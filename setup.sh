#!/bin/bash

echo "🤖 MLBB Diamond Top-up Bot Setup Script"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

echo "✅ Python 3 found"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip and try again."
    exit 1
fi

echo "✅ pip3 found"

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your:"
    echo "   - BOT_TOKEN (get from @BotFather)"
    echo "   - ADMIN_USER_ID (your Telegram user ID)"
    echo "   - UPI_ID (your UPI ID for payments)"
    echo ""
    echo "📖 See README.md for detailed setup instructions"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run: python3 bot.py"
echo ""
echo "For help, check README.md or contact @rishikeshkashyap"