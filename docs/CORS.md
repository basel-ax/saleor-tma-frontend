# CORS Debugging & Testing Guide for Saleor TMA Frontend

## Problem Analysis

Based on the curl commands you shared, here's what's happening:

1. **Frontend** runs on `http://localhost:5173` (Vite dev server)
2. **Backend** API is at `http://localhost:8787/graphql`
3. When the frontend makes requests to the backend, the browser:
   - First sends an **OPTIONS request** (CORS preflight) to check if the actual request is allowed
   - Then sends the actual **POST request** if the preflight succeeds

## What's Going Wrong

From your curl output, I can see:
- The **OPTIONS request** to `http://localhost:8787/graphql` is returning **401 Unauthorized**
- This means your backend is requiring authentication even for CORS preflight requests
- **This is incorrect behavior** - CORS preflight requests (OPTIONS) should never require authentication

## Root Cause

Your backend's CORS/middleware configuration is likely:
1. Applying authentication checks to ALL incoming requests, including OPTIONS
2. Not properly exempting OPTIONS requests from authentication
3. Or having overly strict CORS policies that don't match your frontend's origin/headers

## How to Fix It

### Backend Configuration Requirements

Your backend needs to be configured to:

#### 1. Allow CORS from `http://localhost:5173`
```javascript
// Example (adjust for your backend framework)
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend dev server
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Telegram-Init-Data'],
  credentials: true // If you need cookies/auth
};
```

#### 2. **Crucially**: Exempt OPTIONS requests from authentication
Your authentication middleware should skip authentication for OPTIONS requests:
```javascript
// Pseudocode - adjust for your backend framework
app.use((req, res, next) => {
  // Skip authentication for OPTIONS (CORS preflight) requests
  if (req.method === 'OPTIONS') {
    return next(); // Continue to CORS middleware
  }
  
  // Apply authentication for all other methods
  authenticateRequest(req, res, next);
});
```

#### 3. Allow the specific headers your frontend sends:
- `Content-Type` (required for JSON payloads)
- `Telegram-Init-Data` (your custom auth header)

#### 4. Allow required HTTP methods:
- `GET` (for queries)
- `POST` (for mutations and queries)
- `OPTIONS` (for CORS preflight - MUST be allowed without auth)

## Verification Steps

Once your backend is fixed, test with:

### 1. Test OPTIONS request directly (should return 200/204, not 401):
```bash
curl -v -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Telegram-Init-Data" \
  http://localhost:8787/graphql
```

### 2. Test actual request (should work if OPTIONS succeeds):
```bash
curl -v -X POST \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "Telegram-Init-Data: test_data" \
  -d '{"query":"query GetRestaurants { restaurants { id name } }"}' \
  http://localhost:8787/graphql
```

## Frontend Considerations

Your frontend code in `src/api/index.ts` is correct:
- It sets proper headers: `Content-Type` and `Telegram-Init-Data`
- It uses the `VITE_BACKEND_BASE_URL` environment variable correctly
- It handles GraphQL responses properly

### Environment Variable
Double-check your `.env.local`:
```env
VITE_BACKEND_BASE_URL=http://localhost:8787
```
Note: The `/graphql` path is automatically appended in `src/api/index.ts`.

## Quick Checks

1. **Is your backend actually running on port 8787?**
   ```bash
   curl -v http://localhost:8787/graphql
   ```
   Should return a GraphQL response (not connection refused).

2. **Does your backend have a `/graphql` endpoint?**
   Verify the route exists in your backend code.

3. **Check backend logs**
   Look for:
   - Why OPTIONS requests are getting 401
   - What authentication is being applied
   - Any CORS-related error messages

## Summary

**The issue is 100% on the backend side** - your frontend is making correct requests. The backend needs to:
1. Allow CORS from `http://localhost:5173`
2. Allow `Content-Type` and `Telegram-Init-Data` headers
3. Allow POST and OPTIONS methods
4. **MOST IMPORTANTLY**: Not require authentication for OPTIONS requests

