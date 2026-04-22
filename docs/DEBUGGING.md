# Debugging Guide for 401 Errors

## Understanding the 401 Error

When you see a 401 (Unauthorized) error when starting the application, it means the backend is rejecting the request due to missing or invalid authentication.

In this Telegram Mini App, authentication is handled via the `Telegram-Init-Data` header, which contains data from the Telegram WebApp.

## Common Causes and Solutions

### 1. Backend Not Running or Wrong URL

**Symptom**: Connection refused or 404 errors
**Check**: 
- Is your backend actually running on `http://localhost:8787`?
- Does the backend have a `/graphql` endpoint?

**Solution**:
- Verify your backend is running: `curl http://localhost:8787/graphql` (should return GraphQL response, not connection error)
- Check your `.env.local` file: `VITE_BACKEND_BASE_URL` should point to your backend

### 2. Invalid or Missing Telegram Init Data

**Symptom**: 401 errors on all requests
**Check**:
- The mock environment in `src/mockEnv.ts` provides test data when running outside Telegram
- This data might not be valid for your backend

**Solution**:
- Check what authentication your backend expects
- You may need to:
  a) Update the mock data in `mockEnv.ts` to match what your backend expects
  b) Configure your backend to accept the test data
  c) Set `VITE_DEV_INIT_DATA` in `.env.local` with valid test data

### 3. CORS Issues Leading to Auth Problems

**Symptom**: 401 on OPTIONS requests (as seen in your curl command)
**Check**:
- Does your backend properly handle CORS preflight requests?
- Is the `Telegram-Init-Data` header allowed in CORS configuration?

**Solution**:
- Ensure your backend CORS configuration:
  - Allows origins: `http://localhost:5173` (and your Telegram domain)
  - Allows headers: `Content-Type`, `Telegram-Init-Data`
  - Allows methods: `GET`, `POST`, `OPTIONS`

### 4. Backend Expects Real Telegram Data

**Symptom**: Works in Telegram but not in browser
**Check**:
- Your backend might be validating the initData signature against your Bot Token
- The mock data in `mockEnv.ts` won't pass this validation

**Solution**:
- For local development, configure your backend to:
  - Accept unsigned/initData without signature validation
  - Or use a special test mode
  - Or provide a way to bypass Telegram auth for local/dev requests

## Quick Fixes to Try

### Option 1: Update Mock Data
Edit `src/mockEnv.ts` to provide initData that your backend accepts:
```typescript
// In mockEnv.ts, update the initData value:
initData: "your_valid_init_data_here",
// or update initDataUnsafe to match expected format
```

### Option 2: Set Dev Init Data
Uncomment and set `VITE_DEV_INIT_DATA` in `.env.local`:
```env
VITE_DEV_INIT_DATA=query_id=AAAA....&user=%7B%22id%22%3A123%2C%22first_name%22%3A%22Test%22%7D&auth_date=1700000000&hash=valid_hash
```

### Option 3: Check Backend Logs
Look at your backend logs to see:
- Why it's rejecting the request
- What authentication it's expecting
- Any error messages about invalid initData

### Option 4: Temporarily Disable Auth (NOT for production)
For debugging only, you could temporarily modify your backend to:
- Skip authentication for requests from `localhost:5173`
- Or log the incoming initData to see what's being sent

## Verifying Your Setup

Once you think you've fixed the issue:

1. Restart the frontend: `npm run dev`
2. Check the Network tab in browser dev tools
3. Look at the request headers for `Telegram-Init-Data`
4. Verify the value matches what your backend expects
5. The initial restaurant list should load without 401 errors

## Getting Help

If you're still stuck:
1. Check your backend documentation for expected initData format
2. Look at similar projects or examples
3. Consider creating a minimal backend that echoes the initData to see what's being sent