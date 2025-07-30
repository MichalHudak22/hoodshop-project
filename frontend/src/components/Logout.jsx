import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

function Logout() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { refreshCartCount } = useContext(CartContext);

  useEffect(() => {
    logout();             // vymaž user + token
    refreshCartCount();   // prepni košík na sessionId (anonymný)
    navigate('/login');
  }, [logout, refreshCartCount, navigate]);

  return (
    <div>
      <h2>Odhlasovanie...</h2>
    </div>
  );
}

export default Logout;