Fix the backend's CORS/authentication configuration, and the 401 errors on OPTIONS requests will disappear, allowing your frontend to communicate properly with the backend.

---

# CORS Testing & Diagnosis Guide

If you're still getting CORS errors after backend fixes, follow these steps to pinpoint exactly what's wrong.

## Step 1: Isolate the Problem

First, let's test if the issue is truly CORS or something else.

### Test 1: Direct backend access (bypass browser/CORS)
```bash
# Test if backend is reachable and working at all
curl -v http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```

If this fails with connection error or 500, the problem is not CORS - your backend isn't running or has other issues.

### Test 2: Test with curl simulating browser request
```bash
# Simulate what the browser sends (including Origin header)
curl -v http://localhost:8787/graphql \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "Telegram-Init-Data: test" \
  -d '{"query":"query GetRestaurants { restaurants { id name } }"}'
```

If this works (returns 200 with data), then your backend is working correctly and the issue is specifically with CORS handling.

### Test 3: Test the OPTIONS (preflight) request directly
```bash
# This is what the browser sends first - MUST work without auth
curl -v -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Telegram-Init-Data" \
  http://localhost:8787/graphql
```

**This request MUST return 200 or 204** (not 401/403) and include these headers in the response:
- `Access-Control-Allow-Origin: http://localhost:5173`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Telegram-Init-Data`
- `Access-Control-Max-Age: 86400` (or similar)

## Step 2: Check Browser Network Tab

When you see the CORS error in your browser:

1. Open Chrome DevTools → Network tab
2. Look for the **red failed request** to `localhost:8787/graphql`
3. Click on it → Look at:
   - **General tab**: Request Method (should be OPTIONS for preflight failures)
   - **Response Headers**: What CORS headers are missing/wrong?
   - **Request Headers**: What Origin/headers is the browser sending?

## Step 3: Common Issues to Check

### Issue 1: OPTIONS request still getting 401/403
**This means your auth middleware is still running on OPTIONS requests.**
Fix: Ensure your authentication/authorization middleware has a check like:
```javascript
// Pseudocode - ADD THIS AT THE VERY START of your auth middleware
if (req.method === 'OPTIONS') {
  return next(); // Skip auth for CORS preflight
}
```

### Issue 2: Missing or wrong CORS headers in response
Check the OPTIONS response for:
- `Access-Control-Allow-Origin`: Should match requesting origin (http://localhost:5173) or be *
- `Access-Control-Allow-Methods`: Should include POST, GET, OPTIONS
- `Access-Control-Allow-Headers`: Should include Content-Type, Telegram-Init-Data

### Issue 3: Credentials confusion
If you're sending credentials (cookies, HTTP auth), the backend must:
- Set `Access-Control-Allow-Credentials: true`
- **NOT** use `Access-Control-Allow-Origin: *` when credentials are involved
- Specify exact origin: `Access-Control-Allow-Origin: http://localhost:5173`

Your app doesn't appear to use credentials based on the code, so this is less likely.

### Issue 4: Proxy or middleware interference
Check if you have:
- Proxy servers (NGINX, Apache) in front of your backend that might strip CORS headers
- Middleware that runs AFTER CORS middleware and removes headers
- Multiple CORS configurations conflicting

## Step 4: Quick Backend Tests

Add these temporary test endpoints to your backend to isolate the issue:

```javascript
// Add these to your backend temporarily for testing

// Test 1: Simple CORS test endpoint (no auth needed)
app.get('/test-cors', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Telegram-Init-Data');
  res.send('CORS working!');
});

// Test 2: Check if auth is being applied to OPTIONS
app.all('/test-auth', (req, res) => {
  console.log(`Received ${req.method} request - applying auth?`);
  // Your auth logic here
  res.send('Auth test');
});

// Then test with:
// curl -v -X OPTIONS -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET" http://localhost:8787/test-cors
// curl -v -X OPTIONS -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET" http://localhost:8787/test-auth
```

## Step 5: Check Your Specific Setup

Based on your code (`src/api/index.ts`):

