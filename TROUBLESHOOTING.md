# 🔧 Troubleshooting Guide

## Quick Diagnosis

### Is the problem with...?
1. **Backend not starting** → See [Backend Issues](#backend-issues)
2. **Frontend can't connect** → See [Connection Issues](#connection-issues)
3. **Database errors** → See [Database Issues](#database-issues)
4. **CORS errors** → See [CORS Issues](#cors-issues)
5. **Deployment fails** → See [Deployment Issues](#deployment-issues)

---

## Backend Issues

### Backend won't start on Azure

**Symptom:** Application shows "Service Unavailable"

**Diagnostics:**
```bash
# View real-time logs
az webapp log tail --name <your-app-name> --resource-group <resource-group>

# Download logs
az webapp log download --name <your-app-name> --resource-group <resource-group>
```

**Common Causes & Fixes:**

1. **Missing WEBSITES_PORT**
   ```
   Error: App doesn't listen on PORT
   Fix: Add environment variable: WEBSITES_PORT=8080
   ```

2. **Wrong Node version**
   ```
   Error: Unsupported engine
   Fix: In package.json add:
   "engines": {
     "node": ">=18.0.0"
   }
   ```

3. **Missing dependencies**
   ```
   Error: Cannot find module 'express'
   Fix: Ensure package.json has all dependencies
   Run: npm install --save express mongoose cors dotenv
   ```

4. **MongoDB connection fails on startup**
   ```
   Error: MongoDB connection error
   Fix: Make connection async, don't block startup
   See server.js connectDB() function
   ```

### Backend crashes after starting

**Diagnostics:**
```bash
# Check application logs
az webapp log tail --name <your-app-name> --resource-group <resource-group>

# Check crash dumps
az webapp log download --log-file crash.log
```

**Common Causes:**
1. Unhandled promise rejections
2. Missing error handlers
3. Memory leaks
4. Database connection lost

**Fixes:**
```javascript
// Add global error handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
```

### Routes return 404

**Symptom:** `/api/health` works but `/api/tasks` returns 404

**Causes:**
1. Route not defined
2. Middleware blocking routes
3. Router not mounted

**Fix:**
```javascript
// Ensure routes are defined before 404 handler
app.get('/api/tasks', ...);
app.post('/api/tasks', ...);

// 404 handler should be LAST
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
```

---

## Database Issues

### Cannot connect to MongoDB Atlas

**Symptom:** "MongoNetworkError: connection timed out"

**Diagnostics:**
```bash
# Test connection string locally
node -e "require('mongoose').connect('YOUR_CONNECTION_STRING').then(() => console.log('OK')).catch(e => console.log(e))"
```

**Common Causes & Fixes:**

1. **IP not whitelisted**
   ```
   Error: connection timed out
   Fix: 
   - Go to MongoDB Atlas
   - Network Access
   - Add IP: 0.0.0.0/0 (allow all)
   ```

2. **Wrong credentials**
   ```
   Error: Authentication failed
   Fix:
   - Verify username/password
   - No special characters without encoding
   - Use MongoDB Atlas UI to reset password
   ```

3. **Wrong database name**
   ```
   Error: Could not connect
   Fix: Check connection string format:
   mongodb+srv://user:pass@cluster.net/DATABASE_NAME?retryWrites=true
   ```

4. **Connection string has spaces**
   ```
   Fix: Remove all spaces and line breaks from connection string
   ```

### Connection keeps dropping

**Symptom:** Works initially, then "connection closed"

**Fix:**
```javascript
// Add connection options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Handle disconnection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
```

---

## Connection Issues

### Frontend can't reach backend

**Symptom:** Network errors in browser console

**Diagnostics:**
```bash
# Test backend directly
curl https://your-backend.azurewebsites.net/api/health

# Check CORS headers
curl -I https://your-backend.azurewebsites.net/api/health
```

**Common Causes & Fixes:**

1. **Wrong API URL**
   ```
   Error: Failed to fetch
   Fix: Check REACT_APP_API_URL in Vercel
   Should be: https://your-app.azurewebsites.net
   No trailing slash!
   ```

2. **Backend not running**
   ```
   Error: ERR_CONNECTION_REFUSED
   Fix: Check Azure App Service is running
   ```

3. **Mixed content (HTTP/HTTPS)**
   ```
   Error: Blocked loading mixed active content
   Fix: Use HTTPS for both frontend and backend
   Azure provides HTTPS by default
   ```

4. **API URL not set**
   ```
   Error: Cannot read property of undefined
   Fix: Set REACT_APP_API_URL in Vercel environment variables
   Redeploy frontend after adding
   ```

### Environment variable not working

**Symptom:** Frontend uses localhost instead of production URL

**Cause:** React environment variables must start with `REACT_APP_`

**Fix:**
```bash
# Wrong
API_URL=https://backend.azurewebsites.net

# Correct
REACT_APP_API_URL=https://backend.azurewebsites.net
```

**After fixing:**
1. Update in Vercel dashboard
2. Redeploy (or trigger new build)
3. Hard refresh browser (Ctrl+Shift+R)

---

## CORS Issues

### Browser blocks requests

**Symptom:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Diagnostics:**
```bash
# Check CORS headers
curl -H "Origin: https://your-frontend.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-backend.azurewebsites.net/api/tasks -v
```

**Common Causes & Fixes:**

1. **FRONTEND_URL not set**
   ```
   Fix: In Azure environment variables:
   FRONTEND_URL=https://your-app.vercel.app
   ```

2. **URL mismatch**
   ```
   Error: Blocked by CORS
   Fix: Ensure exact match:
   - Include https://
   - No trailing slash
   - Exact subdomain
   ```

3. **CORS package not configured**
   ```javascript
   // Add to server.js
   const cors = require('cors');
   
   app.use(cors({
     origin: process.env.FRONTEND_URL || '*',
     credentials: true
   }));
   ```

4. **Preflight request fails**
   ```javascript
   // Handle OPTIONS requests
   app.options('*', cors());
   ```

### CORS works locally but not in production

**Cause:** Different origins in production

**Fix:**
```javascript
// Use environment-specific CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : '*',
  credentials: true
};

app.use(cors(corsOptions));
```

---

## Deployment Issues

### Azure deployment fails

**Symptom:** Deployment shows error status

**Common Causes:**

1. **Build fails**
   ```
   Error: npm install failed
   Fix: 
   - Check package.json syntax
   - Lock file may be out of sync
   - Delete package-lock.json and regenerate
   ```

2. **Wrong directory**
   ```
   Error: No package.json found
   Fix: Set deployment directory to 'backend'
   ```

3. **Missing start script**
   ```
   Error: No start script
   Fix: In package.json:
   "scripts": {
     "start": "node server.js"
   }
   ```

### Vercel deployment fails

**Symptom:** Build fails with error

**Diagnostics:**
Check Vercel deployment logs in dashboard

**Common Causes:**

1. **Build command wrong**
   ```
   Fix: Should be 'npm run build' for Create React App
   ```

2. **Output directory wrong**
   ```
   Fix: Should be 'build' for Create React App
   ```

3. **Environment variables missing**
   ```
   Fix: Add REACT_APP_API_URL in Vercel dashboard
   ```

4. **React build errors**
   ```
   Error: Failed to compile
   Fix: 
   - Check for ESLint errors
   - Fix console.log warnings
   - Check unused variables
   ```

### Deployment succeeds but app doesn't work

**Cause:** Runtime errors vs build errors

**Diagnostics:**
1. Check browser console
2. Check network tab
3. Check backend logs

**Common Fix:**
Environment variables not set properly

---

## Performance Issues

### Slow response times

**Diagnostics:**
```bash
# Test response time
time curl https://your-backend.azurewebsites.net/api/tasks

# Check Azure metrics
az monitor metrics list --resource <app-id> --metric "ResponseTime"
```

**Causes & Fixes:**

1. **Cold start**
   ```
   Symptom: First request slow
   Fix: Use Azure Always On (requires Basic tier or higher)
   ```

2. **Database queries slow**
   ```
   Fix: Add indexes to MongoDB
   db.tasks.createIndex({ createdAt: -1 })
   ```

3. **Too many database calls**
   ```
   Fix: Implement pagination
   app.get('/api/tasks', async (req, res) => {
     const page = req.query.page || 1;
     const limit = 20;
     const tasks = await Task.find()
       .limit(limit)
       .skip((page - 1) * limit);
   });
   ```

---

## Testing Checklist

Use this to systematically test your deployment:

### Backend Tests
- [ ] Health endpoint: `curl https://your-app.azurewebsites.net/api/health`
- [ ] CORS headers present: `curl -I https://your-app.azurewebsites.net/api/health`
- [ ] Can create task: `curl -X POST https://your-app.azurewebsites.net/api/tasks -H "Content-Type: application/json" -d '{"title":"test"}'`
- [ ] Can get tasks: `curl https://your-app.azurewebsites.net/api/tasks`
- [ ] Logs show no errors: `az webapp log tail`
- [ ] Environment variables set: Check Azure portal

### Frontend Tests
- [ ] Page loads: Visit Vercel URL
- [ ] API URL correct: Check browser Network tab
- [ ] No CORS errors: Check browser Console
- [ ] Can create task via UI
- [ ] Can mark task complete
- [ ] Can delete task
- [ ] Hard refresh works (Ctrl+Shift+R)

### Integration Tests
- [ ] Frontend → Backend → Database flow works
- [ ] Data persists after page refresh
- [ ] Multiple users can use app simultaneously
- [ ] HTTPS works on both frontend and backend

---

## Getting Help

### Where to look
1. **Azure Logs:** Most backend issues show here
2. **Vercel Logs:** Build and deployment issues
3. **Browser Console:** Frontend errors
4. **Browser Network Tab:** API call issues

### Log Commands
```bash
# Azure
az webapp log tail --name <app> --resource-group <rg>
az webapp log download --name <app> --resource-group <rg>

# Check app status
az webapp show --name <app> --resource-group <rg> --query state
```

### Reset Everything

If all else fails:

1. **Backend:**
   ```bash
   # Restart app
   az webapp restart --name <app> --resource-group <rg>
   
   # Or delete and recreate
   az webapp delete --name <app> --resource-group <rg>
   ```

2. **Frontend:**
   - Delete project in Vercel
   - Reimport from GitHub
   - Set environment variables
   - Deploy

3. **Database:**
   - In MongoDB Atlas, check connection
   - Or create new cluster
   - Update connection string everywhere

---

## Prevention Tips

1. **Always test locally first**
   ```bash
   # Backend
   cd backend
   npm install
   npm start
   
   # Frontend
   cd frontend
   npm install
   npm start
   ```

2. **Keep .env.example updated**
   - Document all required variables
   - Share with team

3. **Use consistent naming**
   - No spaces in app names
   - Use hyphens: `my-app-backend`

4. **Version control**
   - Commit working code
   - Tag deployments
   - Document changes

5. **Monitor regularly**
   - Check Azure metrics
   - Check Vercel analytics
   - Set up alerts

---

## Still Stuck?

1. Check the main README.md
2. Review DEPLOYMENT_GUIDE.md
3. Compare with working example
4. Search error message online
5. Check Stack Overflow
6. Ask in course forum
7. Post in Discord/Slack

**Include when asking for help:**
- Exact error message
- Relevant logs
- What you've tried
- Screenshot if applicable
- URLs to your deployed apps

---

**Remember:** Most issues are simple configuration problems. Stay calm, check the logs, and work through the checklist! 🚀
