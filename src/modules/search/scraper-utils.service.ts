import { Injectable } from '@nestjs/common';
import * as undici from 'undici';

import fs from 'fs';

@Injectable()
export class ScraperUtilsService {
  async fetchHTML(url: string): Promise<string> {
    try {
      const response = await undici.request(url, {
        headers: {
          // todo: randomize
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
        },
      });
      return response.body.text();
    } catch (e) {
      throw new Error(`Error during fetching HTML by URL: ${url}`);
    }
  }
}
