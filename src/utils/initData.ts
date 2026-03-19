// ─── Telegram Init Data Utility ────────────────────────────────────────
// Generates mock Telegram init data for development/testing.
// The data is URL-encoded and includes a current auth_date timestamp.
// Note: The hash is a dummy value for development; backend should validate in production.

export function generateMockInitData(): string {
  const authDate = Math.floor(Date.now() / 1000).toString();
  const user = {
    id: 0,
    first_name: "Test",
    last_name: "User",
    username: "testuser",
  };
  // Dummy hash for development. In production, the real hash from Telegram is used.
  const hash = "dummy_hash_for_development";

  const params = new URLSearchParams();
  params.set('auth_date', authDate);
  params.set('user', JSON.stringify(user));
  params.set('hash', hash);

  return params.toString();
}