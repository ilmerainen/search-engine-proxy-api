import { Module } from '@nestjs/common';
import { SearchEngineService } from './search-engine.service';
import { SearchEngineController } from './search-engine.controller';
import { GoogleResultsScraper } from './google-results-scraper.service';
import { ScraperUtilsService } from './scraper-utils.service';
import { WikipediaScraperService } from './wikipedia-scraper.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [
    SearchEngineService,
    ScraperUtilsService,
    GoogleResultsScraper,
    WikipediaScraperService,
  ],
  controllers: [SearchEngineController],
})
export class SearchEngineModule {}
