# TaskForge MERN - Quick Start Guide

## 🚀 Quick Setup (Local Development)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Setup MongoDB
- **Option A - Local MongoDB**
  - Install MongoDB locally
  - MongoDB runs on `mongodb://localhost:27017`

- **Option B - MongoDB Atlas (Cloud)**
  - Create account at https://www.mongodb.com/cloud/atlas
  - Create a cluster
  - Get connection string
  - Replace in `server/.env`

### 3. Configure Environment
```bash
# Navigate to server directory
cd server

# Create .env file
cp .env.example .env

# Update .env with:
# - MONGODB_URI (your database connection)
# - JWT_SECRET (any random string)
# - PORT (default 5000)
```

### 4. Start Development Servers
```bash
# From root directory, run both client and server
npm run dev
```

Or separately:
```bash
# Terminal 1 - Server (port 5000)
npm run server

# Terminal 2 - Client (port 3000)
npm run client
```

### 5. Access Application
- Client: http://localhost:3000
- Server: http://localhost:5000
- API: http://localhost:5000/api

### 6. Test Accounts

Create accounts through registration page, or add to MongoDB:

```javascript
// Default Admin (add to users collection)
{
  name: "Admin User",
  email: "admin@taskforge.com",
  password: "hashed_password",
  role: "admin"
}
```

---

## 🌐 Deployment Options

### Option 1: Heroku (Free tier available)

1. **Install Heroku CLI**
   ```bash
   # Visit https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku login
   heroku create taskforge-app
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster...
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **View Logs**
   ```bash
   heroku logs --tail
   ```

### Option 2: Railway.app (Recommended)

1. **Sign up** at https://railway.app

2. **Connect GitHub repository**

3. **Create services:**
   - Node.js service for backend
   - MongoDB service (or use MongoDB Atlas)

4. **Set environment variables** in Railway dashboard

5. **Deploy** - automatic on push

### Option 3: Vercel + External API

1. **Deploy Frontend to Vercel**
   ```bash
   cd client
   npm install -g vercel
   vercel
   ```

2. **Deploy Backend to Railway/Render**
   - Use guides above

3. **Update client API endpoint** in `client/src/services/api.js`:
   ```javascript
   const api = axios.create({
     baseURL: process.env.REACT_APP_API_URL || '/api',
   })
   ```

### Option 4: Docker + Cloud Run

1. **Create Dockerfile**
   ```dockerfile
   FROM node:16
   WORKDIR /app
   COPY . .
   RUN npm install
   RUN cd client && npm run build
   EXPOSE 5000
   CMD ["node", "server/index.js"]
   ```

2. **Build Image**
   ```bash
   docker build -t taskforge .
   ```

3. **Test Locally**
   ```bash
   docker run -p 5000:5000 \
     -e MONGODB_URI=your_mongodb_uri \
     -e JWT_SECRET=your_secret \
     taskforge
   ```

4. **Deploy to Cloud Run**
   ```bash
   # Using Google Cloud
   gcloud run deploy taskforge --source .
   ```

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB connection string working
- [ ] JWT_SECRET set in environment
- [ ] .env files not committed to git
- [ ] Client build works: `cd client && npm run build`
- [ ] All API endpoints tested
- [ ] Frontend connects to backend API
- [ ] CORS configured if needed
- [ ] Database backups enabled

---

## 🔧 Troubleshooting

### "Cannot find module" errors
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection error
```bash
# Check connection string format
# Should be: mongodb+srv://username:password@cluster.mongodb.net/dbname
# Or: mongodb://localhost:27017/taskforge
```

### Port already in use
```bash
# Kill process on port 5000 (server)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (client)
lsof -ti:3000 | xargs kill -9
```

### CORS errors
- Ensure server CORS is configured
- Frontend should point to correct API URL
- Check `vite.config.js` proxy settings

---

## 📞 Support Resources

- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- JWT Guide: https://jwt.io

---

## 🎯 Next Steps

1. Customize branding and colors
2. Add email notifications
3. Implement task comments/attachments
4. Add team management features
5. Create mobile app version
6. Add analytics dashboard

Enjoy using TaskForge! 🚀
