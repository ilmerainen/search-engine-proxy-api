import { Expose } from 'class-transformer';

export class GoogleSearchResponseDto {
  @Expose()
  title: string;

  @Expose()
  url: string;

  @Expose()
  description: string;
}
