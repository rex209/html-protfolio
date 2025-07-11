#!/usr/bin/env python3
"""
MLBB Diamond Top-up Telegram Bot using SmileOne API
Complete bot implementation in a single file
"""

import os
import logging
import hashlib
import time
import aiohttp
import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

# Telegram Bot imports
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder, 
    CommandHandler, 
    CallbackQueryHandler, 
    MessageHandler, 
    filters, 
    ContextTypes
)

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', 
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot Configuration
BOT_TOKEN = os.getenv('BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')
ADMIN_USER_ID = int(os.getenv('ADMIN_USER_ID', '5304539511'))
ADMIN_USERNAME = "@rishikeshkashyap"
UPI_ID = os.getenv('UPI_ID', '7002610853@fam')

# SmileOne API Configuration
SMILE_UID = os.getenv('SMILE_UID', '2932248')
SMILE_EMAIL = os.getenv('SMILE_EMAIL', 'smilestockapi@gmail.com')
SMILE_API_KEY = os.getenv('SMILE_API_KEY', 'b7919dab2af9089c1502c50bf665e171')
SMILE_BASE_URL = os.getenv('SMILE_BASE_URL', 'https://api.smile.one')

# Diamond Packages Configuration
DIAMOND_PACKAGES = {
    "110": {"diamonds": 86, "price": "₹110", "display": "₹110 = 86💎"},
    "220": {"diamonds": 172, "price": "₹220", "display": "₹220 = 172💎"},
    "330": {"diamonds": 257, "price": "₹330", "display": "₹330 = 257💎"},
    "440": {"diamonds": 343, "price": "₹440", "display": "₹440 = 343💎"},
    "550": {"diamonds": 429, "price": "₹550", "display": "₹550 = 429💎"},
    "660": {"diamonds": 514, "price": "₹660", "display": "₹660 = 514💎"},
    "770": {"diamonds": 600, "price": "₹770", "display": "₹770 = 600💎"},
    "880": {"diamonds": 706, "price": "₹880", "display": "₹880 = 706💎"},
    "990": {"diamonds": 792, "price": "₹990", "display": "₹990 = 792💎"},
    "1100": {"diamonds": 878, "price": "₹1100", "display": "₹1100 = 878💎"},
    "1200": {"diamonds": 963, "price": "₹1200", "display": "₹1200 = 963💎"},
    "1350": {"diamonds": 1049, "price": "₹1350", "display": "₹1350 = 1049💎"},
    "1400": {"diamonds": 1135, "price": "₹1400", "display": "₹1400 = 1135💎"},
    "1700": {"diamonds": 1412, "price": "₹1700", "display": "₹1700 = 1412💎"},
    "2800": {"diamonds": 2195, "price": "₹2800", "display": "₹2800 = 2195💎"},
    "3900": {"diamonds": 3688, "price": "₹3900", "display": "₹3900 = 3688💎"},
    "4900": {"diamonds": 3774, "price": "₹4900", "display": "₹4900 = 3774💎 (3688+86)"},
    "155": {"diamonds": "Weekly Pass", "price": "₹155", "display": "₹155 = Weekly Pass"},
    "670": {"diamonds": "Twilight Pass", "price": "₹670", "display": "₹670 = Twilight Pass"},
}

# Product ID mapping for SmileOne API
PRODUCT_MAP = {
    "110": ["13"],                     # 86 💎
    "220": ["23"],                     # 172 💎
    "330": ["25"],                     # 257 💎
    "440": ["25&13"],                  # 343 💎
    "550": ["25&23"],                  # 429 💎
    "660": ["25&25"],                  # 514 💎
    "770": ["25&25&13"],               # 600 💎
    "880": ["26"],                     # 706 💎
    "990": ["26&13"],                  # 792 💎
    "1100": ["26&23"],                 # 878 💎
    "1200": ["26&25"],                 # 963 💎
    "1350": ["26&25&13"],              # 1049 💎
    "1400": ["26&25&23"],              # 1135 💎
    "1700": ["26&25&25"],              # 1412 💎
    "2800": ["27"],                    # 2195 💎
    "3900": ["28"],                    # 3688 💎
    "4900": ["28&13"],                 # 3688 + 86 💎
    "155": ["16642"],                  # Weekly Pass
    "670": ["33"]                      # Twilight Pass
}


