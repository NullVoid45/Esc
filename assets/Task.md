Opencode CLI Task: Convert current repository into a production-ready Online Outpass System

This file is a single actionable checklist and patch plan for Opencode CLI to automatically edit the repository (web + backend + mobile) so the already-developed code becomes a working system as described in the project docs. It maps features from your existing design and progress notes to concrete code changes, files to create/modify, commands to run, env vars, tests, and rollout steps.

Sources used to produce this plan: project abstract and slides, and the mobile progress report.

Summary (what this task will implement)

Add backend API (Node + Express) endpoints for authentication, outpass CRUD, multi-level approvals, QR generation (secure token), and QR verification.

Replace hardcoded/sample data in the React Native app with real API integration + authentication and persistence.

Add a basic web admin UI integration points (React) to create, approve, view logs.

Add MongoDB schemas, indexes, TTL where appropriate (secure short-lived tokens).

Add real-time updates via WebSocket (socket.io) for request status updates.

Add tests (unit + integration), linting, and CI job templates.

Add Expo push notification scaffolding and mobile QR scanner verification flow.

Add migration & safety steps (backups, env validation).

Repo assumptions (what Opencode CLI will assume)

Backend lives in /server or /backend; if not present, create /server.

Mobile app is in /mobile (Expo/React Native).

Web frontend is in /web (React).

TypeScript is used for mobile; backend can be TS or JS. CLI will detect tsconfig / package.json.

MongoDB connection string available in env.

Current mobile app uses sample data and Expo (as indicated in progress report). 

PROGRESS_REPORT

If any path is missing, the CLI should create the folder scaffold and add files.

Files to add / modify (high level)

server/

server/package.json (dependencies)

server/src/index.ts (Express app bootstrap + socket.io)

server/src/config.ts (env loader/validator)

server/src/models/User.ts, Request.ts, AuditLog.ts, QrToken.ts

server/src/routes/auth.ts, requests.ts, qr.ts, admin.ts

server/src/middleware/auth.ts (JWT & RBAC)

server/src/services/qr.service.ts (generate/verify secure token)

server/src/services/notification.service.ts (Expo push helper stub)

