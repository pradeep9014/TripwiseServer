import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('destination') destination: string) {
    if (!destination) {
      return { error: 'Destination query parameter is required' };
    }
    return this.weatherService.getWeather(destination);
  }
}
