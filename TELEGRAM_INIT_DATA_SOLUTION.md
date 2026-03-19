# Solution: Fixing Telegram Init Data for Local Development

## Problem Identified
The frontend is sending an empty `Telegram-Init-Data` header (`""`) which causes the backend to reject authentication. This happens because:

1. In `src/mockEnv.ts`: `initData: ""` (empty string)
2. In `src/api/index.ts`: The `getTelegramInitHeader()` function processes this empty data and returns `"{}"` or `""`
3. Backend expects valid Telegram init data format, not empty strings

## The Fix: Update Mock Data to Provide Valid Format

### Option 1: Direct Fix in mockEnv.ts (Simplest)

**Update `src/mockEnv.ts`:**

```typescript
// REPLACE THE CURRENT initData LINE (line 15):
// FROM:
initData: "",
// TO:
initData: "query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=dev_test_hash",
```

This provides a properly formatted Telegram init data string that matches what the real Telegram client would send.

### Option 2: Using Environment Variable (More Flexible)

**Step 1: Uncomment and set in `.env.local`:**
```env
VITE_DEV_INIT_DATA=query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1773912950&hash=dev_test_hash
```

**Step 2: Update `src/mockEnv.ts`:**
```typescript
// REPLACE LINE 15:
// FROM:
initData: "",
// TO:
initData: import.meta.env.VITE_DEV_INIT_DATA || "",
```

**Step 3: Update `src/api/index.ts` to prefer env var in dev:**
```typescript
function getTelegramInitHeader(): string {
  // USE DEV INIT DATA IF PROVIDED (for local testing outside Telegram)
  if (import.meta.env.VITE_DEV_INIT_DATA) {
    return import.meta.env.VITE_DEV_INIT_DATA;
  }
  
  // REAL TELEGRAM ENVIRONMENT
  const initData = (window as any).Telegram?.WebApp?.initData;
  if (initData) {
    return initData;
  }
  
  // FALLBACK TO MOCK DATA
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user 
    ? JSON.stringify((window as any).Telegram?.WebApp?.initDataUnsafe?.user)
    : '{}';
}
```

## Why This Works

### Telegram Init Data Format
Real Telegram init data looks like:
```
query_id=AAAA....&user=%7B%22id%22%3A123%2C%22first_name%22%3A%22John%22%2C%22username%22%3A%22john%22%7D&auth_date=1717000000&hash=actual_hmac_sha256_hash
```

Our mock provides:
```
query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=dev_test_hash
```

### What the Backend Sees
After the fix, the `Telegram-Init-Data` header will contain:
```
query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=dev_test_hash
```

This is a valid format that the backend can parse (even if the hash isn't cryptographically valid in development).

## Verification

After applying the fix, test with:
```bash
curl -v -X POST \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "Telegram-Init-Data: query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=dev_test_hash" \
  -d '{"query":"query GetRestaurants { restaurants { id name } }"}' \
  http://localhost:8787/graphql
```

This should return 200 with data instead of 401.

## Important Notes for Backend Developer

1. **Development vs Production**: In development, the hash doesn't need to be cryptographically valid if your backend has a dev mode that accepts test data. In production, Telegram provides properly signed data.

2. **Backend Should**: 
   - Accept the init data format in development
   - Validate the hash properly in production
   - Extract user info from the init data for authentication/identification

3. **Never Commit Real Secrets**: The mock data should obviously be fake - never use real bot tokens or production data in `VITE_DEV_INIT_DATA`.

## Alternative: If Backend Expects Different Format

If your backend expects the init data parsed differently (e.g., as a JSON object rather than URL-encoded string), let me know and I'll adjust the solution accordingly. But based on standard Telegram WebApp implementation and your feedback about expecting "valid Telegram init data", the URL-encoded string format is correct.