server/src/tests/* (basic tests)

mobile/ (modify)

Replace sample dataset modules with api/* wrappers; add auth flow (login screen), token storage, API client.

Hook QR scanner to POST /api/qr/verify.

Add push token registration hook.

web/ (modify)

Add request list hooked to GET /api/requests and approval buttons calling POST /api/requests/:id/approve.

Root

.github/workflows/ci.yml — runs lint, test, and build for server/mobile/web (basic).

ops/README-opencode-instructions.md — summary for operators.

Environment variables (create .env.example)
# Server
PORT=4000
MONGO_URI=mongodb://localhost:27017/hitam_outpass
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=7d
QR_TOKEN_SECRET=replace_with_another_random_secret
QR_TOKEN_TTL_SECONDS=3600
EXPO_PUSH_KEY= # optional for push notifications
SENTRY_DSN= # optional

# Client
REACT_APP_API_URL=http://localhost:4000/api

Data models (MongoDB / Mongoose) — essential fields
User (server/src/models/User.ts)
import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  roll: { type: String }, // optional
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student','admin','approver','security'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

export default model('User', UserSchema);

Request (server/src/models/Request.ts)
const RequestSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: String,
  from: Date,
  to: Date,
  status: { type: String, enum: ['pending','approved','rejected','cancelled'], default: 'pending' },
  approvalChain: [{
    role: String,
    approver: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
    comment: String,
    actedAt: Date
  }],
  qrTokenId: { type: Schema.Types.ObjectId, ref: 'QrToken' },
  createdAt: { type: Date, default: Date.now },
});

QrToken (server/src/models/QrToken.ts)

Stores server-side token payload (non-guessable value), expiration, pointer to request, and a boolean used.

Add TTL index to auto-delete after expiry.

const QrTokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  request: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
});
QrTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

API spec (routes + behavior)

All routes prefixed with /api.

Auth

POST /api/auth/register — body { name, email, password, role? }

POST /api/auth/login — returns { token } (JWT)

GET /api/auth/me — returns current user

Requests

POST /api/requests (student) — create a request, returns request

GET /api/requests — list requests (admins/approvers: filtered; students: own)

GET /api/requests/:id — request details

POST /api/requests/:id/approve — Approver approves current level; if last level, backend generates QR token and attaches QR to request

POST /api/requests/:id/reject — Approver rejection

POST /api/requests/:id/cancel — Student cancel

QR

GET /api/qr/:token/img — returns a QR image (optional helper)

POST /api/qr/verify — body { token } or scanner supplies token. Server checks token exists, not expired, and request.status === 'approved'. Returns request details and validity boolean. Mark token as used if single-use.

Admin

GET /api/admin/logs — audit logs (admin only)

POST /api/admin/users — create/update users

Security behaviour + QR design

QR should contain only a server-signed non-guessable token (e.g., crypto.randomBytes(32).toString('hex')) or a short JWT signed with QR_TOKEN_SECRET containing token id (but not user PII).

Server stores token + request pointer + expiry and sets TTL index to auto-expire.

QR verification endpoint validates token server-side; only return requested fields (no sensitive PII).

Mark token as used if business rules demand single-use.

All API routes require JWT and role-checking middleware. Use bcrypt for password hashing.

Real-time updates

Install socket.io on server and client.

On status changes (approve/reject), emit an event request:updated with minimal safe payload (id, status) to update UI instantly. Fallback to client polling.

Mobile app changes (mobile/)

Add src/api/client.ts (axios/fetch wrapper) that adds Authorization: Bearer <token>.

Replace sample data module with src/api/requests.ts functions: fetchRequests, approveRequest, createRequest.

Add Auth screens: LoginScreen.tsx, RegisterScreen.tsx. Store JWT in SecureStore/AsyncStorage.

Update QR scanner flow: when a QR is scanned, call POST /api/qr/verify and display the returned request info and allow guard to grant or deny based on verification.

Register device for push notifications via Expo and send push token to server on login.

Web frontend changes (web/)

Configure API client with same base URL.

Replace sample list with live GET /api/requests.

Add an admin approval modal that calls POST /api/requests/:id/approve and shows the generated QR (as image or raw token string for print).

Example server code snippets
server/src/services/qr.service.ts
import crypto from 'crypto';
import QrToken from '../models/QrToken';

export async function generateQrToken(requestId: string, ttlSeconds: number) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const doc = await QrToken.create({ token, request: requestId, expiresAt });
  return doc;
}

server/src/routes/qr.ts (verify route)
router.post('/verify', async (req, res) => {
  const { token } = req.body;
  const doc = await QrToken.findOne({ token }).populate('request');
  if (!doc) return res.status(404).json({ valid: false, reason: 'not_found' });
  if (doc.expiresAt < new Date()) return res.status(410).json({ valid: false, reason: 'expired' });
  if (doc.request.status !== 'approved') return res.status(403).json({ valid: false, reason: 'not_approved' });
  // optionally mark used
  // doc.used = true; await doc.save();
  return res.json({ valid: true, request: { id: doc.request._id, student: doc.request.student, from: doc.request.from, to: doc.request.to }});
});

Tests (minimum)

Unit: auth hashing + JWT generation, QR token generation + expiry.

Integration: POST /api/requests → approve full chain → QR created → POST /api/qr/verify returns valid.

Use Jest + supertest for server tests.

Linting & TypeScript

Ensure ESLint config and TypeScript tsconfig.json exist at server root. Add npm run lint & npm run build scripts.

Add prettier for formatting.

Migration & DB steps

Add initial indexes after deployment: unique email index, TTL index for QrToken.expiresAt.

Provide a script server/scripts/ensureIndexes.ts to run once.

CI / CD (basic)

Create .github/workflows/ci.yml to:

Install dependencies

Run npm run lint and npm test for server

Build React web app (npm run build in /web)

Lint mobile TypeScript

Example Opencode CLI operations (pseudo-commands)

Opencode CLI should perform the following edits / commands (in order):

Detect repo layout and create server/ scaffold if missing.

Add packages:

cd server
npm init -y
npm i express mongoose bcrypt jsonwebtoken socket.io cors dotenv
npm i -D typescript ts-node-dev @types/express @types/node jest ts-jest supertest @types/supertest


Create models and routes files as specified above.

Add mobile/src/api/* wrappers and replace sample data import references.

Patch mobile/App.tsx to add login gating and API client.

Add web/src/api client and wire to existing request list components.

Add tests and CI workflow.

Commit with message: feat: backend API + qr verification + client integration and create PR.

Rollout checklist (what the operator must verify)

 MONGO_URI configured and reachable.

 JWT_SECRET and QR_TOKEN_SECRET are strong.

 TLS/HTTPS is used in production.

 Backups enabled for DB.

 Expo push credentials if notifications required.

 Perform local end-to-end test (server + web + mobile) with sample user and request.

 Run server/scripts/ensureIndexes.ts

Quick developer notes & considerations

QR tokens are stored server-side so QR itself carries only the token string — no PII. This matches the security description in your abstract. 

PBL Abstract

Mobile app currently uses Expo and sample data. The CLI will not remove your UI; it will replace sample sources with API-backed implementations and keep UI intact. See progress report. 

PROGRESS_REPORT

Make the approval flow configurable: approvals complete when the last item in approvalChain is approved. On final approval, generate QR token and notify security/admin.

Keep audit logs for every action (AuditLog model) with actorId, action, targetId, and meta.

PR / commit checklist to include in generated PR

 All new dependencies added to package.json.

 README.md updated with environment and run commands for dev/prod.

 .env.example added.

 Tests added and passing.

 Lint and build success in CI config.

 Migration / index script included.

Example README snippets (to use in PR)
# Dev server
cd server
cp .env.example .env
# set MONGO_URI and secrets
npm install
npm run dev

# Web
cd web
npm install
npm run start

# Mobile (Expo)
cd mobile
npm install
expo start
