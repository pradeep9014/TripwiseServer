import { Module } from '@nestjs/common';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [TravelController],
  providers: [TravelService],
})
export class TravelModule {}
