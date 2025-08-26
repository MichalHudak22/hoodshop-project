import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from './CartContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { refreshCartCount } = useContext(CartContext); // <-- prístup k CartContext
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      return { ...JSON.parse(storedUser), token: storedToken };
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

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
        setUser({ ...userData, token: user.token }); // user obsahuje aj loyalty_points
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

  const login = async (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);

    // --- merge guest košíka ---
    const sessionId = localStorage.getItem('sessionId') || localStorage.getItem('session_id');
    if (sessionId) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/cart/merge`,
          { sessionId },
          { headers: { Authorization: `Bearer ${userData.token}` } }
        );
      } catch (err) {
        console.error('Merge košíka zlyhal:', err);
      }
    }

    // --- refresh košíka ---
    if (refreshCartCount) refreshCartCount();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // optional: môžeš tu aj vymazať sessionId, ak chceš
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
