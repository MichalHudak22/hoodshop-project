import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);
  const { setCartDirectly } = useContext(CartContext); // ✅ refreshCart odstránené

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      console.log('➡️ Sending login request...', email);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': localStorage.getItem('sessionId'),
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba pri prihlasovaní');

      console.log('⬅️ Login response:', data);
      setMessage(data.message);

      // uloženie usera do AuthContext
      login({
        email: data.email,
        name: data.name,
        role: data.role,
        token: data.token,
      });

      // CartContext už automaticky načíta košík podľa user?.token
      navigate('/profile');
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message || 'An error occurred while logging in.');
    }
  };

  return (
    <div className="relative mt-10 pb-10 flex justify-center bg-fixed bg-cover bg-no-repeat bg-center" style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-60 z-0" />
      <div className="relative z-10 bg-black bg-opacity-70 md:border-2 border-gray-600 py-8 lg:py-16 px-5 md:px-12 lg:px-12 rounded-2xl shadow-xl max-w-xl md:max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-center text-blue-200 mb-6">
          Sign In to Your Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md m-auto">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg text-lg font-semibold bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-black placeholder:font-bold"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg text-lg font-bold bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-black placeholder:font-bold"
            required
          />
          <div className="pt-3">
            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200">
              Log In
            </button>
          </div>
        </form>
        <div className="mt-4 text-center h-8">
          {error ? <p className="text-red-400">{error}</p> : message ? <p className="text-green-400">{message}</p> : <span className="block invisible">&nbsp;</span>}
        </div>
        <div className="mt-8 text-center">
          <p className="text-white">New to HoodShop? Create your account and unlock exclusive benefits!</p>
          <Link to="/registration" className="inline-block mt-2 bg-blue-700 hover:bg-blue-600 text-white px-7 py-3 rounded-lg transition duration-200">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
