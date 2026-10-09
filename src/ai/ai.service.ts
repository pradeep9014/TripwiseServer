import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface GroqResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await axios.post<GroqResponse>(
        this.apiUrl,
        {
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'openai/gpt-oss-120b',
          stream: false,
          temperature: 0.7,
          max_tokens: 8192,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const text = response.data.choices?.[0]?.message?.content as string | undefined;

      if (!text) {
        throw new ServiceUnavailableException('AI returned an empty response');
      }

      return text;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error('Groq API error details:', JSON.stringify(error.response?.data || error.message, null, 2));
      } else {
        this.logger.error('Groq API error:', error);
      }
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'AI service is temporarily unavailable. Please try again.',
      );
    }
  }

  parseJsonResponse<T>(text: string): T {
    try {
      let cleaned = text.trim();
      const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        cleaned = match[1].trim();
      } else {
        const startIdx = cleaned.indexOf('{');
        const startArrIdx = cleaned.indexOf('[');
        const firstIdx = (startIdx !== -1 && startArrIdx !== -1) ? Math.min(startIdx, startArrIdx) : Math.max(startIdx, startArrIdx);

        const endIdx = cleaned.lastIndexOf('}');
        const endArrIdx = cleaned.lastIndexOf(']');
        const lastIdx = Math.max(endIdx, endArrIdx);

        if (firstIdx !== -1 && lastIdx !== -1 && lastIdx > firstIdx) {
          cleaned = cleaned.slice(firstIdx, lastIdx + 1);
        }
      }

      return JSON.parse(cleaned) as T;
    } catch {
      this.logger.error(
        'Failed to parse AI JSON response. Length: ' + text.length + ' chars. Output: ',
        text.slice(0, 200) + '\n... [truncated] ...\n' + text.slice(-200),
      );
      throw new ServiceUnavailableException(
        'AI returned an invalid response format. Please try again.',
      );
    }
  }
}
