import { Injectable } from '@nestjs/common';

import { WikipediaScraperService } from './wikipedia-scraper.service';
import {
  GoogleResultsScraper,
  GoogleSearchResult,
} from './google-results-scraper.service';
import { RedisLock } from '../cache/redis-lock.service';
import { RedisService } from '../cache/redis.service';
import {
  RedisList,
  RedisListItem,
  SearchEngineResult,
  SearchResultType,
} from './types';
import { sleep } from "../../utils";

@Injectable()
export class SearchEngineService {
  private static readonly REDIS_RESULTS_LIST_KEY = 'searchResults';

  private static readonly WIKIPEDIA_URL = 'wikipedia.org';

  constructor(
    private readonly wikipediaParserService: WikipediaScraperService,
    private readonly googleResultsScraper: GoogleResultsScraper,
    private readonly redisService: RedisService,
    private readonly redisLock: RedisLock,
  ) {}

  async getSearchResultsByTerm(params: {
    term: string;
    resultsCount: number;
  }): Promise<SearchEngineResult> {
    const term = params.term.toLowerCase().trim();
    const resultsCount = params.resultsCount;
    const redisKey = SearchEngineService.REDIS_RESULTS_LIST_KEY;

    try {
      const redisLock = this.redisLock.lock();
      const result = await redisLock(`${redisKey}:${term}`, async () => {
        const cached = await this.getSearchResultFromCache(term);

        if (cached) {
          return cached.value;
        }

        const res = await this.googleResultsScraper.getSearchResults({
          term,
          resultsCount,
        });
        const wikiUrl = this.findGoogleResultWithWikiURL(res)?.url;

        let searchResult: SearchEngineResult;

        if (wikiUrl) {
          const wikiResults =
            await this.wikipediaParserService.getArticlePageData(wikiUrl);
          searchResult = {
            type: SearchResultType.wiki,
            data: wikiResults,
          };
        } else {
          searchResult = {
            type: SearchResultType.google,
            data: res,
          };
        }

        await this.cacheSearchResult(term, searchResult);

        // simulate work of the slow service
        await sleep(5000);

        return searchResult;
      });

      return result;
    } catch (err) {
      console.error('Error fetching search results:', err);
      throw err;
    }
  }

  private async getSearchResultFromCache(
    term: string,
  ): Promise<RedisListItem<SearchEngineResult> | null> {
    try {
      const list: RedisList<SearchEngineResult> = (
        await this.redisService.client.LRANGE(
          SearchEngineService.REDIS_RESULTS_LIST_KEY,
          0,
          9,
        )
      ).map((val) => JSON.parse(val));
      const result = list.find((el) => el.key === term);
      return result || null;
    } catch (err) {
      console.error('Error reading from cache:', err);
      return null;
    }
  }

  private async cacheSearchResult(
    term: string,
    value: SearchEngineResult,
  ): Promise<void> {
    const redisKey = SearchEngineService.REDIS_RESULTS_LIST_KEY;
    await this.redisService.client.LPUSH(
      redisKey,
      JSON.stringify({ key: term, value }),
    );
    await this.redisService.client.LTRIM(redisKey, 0, 9);
  }

  private findGoogleResultWithWikiURL(
    results: GoogleSearchResult[],
  ): GoogleSearchResult | null {
    return (
      results.find((el) =>
        el.url.includes(SearchEngineService.WIKIPEDIA_URL),
      ) || null
    );
  }
}
