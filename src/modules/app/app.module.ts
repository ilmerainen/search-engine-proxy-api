import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configSchemas } from '../config';
import { SearchEngineModule } from '../search/search-engine.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configSchemas,
    }),
    SearchEngineModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
