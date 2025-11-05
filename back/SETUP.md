# Quick Setup Guide - Groq API Integration

## Step 1: Get Your Groq API Key

1. Visit [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up or log in
3. Click "Create API Key"
4. Copy the API key (keep it safe!)

## Step 2: Configure Your Environment

1. Create a `.env` file in the `back` directory:
   ```bash
   cd back
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```env
   GROQ_API_KEY="gsk_your_actual_api_key_here"
   ```

## Step 3: Install Dependencies (if not already done)

```bash
cd back
npm install
```

## Step 4: Start the Application

```bash
npm run start:dev
```

## That's it! 🎉

Your application is now using Groq's API for Llama 3 instead of running it locally.

### What Works Now:

✅ **Chatbot** - Conversations powered by Llama 3.1 via Groq API  
✅ **Video Analysis** - Course content analysis using Llama 3.1  
✅ **Requirements Generation** - AI-powered requirement extraction  
✅ **Learning Objectives** - Automatic "what you will learn" generation  

### Benefits:

- ⚡ Faster responses (Groq has very fast inference)
- 🚀 No local setup needed
- 📈 Scales automatically
- 💰 Free tier available

### Model Options:

You can choose which model to use in your `.env`:

```env
# Better quality, slightly slower (default)
LLAMA_MODEL="llama-3.1-70b-versatile"

# Faster responses
LLAMA_MODEL="llama-3.1-8b-instant"
```

### Testing:

1. **Test the Chatbot:**
   - Make a POST request to `http://localhost:3000/chatbot`
   - Body: `{ "prompt": "Hello, how are you?" }`

2. **Test Video Analysis:**
   - Upload a course video through your application
   - Check that it generates requirements and learning objectives

### Troubleshooting:

If you see errors about missing API key:
- Make sure you created the `.env` file
- Make sure `GROQ_API_KEY` is set correctly
- Restart the server after changing `.env`

For more details, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
