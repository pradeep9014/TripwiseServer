import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import {
  PlanTripDto,
  GetQuestionsDto,
  RefineItineraryDto,
} from './dto/travel.dto';
import {
  ItineraryInterface,
  FollowUpResponseInterface,
} from './interfaces/travel.interface';
import {
  buildTravelPlanPrompt,
  buildFollowUpQuestionsPrompt,
  buildRefinementPrompt,
} from '../ai/prompts/travel-planner.prompt';

@Injectable()
export class TravelService {
  private readonly logger = new Logger(TravelService.name);

  constructor(private readonly aiService: AiService) {}

  async planTrip(dto: PlanTripDto): Promise<ItineraryInterface> {
    this.logger.log(`Planning trip to: ${dto.destination}`);

    const prompt = buildTravelPlanPrompt(dto);
    const rawResponse = await this.aiService.generateContent(prompt);
    const itinerary =
      this.aiService.parseJsonResponse<ItineraryInterface>(rawResponse);

    this.validateItinerary(itinerary, dto.days);

    return itinerary;
  }

  async getFollowUpQuestions(
    dto: GetQuestionsDto,
  ): Promise<FollowUpResponseInterface> {
    this.logger.log(`Getting follow-up questions for: ${dto.destination}`);

    const prompt = buildFollowUpQuestionsPrompt(dto);
    const rawResponse = await this.aiService.generateContent(prompt);
    const result =
      this.aiService.parseJsonResponse<FollowUpResponseInterface>(rawResponse);

    return result;
  }

  async refineItinerary(dto: RefineItineraryDto): Promise<ItineraryInterface> {
    this.logger.log(`Refining itinerary: "${dto.instruction}"`);

    const prompt = buildRefinementPrompt(dto.itinerary, dto.instruction);
    const rawResponse = await this.aiService.generateContent(prompt);
    const itinerary =
      this.aiService.parseJsonResponse<ItineraryInterface>(rawResponse);

    return itinerary;
  }

  private validateItinerary(
    itinerary: ItineraryInterface,
    expectedDays: number,
  ): void {
    if (
      !itinerary.destination ||
      !itinerary.days ||
      !Array.isArray(itinerary.days)
    ) {
      throw new ServiceUnavailableException(
        'AI returned an invalid itinerary structure. Please try again.',
      );
    }

    if (itinerary.days.length === 0) {
      throw new ServiceUnavailableException(
        'AI did not generate any days for the itinerary. Please try again.',
      );
    }

    this.logger.log(
      `Itinerary validated: ${itinerary.days.length}/${expectedDays} days for ${itinerary.destination}`,
    );
  }
}
