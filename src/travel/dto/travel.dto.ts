import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsObject,
  ValidateNested,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TravellersDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  count: number;
}

export class BudgetDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  @IsIn(['budget', 'moderate', 'premium', 'luxury'])
  category: string;
}

export class PreferencesDto {
  @IsOptional()
  @IsString()
  food?: string;

  @IsOptional()
  @IsString()
  accommodation?: string;

  @IsOptional()
  @IsString()
  transportation?: string;

  @IsOptional()
  @IsString()
  accessibility?: string;

  @IsOptional()
  @IsString()
  thingsToAvoid?: string;

  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}

export class PlanTripDto {
  @IsString()
  destination: string;

  @IsNumber()
  @Min(1)
  @Max(30)
  days: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsString()
  purpose: string;

  @ValidateNested()
  @Type(() => TravellersDto)
  travellers: TravellersDto;

  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @ValidateNested()
  @Type(() => BudgetDto)
  budget: BudgetDto;

  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences: PreferencesDto;

  @IsOptional()
  @IsObject()
  followUpAnswers?: Record<string, string>;
}

export class GetQuestionsDto {
  @IsString()
  destination: string;

  @IsNumber()
  @Min(1)
  @Max(30)
  days: number;

  @IsString()
  purpose: string;

  @ValidateNested()
  @Type(() => TravellersDto)
  travellers: TravellersDto;

  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @ValidateNested()
  @Type(() => BudgetDto)
  budget: BudgetDto;

  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences: PreferencesDto;

  @IsOptional()
  @IsString()
  startDate?: string;
}

export class RefineItineraryDto {
  @IsObject()
  itinerary: Record<string, unknown>;

  @IsString()
  instruction: string;
}
