import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('loading');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    console.log('Overujem email s tokenom:', token);

    fetch(`http://localhost:3001/user/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Odpoveď z overenia:', data);
        if (data.message) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [token]);

  // Automatické presmerovanie po úspechu
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/login');  // zmeň na svoju prihlasovaciu stránku
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {status === 'loading' && <p>Overovanie emailu prebieha...</p>}
      {status === 'success' && (
        <div className="text-green-600 text-xl">
          Email bol úspešne overený! Budeš presmerovaný na prihlásenie.
        </div>
      )}
      {status === 'error' && (
        <div className="text-red-600 text-xl">
          Overenie emailu zlyhalo. Skontroluj odkaz alebo kontaktuj podporu.
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage;
