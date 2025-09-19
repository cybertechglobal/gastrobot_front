// lib/socket.ts (updated to track socket instance)
import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(userId: string, restaurantId: string) {
  if (typeof window === 'undefined') return null;
  
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_EXTERNAL_BACKEND_URL!, {
      autoConnect: false,
      transports: ['websocket'],
      withCredentials: true,
      query: {
        userId,
        restaurantId
      }
    });
    
    // Store reference globally for cleanup
    (window as any).__socket_instance__ = socket;
    
    socket.on('connect', () => {
      console.log('WS connected', socket?.id);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('WS disconnected', reason);
      // Clear reference if disconnected
      if (reason === 'io client disconnect') {
        socket = null;
        delete (window as any).__socket_instance__;
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WS connection error:', error);
    });
  }
  
  return socket;
}
