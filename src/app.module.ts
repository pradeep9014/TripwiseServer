import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TravelModule } from './travel/travel.module';
import { WeatherModule } from './weather/weather.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
    TravelModule,
    WeatherModule,
    AiModule,
  ],
})
export class AppModule {}
