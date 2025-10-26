import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '@components/Sidebar';
import SessionOverview from '@components/SessionOverview';
import TriggerBoard from '@components/TriggerBoard';
import ReminderTimeline from '@components/ReminderTimeline';
import StatsPanel from '@components/StatsPanel';
import LogConsole from '@components/LogConsole';
import useSessions from '@hooks/useSessions';
import axios from 'axios';

const API_URL = 'http://localhost:4010/api';

export default function App() {
  const { sessions, selectedSession, selectedId, setSelectedId, refreshSessions, qrCodes } = useSessions();
  const [creating, setCreating] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionId, setSessionId] = useState('');

  const handleCreateSession = async (event) => {
    event.preventDefault();
    await axios.post(`${API_URL}/sessions`, { id: sessionId, name: sessionName });
    setCreating(false);
    setSessionName('');
    setSessionId('');
    refreshSessions();
  };

  return (
    <div className="min-h-screen flex gap-6 p-6 text-slate-700 dark:text-slate-100">
      <Sidebar
        sessions={sessions}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={() => setCreating(true)}
      />
      <main className="flex-1 space-y-6">
        <AnimatePresence>
          {creating && (
            <motion.form
              className="glass-card p-6 grid grid-cols-4 gap-4 bg-gradient-to-br from-white/80 via-pearl/70 to-mint/50 shadow-glass"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleCreateSession}
            >
              <h2 className="col-span-4 text-lg font-semibold">Nueva sesión</h2>
              <label className="col-span-2 text-sm">
                Nombre de sesión
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="mt-1 w-full glass-card p-3 bg-white/80"
                  required
                />
              </label>
              <label className="col-span-2 text-sm">
                Identificador único
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="mt-1 w-full glass-card p-3 bg-white/80"
                  required
                />
              </label>
              <div className="col-span-4 flex justify-end gap-3">
                <button type="button" className="px-4 py-2 glass-card bg-gradient-to-r from-white/80 to-pearl/60" onClick={() => setCreating(false)}>
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 glass-card bg-gradient-to-r from-mint/80 to-sky/70">
                  Crear sesión
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {selectedSession ? (
          <div className="space-y-6">
            <SessionOverview
              session={selectedSession}
              onRefresh={refreshSessions}
              qrCode={qrCodes[selectedSession.id]}
            />
            <TriggerBoard sessionId={selectedSession.id} />
            <div className="grid grid-cols-3 gap-6">
              <ReminderTimeline sessionId={selectedSession.id} />
              <StatsPanel sessionId={selectedSession.id} />
              <LogConsole sessionId={selectedSession.id} />
            </div>
          </div>
        ) : (
          <motion.div
            className="glass-card p-12 text-center text-slate-500 bg-gradient-to-br from-white/80 via-pearl/70 to-lavender/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Selecciona una sesión para comenzar.
          </motion.div>
        )}
      </main>
    </div>
  );
}
