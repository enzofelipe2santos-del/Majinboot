import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';

const API_URL = 'http://localhost:4010/api';

export default function ReminderTimeline({ sessionId }) {
  const [reminders, setReminders] = useState([]);

  const loadReminders = async () => {
    if (!sessionId) return;
    const { data } = await axios.get(`${API_URL}/reminders/${sessionId}`);
    setReminders(data);
  };

  useEffect(() => {
    loadReminders();
  }, [sessionId]);

  return (
    <motion.div className="glass-card p-6 space-y-4 bg-gradient-to-br from-white/90 via-pearl/70 to-mint/40" layout>
      <header className="flex items-center gap-3">
        <FiClock className="text-xl text-lilac-500" />
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">Recordatorios</h3>
          <p className="text-xs text-slate-500 dark:text-slate-300">Avisos automáticos cuando un cliente no responde.</p>
        </div>
      </header>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="glass-card p-4 bg-gradient-to-r from-white/85 via-pearl/70 to-lavender/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-white">Trigger #{reminder.triggerId}</p>
              <span className="text-xs text-slate-500">{reminder.delayMinutes} minutos</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {reminder.responses.map((response, index) => (
                <li key={`${reminder.id}-${index}`}>{response.type === 'text' ? response.content : `${response.type.toUpperCase()} → ${response.path}`}</li>
              ))}
            </ul>
          </div>
        ))}
        {!reminders.length && (
          <p className="text-xs text-slate-500 dark:text-slate-300">No hay recordatorios configurados.</p>
        )}
      </div>
    </motion.div>
  );
}
