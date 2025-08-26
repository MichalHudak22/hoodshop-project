import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { refreshCartCount } = useContext(CartContext) || {}; // CartProvider môže byť ešte undefined pri mountnutí
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
      if (!user) { setLoading(false); return; }
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

  // login funkcia
  const login = async (userData) => {
    try {
      // získame plné údaje používateľa hneď po login-e
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/profile`, {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });
      const fullUserData = res.ok ? await res.json() : userData;

      setUser({ ...fullUserData, token: userData.token });
      localStorage.setItem('user', JSON.stringify(fullUserData));
      localStorage.setItem('token', userData.token);

      if (refreshCartCount) refreshCartCount(); // fetch košíka hneď po login-e
      navigate('/profile'); // presmerovanie na profil
    } catch (err) {
      console.error('Login failed:', err);
      setUser(userData); // fallback na pôvodné údaje
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      if (refreshCartCount) refreshCartCount();
      navigate('/profile');
    }
  };

  // logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (refreshCartCount) refreshCartCount(); // fetch košíka session používateľa
    navigate('/'); // presmerovanie na hlavnú
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
