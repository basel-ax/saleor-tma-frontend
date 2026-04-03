# Telegram Init Data Guide for Local Development

> Opencode-compatible guide for handling Telegram initialization data in local development environments.

---

## 🎯 Overview

This guide explains how to properly handle Telegram initialization data (`Telegram-Init-Data` header) when developing the Saleor TMA Frontend locally outside of Telegram.

**Problem:** The backend requires valid Telegram init data for authentication, but the frontend sends an empty string when running locally.

---

## 🔍 How Telegram Init Data Works

In a real Telegram Mini App:
1. Telegram loads your app in a WebView
2. It injects `window.Telegram.WebApp` with real init data
3. The init data is a URL-encoded string containing:
   - `query_id` - Unique identifier for the WebApp session
   - `user` - JSON-encoded object with user information
   - `auth_date` - Unix timestamp when data was generated
   - `hash` - Cryptographic signature (HMAC-SHA256 using bot token)

**Example format:**
```
query_id=AAAAb...&user=%7B%22id%22%3A123456%2C%22first_name%22%3A%22John%22%2C%22username%22%3A%22john_doe%22%7D&auth_date=1717000000&hash=abc123...
```

---

## ⚠️ Current Implementation Issues

**In `src/mockEnv.ts`:**
```typescript
const mockWebApp = {
  initData: "",  // ❌ PROBLEM: Empty string
  initDataUnsafe: { /* user data */ },
  // ...
};
```

**In `src/api/index.ts`:**
```typescript
function getTelegramInitHeader(): string {
  const init = (window as any).Telegram?.WebApp?.initDataUnsafe?.user ??
              (window as any).Telegram?.WebApp?.initData ?? {};
  try {
    return JSON.stringify(init);  // Creates "{}" when init is empty
  } catch {
    return '{}';
  }
}
```

**Issues:**
1. `initData` is empty string in mock
2. Code prefers `initData` over `initDataUnsafe.user` (when `initData` is empty)
3. Even if using `initDataUnsafe.user`, it JSON.stringify's it to wrong format

---

## ✅ What the Backend Expects

Based on backend feedback, the backend expects:
1. A properly formatted Telegram init data string (URL-encoded parameters)
2. Not an empty string
3. Not a JSON object - the actual init data string format

---

## 🛠️ Solutions

### Solution 1: Fix Mock to Return Valid Init Data Format (Recommended)

**Update `src/mockEnv.ts`:**
```typescript
const mockWebApp = {
  // Provide properly formatted init data string (URL-encoded)
  initData: "query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=test_hash_for_development",
  
  // Keep initDataUnsafe for compatibility
  initDataUnsafe: {
    user: {
      id: 0,
      first_name: "Test",
      last_name: "User",
      username: "testuser",
    },
  },
  // ... rest remains the same
};
```

### Solution 2: Update API Header Function

**Alternative: Update `src/api/index.ts`:**
```typescript
function getTelegramInitHeader(): string {
  // When in mock environment, use mock data properly
  if (!(window as any).Telegram?.WebApp) {
    return "query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=test_hash_for_development";
  }
  
  // Real Telegram environment
  const initData = (window as any).Telegram?.WebApp?.initData;
  if (initData) {
    return initData;
  }
  
  // Fallback - construct from initDataUnsafe if available
  const unsafeUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  if (unsafeUser) {
    const userJson = encodeURIComponent(JSON.stringify(unsafeUser));
    return `user=${userJson}&auth_date=${Date.now()/1000|0}&hash=dev`;
  }
  
  // Last resort - return empty (will cause auth failure but app won't crash)
  return "";
}
```

---

## 🏆 Best Practice for Local Development

### Option A: Use VITE_DEV_INIT_DATA Environment Variable (Recommended)

1. **Set in `.env.local`:**
   ```env
   VITE_DEV_INIT_DATA=query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=test_hash_for_development
   ```

2. **Update `src/mockEnv.ts`:**
   ```typescript
   initData: import.meta.env.VITE_DEV_INIT_DATA || "",
   ```

3. **Update `src/api/index.ts`:**
   ```typescript
   function getTelegramInitHeader(): string {
     // Use dev init data if provided (for local testing outside Telegram)
     if (import.meta.env.VITE_DEV_INIT_DATA) {
       return import.meta.env.VITE_DEV_INIT_DATA;
     }
     
     // Real Telegram environment
     const initData = (window as any).Telegram?.WebApp?.initData;
     if (initData) {
       return initData;
     }
     
     // Fallback to mock data
     return (window as any).Telegram?.WebApp?.initDataUnsafe?.user 
       ? JSON.stringify((window as any).Telegram?.WebApp?.initDataUnsafe?.user)
       : '{}';
   }
   ```

### Option B: Generate Realistic Mock Data

**For better testing, generate realistic mock data:**
```typescript
const generateMockInitData = () => {
  const user = {
    id: 123456789,
    first_name: "Test",
    last_name: "User",
    username: "testuser",
    language_code: "en",
    is_premium: false,
    allows_write_to_pm: true,
  };

  const authDate = Math.floor(Date.now() / 1000);
  
  // Note: In reality, hash is HMAC-SHA256 using bot token
  // For development, use placeholder
  const dataString = `auth_date=${authDate}&query_id=AAAA....&user=${encodeURIComponent(JSON.stringify(user))}`;
  const hash = "dev_hash_placeholder"; // Real app: crypto.createHmac('sha256', BOT_TOKEN).update(dataString).digest('hex');
  
  return `${dataString}&hash=${hash}`;
};

// Then use in mockWebApp:
initData: generateMockInitData(),
```

---

## 🧪 Testing the Fix

After implementing a solution, verify:

1. Frontend sends non-empty `Telegram-Init-Data` header
2. Header value is properly formatted string (not `{}` or `""`)
3. Backend accepts data and returns 200 instead of 401

**Test with:**
```bash
curl -v -X POST \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "Telegram-Init-Data: query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=test" \
  -d '{"query":"query GetRestaurants { restaurants { id name } }"}' \
  http://localhost:8787/graphql
```

---

## 📝 Important Notes

1. **Never use real bot tokens or production data in development**
2. **Development hash doesn't need cryptographic validity** if backend has dev mode accepting test data
3. **For production**, real Telegram client provides properly signed init data
4. **Always validate** backend actually checks init data properly in production

---

## 💡 Implementation Recommendation

**Use Option A (VITE_DEV_INIT_DATA) because:**
1. Explicit and configurable
2. Doesn't require changing core logic
3. Allows easy switching between test users/scenarios
4. Follows pattern suggested in README.md
5. Keeps mock simple and focused

---

## 📝 Changelog

- Original: Telegram init data guide for local development
- 2026-04-03: Restructured for opencode compatibility with:
  - Clear overview and problem statement
  - Detailed explanation of how Telegram init data works
  - Identification of current implementation issues
  - Clear statement of backend expectations
  - Multiple solution options with code examples
  - Best practice recommendations
  - Testing procedures
  - Important notes and warnings
  - Implementation recommendation