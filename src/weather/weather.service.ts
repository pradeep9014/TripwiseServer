import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface WeatherData {
  destination: string;
  temperature: {
    current: number;
    feelsLike: number;
    min: number;
    max: number;
    unit: string;
  };
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  windUnit: string;
  visibility: number;
  icon: string;
  forecast: WeatherForecastDay[];
  fetchedAt: string;
}

export interface WeatherForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('WEATHER_API_KEY') || '';
  }

  async getWeather(destination: string): Promise<WeatherData> {
    if (!this.apiKey) {
      this.logger.warn('WEATHER_API_KEY not configured, returning mock data');
      return this.getMockWeatherData(destination);
    }

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        firstValueFrom(
          this.httpService.get(`${this.baseUrl}/weather`, {
            params: {
              q: destination,
              appid: this.apiKey,
              units: 'metric',
            },
            timeout: 10000,
          }),
        ),
        firstValueFrom(
          this.httpService.get(`${this.baseUrl}/forecast`, {
            params: {
              q: destination,
              appid: this.apiKey,
              units: 'metric',
              cnt: 5,
            },
            timeout: 10000,
          }),
        ),
      ]);

      const current = currentResponse.data;
      const forecastData = forecastResponse.data;

      const forecast: WeatherForecastDay[] = forecastData.list
        .filter((_: unknown, idx: number) => idx % 8 === 0)
        .slice(0, 5)
        .map(
          (item: {
            dt_txt: string;
            main: { temp_min: number; temp_max: number; humidity: number };
            weather: Array<{ main: string; description: string; icon: string }>;
          }) => ({
            date: item.dt_txt.split(' ')[0],
            tempMin: Math.round(item.main.temp_min),
            tempMax: Math.round(item.main.temp_max),
            condition: item.weather[0].main,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
          }),
        );

      return {
        destination: `${current.name}, ${current.sys.country}`,
        temperature: {
          current: Math.round(current.main.temp),
          feelsLike: Math.round(current.main.feels_like),
          min: Math.round(current.main.temp_min),
          max: Math.round(current.main.temp_max),
          unit: '°C',
        },
        condition: current.weather[0].main,
        description: current.weather[0].description,
        humidity: current.main.humidity,
        windSpeed: Math.round(current.wind.speed * 3.6),
        windUnit: 'km/h',
        visibility: Math.round((current.visibility || 10000) / 1000),
        icon: current.weather[0].icon,
        forecast,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Weather API error:', error);
      this.logger.warn('Falling back to mock weather data');
      return this.getMockWeatherData(destination);
    }
  }

  private getMockWeatherData(destination: string): WeatherData {
    return {
      destination,
      temperature: {
        current: 28,
        feelsLike: 30,
        min: 24,
        max: 32,
        unit: '°C',
      },
      condition: 'Clear',
      description: 'Clear sky',
      humidity: 65,
      windSpeed: 15,
      windUnit: 'km/h',
      visibility: 10,
      icon: '01d',
      forecast: [
        {
          date: new Date().toISOString().split('T')[0],
          tempMin: 24,
          tempMax: 32,
          condition: 'Clear',
          description: 'Clear sky',
          icon: '01d',
          humidity: 65,
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          tempMin: 23,
          tempMax: 30,
          condition: 'Clouds',
          description: 'Few clouds',
          icon: '02d',
          humidity: 70,
        },
        {
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          tempMin: 22,
          tempMax: 29,
          condition: 'Rain',
          description: 'Light rain',
          icon: '10d',
          humidity: 80,
        },
        {
          date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
          tempMin: 24,
          tempMax: 31,
          condition: 'Clear',
          description: 'Clear sky',
          icon: '01d',
          humidity: 62,
        },
        {
          date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
          tempMin: 25,
          tempMax: 33,
          condition: 'Clear',
          description: 'Clear sky',
          icon: '01d',
          humidity: 60,
        },
      ],
      fetchedAt: new Date().toISOString(),
    };
  }
}
