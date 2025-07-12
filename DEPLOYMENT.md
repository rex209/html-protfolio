# 🚀 GameTopUp Deployment Guide

This guide provides step-by-step instructions for deploying the GameTopUp website in various environments.

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git
- npm or yarn

## 🎯 Quick Demo (No MongoDB Required)

For a quick demonstration of the website functionality:

```bash
# Clone the repository
git clone <repository-url>
cd game-topup-website

# Install dependencies
npm install

# Run demo server
npm run demo
```

**Demo Access:**
- **Frontend**: http://localhost:3001
- **Admin Panel**: http://localhost:3001/admin
- **Admin Credentials**: `admin` / `smileadmin@123`

## 🏠 Local Development Setup

### 1. Install MongoDB

**Option A: Local MongoDB Installation**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS with Homebrew
brew install mongodb/brew/mongodb-community

# Windows - Download from MongoDB website
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### 2. Setup Environment

```bash
# Clone repository
git clone <repository-url>
cd game-topup-website

# Install dependencies
npm install

# Setup environment variables
cp .env.template .env
# Edit .env with your configurations

# Start MongoDB (if using local)
mongod

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

### 3. Access Application

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Health**: http://localhost:3000/api/health

## 🐳 Docker Deployment

### Single Container

```bash
# Build image
docker build -t game-topup .

# Run container
docker run -p 3000:3000 -e MONGODB_URI=mongodb://host.docker.internal:27017/game-topup game-topup
```

### Docker Compose (Recommended)

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

**Services:**
- **App**: http://localhost:3000
- **MongoDB**: localhost:27017

## ☁️ Cloud Deployment

### Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set SMILE_EMAIL=smilestockapi@gmail.com
heroku config:set SMILE_UID=2932248
heroku config:set SMILE_M_KEY=b7919dab2af9089c1502c50bf665e171
heroku config:set TELEGRAM_BOT_TOKEN=8187483951:AAHnh-9UtMVt7hPZtSPn6ZwE4dtkAq_V7Yk
heroku config:set TELEGRAM_ADMIN_ID=5304539511

# Deploy
git push heroku main

# Seed database
heroku run npm run seed
```

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set run command: `npm start`
4. Add environment variables in the dashboard
5. Deploy

### AWS EC2

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb

# Clone repository
git clone <repository-url>
cd game-topup-website

# Install dependencies
npm install

# Setup environment
cp .env.template .env
# Edit .env file

# Install PM2 for process management
sudo npm install -g pm2

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Seed database
npm run seed

# Start application with PM2
pm2 start server.js --name "game-topup"
pm2 startup
pm2 save

# Setup reverse proxy with Nginx
sudo apt install nginx
sudo nano /etc/nginx/sites-available/game-topup
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/game-topup /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## 🔧 Production Configuration

### Environment Variables

```env
# Production settings
NODE_ENV=production
PORT=3000

# Database (use strong credentials)
MONGODB_URI=mongodb://username:password@host:port/database

# JWT (use strong secret)
JWT_SECRET=your-super-secure-jwt-secret-key

# Smile API
SMILE_EMAIL=smilestockapi@gmail.com
SMILE_UID=2932248
SMILE_M_KEY=b7919dab2af9089c1502c50bf665e171
SMILE_BASE_URL=https://www.smile.one/smilecoin/api/

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_ADMIN_ID=your-admin-id

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Use secure MongoDB credentials
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## 📊 Monitoring & Maintenance

### Health Check

```bash
# Check application health
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "mongodb": "connected",
  "environment": "production"
}
```

### PM2 Monitoring

```bash
# View process status
pm2 status

# View logs
pm2 logs game-topup

# Restart application
pm2 restart game-topup

# Monitor resources
pm2 monit
```

### Database Maintenance

```bash
# Backup database
mongodump --uri="mongodb://localhost:27017/game-topup" --out=/backup/

# Restore database
mongorestore --uri="mongodb://localhost:27017/game-topup" /backup/game-topup/
```

## 🔄 Updates & Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart application
pm2 restart game-topup
```

### Database Updates

```bash
# Run migrations (if any)
npm run migrate

# Re-seed database (if needed)
npm run seed
```

## 🚨 Troubleshooting

### Common Issues

**1. MongoDB Connection Issues**
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Check connection
mongo --eval "db.runCommand({ connectionStatus: 1 })"
```

**2. Port Already in Use**
```bash
# Find process using port
sudo netstat -tulpn | grep :3000

# Kill process
sudo kill -9 PID
```

**3. Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/project
```

**4. Memory Issues**
```bash
# Check memory usage
free -h

# Restart application
pm2 restart game-topup
```

### Log Files

```bash
# Application logs
pm2 logs game-topup

# System logs
tail -f /var/log/syslog

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## 📞 Support

For deployment issues:

1. Check the logs first
2. Verify environment variables
3. Test database connectivity
4. Check port availability
5. Review error messages

## 🎯 Performance Optimization

### Production Optimizations

```bash
# Enable compression
npm install compression

# Use clustering
npm install cluster

# Implement caching
npm install redis node-cache

# Add monitoring
npm install prometheus-client
```

### Database Optimization

- Create proper indexes
- Use connection pooling
- Implement query optimization
- Set up database monitoring

---

**🎉 Congratulations!** Your GameTopUp website is now deployed and ready to serve users.

For any issues, refer to the troubleshooting section or check the application logs.