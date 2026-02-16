import { useState, useEffect } from 'react';
import { onAuthChange, isManager } from '../firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isManagerUser, setIsManagerUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setIsManagerUser(currentUser ? isManager(currentUser.email) : false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isManager: isManagerUser };
};