class OrderStatus(Enum):
    PACKAGE_SELECTED = "package_selected"
    WAITING_ID_SERVER = "waiting_id_server"
    WAITING_PAYMENT = "waiting_payment"
    PENDING_ADMIN = "pending_admin"
    COMPLETED = "completed"
    REJECTED = "rejected"


@dataclass
class Order:
    user_id: int
    username: str
    package_id: str
    mlbb_id: str = ""
    mlbb_server: str = ""
    mlbb_username: str = ""
    upi_reference: str = ""
    status: OrderStatus = OrderStatus.PACKAGE_SELECTED
    order_id: str = ""
    admin_message_id: int = 0


class SmileOneAPI:
    """SmileOne API Integration"""
    
    @staticmethod
    def generate_signature(timestamp: int) -> str:
        """Generate signature for SmileOne API"""
        sign_raw = f"email={SMILE_EMAIL}&product=mobilelegends&time={timestamp}&uid={SMILE_UID}&key={SMILE_API_KEY}"
        sign = hashlib.md5(hashlib.md5(sign_raw.encode()).hexdigest().encode()).hexdigest()
        return sign
    
    @staticmethod
    async def get_user_info(mlbb_id: str, server_id: str) -> Optional[Dict[str, Any]]:
        """Fetch MLBB username from SmileOne API"""
        try:
            timestamp = int(time.time())
            signature = SmileOneAPI.generate_signature(timestamp)
            
            params = {
                'uid': SMILE_UID,
                'email': SMILE_EMAIL,
                'time': timestamp,
                'sign': signature,
                'product': 'mobilelegends',
                'id': mlbb_id,
                'server': server_id
            }
            
            # Using the check endpoint to get user info
            url = f"{SMILE_BASE_URL}/api/check"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('status') == 'success':
                            return {
                                'username': data.get('username', 'Unknown Player'),
                                'id': mlbb_id,
                                'server': server_id
                            }
                    
                    response_text = await response.text()
                    logger.error(f"SmileOne API error: {response.status} - {response_text}")
                    return None
                
        except Exception as e:
            logger.error(f"Error fetching user info: {e}")
            return None
    
    @staticmethod
    async def send_diamonds(mlbb_id: str, server_id: str, product_ids: List[str]) -> bool:
        """Send diamonds via SmileOne API"""
        try:
            timestamp = int(time.time())
            signature = SmileOneAPI.generate_signature(timestamp)
            
                         # Handle multiple product IDs
             if isinstance(product_ids, list):
                 product_id_str = product_ids[0] if len(product_ids) == 1 else "&".join(product_ids)
             else:
                 product_id_str = str(product_ids)
            
            data = {
                'uid': SMILE_UID,
                'email': SMILE_EMAIL,
                'time': timestamp,
                'sign': signature,
                'product': 'mobilelegends',
                'id': mlbb_id,
                'server': server_id,
                'productid': product_id_str
            }
            
            url = f"{SMILE_BASE_URL}/api/order"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, data=data, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get('status') == 'success':
                            logger.info(f"Diamonds sent successfully to {mlbb_id}:{server_id}")
                            return True
                    
                    response_text = await response.text()
                    logger.error(f"SmileOne API order error: {response.status} - {response_text}")
                    return False
                
        except Exception as e:
            logger.error(f"Error sending diamonds: {e}")
            return False


