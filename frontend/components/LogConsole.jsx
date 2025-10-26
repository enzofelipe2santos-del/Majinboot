import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useSocket from '../hooks/useSocket';

export default function LogConsole({ sessionId }) {
  const socket = useSocket();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleLog = (payload) => {
      if (payload.id !== sessionId) return;
      setLogs((prev) => [...prev.slice(-40), payload]);
    };

    socket.on('session:log', handleLog);
    socket.on('session:error', handleLog);

    return () => {
      socket.off('session:log', handleLog);
      socket.off('session:error', handleLog);
    };
  }, [socket, sessionId]);

  return (
    <motion.div className="glass-card p-4 space-y-3" layout>
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Logs en tiempo real</h3>
        <p className="text-xs text-slate-500 dark:text-slate-300">Seguimiento detallado de eventos por sesión.</p>
      </div>
      <div className="glass-card p-4 h-48 overflow-y-auto scrollbar-thin text-xs font-mono space-y-2">
        {logs.map((log, index) => (
          <div key={`${log.message}-${index}`} className={`flex items-center gap-2 ${log.level === 'info' ? 'text-emerald-400' : 'text-red-400'}`}>
            <span>{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</span>
            <span className="uppercase">{log.level}</span>
            <span>{log.message}</span>
          </div>
        ))}
        {!logs.length && <p className="text-slate-500">Sin registros recientes.</p>}
      </div>
    </motion.div>
  );
}
