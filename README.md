# MERN Task Manager - Deployment Demo 🚀

A full-stack MERN (MongoDB, Express, React, Node.js) application built for demonstrating deployment on Azure App Service (backend) and Vercel (frontend).

## 📋 Project Structure

```
mern-deployment-demo/
├── backend/          # Node.js + Express API
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/         # React Application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
└── README.md
```

## ✨ Features

- ✅ Create, Read, Update, Delete tasks
- ✅ Mark tasks as completed
- ✅ Clean and modern UI
- ✅ Fully configured environment variables
- ✅ CORS enabled
- ✅ Health check endpoint
- ✅ Ready for production deployment

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS for cross-origin requests

**Frontend:**
- React 18
- Axios for API calls
- Modern CSS with gradient backgrounds

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mern-demo
FRONTEND_URL=http://localhost:3000
```

5. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your backend URL:
```env
REACT_APP_API_URL=http://localhost:5000
```

5. Start the frontend:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

---

## 🌐 Deployment Guide

### Backend Deployment (Azure App Service)

#### Step 1: Prepare MongoDB Database

**Option A: MongoDB Atlas (Recommended)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mern-demo?retryWrites=true&w=majority
   ```

**Option B: Azure Cosmos DB**

1. Create Cosmos DB with MongoDB API in Azure Portal
2. Get connection string from Azure Portal

#### Step 2: Deploy to Azure App Service

**Method 1: Using Azure Portal**

1. **Create App Service:**
   - Go to Azure Portal
   - Create new "Web App"
   - Runtime: Node 18 LTS
   - Operating System: Linux
   - Region: Choose your preferred region

2. **Configure Application Settings (Environment Variables):**
   - Go to: Configuration → Application settings
   - Add the following:
     ```
     MONGODB_URI=<your-mongodb-connection-string>
     NODE_ENV=production
     FRONTEND_URL=<your-vercel-frontend-url>
     PORT=8080
     WEBSITES_PORT=8080
     ```

3. **Deploy Code:**
   - Go to Deployment Center
   - Choose deployment source (GitHub, Local Git, etc.)
   - Connect your repository
   - Select `backend` folder as the root
   - Azure will auto-deploy

**Method 2: Using Azure CLI**

```bash
# Login to Azure
az login

# Create resource group
az group create --name mern-demo-rg --location eastus

# Create App Service plan
az appservice plan create --name mern-plan --resource-group mern-demo-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group mern-demo-rg --plan mern-plan --name <your-unique-app-name> --runtime "NODE|18-lts"

# Configure environment variables
az webapp config appsettings set --resource-group mern-demo-rg --name <your-app-name> --settings \
  MONGODB_URI="<your-mongodb-uri>" \
  NODE_ENV="production" \
  FRONTEND_URL="<your-vercel-url>" \
  WEBSITES_PORT="8080"

# Deploy from local git (from backend directory)
cd backend
git init
az webapp deployment source config-local-git --name <your-app-name> --resource-group mern-demo-rg
git remote add azure <deployment-url-from-previous-command>
git add .
git commit -m "Initial deployment"
git push azure main
```

**Method 3: Using GitHub Actions**

1. Create `.github/workflows/azure-deploy.yml` in your repo:

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      working-directory: ./backend
      run: npm ci
      
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: <your-app-name>
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./backend
```

2. Add your Azure publish profile to GitHub Secrets

#### Step 3: Verify Backend Deployment

Visit: `https://<your-app-name>.azurewebsites.net/api/health`

You should see:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "environment": "production",
  "timestamp": "2024-xx-xxTxx:xx:xx.xxxZ"
}
```

---

### Frontend Deployment (Vercel)

#### Step 1: Prepare for Deployment

1. Ensure your backend is deployed and URL is available
2. Update frontend code if needed

#### Step 2: Deploy to Vercel

**Method 1: Using Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login (GitHub recommended)
3. Click "New Project"
4. Import your repository
5. **Configure Project:**
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. **Environment Variables:**
   - Add: `REACT_APP_API_URL=https://<your-azure-app>.azurewebsites.net`
7. Click "Deploy"

**Method 2: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? mern-task-manager-frontend
# - Directory? ./
# - Override settings? No

# Add environment variable
vercel env add REACT_APP_API_URL production

# Enter your Azure backend URL when prompted
# Example: https://your-app-name.azurewebsites.net

# Deploy to production
vercel --prod
```

**Method 3: Continuous Deployment with Git**

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Vercel will auto-deploy on every push to main branch

#### Step 3: Configure vercel.json (Optional)

Create `frontend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### Step 4: Update Backend CORS

Update your Azure App Service environment variable:
```
FRONTEND_URL=https://<your-vercel-app>.vercel.app
```

---

## 🧪 Testing the Deployment

1. **Backend Health Check:**
   ```bash
   curl https://<your-azure-app>.azurewebsites.net/api/health
   ```

2. **Frontend Access:**
   - Visit: `https://<your-vercel-app>.vercel.app`
   - Try creating a task
   - Check if it saves to the database

3. **API Connection:**
   - Open browser console on frontend
   - Check for any CORS errors
   - Verify API calls are successful

---

## 📝 Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | production |
| MONGODB_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/dbname |
| FRONTEND_URL | Frontend URL for CORS | https://app.vercel.app |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | https://app.azurewebsites.net |

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Check MongoDB connection string
- Verify IP whitelist in MongoDB Atlas
- Check Azure App Service logs: `az webapp log tail --name <app-name> --resource-group <rg-name>`

**App Won't Start:**
- Verify `WEBSITES_PORT=8080` is set
- Check Node.js version compatibility
- Review Azure App Service logs

**CORS Errors:**
- Ensure `FRONTEND_URL` is correctly set
- Verify frontend URL matches exactly (with https://)

### Frontend Issues

**Can't Connect to Backend:**
- Verify `REACT_APP_API_URL` environment variable
- Check Azure backend is running
- Test backend health endpoint directly

**Build Fails on Vercel:**
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure no console errors in code

---

## 📚 API Endpoints

### Health Check
```
GET /api/health
Response: { status: "ok", message: "Backend is running" }
```

### Tasks
```
GET    /api/tasks          - Get all tasks
GET    /api/tasks/:id      - Get single task
POST   /api/tasks          - Create new task
PUT    /api/tasks/:id      - Update task
PATCH  /api/tasks/:id/toggle - Toggle task completion
DELETE /api/tasks/:id      - Delete task
```

---

---

## 📖 Additional Resources

- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Express.js Guide](https://expressjs.com/en/starter/installing.html)

---

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

Created for MERN Stack deployment demonstration.

---

**Happy Deploying! 🎉**