class OrderManager:
    """Manage user orders"""
    
    def __init__(self):
        self.orders: Dict[int, Order] = {}
        self.admin_orders: Dict[int, int] = {}  # admin_message_id -> user_id
    
    def create_order(self, user_id: int, username: str, package_id: str) -> Order:
        """Create a new order"""
        order = Order(
            user_id=user_id,
            username=username,
            package_id=package_id,
            order_id=f"MLBB_{user_id}_{int(time.time())}"
        )
        self.orders[user_id] = order
        return order
    
    def get_order(self, user_id: int) -> Optional[Order]:
        """Get order by user ID"""
        return self.orders.get(user_id)
    
    def update_order_status(self, user_id: int, status: OrderStatus) -> None:
        """Update order status"""
        if user_id in self.orders:
            self.orders[user_id].status = status
    
    def get_user_by_admin_message(self, admin_message_id: int) -> Optional[int]:
        """Get user ID by admin message ID"""
        return self.admin_orders.get(admin_message_id)
    
    def set_admin_message(self, user_id: int, admin_message_id: int) -> None:
        """Set admin message ID for order"""
        if user_id in self.orders:
            self.orders[user_id].admin_message_id = admin_message_id
            self.admin_orders[admin_message_id] = user_id


# Global order manager
order_manager = OrderManager()


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command"""
    user = update.effective_user
    
    welcome_text = f"""
🎮 **Welcome to MLBB Diamond Top-up Bot!** 💎

Hello {user.first_name}! 

Select your diamond package below:
    """
    
    # Create keyboard with diamond packages
    keyboard = []
    
    # Group packages in rows of 2
    package_items = list(DIAMOND_PACKAGES.items())
    for i in range(0, len(package_items), 2):
        row = []
        for j in range(2):
            if i + j < len(package_items):
                package_id, package_info = package_items[i + j]
                row.append(InlineKeyboardButton(
                    package_info["display"], 
                    callback_data=f"package_{package_id}"
                ))
        keyboard.append(row)
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        welcome_text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )


async def package_selection(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle package selection"""
    query = update.callback_query
    await query.answer()
    
    user = query.from_user
    package_id = query.data.split("_")[1]
    
    # Create new order
    order = order_manager.create_order(user.id, user.username or user.first_name, package_id)
    order.status = OrderStatus.WAITING_ID_SERVER
    
    package_info = DIAMOND_PACKAGES[package_id]
    
    confirmation_text = f"""
✅ **Package Selected:** {package_info["display"]}

Please send your **MLBB ID and Server** in this format:
`123456789 1234`

Example: `987654321 5678`
    """
    
    await query.edit_message_text(
        confirmation_text,
        parse_mode='Markdown'
    )


