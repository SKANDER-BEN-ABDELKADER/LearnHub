# Groq API Setup Script for Windows PowerShell
# This script helps you set up your Groq API key

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Groq API Key Setup for LearnHub" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
    Write-Host ""
    $update = Read-Host "Do you want to update your API key? (y/n)"
    if ($update -ne "y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
}

Write-Host "To get your Groq API key:" -ForegroundColor Yellow
Write-Host "1. Visit: https://console.groq.com/keys"
Write-Host "2. Sign up or log in"
Write-Host "3. Click 'Create API Key'"
Write-Host "4. Copy the API key"
Write-Host ""

$api_key = Read-Host "Enter your Groq API key"

if ([string]::IsNullOrWhiteSpace($api_key)) {
    Write-Host "❌ No API key provided. Setup cancelled." -ForegroundColor Red
    exit 1
}

# Read .env content
$envContent = Get-Content ".env" -Raw

# Update or add GROQ_API_KEY in .env
if ($envContent -match "GROQ_API_KEY=") {
    # Update existing key
    $envContent = $envContent -replace 'GROQ_API_KEY="?[^"]*"?', "GROQ_API_KEY=`"$api_key`""
} else {
    # Add new key
    $envContent += "`nGROQ_API_KEY=`"$api_key`""
}

# Write back to .env
Set-Content ".env" $envContent

Write-Host ""
Write-Host "✓ API key configured successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm install"
Write-Host "2. Run: npm run start:dev"
Write-Host "3. Test your chatbot at: http://localhost:3000/chatbot"
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