1. Your frontend sends:
   - Origin: `http://localhost:5173` (from browser)
   - Method: `POST` (for GraphQL)
   - Headers: `Content-Type`, `Telegram-Init-Data`

2. So your backend OPTIONS response MUST include:
   ```
   Access-Control-Allow-Origin: http://localhost:5173
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Telegram-Init-Data
   ```

## Step 6: Verify Your Fixes Worked

After backend changes, ALWAYS test the OPTIONS request first:
```bash
curl -v -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Telegram-Init-Data" \
  http://localhost:8787/graphql
```

Look for:
- HTTP/1.1 200 OK (or 204 No Content)
- Correct CORS headers in response
- NO authentication required (should not hit your auth logs)

## Step 7: If Still Stuck...

1. **Check backend logs** - Add logging to see:
   - When OPTIONS requests arrive
   - Whether auth middleware is being called for OPTIONS
   - What CORS headers are being set

2. **Temporarily disable all auth** - Just to test if CORS works:
   ```javascript
   // Temporarily comment out auth middleware for testing
   // app.use(yourAuthMiddleware);
   
   // Add simple CORS middleware
   app.use((req, res, next) => {
     res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
     res.header('Access-Control-Allow-Headers', 'Content-Type, Telegram-Init-Data');
     if (req.method === 'OPTIONS') {
       return res.sendStatus(204);
     }
     next();
   });
   ```
   
   If this works, then your CORS setup is correct and the issue is in your auth middleware not properly skipping OPTIONS requests.

3. **Check middleware order** - In Express-like frameworks, order matters:
   ```javascript
   // CORRECT order:
   app.use(corsMiddleware); // Must come FIRST
   app.use(authMiddleware); // Auth comes AFTER cors
   
   // WRONG order (auth blocks CORS preflight):
   app.use(authMiddleware); // This runs first and might block OPTIONS
   app.use(corsMiddleware); // This never gets reached for blocked OPTIONS requests
   ```

## Summary Checklist

When debugging CORS issues, verify in this order:

☐ Backend is running and accessible at `http://localhost:8787/graphql`  
☐ OPTIONS request to `/graphql` returns 200/204 (NOT 401/403)  
☐ OPTIONS response includes `Access-Control-Allow-Origin: http://localhost:5173`  
☐ OPTIONS response includes `Access-Control-Allow-Methods: GET, POST, OPTIONS`  
☐ OPTIONS response includes `Access-Control-Allow-Headers: Content-Type, Telegram-Init-Data`  
☐ Actual POST request works after successful OPTIONS  
☐ Browser shows no CORS errors in Network tab  

Start with testing the OPTIONS request directly with curl - that's almost always where the issue lies.

## Quick Reference

### Common Backend Fix Snippets

**Express.js:**
```javascript
const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Telegram-Init-Data'],
  credentials: true
};
app.use(cors(corsOptions));

// Auth middleware - MUST come after CORS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  // Your auth logic here
  next();
});
```

**Apollo Server:**
```javascript
const server = new ApolloServer({
  // ... other options
  plugins: [{
    async requestDidStart() {
      return {
        async willSendResponse({ request, response }) {
          // Add CORS headers
          response.http.headers.set('access-control-allow-origin', 'http://localhost:5173');
          response.http.headers.set('access-control-allow-methods', 'GET, POST, OPTIONS');
          response.http.headers.set('access-control-allow-headers', 'content-type, telegram-init-data');
        }
      };
    }
  ]
});

// In your server setup:
// Apply CORS middleware before auth
app.use(cors(corsOptions));
app.use(authMiddleware); // Auth skips OPTIONS
```

### Testing Commands

**Quick OPTIONS test:**
```bash
curl -I -X OPTIONS -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type,Telegram-Init-Data" http://localhost:8787/graphql
```

**Full curl test:**
```bash
curl -v -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Telegram-Init-Data" \
  http://localhost:8787/graphql && echo "--- OPTIONS TEST COMPLETE ---" && \
curl -v -X POST \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "Telegram-Init-Data: test" \
  -d '{"query":"{ __typename }"}' \
  http://localhost:8787/graphql
```