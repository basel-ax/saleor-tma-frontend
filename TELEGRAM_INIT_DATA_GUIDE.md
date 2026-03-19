# Telegram Init Data Guide for Local Development

## The Problem

The backend requires valid Telegram init data in the `Telegram-Init-Data` header for authentication, but the frontend is currently sending an empty string (`""`) when running locally outside of Telegram.

## How Telegram Init Data Works

In a real Telegram Mini App:
1. Telegram loads your app in a WebView
2. It injects `window.Telegram.WebApp` with real init data
3. The init data is a URL-encoded string containing:
   - `query_id` - Unique identifier for the WebApp session
   - `user` - JSON-encoded object with user information (id, first_name, username, etc.)
   - `auth_date` - Unix timestamp when the data was generated
   - `hash` - Cryptographic signature for security (HMAC-SHA256 of the data using your bot token)

Example format:
```
query_id=AAAAb...&user=%7B%22id%22%3A123456%2C%22first_name%22%3A%22John%22%2C%22username%22%3A%22john_doe%22%7D&auth_date=1717000000&hash=abc123...
```

## Current Implementation Issues

In `src/mockEnv.ts`:
```typescript
const mockWebApp = {
  initData: "",  // ❌ PROBLEM: Empty string
  initDataUnsafe: {
    user: {
      id: 0,
      first_name: "Test",
      last_name: "User",
      username: "testuser",
    },
  },
  // ...
};
```

And in `src/api/index.ts`:
```typescript
function getTelegramInitHeader(): string {
  const init = (window as any).Telegram?.WebApp?.initDataUnsafe?.user ??
               (window as any).Telegram?.WebApp?.initData ?? {};
  try {
    return JSON.stringify(init);  // This creates "{}" when init is empty object
  } catch {
    return '{}';
  }
}
```

The problem is:
1. `initData` is empty string in mock
2. `initDataUnsafe.user` exists but the code prefers `initData` when available (it's not, it's empty string)
3. Even if it used `initDataUnsafe.user`, it would JSON.stringify it to `{"id":0,"first_name":"Test"...}` which is NOT the format the backend expects

## The Backend Expects

Based on the backend developer's feedback, the backend expects:
1. A properly formatted Telegram init data string (URL-encoded parameters)
2. Not an empty string
3. Not a JSON object - the actual init data string format

## Solutions

### Solution 1: Fix the Mock to Return Valid Init Data Format (Recommended)

Update `src/mockEnv.ts` to provide a properly formatted init data string:

```typescript
// In src/mockEnv.ts, replace the mockWebApp initData:
const mockWebApp = {
  // Provide a properly formatted init data string (URL-encoded)
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

### Solution 2: Update the API Header Function

Alternatively, update `src/api/index.ts` to properly format the init data:

```typescript
function getTelegramInitHeader(): string {
  // When in mock environment, use the mock data properly
  if (!(window as any).Telegram?.WebApp) {
    // Return properly formatted mock init data
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
    // Note: This is NOT the real format but might work for some backends
    // Real format should be URL-encoded string, not JSON
    const userJson = encodeURIComponent(JSON.stringify(unsafeUser));
    return `user=${userJson}&auth_date=${Date.now()/1000|0}&hash=dev`;
  }
  
  // Last resort - return empty (will cause auth failure but app won't crash)
  return "";
}
```

## Best Practice for Local Development

### Option A: Use VITE_DEV_INIT_DATA Environment Variable (Recommended)

1. **Uncomment and set** in `.env.local`:
   ```env
   VITE_DEV_INIT_DATA=query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=test_hash_for_development
   ```

2. **Update** `src/mockEnv.ts` to use this environment variable:
   ```typescript
   // In the mockWebApp definition:
   initData: import.meta.env.VITE_DEV_INIT_DATA || "",
   ```

3. **Update** `src/api/index.ts` to prefer environment variable in development:
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

For better testing, you can generate more realistic mock data:
```typescript
// Generate a realistic mock init data string
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
  
  // Note: In reality, the hash is HMAC-SHA256 of the data using bot token
  // For development, we'll use a placeholder
  const dataString = `auth_date=${authDate}&query_id=AAAA....&user=${encodeURIComponent(JSON.stringify(user))}`;
  const hash = "dev_hash_placeholder"; // In real app: crypto.createHmac('sha256', BOT_TOKEN).update(dataString).digest('hex');
  
  return `${dataString}&hash=${hash}`;
};

// Then use in mockWebApp:
initData: generateMockInitData(),
```

## Testing the Fix

After implementing one of these solutions, verify that:

1. The frontend sends a non-empty `Telegram-Init-Data` header
2. The header value is a properly formatted string (not `{}` or `""`)
3. The backend accepts this data and returns 200 instead of 401

You can test with:
```bash
curl -v -X POST \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "Telegram-Init-Data: query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=test" \
  -d '{"query":"query GetRestaurants { restaurants { id name } }"}' \
  http://localhost:8787/graphql
```

## Important Notes

1. **Never use real bot tokens or production data in development**
2. **The hash in development data doesn't need to be cryptographically valid** if your backend has a development mode that accepts test data
3. **For production**, the real Telegram client will provide properly signed init data
4. **Always validate** that your backend is actually checking the init data properly in production

## Implementation Recommendation

I recommend **Option A** (VITE_DEV_INIT_DATA environment variable) because:
1. It's explicit and configurable
2. Doesn't require changing the core logic
3. Allows easy switching between different test users/scenarios
4. Follows the pattern already suggested in the README.md
5. Keeps the mock simple and focused