# 💻 Local Development Guide

This guide helps you run the MERN Task Manager on your local machine for development and testing before deployment.

---

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - Choose one option:
  - Local MongoDB: [Download](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas: [Sign up](https://www.mongodb.com/cloud/atlas) (Free tier)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

### Verify Installation
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
git --version     # Should show 2.x.x or higher
```

---

## Quick Start (5 minutes)

### 1. Clone/Download Project
```bash
# If using Git
git clone <repository-url>
cd mern-deployment-demo

# Or extract downloaded ZIP
cd mern-deployment-demo
```

### 2. Set Up Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings (see below)

# Start backend
npm start
```

Backend should start on: http://localhost:5000

### 3. Set Up Frontend (in new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env (see below)

# Start frontend
npm start
```

Frontend should open automatically at: http://localhost:3000

---

## Detailed Setup

### Backend Configuration

#### Option A: Using MongoDB Atlas (Recommended for beginners)

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Click "Build a Database"
   - Choose FREE tier
   - Select cloud provider and region
   - Create cluster (takes 3-5 minutes)

2. **Configure Database Access:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `admin` (or your choice)
   - Password: Click "Autogenerate Secure Password" and SAVE IT
   - User Privileges: "Read and write to any database"
   - Click "Add User"

3. **Configure Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0`
   - Click "Confirm"

4. **Get Connection String:**
   - Go to "Databases"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password
   - Replace `<database>` with `mern-demo`

5. **Update backend/.env:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mern-demo?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:3000
   ```

#### Option B: Using Local MongoDB

1. **Install MongoDB:**
   - Download from https://www.mongodb.com/try/download/community
   - Follow installation instructions for your OS
   - Start MongoDB service

2. **Verify MongoDB is running:**
   ```bash
   # On Mac/Linux
   sudo systemctl status mongod
   
   # On Windows
   # MongoDB should run as a service
   # Check Services app
   ```

3. **Update backend/.env:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/mern-demo
   FRONTEND_URL=http://localhost:3000
   ```

### Frontend Configuration

Update `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## Running the Application

### Start Backend
```bash
cd backend

# Standard mode
npm start

# Development mode (auto-restart on changes)
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
📝 Environment: development
✅ MongoDB connected successfully
```

### Start Frontend
```bash
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

### Access the Application
Open browser and go to: http://localhost:3000

---

## Testing Locally

### 1. Backend API Tests

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "environment": "development",
  "timestamp": "2024-xx-xxTxx:xx:xx.xxxZ"
}
```

**Get All Tasks:**
```bash
curl http://localhost:5000/api/tasks
```

**Create Task:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"This is a test"}'
```

### 2. Frontend Tests

1. Open http://localhost:3000
2. Create a new task
3. Mark task as complete
4. Edit task
5. Delete task
6. Refresh page (data should persist)

### 3. Database Verification

**MongoDB Atlas:**
- Go to your cluster
- Click "Browse Collections"
- You should see `mern-demo` database
- With `tasks` collection

**Local MongoDB:**
```bash
# Connect to MongoDB
mongosh

# Select database
use mern-demo

# Show tasks
db.tasks.find().pretty()
```

---

## Development Workflow

### Making Changes

**Backend Changes:**
1. Edit files in `backend/`
2. If using `npm run dev`, server auto-restarts
3. If using `npm start`, manually restart:
   ```bash
   # Press Ctrl+C to stop
   npm start
   ```

**Frontend Changes:**
1. Edit files in `frontend/src/`
2. Changes auto-reload in browser
3. Check browser console for errors

### Code Structure

**Backend (backend/server.js):**
```javascript
// 1. Imports and setup
// 2. Middleware configuration
// 3. MongoDB connection
// 4. Data models
// 5. Route handlers
// 6. Error handling
// 7. Server start
```

**Frontend (frontend/src/App.js):**
```javascript
// 1. Imports
// 2. State management (useState)
// 3. API calls (useEffect)
// 4. Event handlers
// 5. JSX return (UI)
```

### Adding New Features

**Example: Add a "priority" field to tasks**

1. **Update Backend Model:**
   ```javascript
   // In server.js, update taskSchema
   const taskSchema = new mongoose.Schema({
     title: String,
     description: String,
     completed: Boolean,
     priority: {
       type: String,
       enum: ['low', 'medium', 'high'],
       default: 'medium'
     }
   });
   ```

2. **Update Backend Route:**
   ```javascript
   // In POST /api/tasks
   const task = await Task.create({
     title,
     description,
     priority: req.body.priority || 'medium'
   });
   ```

3. **Update Frontend Form:**
   ```javascript
   // Add to form state
   const [newTask, setNewTask] = useState({
     title: '',
     description: '',
     priority: 'medium'
   });
   
   // Add select input in JSX
   <select
     value={newTask.priority}
     onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
   >
     <option value="low">Low</option>
     <option value="medium">Medium</option>
     <option value="high">High</option>
   </select>
   ```

4. **Test:**
   - Create new task with priority
   - Verify in database
   - Check display in UI

---

## Common Development Issues

### Port Already in Use

**Symptom:** "Error: listen EADDRINUSE: address already in use :::5000"

**Fix:**
```bash
# Find process using port 5000
# Mac/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port in backend/.env
PORT=5001
```

### Module Not Found

**Symptom:** "Error: Cannot find module 'express'"

**Fix:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or install specific package
npm install express
```

### MongoDB Connection Failed

**Symptom:** "MongoNetworkError: connection refused"

**Fix:**
1. Check MongoDB is running:
   ```bash
   # Mac/Linux
   sudo systemctl status mongod
   
   # Mac (if installed via Homebrew)
   brew services list
   ```

2. Check connection string in .env

3. For Atlas: Check IP whitelist

### CORS Errors in Browser

**Symptom:** "Access-Control-Allow-Origin header"

**Fix:**
1. Verify backend is running
2. Check FRONTEND_URL in backend/.env
3. Ensure cors is configured in server.js

### Frontend Shows Old Data

**Fix:**
```bash
# Clear browser cache
# Or hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

# Clear React cache
cd frontend
rm -rf node_modules/.cache
npm start
```

---

## Development Tools

### Recommended VS Code Extensions
- ESLint - Code linting
- Prettier - Code formatting
- Thunder Client - API testing (alternative to Postman)
- MongoDB for VS Code - Database viewer
- GitLens - Git integration

### Browser Extensions
- React Developer Tools
- Redux DevTools (if using Redux)

### Useful Commands

**Backend:**
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Run tests (if added)
npm test

# Check code quality
npm run lint
```

**Frontend:**
```bash
# Production build (test before deploying)
npm run build

# Serve production build locally
npx serve -s build
```

### Environment Variables

**.env files should NEVER be committed to Git**

Add to .gitignore:
```
.env
.env.local
.env.*.local
```

Always keep .env.example updated:
```bash
# After adding new variable
echo "NEW_VARIABLE=example_value" >> .env.example
```

---

## Debugging Tips

### Backend Debugging

1. **Add console.logs:**
   ```javascript
   app.post('/api/tasks', async (req, res) => {
     console.log('Received task:', req.body);
     // ... rest of code
   });
   ```

2. **Use VS Code debugger:**
   - Add breakpoints
   - Press F5 to start debugging
   - Or add to package.json:
     ```json
     "scripts": {
       "debug": "node --inspect server.js"
     }
     ```

3. **Check MongoDB data:**
   ```javascript
   // Add temporary route
   app.get('/api/debug/tasks', async (req, res) => {
     const tasks = await Task.find();
     res.json({ count: tasks.length, tasks });
   });
   ```

### Frontend Debugging

1. **Browser Console:**
   - Right-click → Inspect → Console
   - Check for errors and warnings

2. **Network Tab:**
   - See all API calls
   - Check request/response
   - Verify status codes

3. **React DevTools:**
   - Install extension
   - View component state
   - Props and hooks

---

## Before Deploying

### Pre-Deployment Checklist

- [ ] All features work locally
- [ ] No console errors
- [ ] No console warnings (fix or suppress)
- [ ] Database operations work
- [ ] CRUD operations tested
- [ ] Code is formatted
- [ ] .env.example is updated
- [ ] README reflects any changes
- [ ] Git commits are clean
- [ ] Build works: `npm run build`

### Test Production Build Locally

**Backend:**
```bash
# Set to production
export NODE_ENV=production  # Mac/Linux
set NODE_ENV=production     # Windows

npm start
```

**Frontend:**
```bash
# Build
npm run build

# Serve
npx serve -s build
```

Access at http://localhost:3000 and test everything.

---

## Tips for Students

1. **Start Simple:**
   - Get basic setup working first
   - Add features incrementally
   - Test after each change

2. **Read Error Messages:**
   - They usually tell you exactly what's wrong
   - Google the error if unclear
   - Stack Overflow is your friend

3. **Use Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   
   # Before major changes
   git checkout -b new-feature
   # Make changes
   git add .
   git commit -m "Add new feature"
   ```

4. **Document as You Go:**
   - Add comments to complex code
   - Update README with changes
   - Keep .env.example current

5. **Ask for Help:**
   - Don't struggle alone for hours
   - Share error messages
   - Show what you've tried

---

## Next Steps

Once everything works locally:
1. Push to GitHub
2. Follow DEPLOYMENT_GUIDE.md
3. Deploy to Azure and Vercel
4. Test production deployment

---

**Happy Coding! 🚀**
