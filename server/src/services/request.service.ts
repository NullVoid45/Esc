import Request from '../models/Request';
import { SocketService } from './socket.service';

export async function finalizeAndScheduleDelete(requestId: string, socketService: SocketService) {
  // Schedule 1s deletion. Keep handle if you later want to cancel.
  setTimeout(async () => {
    try {
      // delete the document atomically
      await Request.findByIdAndDelete(requestId);
      // emit deletion to clients
      socketService.broadcast('request:deleted', { id: requestId });
    } catch (err) {
      console.error('Failed deleting request after finalize:', err);
    }
  }, 1000);
}