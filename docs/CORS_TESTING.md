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
   ```http
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