import { IsString } from 'class-validator';

export class GetSearchResultsInputDto {
  @IsString()
  term: string;
}
