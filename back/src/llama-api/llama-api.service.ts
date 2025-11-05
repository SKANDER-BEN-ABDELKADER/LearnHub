import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

export interface LlamaApiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlamaApiOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

@Injectable()
export class LlamaApiService {
  private readonly logger = new Logger(LlamaApiService.name);
  private groq: Groq;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY not found in environment variables');
      throw new Error('GROQ_API_KEY is required. Please set it in your .env file');
    }

    this.groq = new Groq({
      apiKey: apiKey,
    });

    // Use llama-3.3-70b-versatile for best results, or llama-3.1-8b-instant for faster responses
    // Updated models as of November 2025
    this.model = process.env.LLAMA_MODEL || 'llama-3.3-70b-versatile';
    
    this.logger.log(`Llama API Service initialized with model: ${this.model}`);
  }

  /**
   * Send a single prompt to Llama 3 and get a response
   */
  async chat(
    prompt: string,
    systemPrompt?: string,
    options: LlamaApiOptions = {}
  ): Promise<string> {
    try {
      const messages: LlamaApiMessage[] = [];

      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      messages.push({
        role: 'user',
        content: prompt,
      });

      return await this.chatWithMessages(messages, options);
    } catch (error) {
      this.logger.error('Error in chat:', error);
      throw error;
    }
  }

  /**
   * Send multiple messages (conversation) to Llama 3 and get a response
   */
  async chatWithMessages(
    messages: LlamaApiMessage[],
    options: LlamaApiOptions = {}
  ): Promise<string> {
    try {
      const {
        temperature = 0.7,
        maxTokens = 1024,
        topP = 0.9,
      } = options;

      this.logger.log(`Sending ${messages.length} messages to Llama API`);

      const chatCompletion = await this.groq.chat.completions.create({
        messages: messages as any,
        model: this.model,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        stream: false, // Explicitly disable streaming
      });

      const response = chatCompletion.choices[0]?.message?.content || '';
      
      this.logger.log('Received response from Llama API');
      
      return response;
    } catch (error: any) {
      this.logger.error('Error communicating with Llama API:', error);
      
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your GROQ_API_KEY.');
      }
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (error.status === 503) {
        throw new Error('Llama API service temporarily unavailable. Please try again.');
      }
      
      throw new Error(`Failed to get response from Llama API: ${error.message}`);
    }
  }

  /**
   * Analyze and extract structured JSON from text
   */
  async extractJson<T = any>(
    prompt: string,
    systemPrompt?: string,
    options: LlamaApiOptions = {}
  ): Promise<T> {
    const defaultSystemPrompt = systemPrompt || 
      'You are a helpful assistant that extracts structured data. Always respond with valid JSON only, no additional text.';
    
    const response = await this.chat(prompt, defaultSystemPrompt, {
      ...options,
      temperature: options.temperature ?? 0.3, // Lower temperature for more consistent JSON
    });

    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, try parsing the whole response
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to parse JSON from response:', response);
      throw new Error('Failed to parse structured data from API response');
    }
  }
}
