#!/bin/bash

# Groq API Setup Script
# This script helps you set up your Groq API key

echo "========================================="
echo "   Groq API Key Setup for LearnHub"
echo "========================================="
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✓ .env file already exists"
    echo ""
    read -p "Do you want to update your API key? (y/n): " update
    if [ "$update" != "y" ]; then
        echo "Setup cancelled."
        exit 0
    fi
else
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
fi

echo "To get your Groq API key:"
echo "1. Visit: https://console.groq.com/keys"
echo "2. Sign up or log in"
echo "3. Click 'Create API Key'"
echo "4. Copy the API key"
echo ""

read -p "Enter your Groq API key: " api_key

if [ -z "$api_key" ]; then
    echo "❌ No API key provided. Setup cancelled."
    exit 1
fi

# Update or add GROQ_API_KEY in .env
if grep -q "GROQ_API_KEY=" .env; then
    # Update existing key
    sed -i "s/GROQ_API_KEY=.*/GROQ_API_KEY=\"$api_key\"/" .env
else
    # Add new key
    echo "GROQ_API_KEY=\"$api_key\"" >> .env
fi

echo ""
echo "✓ API key configured successfully!"
echo ""
echo "Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm run start:dev"
echo "3. Test your chatbot at: http://localhost:3000/chatbot"
echo ""
echo "========================================="
