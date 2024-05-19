import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiExtraModels } from '@nestjs/swagger';

import { plainToInstance } from 'class-transformer';
import { SearchEngineService } from './search-engine.service';
import {
  GetSearchResultsInputDto,
  GetSearchResultsOutputDto,
  GoogleSearchResponseDto,
  WikipediaArticleDataOutputDto,
} from './dto/get-search-results';

@ApiTags('search')
@ApiExtraModels(
  GoogleSearchResponseDto,
  WikipediaArticleDataOutputDto,
  ApiExtraModels,
)
@Controller('search')
export class SearchEngineController {
  private readonly SEARCH_RESULTS_COUNT = 10;

  constructor(private readonly searchEngineService: SearchEngineService) {}

  @Get()
  @ApiOkResponse({
    status: 200,
  })
  @HttpCode(HttpStatus.OK)
  async getSearchResults(
    @Query() query: GetSearchResultsInputDto,
  ): Promise<GetSearchResultsOutputDto> {
    const result = await this.searchEngineService.getSearchResultsByTerm({
      term: query.term,
      resultsCount: this.SEARCH_RESULTS_COUNT,
    });
    return plainToInstance(GetSearchResultsOutputDto, {
      type: result.type,
      data: result.data,
    });
  }
}
