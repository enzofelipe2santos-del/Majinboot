import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import useSocket from './useSocket';

const API_URL = 'http://localhost:4010/api';

export default function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const socket = useSocket();

  const refreshSessions = useCallback(async () => {
    const { data } = await axios.get(`${API_URL}/sessions`);
    setSessions(data);
    if ((!selectedId && data.length) || (selectedId && !data.some((session) => session.id === selectedId))) {
      setSelectedId(data[0]?.id ?? null);
    }
  }, [selectedId]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    if (!socket) return;
    const events = ['session:created', 'session:ready', 'session:deleted', 'session:paused', 'session:resumed'];
    events.forEach((event) => socket.on(event, refreshSessions));
    return () => {
      events.forEach((event) => socket.off(event, refreshSessions));
    };
  }, [socket, refreshSessions]);

  const selectedSession = useMemo(() => sessions.find((session) => session.id === selectedId), [sessions, selectedId]);

  return {
    sessions,
    selectedSession,
    selectedId,
    setSelectedId,
    refreshSessions,
  };
}
