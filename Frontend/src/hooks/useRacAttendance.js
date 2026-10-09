import { useCallback, useEffect, useRef, useState } from 'react';
import API from '../api';
import { applyRacAttendance, getRacAttendanceChanges, mergeRacSnapshot } from '../utils/racAttendance';

const EMPTY_ROSTER = { teams: [], competitions: [] };

export default function useRacAttendance() {
  const [roster, setRoster] = useState(EMPTY_ROSTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connection, setConnection] = useState('connecting');
  const [pending, setPending] = useState({});
  const [notifications, setNotifications] = useState([]);
  const rosterRef = useRef(EMPTY_ROSTER);
  const initialized = useRef(false);
  const locks = useRef(new Set());
  const sourceId = useRef('');
  const mounted = useRef(false);

  const notify = useCallback((message, kind = 'success') => {
    if (!mounted.current) return;
    setNotifications((current) => [...current.slice(-2), { id: crypto.randomUUID(), message, kind }]);
  }, []);
  const dismiss = useCallback((id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  useEffect(() => {
    if (!notifications.length) return;
    const timer = setTimeout(() => dismiss(notifications[0].id), 6000);
    return () => clearTimeout(timer);
  }, [notifications, dismiss]);

  const acceptSnapshot = useCallback((incoming) => {
    const next = mergeRacSnapshot(rosterRef.current, incoming);
    if (initialized.current) {
      const changes = getRacAttendanceChanges(rosterRef.current, next, sourceId.current);
      if (changes.length) notify(changes.length === 1 ? changes[0] : `${changes.length} RAC attendance records were updated by other admins.`);
    }
    initialized.current = true;
    rosterRef.current = next;
    setRoster(next);
    setLoading(false);
    setError('');
  }, [notify]);

  const refresh = useCallback(async (signal) => {
    try {
      const response = await API.get('/admin/rac-attendance', { signal });
      if (mounted.current && !signal?.aborted) acceptSnapshot(response.data);
      return true;
    } catch (err) {
      if (!mounted.current || signal?.aborted) return false;
      setLoading(false);
      setError(err.userMessage || 'Unable to load RAC attendance. Please try again.');
      return ![401, 403].includes(err.response?.status);
    }
  }, [acceptSnapshot]);

  useEffect(() => {
    mounted.current = true;
    sourceId.current ||= crypto.randomUUID();
    const controller = new AbortController();
    const url = `${API.defaults.baseURL.replace(/\/$/, '')}/admin/rac-attendance/stream`;
    const stream = new EventSource(url, { withCredentials: true });
    let lastAuthCheck = Date.now();
    let lastSync = Date.now();
    let checking = false;
    stream.addEventListener('snapshot', (event) => {
      if (!mounted.current) return;
      try {
        acceptSnapshot(JSON.parse(event.data));
      } catch {
        setConnection('reconnecting');
      }
    });
    stream.addEventListener('synced', () => {
      lastSync = Date.now();
      setConnection('live');
      setError('');
    });
    stream.addEventListener('unavailable', () => setConnection('reconnecting'));
    stream.onerror = async () => {
      if (!mounted.current) return;
      setConnection('reconnecting');
      // Native EventSource hides HTTP status; an occasional API request checks auth.
      if (!checking && Date.now() - lastAuthCheck >= 60000) {
        checking = true;
        lastAuthCheck = Date.now();
        const authorized = await refresh(controller.signal);
        checking = false;
        if (!authorized) stream.close();
      }
    };
    void refresh(controller.signal).then((authorized) => {
      if (!authorized) stream.close();
    });
    const watchdog = setInterval(() => {
      if (Date.now() - lastSync > 10000) setConnection('reconnecting');
    }, 5000);
    return () => {
      mounted.current = false;
      controller.abort();
      stream.close();
      clearInterval(watchdog);
    };
  }, [acceptSnapshot, refresh]);

  const takeAttendance = useCallback(async (teamId, member) => {
    const key = `${teamId}:${member._id}`;
    if (locks.current.has(key)) return;
    locks.current.add(key);
    setPending((current) => ({ ...current, [key]: true }));
    const acceptUpdate = (update) => {
      if (!mounted.current || !update.attendance) return;
      rosterRef.current = applyRacAttendance(rosterRef.current, update);
      setRoster(rosterRef.current);
    };
    try {
      const response = await API.patch(`/admin/rac-attendance/${teamId}/members/${member._id}`, {
        present: !member.attendance.present,
        version: member.attendance.version,
        sourceId: sourceId.current,
      });
      acceptUpdate(response.data);
      notify(`${member.name} ${response.data.attendance.present ? 'checked in' : 'marked not checked in'}.`);
    } catch (err) {
      if (err.response?.status === 409) acceptUpdate(err.response.data);
      notify(err.response?.status === 409 ? err.response.data.message :
        err.userMessage || 'Unable to save attendance. Please try again.', 'error');
    } finally {
      locks.current.delete(key);
      if (mounted.current) setPending((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }, [notify]);

  return { roster, loading, error, connection, pending, notifications, dismiss, takeAttendance, refresh };
}
