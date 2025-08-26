import { createContext, useState, useEffect, useContext } from 'react';
import { CartContext } from './CartContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { refreshCartCount } = useContext(CartContext) || {}; // optional, môže byť undefined pri mountnutí
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) return { ...JSON.parse(storedUser), token: storedToken };
    return null;
  });

  const [loading, setLoading] = useState(true);

  // verify token po načítaní stránky
  useEffect(() => {
    const verifyToken = async () => {
      if (!user) { 
        setLoading(false); 
        return; 
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/profile`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
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

  // login: iba uloženie usera a refreshCartCount
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    if (refreshCartCount) refreshCartCount(); // fetch košíka hneď po login-e
  };

  // logout: vymazanie usera a refreshCartCount
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (refreshCartCount) refreshCartCount(); // fetch košíka session používateľa
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
