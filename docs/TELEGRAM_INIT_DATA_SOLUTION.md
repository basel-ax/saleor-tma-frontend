# Telegram Init Data Solution

> **This is now handled automatically.** See [TELEGRAM_INIT_DATA_GUIDE.md](./TELEGRAM_INIT_DATA_GUIDE.md) for complete documentation.

## What Was Done

The frontend now automatically generates valid `X-Telegram-Init-Data` headers:

1. **Mock environment** (`src/mockEnv.ts`) creates `window.Telegram.WebApp.initData` as a getter
2. **Generator** (`src/utils/initData.ts`) produces fresh init data with current timestamp
3. **API layer** (`src/api/index.ts`) includes the header on every request

## Quick Start

```bash
# 1. Copy env file
cp .env.example .env.local

# 2. Set backend URL
echo "VITE_BACKEND_BASE_URL=http://localhost:8787" >> .env.local

# 3. Run dev server
npm run dev
```

That's it - mock init data is auto-generated with fresh timestamps.

## Manual Testing

Generate a test header:

```bash
node -e "const u=JSON.stringify({id:0,first_name:'Test'});console.log('user='+encodeURIComponent(u)+'&auth_date='+Math.floor(Date.now()/1000)+'&hash=test')"
```

Use with curl:

```bash
curl -X POST 'http://localhost:8787/graphql' \
  -H 'Content-Type: application/json' \
  -H 'X-Telegram-Init-Data: user=%7B%22id%22%3A0%2C%22first_name%22%3A%22Test%22%7D&auth_date=1234567890&hash=test' \
  -d '{"query":"query GetRestaurants { restaurants { id name } }"}'
```

## If You See "Missing X-Telegram-Init-Data"

1. Check Network tab - is the header present?
2. Check browser console for `mockEnv.ts` messages
3. Restart dev server: `npm run dev`

## For More Details

See [TELEGRAM_INIT_DATA_GUIDE.md](./TELEGRAM_INIT_DATA_GUIDE.md)
