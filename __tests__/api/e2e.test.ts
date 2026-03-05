/**
 * API end-to-end tests – hit running app (TEST_BASE_URL or http://localhost:3000).
 * Run with server up: npm run dev (or next start) then npm run test
 * Skips tests if server is unreachable.
 */

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";

async function fetchOk(
  path: string,
  opts: RequestInit = {}
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts.headers },
  });
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

let serverAvailable = false;

beforeAll(async () => {
  try {
    const res = await fetch(`${BASE}/`);
    serverAvailable = res.ok || res.status === 200;
  } catch {
    serverAvailable = false;
  }
});

function skipIfNoServer(
  name: string,
  fn: () => void | Promise<void>
) {
  it(name, async () => {
    if (!serverAvailable) {
      console.warn("Skipping API test: server not available at " + BASE);
      return;
    }
    await fn();
  });
}

describe("Public API – Leads", () => {
  skipIfNoServer("POST /api/leads accepts valid body and returns success", async () => {
    const { status, body } = await fetchOk("/api/leads", {
      method: "POST",
      body: JSON.stringify({
        name: "E2E Test",
        mobile: "9999999999",
        email: "e2e@test.com",
        message: "E2E lead message",
      }),
    });
    expect(status).toBe(200);
    expect((body as { success?: boolean }).success).toBe(true);
  });

  skipIfNoServer("POST /api/leads rejects invalid body with 400", async () => {
    const { status } = await fetchOk("/api/leads", {
      method: "POST",
      body: JSON.stringify({ name: "A", mobile: "1" }),
    });
    expect(status).toBe(400);
  });
});

describe("Public API – User Queries", () => {
  skipIfNoServer("POST /api/user-queries accepts valid body", async () => {
    const { status, body } = await fetchOk("/api/user-queries", {
      method: "POST",
      body: JSON.stringify({
        mobile: "9999999998",
        mode: "RENT",
        city: "Noida",
        message: "Need 2BHK for rent",
      }),
    });
    expect(status).toBe(200);
    expect((body as { success?: boolean }).success).toBe(true);
  });

  skipIfNoServer("POST /api/user-queries rejects invalid body with 400", async () => {
    const { status } = await fetchOk("/api/user-queries", {
      method: "POST",
      body: JSON.stringify({ mobile: "1", message: "Hi" }),
    });
    expect(status).toBe(400);
  });
});

describe("Public API – Auth OTP", () => {
  skipIfNoServer("POST /api/auth/request-otp accepts phone and returns 200 or 429", async () => {
    const { status, body } = await fetchOk("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone: "9876543210", type: "customer" }),
    });
    expect([200, 429]).toContain(status);
    if (status === 200) {
      expect((body as { success?: boolean }).success).toBe(true);
    }
  });

  skipIfNoServer("POST /api/auth/request-otp rejects invalid body with 400", async () => {
    const { status } = await fetchOk("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone: "1" }),
    });
    expect(status).toBe(400);
  });
});

describe("Protected API – Wishlist", () => {
  skipIfNoServer("GET /api/wishlist without session returns 401", async () => {
    const { status } = await fetchOk("/api/wishlist");
    expect(status).toBe(401);
  });

  skipIfNoServer("POST /api/wishlist/toggle without session returns 401", async () => {
    const { status } = await fetchOk("/api/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ propertyId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" }),
    });
    expect(status).toBe(401);
  });
});

describe("Protected API – Listing Requests", () => {
  skipIfNoServer("POST /api/listing-requests without session returns 401", async () => {
    const { status } = await fetchOk("/api/listing-requests", {
      method: "POST",
      body: JSON.stringify({
        mode: "BUY",
        propertyType: "APARTMENT",
        locationText: "Test",
        city: "Noida",
        price: 5000000,
        description: "Test",
      }),
    });
    expect(status).toBe(401);
  });
});

describe("Admin API – Unauthorized", () => {
  skipIfNoServer("GET /api/admin/leads without admin session returns 401", async () => {
    const { status } = await fetchOk("/api/admin/leads");
    expect(status).toBe(401);
  });

  skipIfNoServer("GET /api/admin/users without admin session returns 401", async () => {
    const { status } = await fetchOk("/api/admin/users");
    expect(status).toBe(401);
  });
});
