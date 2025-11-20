import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export class SocketService {
  private io: SocketServer;

  constructor(io: SocketServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle room joining
      socket.on('join', (data: { token: string; role: string; branch?: string; section?: string }) => {
        try {
          // Verify JWT token
          const decoded = jwt.verify(data.token, config.JWT_SECRET) as any;

          // Join appropriate rooms based on role
          if (data.role === 'mentor' && data.branch && data.section) {
            socket.join(`mentor:${data.branch}:${data.section}`);
            console.log(`Mentor joined room: mentor:${data.branch}:${data.section}`);
          } else if (data.role === 'hod' && data.branch) {
            socket.join(`hod:${data.branch}`);
            console.log(`HOD joined room: hod:${data.branch}`);
          } else if (data.role === 'watchman') {
            socket.join('scanner');
            console.log('Watchman joined scanner room');
          } else if (data.role === 'dev') {
            socket.join('dev');
            console.log('Dev joined dev room');
          }
        } catch (error) {
          console.error('Invalid token for socket join:', error);
          socket.disconnect();
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Emit events to specific rooms
  emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  // Broadcast to all clients
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Emit to related users (for now, broadcast globally)
  emitToRelatedUsers(event: string, data: any) {
    this.broadcast(event, data);
  }
}