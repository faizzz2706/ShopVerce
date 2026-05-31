import { describe, it, before } from "node:test";
import assert from "node:assert";

/**
 * Integration tests - require running server
 * Run: npm run dev -w backend (in separate terminal) then npm test -w backend
 */
const API_URL = process.env.API_URL || "http://localhost:5000/api";

describe("API Integration", { skip: !process.env.RUN_INTEGRATION }, () => {
  it("health endpoint returns 200", async () => {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
  });

  it("products endpoint returns paginated data", async () => {
    const res = await fetch(`${API_URL}/products?limit=5`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.pagination);
  });

  it("categories endpoint returns data", async () => {
    const res = await fetch(`${API_URL}/categories`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data.data));
  });
});

describe("Auth validation", { skip: !process.env.RUN_INTEGRATION }, () => {
  it("register requires valid email", async () => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid", password: "short" }),
    });
    assert.ok(res.status >= 400);
  });
});
