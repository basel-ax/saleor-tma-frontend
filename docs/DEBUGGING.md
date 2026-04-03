# Debugging Guide for 401 Errors

> Opencode-compatible guide for troubleshooting authentication issues in the Saleor TMA Frontend.

---

## 🎯 Understanding the 401 Error

When you see a 401 (Unauthorized) error when starting the application, it means the backend is rejecting the request due to missing or invalid authentication.

**In this Telegram Mini App:** Authentication is handled via the `Telegram-Init-Data` header, which contains data from the Telegram WebApp.

---

## 🔍 Common Causes and Solutions

### 1️⃣ Backend Not Running or Wrong URL

**Symptom:** Connection refused or 404 errors  
**Checks:**
- Is your backend actually running on `http://localhost:8787`?
- Does the backend have a `/graphql` endpoint?

**Solutions:**
- Verify backend is running: `curl http://localhost:8787/graphql` (should return GraphQL response, not connection error)
- Check `.env.local`: `VITE_BACKEND_BASE_URL` should point to your backend

### 2️⃣ Invalid or Missing Telegram Init Data

**Symptom:** 401 errors on all requests  
**Checks:**
- Mock environment in `src/mockEnv.ts` provides test data when running outside Telegram
- This data might not be valid for your backend

**Solutions:**
- Check what authentication your backend expects
- Choose one:
  a) Update mock data in `mockEnv.ts` to match backend expectations
  b) Configure backend to accept test data
  c) Set `VITE_DEV_INIT_DATA` in `.env.local` with valid test data

### 3️⃣ CORS Issues Leading to Auth Problems

**Symptom:** 401 on OPTIONS requests (as seen in curl commands)  
**Checks:**
- Does backend properly handle CORS preflight requests?
- Is `Telegram-Init-Data` header allowed in CORS configuration?

**Solutions:**
Ensure backend CORS configuration:
- Allows origins: `http://localhost:5173` (and Telegram domain)
- Allows headers: `Content-Type`, `Telegram-Init-Data`
- Allows methods: `GET`, `POST`, `OPTIONS`

### 4️⃣ Backend Expects Real Telegram Data

**Symptom:** Works in Telegram but not in browser  
**Checks:**
- Backend might be validating initData signature against Bot Token
- Mock data in `mockEnv.ts` won't pass signature validation

**Solutions:**
For local development, configure backend to:
- Accept unsigned/initData without signature validation
- Use special test mode
- Provide way to bypass Telegram auth for local/dev requests

---

## 🛠️ Quick Fixes to Try

### Option 1: Update Mock Data
Edit `src/mockEnv.ts` to provide initData your backend accepts:
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
Examine backend logs to see:
- Why it's rejecting the request
- What authentication it's expecting
- Any error messages about invalid initData

### Option 4: Temporarily Disable Auth (NOT for production)
⚠️ For debugging only - temporarily modify backend to:
- Skip authentication for requests from `localhost:5173`
- Log incoming initData to see what's being sent

---

## ✅ Verifying Your Setup

Once you think you've fixed the issue:

1. **Restart frontend:** `npm run dev`
2. **Check Network tab** in browser dev tools
3. **Verify request headers** for `Telegram-Init-Data`
4. **Confirm value matches** backend expectations
5. **Initial restaurant list** should load without 401 errors

---

## ❓ Getting Help

If still stuck:
1. Check backend documentation for expected initData format
2. Look at similar projects or examples
3. Consider creating minimal backend that echoes initData to see what's being sent

---

## 📝 Changelog

- Original: Debugging guide for 401 errors
- 2026-04-03: Restructured for opencode compatibility with:
  - Clear problem statement and context
  - Organized common causes with symptoms/checks/solutions
  - Quick fixes section with actionable options
  - Verification steps
  - Getting help guidance