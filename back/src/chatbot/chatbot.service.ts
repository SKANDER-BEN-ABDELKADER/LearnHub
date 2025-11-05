import { Injectable, Logger } from '@nestjs/common';
import { LlamaApiService, LlamaApiMessage } from '../llama-api/llama-api.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private conversations: Map<string, Conversation> = new Map();

  constructor(private readonly llamaApiService: LlamaApiService) {}

  async askLlama3(prompt: string, conversationId?: string): Promise<{ response: string; conversationId: string }> {
    try {
      // Get or create conversation
      let conversation = conversationId ? this.conversations.get(conversationId) : null;
      
      if (!conversation) {
        conversation = {
          id: this.generateConversationId(),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.conversations.set(conversation.id, conversation);
      }

      // Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      });

      // Build context from conversation history (last 10 messages)
      const recentMessages = conversation.messages.slice(-10);
      
      // Convert to Llama API message format
      const apiMessages: LlamaApiMessage[] = recentMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Add the system prompt
      const systemPrompt = 'You are a helpful and knowledgeable AI assistant. Provide clear, accurate, and helpful responses to the user\'s questions.';

      this.logger.log(`Sending request to Llama API for conversation ${conversation.id}`);

      // Use Llama API service to get response
      const botResponse = await this.llamaApiService.chatWithMessages(
        [
          { role: 'system', content: systemPrompt },
          ...apiMessages,
        ],
        {
          temperature: 0.7,
          maxTokens: 500,
          topP: 0.9,
        }
      );

      // Add bot response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: botResponse,
        timestamp: new Date(),
      });

      conversation.updatedAt = new Date();

      this.logger.log(`Received response from Llama API for conversation ${conversation.id}`);

      return {
        response: botResponse,
        conversationId: conversation.id,
      };

    } catch (error) {
      this.logger.error('Error communicating with Llama API:', error);
      
      // The LlamaApiService already provides user-friendly error messages
      throw new Error(error.message || 'Failed to get response from AI model. Please try again.');
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversations.get(conversationId) || null;
  }

  async createConversation(): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.generateConversationId(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    return this.conversations.delete(conversationId);
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 