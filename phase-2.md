# Opencode CLI Task Prompt — Mentor → HOD Request Routing & Semester Mapping

**Goal:** Implement backend and thin API-layer changes so that:  
1. When a student creates an outpass request it first appears in the Mentor app (only mentors for that class/section see it).  
2. After mentor approval it appears in the HOD app (only HODs for that branch see it).  
3. Leave a clear, easy-to-edit mapping of which class/section goes to which mentor(s) and HOD(s).  
4. Provide a simple admin API + data model to update mappings every semester (versioned / toggled active).  
**Important:** Do **NOT** change UI components/layouts. Only add new server files, API wrappers, small migration scripts, and API endpoints that UI can call. Keep exported function signatures identical if replacing sample-data modules.

---

## 1 — High-level approach (one line)
Add a `ClassAssignment` model (mapping semester/branch/section → mentor user IDs & hod user IDs), API endpoints to read/update assignments, route new requests to mentor rooms based on the active assignment, and on mentor approval route to HOD rooms; expose a semester-friendly update endpoint and a CLI script to rotate assignments each semester.

---

## 2 — Files / paths to create (server only)
Place these under `/server/src`:

models/ClassAssignment.ts # mapping model (semester-aware)
routes/assignments.ts # CRUD for assignments + semester switch
routes/requests.ts # modify: create + approve flows (emit to mentor/hod rooms)
services/assignment.service.ts # lookup helpers
scripts/updateSemesterAssignments.ts # CLI script to activate new semester mapping
scripts/seed-default-assignments.ts # optional starter data

yaml
Copy code

If `server` missing, scaffold `/server` as per existing manifest.

---

## 3 — Data models (Mongoose-like)

