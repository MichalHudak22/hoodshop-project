import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    return storedUser && storedToken
      ? { ...JSON.parse(storedUser), token: storedToken }
      : null;
  });

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const verifyToken = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) {
        throw new Error('Unauthorized');
      }

      const userData = await res.json();
      setUser({ ...userData, token: user.token });
      localStorage.setItem('user', JSON.stringify({ ...userData, token: user.token }));
    } catch (err) {
      console.warn('Token verification failed:', err);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };
  verifyToken();
}, []);


  const login = (userData, callback) => {
    setUser(userData); // toto spustí re-render vo všetkých kontextoch
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    if (callback) callback(); // napr. refresh košíka + navigácia
  };

  const logout = (callback) => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (callback) callback(); // napr. refresh košíka
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
