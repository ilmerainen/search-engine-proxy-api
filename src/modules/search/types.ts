import { GoogleSearchResult } from './google-results-scraper.service';
import { WikiArticlePageResult } from './wikipedia-scraper.service';

export enum SearchResultType {
  google = 'google',
  wiki = 'wiki',
}

export type SearchEngineResult =
  | {
      type: SearchResultType.google;
      data: GoogleSearchResult[];
    }
  | {
      type: SearchResultType.wiki;
      data: WikiArticlePageResult;
    };

export type RedisListItem<T extends Record<string, unknown>> = {
  key: string;
  value: T;
};

export type RedisList<T extends Record<string, unknown>> = RedisListItem<T>[];
