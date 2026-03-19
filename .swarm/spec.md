# Telegram Init Data Validation

## Feature Description
Users need to send valid, non-expired Telegram init data when interacting with the backend API. The init data must include a recent `auth_date` timestamp (within the last 24 hours) to prevent replay attacks and ensure secure authentication. The frontend should generate or obtain valid init data appropriate for the execution environment (real Telegram client or development mock) and include it in API requests.

## User Scenarios

### Scenario 1: Real Telegram Client
Given the user is running the Mini App inside the Telegram client
When the app initializes
Then it should use the `window.Telegram.WebApp.initData` provided by the Telegram client
And send this init data in the `X-Telegram-Init-Data` header for all API requests
And the backend should validate the init data hash and accept it as authentic

### Scenario 2: Development/Browser Testing
Given the user is running the app outside Telegram (browser or preview)
When `VITE_DEV_INIT_DATA` is not set
Then the app should use a mock init data structure with a recent `auth_date`
And send this mock init data in the `X-Telegram-Init-Data` header
And the backend should accept it for development purposes (if configured to do so)

### Scenario 3: Expired Init Data Prevention
Given the app has valid init data
When the `auth_date` in the init data is older than 24 hours
Then the app should not use this init data for API requests
And instead obtain fresh init data (in real Telegram) or regenerate mock data with current timestamp (in development)

## Functional Requirements

FR-001: The app MUST include Telegram init data in the `X-Telegram-Init-Data` header for all backend API requests.

FR-002: In production (real Telegram), the app MUST use the `initData` string from `window.Telegram.WebApp.initData` without modification.

FR-003: In development (when `VITE_DEV_INIT_DATA` is set), the app MUST use the value of `VITE_DEV_INIT_DATA` as the init data, which MUST be a full URL-encoded string matching Telegram's format.

FR-004: In development (when `VITE_DEV_INIT_DATA` is NOT set), the app MUST generate mock init data that includes a current `auth_date` timestamp in URL-encoded format.

FR-005: The app MUST ensure the `auth_date` in the init data represents a time within the last 24 hours relative to the current system time.

FR-006: The app MUST NOT attempt to validate the Telegram init data hash signature (this is the backend's responsibility).

FR-007: The app MUST preserve the URL-encoded format of the init data when reading from `window.Telegram.WebApp.initData` or `VITE_DEV_INIT_DATA`.

FR-008: The app MUST NOT modify the `auth_date` value when using init data from the real Telegram client.

FR-009: When the app detects that the `auth_date` in the init data is older than 24 hours, it MUST log a warning to the console indicating the init data is expired.

## Success Criteria

SC-001: All API requests include a non-empty `X-Telegram-Init-Data` header.

SC-002: In development without `VITE_DEV_INIT_DATA`, the `auth_date` in the sent init data is within 24 hours of the current time.

SC-003: In production, the init data sent matches exactly the `window.Telegram.WebApp.initData` string.

SC-004: The app does not crash or fail to initialize when `window.Telegram.WebApp` is unavailable (mock environment works).

SC-005: The app does not send init data with an `auth_date` older than 24 hours.

## Key Entities
- Telegram WebApp
- Init data string
- Auth date timestamp
- Backend API

## Edge Cases
- The `window.Telegram.WebApp.initData` string is empty or malformed in real Telegram (should not happen but app should handle gracefully).
- The `VITE_DEV_INIT_DATA` environment variable contains an expired `auth_date`.
- The system clock is significantly incorrect (time travel) affecting the 24-hour window calculation.
- The init data contains optional fields like `receiver`, `chat`, `start_param` that should be preserved.

## Clarifications

- **Refresh strategy**: The app relies on obtaining fresh init data on next app start rather than actively refreshing when auth_date is near expiration.
- **Development format**: `VITE_DEV_INIT_DATA` must be a full URL-encoded string matching Telegram's format (not a simplified JSON object).
- **Expired data handling**: The app logs a warning to the console when it detects expired init data (auth_date older than 24 hours).