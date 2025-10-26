import { motion } from 'framer-motion';
import { FiMessageCircle, FiPlus } from 'react-icons/fi';

export default function Sidebar({ sessions, selectedId, onSelect, onCreate }) {
  return (
    <motion.aside
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-card p-6 w-72 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sesiones</h2>
        <button
          onClick={onCreate}
          className="p-2 rounded-full bg-sky/40 text-slate-800 dark:text-sky-100 hover:bg-sky/60 transition"
        >
          <FiPlus />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition glass-card ${selectedId === session.id ? 'ring-2 ring-sky/70' : 'opacity-80 hover:opacity-100'}`}
          >
            <div className="p-2 rounded-full bg-white/40 dark:bg-slate-800/60">
              <FiMessageCircle className="text-sky-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{session.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 capitalize">{session.status || 'desconectado'}</p>
            </div>
          </button>
        ))}
        {!sessions.length && (
          <div className="text-sm text-slate-500 dark:text-slate-300">
            No hay sesiones activas todavía. ¡Crea la primera! 🪄
          </div>
        )}
      </div>
    </motion.aside>
  );
}
