import { useState, useEffect, useRef, useCallback } from 'react';

export const useAutoSave = (data, saveFunction, interval = 60000) => {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const lastDataRef = useRef(data);

  const save = useCallback(async () => {
    if (!data || JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
      return; // No changes to save
    }

    setSaving(true);
    setError(null);

    try {
      await saveFunction(data);
      setLastSaved(new Date());
      lastDataRef.current = data;
    } catch (err) {
      setError(err.message);
      console.error('Auto-save error:', err);
    } finally {
      setSaving(false);
    }
  }, [data, saveFunction]);

  // Auto-save on interval
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save();
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, interval, save]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await save();
  }, [save]);

  return {
    saving,
    lastSaved,
    error,
    saveNow
  };
};
