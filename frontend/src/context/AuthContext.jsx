import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      return { ...JSON.parse(storedUser), token: storedToken };
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // 🔑 Session ID musí existovať pre každého (aj neprihláseného)
  useEffect(() => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID(); // alebo Date.now().toString()
      localStorage.setItem('sessionId', sessionId);
    }
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/user/profile', {
          headers: { 'Authorization': 'Bearer ' + user.token },
        });
        if (!res.ok) throw new Error('Unauthorized');
        const userData = await res.json();
        setUser({ ...userData, token: user.token });
        localStorage.setItem('user', JSON.stringify(userData));
      } catch {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    // ⚡ sessionId sa tu nemení — ostáva rovnaké, aby merge fungoval
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // sessionId nevymazávame → nechávame ho pre guest košík
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
