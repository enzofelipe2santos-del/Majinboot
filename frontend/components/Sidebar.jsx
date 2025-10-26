import { motion } from 'framer-motion';
import { FiMessageCircle, FiPlus } from 'react-icons/fi';

export default function Sidebar({ sessions, selectedId, onSelect, onCreate }) {
  return (
    <motion.aside
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-card p-6 w-72 flex flex-col gap-5 bg-gradient-to-br from-pearl/80 via-white/80 to-lavender/60"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Control</p>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-white">Sesiones</h2>
        </div>
        <button
          onClick={onCreate}
          className="p-2 rounded-full bg-gradient-to-br from-mint/70 to-sky/60 text-slate-700 hover:shadow-glass transition-transform hover:-translate-y-0.5"
        >
          <FiPlus />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all bg-gradient-to-r from-white/80 via-pearl/70 to-lilac/50 shadow-[0_16px_40px_-30px_rgba(134,154,255,0.6)] ${selectedId === session.id ? 'ring-2 ring-lilac/60 scale-[1.02]' : 'opacity-85 hover:opacity-100 hover:scale-[1.01]'}`}
          >
            <div className="p-2 rounded-full bg-white/70">
              <FiMessageCircle className="text-lilac-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-700 dark:text-white">{session.name}</p>
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
