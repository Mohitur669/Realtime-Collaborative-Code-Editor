import { io } from 'socket.io-client';

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const initSocket = () => {
  return io(BACKEND_URL, {
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
};
