# Opencode CLI Task Prompt — Auto-delete requests 1s after approval/rejection with slide animation

**Goal:** Implement coordinated backend + client behavior so that when a request is approved or disapproved:
1. It is finalized (status updated) and a real-time event is emitted immediately.  
2. Clients (mentor/HOD lists, dev app, student list if applicable) play a slide-out animation:  
   - **Approved:** slide **right**.  
   - **Disapproved:** slide **left**.  
3. After **1 second**, the server deletes the request from the DB and emits a deletion event; clients remove the item from UI (or remove after animation finishes).  
4. Preserve UX safety: animation always runs before the item visually disappears. Provide fallbacks so the UI stays correct if network events arrive in different order.

**IMPORTANT:** This task requires small UI changes (adding animation classes / animation handling) and backend changes (emit events + delayed delete). The visual layout and styles should otherwise remain unchanged.

---

## High-level design (sequence)
1. Approver clicks Approve/Reject → Backend updates `request.status` to `'approved'` or `'rejected'` and emits `request:finalized` with `{ id, status }`.  
2. Backend schedules deletion: `setTimeout(1000, deleteRequestAndEmit)` which deletes the DB row and emits `request:deleted` with `{ id }`.  
3. All clients subscribed to request lists:
   - On `request:finalized` → add `slide-out-right` class (approved) or `slide-out-left` class (rejected) to the item so animation starts immediately.  
   - Listen for CSS `transitionend` / `animationend` and then remove the item from local state.  
   - On `request:deleted` → if the item still exists, remove it (if animation already finished remove immediately; if animation not started, trigger the appropriate animation then remove).  
