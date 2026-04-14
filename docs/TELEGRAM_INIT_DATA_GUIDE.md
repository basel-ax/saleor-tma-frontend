# Telegram Init Data Guide for Local Development

> How X-Telegram-Init-Data works and how to generate correct headers for testing.

---

## Overview

The backend requires `X-Telegram-Init-Data` header on every GraphQL request. This header authenticates the request by passing Telegram Mini App launch parameters.

**Current Implementation:**
- In **Telegram**: `window.Telegram.WebApp.initData` is automatically provided
- In **Browser**: Mock environment auto-generates fresh init data on every request

---

## Header Format

```
X-Telegram-Init-Data: auth_date=1234567890&user={"id":0,"first_name":"Test"}&hash=dummy
```

Required fields:
- `auth_date` - Unix timestamp (seconds) when data was generated
- `hash` - HMAC signature (dummy value accepted in dev)
- `user` - JSON-encoded user object (optional but recommended)

---

## Quick Reference: Generate Test Headers

### Node.js One-Liner

```bash
node -e "const u=JSON.stringify({id:0,first_name:'Test'});console.log('user='+encodeURIComponent(u)+'&auth_date='+Math.floor(Date.now()/1000)+'&hash=test')"
```

### Python One-Liner

```bash
python3 -c "import urllib.parse,json;u=json.dumps({'id':0,'first_name':'Test'});print(f'user={urllib.parse.quote(u)}&auth_date={int(__import__(\"time\").time())}&hash=test')"
```

### JavaScript (Browser Console)

```javascript
const user = JSON.stringify({id: 0, first_name: "Test"});
const authDate = Math.floor(Date.now() / 1000);
const initData = `auth_date=${authDate}&user=${encodeURIComponent(user)}&hash=test`;
console.log(initData);
```

### Copy-Paste for curl

```bash
# Generate fresh header
INIT_DATA="user=$(node -e "console.log(encodeURIComponent(JSON.stringify({id:0,first_name:'Test'})))")&auth_date=$(date +%s)&hash=test"

# Use in curl
curl -X POST 'http://localhost:8787/graphql' \
  -H 'Content-Type: application/json' \
  -H "X-Telegram-Init-Data: $INIT_DATA" \
  -d '{"query":"query GetRestaurants { restaurants { id name } }"}'
```

---

## Environment Variable Method

### Set in `.env.local`

```bash
# Generate and copy the output:
node -e "const u=JSON.stringify({id:0,first_name:'Test'});console.log('VITE_DEV_INIT_DATA=user='+encodeURIComponent(u)+'&auth_date='+Math.floor(Date.now()/1000)+'&hash=test')"
```

Add to `.env.local`:
```env
VITE_DEV_INIT_DATA=user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%7D&auth_date=1234567890&hash=test
```

**Note:** The mock auto-generates fresh `auth_date` on each request, so the timestamp in the env var only matters for the initial value.

---

## How Mock Environment Works

### File: `src/mockEnv.ts`

```typescript
const mockWebApp = {
  get initData() {
    // Getter called on EVERY access - generates fresh timestamp
    return import.meta.env.VITE_DEV_INIT_DATA || generateMockInitData();
  },
  // ...
};
```

### File: `src/utils/initData.ts`

```typescript
export function generateMockInitData(): string {
  const authDate = Math.floor(Date.now() / 1000);  // Fresh timestamp!
  const user = { id: 0, first_name: "Test", /* ... */ };
  const hash = "dummy_hash_for_development";
  
  const params = new URLSearchParams();
  params.set('auth_date', authDate);
  params.set('user', JSON.stringify(user));
  params.set('hash', hash);
  
  return params.toString();
}
```

### File: `src/api/index.ts`

```typescript
function buildHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': getTelegramInitHeader(),  // Auto-included
  };
}
```

---

## Backend Validation

The backend (`worker/src/auth.ts`) validates:
1. Header is present and not empty
2. Contains `hash` and `auth_date` fields
3. `auth_date` is within last 24 hours

**Development mode:** Hash is NOT cryptographically validated (skeleton implementation).

---

## Troubleshooting

### Error: "Missing X-Telegram-Init-Data"
- Check Network tab - is the header being sent?
- Check browser console for `mockEnv.ts` initialization messages

### Error: "X-Telegram-Init-Data has expired"
- This shouldn't happen with auto-generated mock (fresh timestamp)
- If using `VITE_DEV_INIT_DATA`, the timestamp may be old
- Solution: Remove the env var and let mock generate fresh timestamps

### Verify Header Format
```javascript
// In browser console:
console.log(window.Telegram.WebApp.initData);
// Should output: "auth_date=1234567890&user={...}&hash=..."
```

---

## Production vs Development

| Aspect | Development | Production |
|--------|-------------|------------|
| Source | Mock generator | Telegram SDK |
| Hash | Dummy value | HMAC-SHA256 signed |
| Timestamp | Fresh each request | Telegram-provided |
| User ID | 0 (test user) | Real Telegram user ID |

---

## Testing Checklist

- [ ] Browser console shows `mockEnv.ts: Creating mock WebApp`
- [ ] Network tab shows `X-Telegram-Init-Data` header
- [ ] Header value contains `auth_date`, `user`, `hash`
- [ ] Backend returns 200 with data (not 401)
