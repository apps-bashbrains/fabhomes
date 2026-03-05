# Testing

## 1. Validation tests (no server)

Schema and request validation for leads, user-queries, and listing-requests:

```bash
npm run test:validations
```

## 2. API end-to-end tests (server required)

These tests call the running app to verify API contracts and data flow (status codes, response shape, auth).

**Run with server:**

```bash
# Terminal 1: start the app (with DATABASE_URL and env set)
npm run dev

# Terminal 2: run API e2e tests
npm run test:api
```

Optional: set `TEST_BASE_URL` if the app runs on a different host/port:

```bash
TEST_BASE_URL=http://localhost:3000 npm run test:api
```

If the server is not available, API e2e tests are **skipped** (no failure), so `npm run test` is safe in CI without a running server.

## 3. All tests

```bash
npm run test
```

- Validation tests always run.
- API e2e tests run but skip when the server is unreachable.
