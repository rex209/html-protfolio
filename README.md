# 🎮 GameTopUp - Complete Game Top-Up Website

A complete game top-up website similar to UniPin with full backend and frontend functionality. Users can pay manually via UPI, and admins can approve orders. Once approved, the Smile API is triggered to complete the top-up.

## 🌟 Features

### 🌐 Frontend Features
- **UniPin-style homepage** with game cards
- **Game pages** showing available packs with prices
- **User order form** (Game ID, Zone ID, UPI Transaction ID)
- **UPI payment display**: `7002610853@fam`
- **Order confirmation** page with Order ID
- **Order tracking** system ("Track My Order" on homepage)
- **Fully responsive** design for mobile devices

### 👨‍💼 Admin Panel Features
- **Secure admin login**: `admin` / `smileadmin@123`
- **Game management** (add, edit, enable/disable games)
- **Pack management** per game (add/edit/enable/disable packs)
- **Order management** (view all orders, filter by game/status/date)
- **Order approval/rejection** system
- **Bulk pack upload** via CSV
- **Dashboard** with analytics

### 🔐 API Integrations
- **Smile API Integration** for completing top-ups
- **Telegram Bot** for admin notifications
- **Automated order processing** after approval

### 🤖 Telegram Bot Features
- **Real-time notifications** for new orders
- **Order status updates** for admins
- **Admin alerts** for important events

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Frontend**: HTML + Tailwind CSS
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, Rate Limiting, CORS
- **API Integration**: Smile API, Telegram Bot API

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd game-topup-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.template .env
   # Edit .env with your configurations
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env file
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin
   - **Admin Credentials**: `admin` / `smileadmin@123`

## 📁 Project Structure

```
game-topup-website/
├── models/                 # MongoDB models
│   ├── Game.js
│   ├── Pack.js
│   ├── Order.js
│   └── User.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── games.js
│   ├── packs.js
│   ├── orders.js
│   └── admin.js
├── utils/                  # Utility functions
│   ├── smile-api.js
│   └── telegram.js
├── public/                 # Frontend files
│   ├── index.html
│   ├── game.html
│   ├── order.html
│   └── admin.html
├── scripts/               # Database scripts
│   └── seed.js
├── server.js              # Main server file
├── package.json
├── .env.template          # Environment variables template
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.template`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/game-topup

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Smile API
SMILE_EMAIL=smilestockapi@gmail.com
SMILE_UID=2932248
SMILE_M_KEY=b7919dab2af9089c1502c50bf665e171
SMILE_BASE_URL=https://www.smile.one/smilecoin/api/

# Telegram Bot
TELEGRAM_BOT_TOKEN=8187483951:AAHnh-9UtMVt7hPZtSPn6ZwE4dtkAq_V7Yk
TELEGRAM_ADMIN_ID=5304539511

# Payment
UPI_ID=7002610853@fam
```

### Smile API Configuration

The Smile API integration includes:
- **Email**: `smilestockapi@gmail.com`
- **UID**: `2932248`
- **API Key**: `b7919dab2af9089c1502c50bf665e171`
- **Endpoints**: `getrole` and `createorder`
- **Signature**: `md5(md5(sortedParams + '&m_key'))`

### Telegram Bot Configuration

- **Bot Token**: `8187483951:AAHnh-9UtMVt7hPZtSPn6ZwE4dtkAq_V7Yk`
- **Admin ID**: `5304539511`
- **Notification Format**:
  ```
  🆕 New Order
  Game: MLBB
  Game ID: 123456
  Pack: 275 Diamonds
  Txn ID: ABC123XYZ
  ```

## 📊 Sample Data

The seed script includes:

### Games
- **Mobile Legends: Bang Bang** (MLBB)
- **Free Fire** (FF)
- **PUBG Mobile** (PUBGM)

### MLBB Packs
- 55 Diamond - ₹4.00
- 165 Diamond - ₹11.99
- 275 Diamond - ₹19.75
- 565 Diamond - ₹40.50
- 78&8 Diamond - ₹6.25
- 156&16 Diamond - ₹12.50
- 234&23 Diamond - ₹18.67
- 625&81 Diamond - ₹50.00
- 1860&335 Diamond - ₹150.00
- 3099&589 Diamond - ₹250.00
- 4649&883 Diamond - ₹375.00
- 7740&1548 Diamond - ₹625.00
- Passagem... - ₹41.25
- Passe Semanal - ₹8.00

## 🛡️ Security Features

- **JWT Authentication** for admin access
- **Password hashing** using bcrypt
- **Rate limiting** to prevent abuse
- **CORS protection** for API endpoints
- **Input validation** using express-validator
- **Helmet** for security headers

## 📱 API Endpoints

### Public Endpoints
- `GET /api/games` - Get all active games
- `GET /api/games/:id` - Get specific game
- `GET /api/packs/:gameId` - Get packs for a game
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderId` - Get order details

### Admin Endpoints
- `POST /api/auth/login` - Admin login
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/approve` - Approve order
- `PUT /api/admin/orders/:id/reject` - Reject order
- `GET /api/admin/games` - Manage games
- `GET /api/admin/packs` - Manage packs

## 🚢 Deployment

### Production Setup

1. **Set up production environment**
   ```bash
   NODE_ENV=production
   ```

2. **Use production database**
   ```bash
   MONGODB_URI=mongodb://your-production-db-url
   ```

3. **Configure reverse proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "game-topup"
   pm2 startup
   pm2 save
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/game-topup
    depends_on:
      - mongo
  
  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 🔧 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Adding New Games

1. **Via Admin Panel**: Login to admin panel and add games
2. **Via Database**: Add to `games` collection
3. **Via Seed Script**: Update `scripts/seed.js`

### Adding New Packs

1. **Via Admin Panel**: Manage packs section
2. **Via CSV Upload**: Use bulk upload feature
3. **Via API**: POST to `/api/admin/packs`

## 📞 Support

For support and questions:
- Check the logs: `pm2 logs game-topup`
- Monitor the database: Use MongoDB Compass
- Test API endpoints: Use Postman or curl
- Check Telegram bot: `/test` command

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- [ ] Multiple payment methods (PayPal, Stripe)
- [ ] Real-time order tracking
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Automated testing suite
- [ ] API documentation with Swagger

---

**Ready to use!** 🚀 The website is fully functional and ready for deployment.

For any issues or questions, please check the logs or contact the development team.