export interface ActivityInterface {
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  estimatedCost: number;
  type:
    | 'meal'
    | 'attraction'
    | 'transport'
    | 'accommodation'
    | 'leisure'
    | 'shopping';
}

export interface DayInterface {
  day: number;
  title: string;
  summary: string;
  activities: ActivityInterface[];
}

export interface BudgetBreakdownInterface {
  accommodation: number;
  food: number;
  transportation: number;
  activities: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

export interface FoodRecommendationInterface {
  name: string;
  description: string;
  type:
    | 'vegetarian'
    | 'non-vegetarian'
    | 'vegan'
    | 'seafood'
    | 'local'
    | 'street food';
  mustTry: boolean;
}

export interface PackingCategoryInterface {
  category: string;
  items: string[];
}

export interface TravelTipInterface {
  category: 'Transportation' | 'Safety' | 'Culture' | 'Money' | 'General';
  tip: string;
}

export interface ItineraryInterface {
  destination: string;
  summary: string;
  tripStyle: string;
  estimatedBudget: BudgetBreakdownInterface;
  days: DayInterface[];
  foodRecommendations: FoodRecommendationInterface[];
  packingList: PackingCategoryInterface[];
  travelTips: TravelTipInterface[];
  importantNotes: string[];
}

export interface FollowUpQuestionInterface {
  id: string;
  question: string;
  options: string[];
}

export interface FollowUpResponseInterface {
  needsFollowUp: boolean;
  questions: FollowUpQuestionInterface[];
}
