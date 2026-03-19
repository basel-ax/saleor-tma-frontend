<!-- PLAN_HASH: 30wsh4qi6f2g2 -->
# Saleor TMA Frontend - Telegram Init Data Validation
Swarm: default
Phase: 1 [PENDING] | Updated: 2026-03-19T14:21:13.456Z

---
## Phase 1: Telegram Init Data Validation Implementation [PENDING]
- [x] 1.0: Set up Vitest testing framework and configuration [SMALL]
- [x] 1.1: Create utility function for generating URL-encoded Telegram init data with current auth_date [SMALL] (depends: 1.0)
- [x] 1.2: Fix getTelegramInitHeader() in src/api/index.ts to return raw URL-encoded init data instead of JSON and add expiration warning (dev mode only) [SMALL] (depends: 1.1)
- [x] 1.3: Modify mockEnv.ts to use utility function for generating mock init data when VITE_DEV_INIT_DATA is not set [SMALL] (depends: 1.1)
- [ ] 1.4: Create automated tests for Telegram init data utility and header function [MEDIUM] (depends: 1.1, 1.2)
