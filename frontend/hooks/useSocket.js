import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4010';
let sharedSocket;

export default function useSocket() {
  const [socket, setSocket] = useState(sharedSocket);

  useEffect(() => {
    if (!sharedSocket) {
      sharedSocket = io(SOCKET_URL, {
        transports: ['websocket'],
      });
    }
    setSocket(sharedSocket);

    return () => {
      // No desconectamos para conservar la conexión global en toda la app.
    };
  }, []);

  return socket;
}