async def handle_id_server(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle MLBB ID and Server input"""
    user = update.effective_user
    order = order_manager.get_order(user.id)
    
    if not order or order.status != OrderStatus.WAITING_ID_SERVER:
        await update.message.reply_text(
            "❌ Please start with /start and select a package first."
        )
        return
    
    try:
        # Parse ID and Server
        parts = update.message.text.strip().split()
        if len(parts) != 2:
            await update.message.reply_text(
                "❌ Invalid format. Please send ID and Server like: `123456789 1234`",
                parse_mode='Markdown'
            )
            return
        
        mlbb_id, mlbb_server = parts
        order.mlbb_id = mlbb_id
        order.mlbb_server = mlbb_server
        
        # Show loading message
        loading_msg = await update.message.reply_text("🔍 Fetching your MLBB username...")
        
        # Fetch username from SmileOne API
        user_info = await SmileOneAPI.get_user_info(mlbb_id, mlbb_server)
        
        await loading_msg.delete()
        
        if user_info:
            order.mlbb_username = user_info['username']
            order.status = OrderStatus.WAITING_PAYMENT
            
            package_info = DIAMOND_PACKAGES[order.package_id]
            
            payment_text = f"""
✅ **Player Found!**

**👤 Username:** {user_info['username']}
**🆔 ID:** {mlbb_id}
**🖥️ Server:** {mlbb_server}
**💎 Package:** {package_info["display"]}
**💰 Amount:** {package_info["price"]}

**💳 Payment Instructions:**
1. Pay {package_info["price"]} via UPI to: `{UPI_ID}`
2. After payment, send your **UPI Reference ID** here

⚠️ **Important:** Only send the UPI Reference ID after successful payment!
            """
            
            await update.message.reply_text(
                payment_text,
                parse_mode='Markdown'
            )
        else:
            await update.message.reply_text(
                "❌ Player not found! Please check your ID and Server and try again.\n\n"
                "Send your MLBB ID and Server like: `123456789 1234`",
                parse_mode='Markdown'
            )
    
    except Exception as e:
        logger.error(f"Error handling ID/Server: {e}")
        await update.message.reply_text(
            "❌ An error occurred. Please try again with format: `123456789 1234`",
            parse_mode='Markdown'
        )


async def handle_upi_reference(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle UPI Reference ID"""
    user = update.effective_user
    order = order_manager.get_order(user.id)
    
    if not order or order.status != OrderStatus.WAITING_PAYMENT:
        return
    
    upi_ref = update.message.text.strip()
    order.upi_reference = upi_ref
    order.status = OrderStatus.PENDING_ADMIN
    
    # Send to admin for approval
    await send_to_admin(context, order)
    
    await update.message.reply_text(
        "✅ **Payment received!**\n\n"
        "Your order has been sent to admin for verification. "
        "You will receive your diamonds shortly after approval! 💎"
    )


async def send_to_admin(context: ContextTypes.DEFAULT_TYPE, order: Order) -> None:
    """Send order to admin for approval"""
    package_info = DIAMOND_PACKAGES[order.package_id]
    
    admin_text = f"""
🔔 **New Diamond Top-up Order**

**👤 Customer:** @{order.username} (`{order.user_id}`)
**📦 Package:** {package_info["display"]}
**💰 Amount:** {package_info["price"]}

**🎮 MLBB Details:**
**🆔 ID:** `{order.mlbb_id}`
**🖥️ Server:** `{order.mlbb_server}`
**👤 Username:** {order.mlbb_username}

**💳 Payment:**
**UPI Reference:** `{order.upi_reference}`
**UPI ID:** {UPI_ID}

**📝 Order ID:** `{order.order_id}`
    """
    
    keyboard = [
        [
            InlineKeyboardButton("✅ APPROVE", callback_data=f"admin_approve_{order.user_id}"),
            InlineKeyboardButton("❌ REJECT", callback_data=f"admin_reject_{order.user_id}")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    admin_message = await context.bot.send_message(
        chat_id=ADMIN_USER_ID,
        text=admin_text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )
    
    order_manager.set_admin_message(order.user_id, admin_message.message_id)


async def admin_decision(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle admin approval/rejection"""
    query = update.callback_query
    await query.answer()
    
    if query.from_user.id != ADMIN_USER_ID:
        await query.answer("❌ Unauthorized access!", show_alert=True)
        return
    
    data_parts = query.data.split("_")
    action = data_parts[1]  # approve or reject
    user_id = int(data_parts[2])
    
    order = order_manager.get_order(user_id)
    if not order:
        await query.edit_message_text("❌ Order not found!")
        return
    
    if action == "approve":
        await handle_admin_approval(query, context, order)
    else:
        await handle_admin_rejection(query, context, order)


async def handle_admin_approval(query, context: ContextTypes.DEFAULT_TYPE, order: Order) -> None:
    """Handle admin approval"""
    try:
        # Update order status
        order.status = OrderStatus.COMPLETED
        
        # Get product IDs for the package
        product_ids = PRODUCT_MAP.get(order.package_id, [])
        
        # Send diamonds via SmileOne API
        success = await SmileOneAPI.send_diamonds(
            order.mlbb_id, 
            order.mlbb_server, 
            product_ids
        )
        
        if success:
            # Update admin message
            package_info = DIAMOND_PACKAGES[order.package_id]
            await query.edit_message_text(
                f"✅ **ORDER APPROVED & COMPLETED**\n\n"
                f"**Customer:** @{order.username}\n"
                f"**Package:** {package_info['display']}\n"
                f"**MLBB ID:** {order.mlbb_id}:{order.mlbb_server}\n"
                f"**Username:** {order.mlbb_username}\n"
                f"**UPI Ref:** {order.upi_reference}\n"
                f"**Status:** Diamonds sent successfully! 💎",
                parse_mode='Markdown'
            )
            
            # Notify customer
            await context.bot.send_message(
                chat_id=order.user_id,
                text=f"🎉 **Order Completed Successfully!**\n\n"
                     f"Your {package_info['display']} has been sent to your MLBB account!\n"
                     f"**Username:** {order.mlbb_username}\n"
                     f"**ID:** {order.mlbb_id}:{order.mlbb_server}\n\n"
                     f"Thank you for using our service! 💎✨",
                parse_mode='Markdown'
            )
        else:
            # API failed
            await query.edit_message_text(
                f"❌ **API ERROR**\n\n"
                f"Order approved but SmileOne API failed.\n"
                f"Manual intervention required for:\n"
                f"**Customer:** @{order.username}\n"
                f"**MLBB ID:** {order.mlbb_id}:{order.mlbb_server}",
                parse_mode='Markdown'
            )
            
            # Notify customer
            await context.bot.send_message(
                chat_id=order.user_id,
                text="⚠️ **Order Approved**\n\n"
                     "Your payment has been verified. There was a temporary issue with our "
                     "diamond delivery system. Our team will manually process your order shortly.\n\n"
                     "Thank you for your patience! 💎",
                parse_mode='Markdown'
            )
    
    except Exception as e:
        logger.error(f"Error in admin approval: {e}")
        await query.edit_message_text(
            f"❌ **ERROR PROCESSING APPROVAL**\n\n"
            f"Contact technical support for order: {order.order_id}",
            parse_mode='Markdown'
        )


async def handle_admin_rejection(query, context: ContextTypes.DEFAULT_TYPE, order: Order) -> None:
    """Handle admin rejection"""
    try:
        order.status = OrderStatus.REJECTED
        
        # Update admin message
        await query.edit_message_text(
            f"❌ **ORDER REJECTED**\n\n"
            f"**Customer:** @{order.username}\n"
            f"**Package:** {DIAMOND_PACKAGES[order.package_id]['display']}\n"
            f"**UPI Ref:** {order.upi_reference}\n"
            f"**Status:** Payment verification failed",
            parse_mode='Markdown'
        )
        
        # Notify customer
        await context.bot.send_message(
            chat_id=order.user_id,
            text="❌ **Order Rejected**\n\n"
                 "Your payment could not be verified. Please contact support if you "
                 "believe this is an error.\n\n"
                 "Admin: @rishikeshkashyap",
            parse_mode='Markdown'
        )
    
    except Exception as e:
        logger.error(f"Error in admin rejection: {e}")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle text messages"""
    user = update.effective_user
    order = order_manager.get_order(user.id)
    
    if not order:
        await update.message.reply_text(
            "👋 Welcome! Please start with /start to begin your diamond top-up."
        )
        return
    
    if order.status == OrderStatus.WAITING_ID_SERVER:
        await handle_id_server(update, context)
    elif order.status == OrderStatus.WAITING_PAYMENT:
        await handle_upi_reference(update, context)
    else:
        await update.message.reply_text(
            "🤔 I didn't understand that. If you need help, please contact admin: @rishikeshkashyap"
        )


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle errors"""
    logger.error(f"Update {update} caused error {context.error}")


def main():
    """Main function to run the bot"""
    if BOT_TOKEN == 'YOUR_BOT_TOKEN_HERE':
        logger.error("Please set your BOT_TOKEN environment variable!")
        return
    
    # Create application
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CallbackQueryHandler(package_selection, pattern="^package_"))
    application.add_handler(CallbackQueryHandler(admin_decision, pattern="^admin_"))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Error handler
    application.add_error_handler(error_handler)
    
    logger.info("🤖 MLBB Diamond Top-up Bot is starting...")
    
    # Run the bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()