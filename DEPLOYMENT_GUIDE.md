# 🚀 Quick Deployment Guide

## Prerequisites Checklist
- [ ] MongoDB Atlas account created
- [ ] Azure account with active subscription
- [ ] Vercel account (free tier works)
- [ ] Git repository (GitHub recommended)

## 30-Minute Deployment Steps

### Phase 1: Database Setup (5 minutes)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Database Access → Add User (username/password)
4. Network Access → Add IP: `0.0.0.0/0`
5. Copy connection string

### Phase 2: Backend Deployment to Azure (10 minutes)

#### Option A: Azure Portal (Recommended for beginners)
1. Azure Portal → Create Resource → Web App
2. Settings:
   - Name: `mern-demo-backend-[your-name]`
   - Runtime: Node 18 LTS
   - OS: Linux
   - Region: East US (or nearest)
3. Review + Create
4. Go to Configuration → Application Settings → New:
   ```
   MONGODB_URI = <paste-your-mongodb-connection-string>
   NODE_ENV = production
   FRONTEND_URL = https://your-app.vercel.app
   WEBSITES_PORT = 8080
   ```
5. Deployment Center → GitHub → Authorize → Select repo → Select `backend` folder
6. Save

#### Option B: Azure CLI (Faster for experienced users)
```bash
az login
az group create --name mern-rg --location eastus
az appservice plan create --name mern-plan --resource-group mern-rg --sku B1 --is-linux
az webapp create --resource-group mern-rg --plan mern-plan --name mern-demo-backend-yourname --runtime "NODE|18-lts"
az webapp config appsettings set --resource-group mern-rg --name mern-demo-backend-yourname --settings MONGODB_URI="<your-uri>" NODE_ENV="production" WEBSITES_PORT="8080" FRONTEND_URL="https://your-app.vercel.app"
```

#### Verify Backend
Visit: `https://mern-demo-backend-yourname.azurewebsites.net/api/health`

### Phase 3: Frontend Deployment to Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. New Project → Import Git Repository
3. Select your repo
4. Configure:
   - Framework: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Environment Variables → Add:
   ```
   REACT_APP_API_URL = https://mern-demo-backend-yourname.azurewebsites.net
   ```
6. Deploy

### Phase 4: Final Configuration (5 minutes)

1. Copy Vercel URL (e.g., `https://your-app.vercel.app`)
2. Go back to Azure Portal
3. Your Web App → Configuration → Edit `FRONTEND_URL`
4. Paste Vercel URL → Save
5. Restart Web App

### Phase 5: Testing (5 minutes)

1. Visit your Vercel URL
2. Create a test task
3. Verify it saves and appears
4. Check completion toggle works
5. Test delete functionality

---

## Common Issues & Quick Fixes

### Backend won't start
```bash
# Check logs
az webapp log tail --name <your-app-name> --resource-group mern-rg

# Common fix: Ensure WEBSITES_PORT=8080
```

### CORS errors
- Verify `FRONTEND_URL` in Azure exactly matches Vercel URL (including https://)
- Restart Azure web app after changing

### MongoDB connection fails
- Check IP whitelist: must include `0.0.0.0/0`
- Verify username/password in connection string
- Test connection string locally first

### Frontend can't reach backend
- Ensure `REACT_APP_API_URL` is set in Vercel
- Redeploy frontend after adding env variable
- Check Azure backend is running

---

## Demo Script for Students

### Introduction (2 minutes)
"Today we'll deploy a full-stack MERN application across two different cloud platforms - Azure for our Node.js backend and Vercel for our React frontend."

### Database Setup (3 minutes)
"First, we need a database. We're using MongoDB Atlas - a cloud database service..."

### Backend Deployment (8 minutes)
"Now let's deploy our API to Azure App Service. Notice how we're configuring environment variables..."

### Frontend Deployment (5 minutes)
"For our React app, we're using Vercel. Watch how simple this is..."

### Testing & Verification (5 minutes)
"Let's test everything works together. Create a task... check the database..."

### Q&A (7 minutes)
Common questions:
- Why separate deployments? (Scalability, different requirements)
- Cost? (Both have free tiers)
- Alternatives? (Heroku, Render, Netlify, AWS)

---

## Environment Variables Cheat Sheet

### Backend (Azure)
```bash
PORT=8080
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
FRONTEND_URL=https://your-app.vercel.app
WEBSITES_PORT=8080
```

### Frontend (Vercel)
```bash
REACT_APP_API_URL=https://your-app.azurewebsites.net
```

---

## Pro Tips

1. **Use descriptive names:** Include your project name in app URLs
2. **Document everything:** Keep environment variables in a safe place
3. **Test locally first:** Run `npm start` before deploying
4. **Check logs:** Both Azure and Vercel have excellent logging
5. **Free tiers:** Start with free plans, upgrade only when needed

---

## Next Steps After Deployment

1. **Custom Domain:** Add your own domain to Vercel
2. **HTTPS:** Already included by default!
3. **Monitoring:** Set up Azure Application Insights
4. **Analytics:** Add Vercel Analytics
5. **CI/CD:** Automate with GitHub Actions

---

**You're all set! 🎉**

Questions? Check the main README.md for detailed documentation.
