export interface TravelPromptData {
  destination: string;
  days: number;
  startDate?: string;
  purpose: string;
  travellers: {
    type?: string;
    count: number;
  };
  interests: string[];
  budget: {
    amount: number;
    currency: string;
    category: string;
  };
  preferences: {
    food?: string;
    accommodation?: string;
    transportation?: string;
    accessibility?: string;
    thingsToAvoid?: string;
    specialRequirements?: string;
    additionalInfo?: string;
  };
  followUpAnswers?: Record<string, string>;
}

export function buildTravelPlanPrompt(data: TravelPromptData): string {
  const followUpSection =
    data.followUpAnswers && Object.keys(data.followUpAnswers).length > 0
      ? `\n\nAdditional user preferences from follow-up questions:\n${JSON.stringify(data.followUpAnswers, null, 2)}`
      : '';

  return `You are an expert travel planner. Create a detailed, realistic, and personalized day-by-day travel itinerary.

TRIP DETAILS:
- Destination: ${data.destination}
- Duration: ${data.days} days
- Start Date: ${data.startDate || 'Flexible'}
- Purpose: ${data.purpose}
- Travellers: ${data.travellers.count} ${data.travellers.type ? `(${data.travellers.type})` : 'people'}
- Interests: ${data.interests.join(', ')}
- Budget: ${data.budget.amount} ${data.budget.currency} (${data.budget.category} category)

USER PREFERENCES:
- Food: ${data.preferences.food || 'No specific preference'}
- Accommodation: ${data.preferences.accommodation || 'No specific preference'}
- Transportation: ${data.preferences.transportation || 'No specific preference'}
- Accessibility: ${data.preferences.accessibility || 'None'}
- Things to avoid: ${data.preferences.thingsToAvoid || 'None'}
- Special requirements: ${data.preferences.specialRequirements || 'None'}
- Additional info: ${data.preferences.additionalInfo || 'None'}
${followUpSection}

IMPORTANT PLANNING RULES:
1. Create EXACTLY ${data.days} days in the itinerary
2. Group nearby locations together to minimize travel time
3. Include realistic travel durations between locations
4. Schedule meals at appropriate times (breakfast ~8-9am, lunch ~12-1pm, dinner ~7-8pm)
5. Respect local opening hours (most attractions open 9am-6pm)
6. Budget activities appropriate for ${data.budget.category} budget level
7. Consider the traveller group size (${data.travellers.count} people) for activity selection
8. Include a mix of must-see attractions and local hidden gems
9. Provide realistic estimated costs in ${data.budget.currency}
10. DO NOT invent real-time information (weather, current prices may vary)

RESPONSE FORMAT:
Return ONLY valid JSON matching this EXACT structure. No markdown, no explanations, just JSON:

{
  "destination": "string",
  "summary": "2-3 sentence trip overview",
  "tripStyle": "Relaxed | Balanced | Adventure",
  "estimatedBudget": {
    "accommodation": number,
    "food": number,
    "transportation": number,
    "activities": number,
    "miscellaneous": number,
    "total": number,
    "currency": "string"
  },
  "days": [
    {
      "day": number,
      "title": "string",
      "summary": "string",
      "activities": [
        {
          "time": "HH:MM",
          "title": "string",
          "description": "string",
          "location": "string",
          "duration": "string",
          "estimatedCost": number,
          "type": "meal | attraction | transport | accommodation | leisure | shopping"
        }
      ]
    }
  ],
  "foodRecommendations": [
    {
      "name": "string",
      "description": "string",
      "type": "vegetarian | non-vegetarian | vegan | seafood | local | street food",
      "mustTry": boolean
    }
  ],
  "packingList": [
    {
      "category": "string",
      "items": ["string"]
    }
  ],
  "travelTips": [
    {
      "category": "Transportation | Safety | Culture | Money | General",
      "tip": "string"
    }
  ],
  "importantNotes": ["string"]
}`;
}

export function buildFollowUpQuestionsPrompt(data: TravelPromptData): string {
  return `You are a travel planning assistant. Based on the trip details below, determine if you need any clarifying questions to create a better itinerary.

TRIP DETAILS:
- Destination: ${data.destination}
- Duration: ${data.days} days
- Purpose: ${data.purpose}
- Travellers: ${data.travellers.count} ${data.travellers.type ? `(${data.travellers.type})` : 'people'}
- Interests: ${data.interests.join(', ')}
- Budget: ${data.budget.amount} ${data.budget.currency} (${data.budget.category})
- Food preference: ${data.preferences.food || 'Not specified'}
- Accommodation: ${data.preferences.accommodation || 'Not specified'}
- Things to avoid: ${data.preferences.thingsToAvoid || 'None'}

RULES:
1. Only ask questions that will MEANINGFULLY improve the itinerary
2. Ask at MOST 2-3 questions
3. If the trip details are already comprehensive, set needsFollowUp to false
4. Each question must have 3-4 clear option choices
5. Questions should be specific to the destination and trip type

Return ONLY valid JSON:
{
  "needsFollowUp": boolean,
  "questions": [
    {
      "id": "unique-id",
      "question": "string",
      "options": ["option1", "option2", "option3"]
    }
  ]
}`;
}

export function buildRefinementPrompt(
  itinerary: unknown,
  instruction: string,
): string {
  return `You are an expert travel planner. The user wants to modify their existing travel itinerary.

MODIFICATION INSTRUCTION: "${instruction}"

EXISTING ITINERARY:
${JSON.stringify(itinerary, null, 2)}

IMPORTANT RULES:
1. Apply the requested modification thoughtfully
2. Maintain the same JSON structure
3. Keep the same number of days unless the user asks to change it
4. Ensure the modified itinerary is still realistic and coherent
5. Adjust budget estimates if activities change significantly
6. Return ONLY valid JSON matching the same structure as the existing itinerary

Return the complete updated itinerary as valid JSON only, no explanations.`;
}