### ClassAssignment (server/src/models/ClassAssignment.ts)
```ts
// Fields:
/*
  semester: String,            // e.g., "2025-Fall"
  branch: String,              // e.g., "CSE"
  section: String,             // e.g., "A"
  mentors: [ObjectId],         // array of User._id (mentors for this class/section)
  hods: [ObjectId],            // array of User._id (HOD(s) covering this branch)
  active: Boolean,             // only one semester mapping set active per semester deployment
  effectiveFrom: Date?,        // optional
  effectiveTo: Date?,          // optional
  createdAt: Date
*/
Indexes:

Compound unique index: { semester, branch, section }

Query index on { active: 1, branch: 1, section: 1 } for fast lookup

Request model adjustments (server/src/models/Request.ts)
Ensure request stores branch and section (already in your design). Add assignedMentors: [ObjectId] and assignedHods: [ObjectId] (nullable) to cache mapping at request creation time (helps auditing and offline cases).

4 — API endpoints (server/src/routes/assignments.ts)
Public / Admin (Auth: admin/dev)
GET /api/assignments?semester=2025-Fall&branch=CSE&section=A
→ returns the assignment document (mentors, hods, active, effectiveFrom/To)

POST /api/assignments — create new assignment (body: { semester, branch, section, mentors:[], hods:[], effectiveFrom?, effectiveTo? })

PUT /api/assignments/:id — update assignment (edit mentors/hods or dates)

POST /api/assignments/:id/activate — set this assignment active for its semester (deactivate conflicting ones)

DELETE /api/assignments/:id — remove assignment (careful in prod)

Helper / Public-read for clients
GET /api/assignments/active?branch=CSE&section=A — returns active assignment for current semester (used by backend at request creation to determine mentor room)

Notes:

These endpoints must be protected (only admins or dev role can create/activate), but GET /api/assignments/active can be public or require a service key depending on your security model.

5 — Request creation flow (server/src/routes/requests.ts changes)
On POST /api/requests (student creates request)
Validate incoming { branch, section, ... }.

Lookup active assignment:

ts
Copy code
const assign = await AssignmentService.findActive(branch, section);
If assign exists:

Set request.assignedMentors = assign.mentors

Set request.assignedHods = assign.hods

Save request.

Emit socket event to mentor rooms for each mentor in assign.mentors:

Prefer room design: mentor:{mentorId} or mentor:{branch}:{section} — choose one (both are supported). Emit minimal payload: { requestId, branch, section, studentName, from, to, status }.

Return created request to student UI.

Fallback: If no assignment found, save request with empty assigned arrays and optionally emit to a dev room or unassigned admin queue for manual routing.

6 — Mentor approval flow (server/src/routes/requests.ts approve endpoint)
On POST /api/requests/:id/approve:

Authorize user is one of request.assignedMentors OR has mentor role + matches branch/section (defense-in-depth).

Update approval chain (mentor approved).

If mentor-level approval completes (business rule: either single mentor or all mentors approved — choose rule; default: any assigned mentor approving moves to HOD stage), then:

Set request.status = 'mentors_approved'

Emit to HOD rooms for each id in request.assignedHods:

Rooms: hod:{hodId} or hod:{branch}

Event: request:mentors_approved with minimal payload

Return updated request.

(Include audit logging of who approved and timestamp.)

7 — HOD approval flow (final)
On HOD approve:

Validate HOD is in request.assignedHods / has HOD privileges for the branch.

Set status = 'approved' and trigger QR generation (existing QR service).

Emit request:approved to scanner room(s) and to dev room with { requestId, qrToken }.

8 — Socket room design (simple, robust)
Use per-user rooms for precise delivery:

Mentor: mentor:{mentorId}

HOD: hod:{hodId}

Dev: dev:{userId} or dev (single global)

Optionally keep branch/section rooms for broadcast:

mentor:branch:{branch}:section:{section} and hod:branch:{branch}

On client connect, client should:

Join mentor:{userId} if user is mentor

Join hod:{userId} if HOD

Join dev:{userId} if dev

(Clients can also join branch-level rooms to reduce server-side lookup)

Emits:

request:new → to each mentor:{mentorId}

request:mentors_approved → to each hod:{hodId}

request:approved → to scanner & dev rooms

9 — Semester update mechanism
Data model supports semester in ClassAssignment. Two ways to manage semester changes:
A. Activate new semester mapping (recommended)

Admin posts new assignments for new semester (semester string 2025-Fall).

Admin calls POST /api/assignments/:id/activate — server sets active = false for other assignments of same branch/section & sets this active = true.

Optionally set effectiveFrom and effectiveTo and a scheduled job can automatically flip active based on dates.

B. Versioned assignments

Keep all assignment documents immutable; active flags determine current mapping. Historical mappings remain for auditing.

CLI script for semester rollover (server/scripts/updateSemesterAssignments.ts)

Input: new semester string and a CSV/JSON file mapping branch,section,mentorEmails/hodEmails or userIDs.

Script:

Create new ClassAssignment docs for the semester (or update existing).

Deactivate older assignments for these branch/sections.

Optionally notify dev/admin room via socket that new semester mapping activated.

Admin UI note: You can later add an admin UI for assignments; for now provide REST endpoints and scripts.

10 — Minimal admin endpoints to update mapping every semester
Bulk create/update: POST /api/assignments/bulk — accepts array of { semester, branch, section, mentors:[], hods:[], effectiveFrom?, effectiveTo? }

Activate by semester: POST /api/assignments/activateSemester — body { semester } → activates all assignments for that semester and deactivates older ones (optional)

Upload CSV endpoint: POST /api/assignments/upload — accept CSV file (admin-only) to create assignments in bulk (use multer for file upload)

11 — Backwards compatibility & UI preservation (must)
Do not change any UI component files.

If any UI imports a sample-data module (e.g., mobile/src/data/sampleRequests), replace it with mobile/src/api/requests.ts that exports the same function names and shapes (e.g., getRequests(), createRequest()), but internally call the new server endpoints.

Ensure the returned DTO keys match existing UI keys (map _id → id, student.name → studentName, etc.).

12 — Tests to add
Unit tests for AssignmentService.findActive(branch, section)

Integration tests:

Student creates request → verify assignedMentors and socket emit to mentors

Mentor approves → verify request status moves to mentors_approved and HOD receives socket emit

Admin activates new semester assignments → verify new assignments are active and old ones inactive

Add a simple test for scripts/updateSemesterAssignments.ts using a temporary DB.

13 — DB migration & indexes
Add unique index on { semester, branch, section } in ClassAssignment.

Add index on active for assignment quick lookup.

Ensure Request.assignedMentors and Request.assignedHods are arrays of ObjectIds for easy filtering.

Provide server/scripts/ensureIndexes.ts to be run at deploy.

14 — Example minimal code snippets
Assignment model (sketch)
ts
Copy code
// server/src/models/ClassAssignment.ts
import { Schema, model } from 'mongoose';
const ClassAssignmentSchema = new Schema({
  semester: { type: String, required: true },
  branch: { type: String, required: true },
  section: { type: String, required: true },
  mentors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  hods: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  active: { type: Boolean, default: false },
  effectiveFrom: Date,
  effectiveTo: Date,
  createdAt: { type: Date, default: Date.now }
});
ClassAssignmentSchema.index({ semester: 1, branch: 1, section: 1 }, { unique: true });
ClassAssignmentSchema.index({ active: 1, branch: 1, section: 1 });
export default model('ClassAssignment', ClassAssignmentSchema);
Find active helper
ts
Copy code
// server/src/services/assignment.service.ts
export async function findActive(branch, section) {
  return ClassAssignment.findOne({ branch, section, active: true }).lean();
}
Use in request create
ts
Copy code
const assign = await findActive(req.body.branch, req.body.section);
if (assign) {
  newReq.assignedMentors = assign.mentors;
  newReq.assignedHods = assign.hods;
}
await newReq.save();
assign.mentors.forEach(mid => io.to(`mentor:${mid}`).emit('request:new', payload));
15 — CLI / operator steps to run after Opencode applies code
Run DB migrations / ensure indexes:

bash
Copy code
node server/scripts/ensureIndexes.js
Seed initial assignments (optional):

bash
Copy code
node server/scripts/seed-default-assignments.js
To activate new semester mappings (manual):

bash
Copy code
node server/scripts/updateSemesterAssignments.js --semester=2025-Fall --file=assignments-2025-fall.csv
Or use POST /api/assignments/bulk from your admin tools to upload mappings.

16 — Notes & decisions left for later (placeholders)
Business rule: mentor approval policy — choose either:

Any assigned mentor approving moves to HOD stage; OR

Require all assigned mentors to approve before HOD sees it.

Implementation includes a config flag MENTOR_APPROVAL_MODE: 'any'|'all'

Mapping input format for bulk CSV (decide later): use mentor emails or mentor userIds? CLI script accepts both; prefer emails (easier to author), script resolves to user IDs.

Auto-activation schedule: optionally run a cron job to flip active assignments based on effectiveFrom.

17 — Expected outcome (after Opencode run)
New ClassAssignment model and CRUD API exist.

Student requests are routed to the correct mentors immediately on creation (via socket emits to mentor:{mentorId}).

After mentor approval, requests appear in HOD apps (socket emits to hod:{hodId}).

Admins can update semester mappings via API or CLI script; new assignments can be activated with one call and can be versioned.

UI files remain unchanged; API wrappers preserve function signatures.

End of prompt.

makefile
Copy code
::contentReference[oaicite:0]{index=0}