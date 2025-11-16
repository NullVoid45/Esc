# Opencode CLI Task Prompt
**Goal:** Implement backend, real-time, QR, and API wiring so the existing Student / Mentor / HOD / Watchman / Dev apps work with a single MongoDB backend — **without modifying any UI layout, styles, or components**. Only replace or add data-layer files (API clients, sample-data modules), add server code, scripts, and tests. Preserve all UI files and assets. Set up the APIs for the database and leave placeholder text for for adding a database latee

---

## High-level instructions (do not change UI)
1. **Do NOT edit any UI JSX/TSX/CSS/layout files.**  
   - Only modify files that are explicitly data-layer, service-layer, or configuration:
     - `mobile/src/api/*`, `mobile/src/data/*` (sample data), `web/src/api/*`, `web/src/services/*`
     - New backend files under `/server` (or `/backend`) only.
2. **If a UI component currently imports "sample data" or local JSON, replace that import with a thin API wrapper that exposes the same function names / exports** so UI code continues to call the same functions and the UI remains unchanged.
3. **Do not rename or remove exported functions/props used by UI**. Keep signatures identical when replacing sample data modules with API-backed modules.
4. Create new server, scripts, and CI files as described below. These can be added anywhere (prefer `/server`) and should not alter UI code except for swapping the sample-data module imports with API wrappers.

---

## Repo layout to create (if missing)
/server
package.json
.env.example
tsconfig.json
src/
index.ts
app.ts
config.ts
middleware/auth.ts
routes/auth.ts
routes/requests.ts
routes/qr.ts
routes/admin.ts
models/User.ts
models/Request.ts
models/QrToken.ts
models/AuditLog.ts
services/qr.service.ts
services/notification.service.ts
services/socket.service.ts
tests/
scripts/
ensureIndexes.ts

/web
(do NOT change UI files)
src/api/client.ts <-- add only if not present
src/api/requests.ts <-- implement wrapper which preserves exported functions used by UI

/mobile
(do NOT change UI files)
src/api/client.ts <-- add only if not present
src/api/requests.ts <-- implement wrapper which preserves exported functions used by UI
src/hooks/useAuth.ts <-- add if UI expects auth hooks; keep same exported names

.github/workflows/ci.yml
ops/README-opencode-instructions.md

yaml
Copy code

---

## Environment variables (`/server/.env.example`)
PORT=4000
MONGO_URI=mongodb://localhost:27017/hitam_outpass

JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=7d

QR_TOKEN_SECRET=replace_with_another_random_secret
QR_TOKEN_TTL_SECONDS=3600

EXPO_PUSH_KEY=
SENTRY_DSN=

REACT_APP_API_URL=http://localhost:4000/api

markdown
Copy code

---

## Data models (MongoDB / Mongoose) — add these files under `server/src/models`

### `User`
- Fields: `_id, name, email (unique), passwordHash, role ('student'|'mentor'|'hod'|'watchman'|'dev'), branch, section, createdAt`

### `Request`
- Fields: `_id, student(ObjectId), branch, section, reason, from, to, status ('pending'|'mentors_approved'|'approved'|'rejected'|'cancelled'), approvalChain [ { role, approver, status, comment, actedAt } ], qrTokenId, createdAt`

### `QrToken`
- Fields: `_id, token (crypto hex), request(ObjectId), expiresAt(Date), used(Boolean)`
- TTL index: `QrToken.expiresAt` with `expireAfterSeconds: 0`

### `AuditLog`
- Fields: `{ actorId, action, targetId, meta, createdAt }`

---

## API spec — add routes under `server/src/routes` (prefix `/api`)

### Auth
- `POST /api/auth/register` — { name, email, password, role, branch, section }
- `POST /api/auth/login` — { email, password } → `{ token }`
- `GET /api/auth/me` — returns user (JWT required)

### Requests
- `POST /api/requests` — student creates request (store branch & section)
- `GET /api/requests` — list filtered by role & branch/section (query params supported)
  - Mentor: `?role=mentor&branch=...&section=...&status=pending`
  - HOD: `?role=hod&branch=...&status=mentors_approved`
  - Dev: unrestricted with admin privileges
- `GET /api/requests/:id` — details
- `POST /api/requests/:id/approve` — body: `{ role, comment? }` — backend enforces RBAC and branch/section matching
  - If mentor approval completed → set `status = 'mentors_approved'` and notify HOD room
  - If HOD approves → set `status = 'approved'`, generate QR token, attach `qrTokenId`, notify scanner & dev rooms
- `POST /api/requests/:id/reject` — body `{ role, comment }`
- `POST /api/requests/:id/cancel` — student cancels

