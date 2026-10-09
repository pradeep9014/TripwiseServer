import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TravelService } from './travel.service';
import {
  PlanTripDto,
  GetQuestionsDto,
  RefineItineraryDto,
} from './dto/travel.dto';

@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post('plan')
  @HttpCode(HttpStatus.OK)
  async planTrip(@Body() dto: PlanTripDto) {
    return this.travelService.planTrip(dto);
  }

  @Post('questions')
  @HttpCode(HttpStatus.OK)
  async getFollowUpQuestions(@Body() dto: GetQuestionsDto) {
    return this.travelService.getFollowUpQuestions(dto);
  }

  @Post('refine')
  @HttpCode(HttpStatus.OK)
  async refineItinerary(@Body() dto: RefineItineraryDto) {
    return this.travelService.refineItinerary(dto);
  }
}
