# MLBB Diamond Top-up Telegram Bot 💎

A complete Telegram bot for **semi-automatic Mobile Legends (MLBB) diamond top-ups** using the SmileOne API.

## ✨ Features

- 🎮 **Diamond Package Selection**: 19 different packages from ₹110 to ₹4900
- 🔍 **Auto Username Fetch**: Automatically fetches MLBB username using SmileOne API
- 💳 **UPI Payment Integration**: Simple UPI payment flow with reference ID tracking
- 👨‍💼 **Admin Approval System**: Manual order verification by admin
- 📱 **User-Friendly Interface**: Intuitive inline keyboard navigation
- 🔐 **Secure API Integration**: Proper signature-based authentication with SmileOne
- 📊 **Order Tracking**: Complete order lifecycle management

## 💎 Available Packages

| Price | Diamonds | Special |
|-------|----------|---------|
| ₹110 | 86💎 | |
| ₹220 | 172💎 | |
| ₹330 | 257💎 | |
| ₹440 | 343💎 | |
| ₹550 | 429💎 | |
| ₹660 | 514💎 | |
| ₹770 | 600💎 | |
| ₹880 | 706💎 | |
| ₹990 | 792💎 | |
| ₹1100 | 878💎 | |
| ₹1200 | 963💎 | |
| ₹1350 | 1049💎 | |
| ₹1400 | 1135💎 | |
| ₹1700 | 1412💎 | |
| ₹2800 | 2195💎 | |
| ₹3900 | 3688💎 | |
| ₹4900 | 3774💎 | (3688+86) |
| ₹155 | Weekly Pass | 🎫 |
| ₹670 | Twilight Pass | 🎫 |

## 🚀 Setup Instructions

### 1. Prerequisites

- Python 3.8+
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- SmileOne API credentials

### 2. Installation

```bash
# Clone or download the bot.py file
# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

Edit the following variables in `bot.py`:

```python
# Bot Configuration
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"  # Get from @BotFather
ADMIN_USER_ID = 5304539511         # Your Telegram user ID
UPI_ID = "7002610853@fam"          # Your UPI ID for payments

# SmileOne API Configuration  
SMILE_UID = "2932248"
SMILE_EMAIL = "smilestockapi@gmail.com"
SMILE_API_KEY = "b7919dab2af9089c1502c50bf665e171"
```

### 4. Getting Your Bot Token

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot`
3. Follow the instructions to create your bot
4. Copy the bot token and paste it in the configuration

### 5. Finding Your User ID

1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. Copy your user ID and set it as `ADMIN_USER_ID`

### 6. Running the Bot

```bash
# Set your bot token as environment variable (recommended)
export BOT_TOKEN="your_bot_token_here"

# Or edit bot.py directly and run:
python bot.py
```

## 🔧 Usage Flow

### For Customers:

1. **Start**: Send `/start` to the bot
2. **Select Package**: Choose from available diamond packages
3. **Enter MLBB Details**: Send ID and Server (e.g., `123456789 1234`)
4. **Confirm Player**: Bot fetches and shows username
5. **Payment**: Pay via UPI to the provided UPI ID
6. **Submit Reference**: Send UPI reference ID
7. **Wait for Approval**: Admin verifies and approves/rejects
8. **Receive Diamonds**: Diamonds sent automatically upon approval

### For Admin:

1. **Receive Orders**: Get notification with order details
2. **Verify Payment**: Check UPI reference ID
3. **Approve/Reject**: Click ✅ APPROVE or ❌ REJECT
4. **Auto Processing**: Diamonds sent automatically via SmileOne API

## 🔑 API Integration

### SmileOne API Endpoints Used:

- **Check Player**: `/api/check` - Fetch MLBB username
- **Send Diamonds**: `/api/order` - Process diamond delivery

### Signature Generation:

```python
sign_raw = f"email={EMAIL}&product=mobilelegends&time={timestamp}&uid={UID}&key={API_KEY}"
signature = md5(md5(sign_raw.encode()).hexdigest().encode()).hexdigest()
```

## 📋 Product Mapping

The bot uses specific product IDs for different packages:

```python
PRODUCT_MAP = {
    "110": ["13"],        # 86 💎
    "220": ["23"],        # 172 💎
    "330": ["25"],        # 257 💎
    "440": ["25&13"],     # 343 💎 (Combined products)
    # ... and more
}
```

## 🛡️ Security Features

- ✅ Admin-only approval system
- ✅ Signature-based API authentication
- ✅ User ID validation
- ✅ Order status tracking
- ✅ Error handling and logging

## 🔧 Customization

### Adding New Packages:

1. Add to `DIAMOND_PACKAGES` dictionary
2. Add corresponding product IDs to `PRODUCT_MAP`
3. Restart the bot

### Changing UPI Details:

1. Update `UPI_ID` variable
2. Restart the bot

### Adding Multiple Admins:

```python
ADMIN_USER_IDS = [5304539511, 1234567890]  # Add multiple admin IDs

# Update admin check:
if query.from_user.id not in ADMIN_USER_IDS:
    await query.answer("❌ Unauthorized access!", show_alert=True)
    return
```

## 📝 Logging

The bot includes comprehensive logging:

- Order creation and status updates
- API calls and responses
- Error tracking
- Admin actions

Check console output for real-time logs.

## 🐛 Troubleshooting

### Common Issues:

1. **Bot not responding**: Check bot token and internet connection
2. **API errors**: Verify SmileOne credentials
3. **Payment issues**: Ensure UPI ID is correct
4. **Permission errors**: Verify admin user ID

### Debug Mode:

```python
# Enable debug logging
logging.basicConfig(level=logging.DEBUG)
```

## 📞 Support

- **Admin**: @rishikeshkashyap
- **Issues**: Check logs for detailed error messages
- **API Docs**: [SmileOne API Documentation](https://docs.smile.one/api.html)

## ⚖️ License

This project is for educational purposes. Ensure compliance with:
- Telegram Bot API Terms
- SmileOne API Terms
- Local payment regulations

## 🔄 Updates

### Version 1.0 Features:
- ✅ Complete bot functionality
- ✅ SmileOne API integration
- ✅ Admin approval system
- ✅ Order tracking
- ✅ Error handling

### Planned Features:
- 🔲 Database persistence
- 🔲 Analytics dashboard
- 🔲 Bulk operations
- 🔲 Multi-language support

---

**⚠️ Important**: This bot handles real money transactions. Always test thoroughly in a controlled environment before deploying for production use.