### QR
- `POST /api/qr/verify` — body `{ token }` → responses:
  - `{ valid: true, request: {...} }`
  - `{ valid: false, reason: 'not_found'|'expired'|'not_approved'|'used' }`
- `GET /api/qr/:token/img` — (optional) serve PNG if needed by web admin (not required for scanner; scanner posts token)

### Admin
- `GET /api/admin/logs` — paginated audit logs (admin/dev only)
- `POST /api/admin/users` — create/update users (admin only)

---

## Socket.IO events & rooms (server-side)
- On client connect, allow join to rooms:
  - Mentors: `mentor:{branch}:{section}`
  - HODs: `hod:{branch}`
  - Scanner: `scanner` or `scanner:{branch}` (optional)
  - Dev: `dev`
- Emit when events occur:
  - `request:new` → to `mentor:{branch}:{section}` with minimal safe payload
  - `request:mentors_approved` → to `hod:{branch}`
  - `request:approved` → to `scanner` and `dev` with `{ requestId, qrToken }`
  - `request:updated` → broadcast to relevant rooms with `{ id, status }`

---

## QR token generation rules
- Use `crypto.randomBytes(32).toString('hex')` for token
- Store in `QrToken` with `expiresAt`
- TTL index will auto-delete expired tokens
- QR must contain only the token string (no PII)
- Verification endpoint must check:
  1. token exists
  2. not expired
  3. request.status === 'approved'
  4. if single-use: `used === false` then optionally mark `used = true`
- Return safe subset of request to callers (no private fields)

---

## Important: Preserve UI contracts
- For every replaced sample-data module or API wrapper:
  - Keep function names, argument signatures, and return shapes identical to original sample module.
  - If UI expected `getRequests()` returning array of objects with `id`, `studentName`, `from`, `to`, `status`, maintain same keys.
  - If UI expects async functions returning a Promise, the wrapper must remain `async` and resolve identical data shapes (map DB fields to UI shape).

---

## Tests & lint
- Add Jest + supertest tests for:
  - Auth flows (register/login)
  - Request lifecycle: create → mentor approve → hod approve → QR created → QR verify valid/expired
  - QR token TTL and used flag behavior
- Add ESLint + Prettier configs
- Add `npm` scripts in `/server/package.json`:
  - `dev`, `start`, `build`, `test`, `lint`, `ensure-indexes`

---

## CI (GitHub Actions) — basic
- Create `.github/workflows/ci.yml` to:
  - install dependencies
  - run `npm run lint` and `npm test` for server
  - build web (`npm run build` in `/web`) — **do not** modify UI build steps
  - type-check mobile if TS used

---

## Deployment & safety scripts
- `server/scripts/ensureIndexes.ts` — create unique index on `User.email` and TTL index on `QrToken.expiresAt`
- Provide `ops/README-opencode-instructions.md` describing steps to run locally:
  - `cp server/.env.example server/.env` and set `MONGO_URI` & secrets
  - `npm install` in server
  - `npm run dev` to start server
  - How to join socket rooms from UI clients (brief snippet)

---

## Commit & PR strategy
- Make a single commit titled:
feat: add backend API, qr verification, real-time events, and API wrappers (no UI changes)

markdown
Copy code
- Create PR with checklist:
- [ ] All new server files added under `/server`
- [ ] `web/src/api/*` and `mobile/src/api/*` wrappers added or replaced (preserve function signatures)
- [ ] `.env.example` added
- [ ] `ensureIndexes.ts` included
- [ ] Tests added and passing
- [ ] CI yaml added

---

## Commands & packages (server)
```bash
# server scaffold (if missing)
mkdir -p server && cd server
npm init -y
npm i express mongoose bcrypt jsonwebtoken socket.io cors dotenv
npm i -D typescript ts-node-dev jest ts-jest supertest @types/express @types/node @types/supertest eslint prettier
Notes & constraints
Absolute must: Do not touch any UI component files, styling, or layout files. Only add/replace data/service modules and backend code.

API wrappers must return the same data structure the UI currently expects (map DB model fields to UI DTOs).

If an existing API client file exists, prefer editing that file; otherwise add a new src/api/client.ts that exports the same functions used by UI.

Keep all changes backward-compatible to avoid breaking the current UI.

Expected output after Opencode CLI run
New /server folder with full API, models, services, and tests.

web/src/api/* and mobile/src/api/* wrappers replacing sample-data, exposing same exported function names/signatures.

Socket.IO enabled server emitting events to role/branch/section rooms.

.env.example, ensureIndexes.ts, ci.yml, and ops/README-opencode-instructions.md added.

One commit & PR titled as specified above.