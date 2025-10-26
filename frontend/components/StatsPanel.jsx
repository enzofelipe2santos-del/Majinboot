import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const API_URL = 'http://localhost:4010/api';

export default function StatsPanel({ sessionId }) {
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    if (!sessionId) return;
    const { data } = await axios.get(`${API_URL}/stats/${sessionId}`);
    setStats(data);
  };

  useEffect(() => {
    loadStats();
  }, [sessionId]);

  const chartData = stats
    ? Object.entries(stats.triggersUsed || {}).map(([triggerId, count]) => ({ triggerId, count }))
    : [];

  return (
    <motion.div className="glass-card p-6 bg-gradient-to-br from-white/90 via-pearl/70 to-mint/40" layout>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">Estadísticas</h3>
      {stats ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 bg-gradient-to-r from-white/85 via-pearl/70 to-lavender/50">
            <p className="text-xs text-slate-500">Mensajes recibidos</p>
            <p className="text-2xl font-semibold text-slate-700 dark:text-white">{stats.messagesReceived}</p>
          </div>
          <div className="glass-card p-4 bg-gradient-to-r from-white/85 via-mint/60 to-sky/40">
            <p className="text-xs text-slate-500">Mensajes enviados</p>
            <p className="text-2xl font-semibold text-slate-700 dark:text-white">{stats.messagesSent}</p>
          </div>
          <div className="glass-card p-4 bg-gradient-to-r from-white/85 via-lilac/60 to-pearl/50">
            <p className="text-xs text-slate-500">Triggers activos</p>
            <p className="text-2xl font-semibold text-slate-700 dark:text-white">{chartData.length}</p>
          </div>
          <div className="col-span-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="triggerId" stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', boxShadow: '0 20px 45px -30px rgba(134,154,255,0.45)' }} />
                <Bar dataKey="count" fill="#a5d8ff" radius={[12, 12, 12, 12]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Selecciona una sesión para ver estadísticas.</p>
      )}
    </motion.div>
  );
}
