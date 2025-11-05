# Migration from Local Llama 3 to Groq API

This document explains the changes made to migrate from using Llama 3 locally (via Ollama) to using Llama 3 via the Groq API.

## What Changed

### 1. **New Service: LlamaApiService**
   - **Location**: `src/llama-api/llama-api.service.ts`
   - **Purpose**: Centralized service for all Llama 3 API interactions
   - **Features**:
     - Simple chat interface
     - Conversation history support
     - Structured JSON extraction
     - Comprehensive error handling

### 2. **Updated Services**

#### Chatbot Service (`src/chatbot/chatbot.service.ts`)
   - **Before**: Used local Ollama API at `http://localhost:11434`
   - **After**: Uses Groq API via `LlamaApiService`
   - **Benefits**: 
     - No need to run Ollama locally
     - Faster responses
     - Better reliability
     - Automatic scaling

#### Video Analysis Service (`src/video-analysis/video-analysis.service.ts`)
   - **Before**: Used Ollama for content analysis
   - **After**: Uses Groq API for content analysis
   - **Note**: Transcription still uses local Python Whisper (more reliable for audio)

### 3. **Configuration Changes**
   - Removed Ollama-specific configuration from `video-analysis.config.ts`
   - Added `GROQ_API_KEY` environment variable
   - Optional `LLAMA_MODEL` environment variable for model selection

### 4. **Dependencies**
   - **Added**: `groq-sdk` - Official Groq SDK for API access
   - **Removed**: No longer dependent on local Ollama installation

## Setup Instructions

### 1. Get a Groq API Key
   1. Go to [https://console.groq.com](https://console.groq.com)
   2. Sign up or log in
   3. Navigate to API Keys section
   4. Create a new API key
   5. Copy the API key

### 2. Configure Environment Variables
   1. Copy `.env.example` to `.env`:
      ```bash
      cp .env.example .env
      ```
   2. Edit `.env` and add your Groq API key:
      ```env
      GROQ_API_KEY="your_groq_api_key_here"
      ```
   3. (Optional) Choose your preferred model:
      ```env
      # For better quality (default):
      LLAMA_MODEL="llama-3.1-70b-versatile"
      
      # For faster responses:
      LLAMA_MODEL="llama-3.1-8b-instant"
      ```

### 3. Install Dependencies
   ```bash
   cd back
   npm install
   ```

### 4. Start the Application
   ```bash
   npm run start:dev
   ```

## Available Llama Models on Groq

| Model | Description | Use Case |
|-------|-------------|----------|
| `llama-3.1-70b-versatile` | Larger model, better quality | Complex analysis, detailed responses |
| `llama-3.1-8b-instant` | Smaller model, faster | Quick responses, simple queries |
| `llama-3.2-90b-vision-preview` | Vision capabilities | Image analysis (future feature) |

## Features Comparison

### Before (Local Ollama)
- ✅ Works offline
- ❌ Requires local installation
- ❌ Slower on consumer hardware
- ❌ Manual model management
- ❌ Limited by local resources

### After (Groq API)
- ✅ No local installation needed
- ✅ Very fast inference
- ✅ Automatic scaling
- ✅ Simple API key management
- ✅ Free tier available
- ❌ Requires internet connection
- ❌ API rate limits apply

## API Usage and Limits

### Groq Free Tier
- **Requests per minute**: 30 RPM
- **Requests per day**: 14,400 RPD
- **Tokens per minute**: 6,000 TPM

For most development and small-scale production use, the free tier is sufficient.

### Rate Limit Handling
The `LlamaApiService` automatically handles rate limits and provides user-friendly error messages.

## Troubleshooting

### Error: "GROQ_API_KEY is required"
- **Solution**: Make sure you've set `GROQ_API_KEY` in your `.env` file

### Error: "Rate limit exceeded"
- **Solution**: Wait a moment and try again, or upgrade your Groq plan
- **Alternative**: Use the faster `llama-3.1-8b-instant` model to reduce token usage

### Error: "Invalid API key"
- **Solution**: Double-check your API key in the Groq console

### Slow Responses
- **Solution**: Switch to `llama-3.1-8b-instant` model
- **Check**: Your internet connection

## Code Examples

### Using LlamaApiService Directly

```typescript
import { LlamaApiService } from './llama-api/llama-api.service';

@Injectable()
export class MyService {
  constructor(private llamaApi: LlamaApiService) {}

  async simpleChat() {
    const response = await this.llamaApi.chat(
      'What is TypeScript?',
      'You are a helpful coding assistant.',
      {
        temperature: 0.7,
        maxTokens: 200,
      }
    );
    return response;
  }

  async extractData() {
    const json = await this.llamaApi.extractJson(
      'Extract person info: John Doe, age 30, developer',
      'Extract structured data as JSON',
      {
        temperature: 0.3,
      }
    );
    return json;
  }
}
```

## Migration Checklist

- [x] Created `LlamaApiService` for API interactions
- [x] Updated `ChatbotService` to use Groq API
- [x] Updated `VideoAnalysisService` to use Groq API
- [x] Removed Ollama configuration
- [x] Installed `groq-sdk` dependency
- [x] Created `.env.example` with API key documentation
- [ ] Get Groq API key
- [ ] Add API key to `.env` file
- [ ] Test chatbot functionality
- [ ] Test video analysis functionality

## Next Steps

1. **Get your Groq API key** from [https://console.groq.com](https://console.groq.com)
2. **Update your `.env` file** with the API key
3. **Test the application** to ensure everything works
4. **Monitor API usage** in the Groq console
5. **(Optional) Upgrade to a paid plan** if you need higher limits

## Support

- **Groq Documentation**: [https://console.groq.com/docs](https://console.groq.com/docs)
- **Groq API Reference**: [https://console.groq.com/docs/api-reference](https://console.groq.com/docs/api-reference)

## Rollback (If Needed)

If you need to rollback to local Ollama:
1. Restore the previous versions of the service files from git
2. Reinstall Ollama locally
3. Pull the Llama 3 model: `ollama pull llama3`
4. Start Ollama service
