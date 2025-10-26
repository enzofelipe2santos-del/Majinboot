import { AnimatePresence, motion } from 'framer-motion';
import { FiPause, FiPlay, FiPower } from 'react-icons/fi';
import QRCode from 'react-qr-code';
import axios from 'axios';

const API_URL = 'http://localhost:4010/api';

export default function SessionOverview({ session, onRefresh, qrCode }) {
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
      className="glass-card p-6 flex flex-col gap-6 bg-gradient-to-br from-pearl/80 via-white/80 to-lavender/60"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Panel principal</p>
          <h1 className="text-3xl font-semibold text-slate-700 dark:text-white">{session.name}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Gestiona la conexión y el estado del bot en tiempo real.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleAction('pause')}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-lilac/80 to-lavender/60 text-slate-700 dark:text-white flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-glass"
            disabled={session.paused}
          >
            <FiPause /> Pausar
          </button>
          <button
            onClick={() => handleAction('resume')}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-mint/80 to-sky/70 text-slate-700 dark:text-white flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-glass"
            disabled={!session.paused}
          >
            <FiPlay /> Reanudar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-blush/80 to-pearl/70 text-rose-500 flex items-center gap-2 text-sm hover:from-blush/90 hover:to-pearl/80"
          >
            <FiPower /> Cerrar
          </button>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass-card p-5 bg-gradient-to-br from-white/90 via-pearl/70 to-mint/40">
          <p className="text-xs tracking-widest text-slate-400">Estado</p>
          <p className="mt-2 text-xl font-semibold text-slate-700 dark:text-white capitalize">{session.status || 'desconectado'}</p>
        </div>
        <div className="glass-card p-5 bg-gradient-to-br from-white/90 via-lavender/40 to-pearl/60">
          <p className="text-xs tracking-widest text-slate-400">Modo</p>
          <p className="mt-2 text-xl font-semibold text-slate-700 dark:text-white">{session.paused ? 'Pausado' : 'Activo'}</p>
        </div>
        <div className="glass-card p-5 bg-gradient-to-br from-white/90 via-sky/40 to-mint/50">
          <p className="text-xs tracking-widest text-slate-400">Recordatorios activos</p>
          <p className="mt-2 text-xl font-semibold text-slate-700 dark:text-white">{session.remindersCount ?? '—'}</p>
        </div>
      </div>
      <AnimatePresence>
        {(qrCode || session.status !== 'ready') && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="glass-card p-6 bg-gradient-to-br from-white/95 via-mint/50 to-sky/40 flex flex-col lg:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-2 text-center lg:text-left">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-200 uppercase tracking-[0.25em]">Escanea para conectar</p>
              <h2 className="text-2xl font-semibold text-slate-700 dark:text-white">{qrCode ? 'Abre WhatsApp y escanea el código' : 'Generando código QR...'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300 max-w-md">Usa la opción <strong>Dispositivos vinculados</strong> en tu app de WhatsApp. El código se renueva automáticamente hasta que la sesión quede lista.</p>
            </div>
            <div className="p-4 rounded-3xl bg-white/80 shadow-glass border border-white/70">
              {qrCode ? (
                <QRCode value={qrCode} size={220} className="rounded-2xl" bgColor="transparent" fgColor="#1f2937" />
              ) : (
                <div className="w-[220px] h-[220px] rounded-2xl bg-gradient-to-br from-pearl/80 to-lavender/60 flex items-center justify-center text-slate-400">
                  Esperando QR...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
