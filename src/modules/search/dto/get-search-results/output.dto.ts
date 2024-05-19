import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SearchResultType } from '../../types';
import { GoogleSearchResponseDto } from './google-search-response.dto';
import { WikipediaArticleDataOutputDto } from './wikipedia-article-data-output.dto';

export class GetSearchResultsOutputDto {
  @ApiProperty({
    enum: SearchResultType,
    description: 'The type of search result',
  })
  @Expose()
  type: SearchResultType;

  @ApiProperty({
    description: 'The search result data',
    oneOf: [
      {
        type: 'array',
        items: {
          $ref: getSchemaPath(GoogleSearchResponseDto),
        },
      },
      {
        $ref: getSchemaPath(WikipediaArticleDataOutputDto),
      },
    ],
  })
  @Expose()
  data: GoogleSearchResponseDto[] | WikipediaArticleDataOutputDto;
}
