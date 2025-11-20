import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketClient {
  private socket: Socket | null = null;
  private baseURL: string;

  constructor(baseURL: string = 'http://192.168.0.101:8081') {
    this.baseURL = baseURL;
  }

  async connect(token: string, role: string, branch?: string, section?: string): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.baseURL, {
      auth: { token },
    });

    return new Promise((resolve, reject) => {
      this.socket!.on('connect', () => {
        console.log('Socket connected');
        // Join room
        this.socket!.emit('join', { token, role, branch, section });
        resolve(this.socket!);
      });

      this.socket!.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketClient();