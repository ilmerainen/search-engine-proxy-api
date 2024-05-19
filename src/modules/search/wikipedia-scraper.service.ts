import { Injectable } from '@nestjs/common';
import { load as cheerioLoad } from 'cheerio';

import { ScraperUtilsService } from './scraper-utils.service';

export type WikiArticlePageResult = {
  title: string;
  text: string;
  image?: string;
};

@Injectable()
export class WikipediaScraperService {
  constructor(private readonly scraperUtilsService: ScraperUtilsService) {}

  async getArticlePageData(url: string) {
    const html = await this.scraperUtilsService.fetchHTML(url);
    const parsedResult = this.parseArticlePage(html);

    return parsedResult;
  }

  private parseArticlePage(html: string): WikiArticlePageResult {
    const $ = cheerioLoad(html);
    const title =
      $('.mw-page-title-main').text().trim() || $('#firstHeading i').text();
    const text =
      $($('div.mw-content-ltr.mw-parser-output:nth-child(1) table ~ p')?.[0])
        .text()
        .trim() ||
      $($('div.mw-content-ltr.mw-parser-output:nth-child(1) > p')?.[0])
        .text()
        .trim();
    const images = $('img.mw-file-element')
      .get()
      .map((el) => el.attribs.src);

    return {
      title,
      text,
      image: images[0],
    };
  }
}
