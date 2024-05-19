import { Injectable } from '@nestjs/common';
import { load as cheerioLoad } from 'cheerio';

import { ScraperUtilsService } from './scraper-utils.service';

export type GoogleSearchResult = {
  title: string;
  url: string;
  description: string;
};

@Injectable()
export class GoogleResultsScraper {
  constructor(private readonly scraperUtilsService: ScraperUtilsService) {}

  async getSearchResults({
    term,
    resultsCount = 10,
  }: {
    resultsCount?: number;
    term: string;
  }): Promise<GoogleSearchResult[]> {
    const results: GoogleSearchResult[] = [];

    for (let page = 1; results.length < resultsCount; page++) {
      const parsedResult = await this.getResultsByPage({
        term,
        page,
      });

      results.push(...parsedResult);
    }

    return results.slice(0, resultsCount);
  }

  private async getResultsByPage({
    page,
    term,
  }: {
    page: number;
    term: string;
  }): Promise<GoogleSearchResult[]> {
    const html = await this.fetchSearchResultsHTML({
      term,
      page,
    });
    const parsedResults: GoogleSearchResult[] = [];
    const $ = cheerioLoad(html);
    const results = $('div.MjjYud > div:not(.EyBRub)');

    results.each((_, result) => {
      const resEl = $(result);
      const isAd = resEl.children()[0]?.type === 'script';
      if (isAd) {
        return;
      }

      const title = $(resEl.find('div > span.VuuXrf')[0]).text().trim();
      const url = resEl.find('a[jsname="UWckNb"]')[0]?.attribs.href;
      const description =
        $(resEl.find('.yXK7lf span')[2]).text().trim() ||
        $(resEl.find('.yXK7lf span')[1]).text().trim() ||
        resEl.find('.yXK7lf span')?.text().trim() ||
        resEl.find('.yXK7lf')?.text().trim() ||
        resEl.find('.ITZIwc').text().trim();

      if (title && url && description) {
        parsedResults.push({
          title,
          url,
          description,
        });
      } else {
        console.error({
          data: {
            title,
            url,
            description,
          },
          html: resEl.html(),
        });
      }
    });

    return parsedResults;
  }

  private async fetchSearchResultsHTML(params: {
    page: number;
    term: string;
  }): Promise<string> {
    const urlParams = new URLSearchParams({
      q: params.term,
      start: String(params.page),
    });
    const url = `https://www.google.com/search?${urlParams.toString()}`;
    const html = await this.scraperUtilsService.fetchHTML(url);

    return html;
  }
}
