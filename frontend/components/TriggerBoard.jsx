import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import axios from 'axios';
import FileDropZone from './FileDropZone';

const API_URL = 'http://localhost:4010/api';

export default function TriggerBoard({ sessionId }) {
  const [triggers, setTriggers] = useState([]);
  const [selectedTrigger, setSelectedTrigger] = useState(null);

  const loadTriggers = async (currentId) => {
    if (!sessionId) return;
    const { data } = await axios.get(`${API_URL}/triggers/${sessionId}`);
    setTriggers(data);
    if (currentId || selectedTrigger) {
      const searchId = currentId || selectedTrigger?.id;
      const current = data.find((item) => item.id === searchId);
      setSelectedTrigger(current || data[0] || null);
    } else {
      setSelectedTrigger(data[0] || null);
    }
  };

  useEffect(() => {
    loadTriggers();
  }, [sessionId]);

  const handleReorder = async (responses) => {
    if (!selectedTrigger) return;
    const updated = { ...selectedTrigger, responses };
    setSelectedTrigger(updated);
    await axios.put(`${API_URL}/triggers/${sessionId}/${selectedTrigger.id}`, updated);
    loadTriggers(updated.id);
  };

  return (
    <motion.div className="glass-card p-6 flex flex-col gap-6 bg-gradient-to-br from-white/90 via-pearl/70 to-lavender/50" layout>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-white">Triggers</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Gestiona palabras clave y respuestas multimedia.</p>
        </div>
      </header>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-3 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin">
          <AnimatePresence>
            {triggers.map((trigger) => (
              <motion.button
                key={trigger.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => setSelectedTrigger(trigger)}
                className={`w-full text-left p-4 rounded-2xl bg-gradient-to-r from-white/85 via-pearl/70 to-lilac/50 transition shadow-[0_18px_40px_-32px_rgba(164,178,255,0.65)] ${selectedTrigger?.id === trigger.id ? 'ring-2 ring-lilac/60 scale-[1.01]' : 'hover:scale-[1.01]'}`}
              >
                <p className="text-sm font-semibold text-slate-700 dark:text-white">{trigger.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-2">{trigger.match}</p>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        <div className="col-span-8">
          {selectedTrigger ? (
            <div className="glass-card p-6 space-y-4 bg-gradient-to-br from-white/90 via-lavender/40 to-pearl/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Coincidencia</p>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-white">{selectedTrigger.match}</h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-300">Similitud: {(selectedTrigger.similarity * 100).toFixed(0)}%</span>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400 mb-2 tracking-[0.3em]">Respuestas</p>
                <Reorder.Group axis="y" values={selectedTrigger.responses || []} onReorder={handleReorder} className="space-y-3">
                  {(selectedTrigger.responses || []).map((response) => (
                    <Reorder.Item
                      key={response.id || response.path || response.content}
                      value={response}
                      className="glass-card p-4 flex items-center justify-between bg-gradient-to-r from-white/90 via-pearl/70 to-mint/50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-white capitalize">{response.type}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300 truncate">
                          {response.type === 'text' ? response.content : response.path}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">Arrastra</span>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
              <FileDropZone sessionId={sessionId} triggerId={selectedTrigger.id} onUploaded={loadTriggers} />
            </div>
          ) : (
            <div className="glass-card p-6 text-slate-500 dark:text-slate-300 bg-gradient-to-br from-white/85 via-pearl/70 to-lilac/40">
              Selecciona un trigger para editarlo.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
