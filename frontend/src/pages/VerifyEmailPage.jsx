import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('loading');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Použijeme env premennú pre backend
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    console.log('Overujem email s tokenom:', token);

    fetch(`${baseURL}/user/verify-email?token=${token}`)
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
  }, [token, baseURL]);

  // Automatické presmerovanie po úspechu
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/login');  // Presmerovanie na prihlasovaciu stránku
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {status === 'loading' && <p>Overovanie emailu prebieha...</p>}
      {status === 'success' && (
        <div className="text-green-600 text-xl">
         Email has been successfully verified! You will be redirected to the login page.
        </div>
      )}
      {status === 'error' && (
        <div className="text-red-600 text-xl">
          Email verification failed. Please check the link or contact support.
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage;
