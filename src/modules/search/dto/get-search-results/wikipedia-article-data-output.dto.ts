import { Expose } from 'class-transformer';

export class WikipediaArticleDataOutputDto {
  @Expose()
  title: string;

  @Expose()
  text: string;

  @Expose()
  image?: string;
}
