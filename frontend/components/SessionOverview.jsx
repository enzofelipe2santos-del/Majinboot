import { motion } from 'framer-motion';
import { FiPause, FiPlay, FiPower } from 'react-icons/fi';
import axios from 'axios';

const API_URL = 'http://localhost:4010/api';

export default function SessionOverview({ session, onRefresh }) {
  const handleAction = async (action) => {
    await axios.post(`${API_URL}/sessions/${session.id}/${action}`);
    onRefresh();
    window.majinboot?.notify({ title: 'Majinboot', body: `Sesión ${session.name} ${action === 'pause' ? 'pausada' : 'actualizada'}` });
  };

  const handleDelete = async () => {
    await axios.delete(`${API_URL}/sessions/${session.id}`);
    onRefresh();
  };

  return (
    <motion.section
      layout
      className="glass-card p-6 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Resumen</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{session.name}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAction('pause')}
            className="px-3 py-2 glass-card flex items-center gap-2 text-sm disabled:opacity-40"
            disabled={session.paused}
          >
            <FiPause /> Pausar
          </button>
          <button
            onClick={() => handleAction('resume')}
            className="px-3 py-2 glass-card flex items-center gap-2 text-sm disabled:opacity-40"
            disabled={!session.paused}
          >
            <FiPlay /> Reanudar
          </button>
          <button onClick={handleDelete} className="px-3 py-2 glass-card flex items-center gap-2 text-sm text-red-500">
            <FiPower /> Cerrar
          </button>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 dark:text-slate-300">Estado</p>
          <p className="text-lg font-medium text-slate-900 dark:text-white capitalize">{session.status || 'desconectado'}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 dark:text-slate-300">Modo</p>
          <p className="text-lg font-medium text-slate-900 dark:text-white">{session.paused ? 'Pausado' : 'Activo'}</p>
        </div>
      </div>
    </motion.section>
  );
}
