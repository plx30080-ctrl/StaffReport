import { useState, useEffect } from 'react';
import { subscribeToConfig, DEFAULT_CONFIG } from '../firebase/config-service';

export const useConfig = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToConfig((newConfig) => {
      setConfig(newConfig);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { config, loading };
};
