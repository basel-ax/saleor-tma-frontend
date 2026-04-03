# Solution: Fixing Telegram Init Data for Local Development

> Opencode-compatible solution for resolving Telegram initialization data issues in local development.

---

## 🎯 Problem Identified

The frontend sends an empty `Telegram-Init-Data` header (`""`) causing backend authentication rejection because:

1. **In `src/mockEnv.ts`**: `initData: ""` (empty string)
2. **In `src/api/index.ts`**: `getTelegramInitHeader()` processes empty data returning `"{}"` or `""`
3. **Backend expects**: Valid Telegram init data format, not empty strings

---

## 🔧 The Fix: Update Mock Data to Provide Valid Format

### Option 1: Direct Fix in mockEnv.ts (Simplest)

**Update `src/mockEnv.ts`:**
```typescript
// REPLACE THE CURRENT initData LINE:
// FROM:
initData: "",
// TO:
initData: "query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=dev_test_hash",
```

This provides a properly formatted Telegram init data string matching real Telegram client format.

### Option 2: Using Environment Variable (More Flexible)

**Step 1: Set in `.env.local`:**
```env
VITE_DEV_INIT_DATA=query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1773912950&hash=dev_test_hash
```

**Step 2: Update `src/mockEnv.ts`:**
```typescript
// REPLACE LINE:
initData: import.meta.env.VITE_DEV_INIT_DATA || "",
```

**Step 3: Update `src/api/index.ts`:**
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

---

## ✅ Why This Works

### Telegram Init Data Format
Real Telegram init data:
```
query_id=AAAA....&user=%7B%22id%22%3A123%2C%22first_name%22%3A%22John%22%2C%22username%22%3A%22john%22%7D&auth_date=1717000000&hash=actual_hmac_sha256_hash
```

Our mock provides:
```
query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=dev_test_hash
```

### What the Backend Sees
After fix, `Telegram-Init-Data` header contains:
```
query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=dev_test_hash
```

This is valid format that backend can parse (hash validity not required in dev if backend has test mode).

---

## 🧪 Verification

After applying fix, test with:
```bash
curl -v -X POST \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "Telegram-Init-Data: query_id=AAAA....&user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=dev_test_hash" \
  -d '{"query":"query GetRestaurants { restaurants { id name } }"}' \
  http://localhost:8787/graphql
```

Should return **200 with data** instead of 401.

---

## 📝 Important Notes for Backend Developer

1. **Development vs Production**: 
   - Dev: Hash doesn't need cryptographic validity if backend accepts test data
   - Prod: Telegram provides properly signed data

2. **Backend Should**:
   - Accept init data format in development
   - Validate hash properly in production
   - Extract user info from init data for authentication

3. **Never Commit Real Secrets**: Mock data should be obviously fake - never use real bot tokens/production data in `VITE_DEV_INIT_DATA`.

---

## 🔄 Alternative: Different Backend Format Expectations

If backend expects init data parsed differently (e.g., JSON object rather than URL-encoded string), please provide specifics and I'll adjust solution. However, based on standard Telegram WebApp implementation and feedback about expecting "valid Telegram init data", URL-encoded string format is correct.

---

## 📝 Changelog

- Original: Solution for fixing Telegram init data for local development
- 2026-04-03: Restructured for opencode compatibility with:
  - Clear problem statement
  - Multiple solution options (direct fix vs environment variable)
  - Detailed implementation instructions with code examples
  - Explanation of why solution works
  - Verification procedures
  - Important notes and warnings
  - Alternative approach guidance