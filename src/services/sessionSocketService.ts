import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

const getSocketBaseUrl = (): string => {
  const apiBase = API_CONFIG.BASE_URL || 'http://localhost:5000/api';
  return apiBase.replace(/\/api\/?$/, '');
};

type RevokedHandler = (payload: { sessionId: string; message?: string }) => void;

class SessionSocketService {
  private socket: Socket | null = null;
  private currentSessionId: string | null = null;
  private onRevokedHandler: RevokedHandler | null = null;

  connect(sessionId: string, onRevoked: RevokedHandler): void {
    if (!sessionId) return;

    if (this.socket && this.currentSessionId === sessionId) {
      this.onRevokedHandler = onRevoked;
      return;
    }

    this.disconnect();

    this.currentSessionId = sessionId;
    this.onRevokedHandler = onRevoked;

    const baseUrl = getSocketBaseUrl();
    if (!baseUrl) return;

    this.socket = io(baseUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.socket?.emit('session:register', { sessionId });
    });

    this.socket.on('session:revoked', (payload: { sessionId?: string; message?: string }) => {
      if (payload?.sessionId && payload.sessionId !== sessionId) return;
      this.onRevokedHandler?.({
        sessionId,
        message: payload?.message,
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentSessionId = null;
    this.onRevokedHandler = null;
  }
}

export const sessionSocketService = new SessionSocketService();