4. Clients that perform the approve action locally should also trigger the same animation path (so UI doesn't jump).

---

## Files / modules to create or modify

### Backend (`/server`)
- Modify: `server/src/routes/requests.ts` (approve/reject handler)
- Modify/create: `server/src/services/request.service.ts` (helper: finalize + delayed delete)
- Ensure Socket.IO service exists: `server/src/services/socket.service.ts` (emit helpers)
- Add tests: `server/src/tests/request-finalize.test.ts`

### Web client (`/web`)
- Modify: `web/src/api/requests.ts` (if needed) — ensure it still exports the same functions used by UI.
- Modify: request list item component (example names: `RequestCard.tsx` / `RequestListItem.tsx`) — add animation class toggling and `animationend` handler.
- Add CSS / style: `web/src/styles/animations.css` or tailwind utility classes if project uses Tailwind.
- Modify Socket.IO initialization (if not present) to listen to `request:finalized` and `request:deleted`.

### Mobile client (`/mobile`, Expo React Native)
- Modify: request list item component (example `RequestItem.tsx`) to use `Animated` API for slide out.
- Modify Socket event handling to trigger animation on `request:finalized` and finalize removal on `request:deleted`.

---

## Backend code sketch (Node + Express + Mongoose)

**requests route — finalize & delayed delete**
```ts
// server/src/routes/requests.ts (inside approve/reject handlers)
import { finalizeAndScheduleDelete } from '../services/request.service';
import socketService from '../services/socket.service';

// Example inside approve handler:
const reqDoc = await Request.findById(id);
reqDoc.approvalChain.push({ ... });
reqDoc.status = 'approved'; // or 'rejected'
await reqDoc.save();

// Emit immediate finalized event
socketService.emitToRelatedUsers('request:finalized', {
  id: reqDoc._id.toString(),
  status: reqDoc.status
});

// Schedule deletion (service will perform setTimeout and emit deleted)
await finalizeAndScheduleDelete(reqDoc._id);
res.json({ ok: true, request: reqDoc });
request.service.ts

ts
Copy code
// server/src/services/request.service.ts
import Request from '../models/Request';
import socketService from './socket.service';

export async function finalizeAndScheduleDelete(requestId: string) {
  // Schedule 1s deletion. Keep handle if you later want to cancel.
  setTimeout(async () => {
    try {
      // delete the document atomically
      await Request.findByIdAndDelete(requestId);
      // emit deletion to clients
      socketService.io.emit('request:deleted', { id: requestId });
    } catch (err) {
      console.error('Failed deleting request after finalize:', err);
    }
  }, 1000);
}
socket.service.ts (ensure io attached and helper emits)

ts
Copy code
// server/src/services/socket.service.ts
let io = null;
export function initSocket(serverInstance) { io = require('socket.io')(serverInstance, { /* options */ }); return io; }
export default {
  get io() { return io; },
  emitToRelatedUsers: (event, payload) => {
    // example: payload should include id, status, maybe branch/section
    // emit globally or compute targets (mentor/hod/dev rooms)
    if (!io) return;
    // emit globally (simple) or to rooms if available:
    io.emit(event, payload);
  }
}
Notes:

Prefer deleting via findByIdAndDelete (single document) for this use-case.

If you need stronger safety (audit trail), consider moving the document into an archive collection instead of deleting. This prompt implements deletion per user request.

Web client code sketch (React)
CSS animations (web/src/styles/animations.css)

css
Copy code
.request-item {
  transition: transform 360ms ease, opacity 360ms ease;
}

/* slide out right (approved) */
.slide-out-right {
  transform: translateX(120%); /* moves right off-screen */
  opacity: 0;
}

/* slide out left (rejected) */
.slide-out-left {
  transform: translateX(-120%); /* moves left off-screen */
  opacity: 0;
}
RequestListItem.tsx (concept)

tsx
Copy code
function RequestListItem({ request, onRemoved }) {
  const [removing, setRemoving] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    // socket is global, listen for finalize & deleted
    function handleFinalized(payload) {
      if (payload.id !== request.id) return;
      // add class based on status
      const cls = payload.status === 'approved' ? 'slide-out-right' : 'slide-out-left';
      setRemoving(cls);
      // remove from state after animation duration (match CSS 360ms)
      setTimeout(() => { onRemoved(request.id); }, 420); // small buffer
    }
    function handleDeleted(payload) {
      if (payload.id !== request.id) return;
      // if not yet removed, remove now
      onRemoved(request.id);
    }
    socket.on('request:finalized', handleFinalized);
    socket.on('request:deleted', handleDeleted);
    return () => {
      socket.off('request:finalized', handleFinalized);
      socket.off('request:deleted', handleDeleted);
    }
  }, [request.id, onRemoved]);

  return (
    <div
      ref={itemRef}
      className={`request-item ${typeof removing === 'string' ? removing : ''}`}
      role="listitem"
    >
      {/* existing UI content unchanged */}
    </div>
  );
}
Notes:

onRemoved should update parent list state to filter out the item.

Ensure existing props and DOM structure remain unchanged — only add className handling and socket listeners.

Mobile client sketch (React Native / Expo)
Use Animated API

tsx
Copy code
const slideAnim = useRef(new Animated.Value(0)).current; // 0 = visible
// On finalized:
function animateOut(direction) {
  const toValue = direction === 'right' ? 1 : -1;
  Animated.timing(slideAnim, {
    toValue,
    duration: 360,
    useNativeDriver: true,
  }).start(() => {
    // call onRemoved after animation complete
    onRemoved(request.id);
  });
}
// transform: translateX: slideAnim.interpolate...
Socket handling

On request:finalized for this id → call animateOut('right'|'left').

On request:deleted → if item still present, call onRemoved() immediately.

Edge cases & fallbacks
If request:deleted arrives before request:finalized: client should remove item immediately. Implement guard: on request:deleted, if the item exists and is not animating, remove it.

If a user approves locally and UI already removed the item: still rely on server deletes; no error if delete is called for missing doc.

Network disconnects: on reconnect, re-sync list from server so no stale items remain.

Accessibility: when item is removed, announce via aria-live region (web) if required.

Tests to add
Backend test: after approve/reject, request:finalized emitted immediately and DB row removed ~1s later; socket request:deleted emitted.

Frontend test (unit/integ): on request:finalized item adds slide class and onRemoved called after animation duration.

Mobile test: animation triggered and item removed.

Deployment & timing
Animation timing: 360ms animation + small buffer → 420ms. Server deletion delay: 1000ms (1 second) as requested. Clients remove after animation (≈420ms) so the item visually disappears before server deletion occurs. Server deletion stays as single source-of-truth cleanup.

Keep both server-side delayed delete and client-side animation timers; they are independent but coordinated by events.

Commit message & PR checklist
Commit message: feat: finalize requests with slide-out animation and auto-delete 1s after approval/rejection

PR checklist:

 Backend emits request:finalized and schedules deletion + emits request:deleted.

 Web client plays slide-out animations for finalized requests and removes items.

 Mobile client plays slide-out animations and removes items.

 Tests added and passing.

 No UI layout files (structure/content) changed other than adding animation classes/handlers.

Summary for Opencode CLI
Add server-side finalize + delayed delete flow (emit request:finalized, then after 1s delete and emit request:deleted).

Update Web UI list item components to listen to these socket events and run CSS slide-out animations:

approved → .slide-out-right

rejected → .slide-out-left

Update Mobile UI list items to use Animated API for slide out.

Ensure safe fallbacks and tests.

End of prompt.

makefile
Copy code
::contentReference[oaicite:0]{index=0}