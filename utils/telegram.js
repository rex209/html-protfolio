const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8187483951:AAHnh-9UtMVt7hPZtSPn6ZwE4dtkAq_V7Yk';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_ID || '5304539511';

let bot;

// Initialize bot
try {
  bot = new TelegramBot(BOT_TOKEN, { polling: false });
} catch (error) {
  console.error('Telegram bot initialization error:', error);
}

// Send new order alert
async function sendTelegramAlert(orderData) {
  try {
    if (!bot) {
      throw new Error('Telegram bot not initialized');
    }

    const message = `🆕 *New Order Alert*

🎮 *Game:* ${orderData.game}
🔢 *Game ID:* \`${orderData.gameId}\`
${orderData.zoneId ? `🌍 *Zone ID:* \`${orderData.zoneId}\`` : ''}
📦 *Pack:* ${orderData.pack}
💰 *Amount:* ₹${orderData.amount}
🔗 *Order ID:* \`${orderData.orderId}\`
🏦 *Transaction ID:* \`${orderData.transactionId}\`

⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

👀 Please review and approve this order in the admin panel.`;

    await bot.sendMessage(ADMIN_CHAT_ID, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

    console.log('Telegram alert sent successfully');
  } catch (error) {
    console.error('Telegram alert error:', error);
    throw error;
  }
}

// Send order status update
async function sendOrderStatusUpdate(orderData) {
  try {
    if (!bot) {
      throw new Error('Telegram bot not initialized');
    }

    let statusEmoji;
    switch (orderData.status) {
      case 'completed':
        statusEmoji = '✅';
        break;
      case 'failed':
        statusEmoji = '❌';
        break;
      case 'processing':
        statusEmoji = '⏳';
        break;
      default:
        statusEmoji = 'ℹ️';
    }

    const message = `${statusEmoji} *Order Status Update*

🔗 *Order ID:* \`${orderData.orderId}\`
📊 *Status:* ${orderData.status.toUpperCase()}
🎮 *Game:* ${orderData.game}
📦 *Pack:* ${orderData.pack}
💰 *Amount:* ₹${orderData.amount}

${orderData.notes ? `📝 *Notes:* ${orderData.notes}` : ''}

⏰ *Updated:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    await bot.sendMessage(ADMIN_CHAT_ID, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

    console.log('Order status update sent successfully');
  } catch (error) {
    console.error('Order status update error:', error);
    throw error;
  }
}

// Send system alert
async function sendSystemAlert(alertData) {
  try {
    if (!bot) {
      throw new Error('Telegram bot not initialized');
    }

    const message = `🚨 *System Alert*

📢 *Type:* ${alertData.type}
📝 *Message:* ${alertData.message}
⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

${alertData.details ? `🔍 *Details:* ${alertData.details}` : ''}`;

    await bot.sendMessage(ADMIN_CHAT_ID, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

    console.log('System alert sent successfully');
  } catch (error) {
    console.error('System alert error:', error);
    throw error;
  }
}

// Test telegram connection
async function testTelegram() {
  try {
    if (!bot) {
      throw new Error('Telegram bot not initialized');
    }

    const message = `🔧 *System Test*

✅ Telegram bot is working correctly!
⏰ Test time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    await bot.sendMessage(ADMIN_CHAT_ID, message, {
      parse_mode: 'Markdown'
    });

    return { success: true, message: 'Test message sent successfully' };
  } catch (error) {
    console.error('Telegram test error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendTelegramAlert,
  sendOrderStatusUpdate,
  sendSystemAlert,
  testTelegram
};