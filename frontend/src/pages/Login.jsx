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
  const { refreshCartCount } = useContext(CartContext);

  const baseURL = 'https://hoodshop-project.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseURL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setMessage('');
        return;
      } else if (data.message === 'Email is not verified. Please verify your account before logging in.') {
        setError(data.message);
        setMessage('');
        return;
      }

      // Načítanie kompletného profilu
      const profileRes = await fetch(`${baseURL}/user/profile`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const profileData = await profileRes.json();

      const completeUser = { ...profileData, token: data.token };
      login(completeUser);
      localStorage.setItem('user', JSON.stringify(completeUser));
      localStorage.setItem('token', data.token);

      refreshCartCount();
      navigate('/profile');
      setError('');
      setMessage(data.message);
    } catch (err) {
      console.error('Error during login:', err);
      setError('An error occurred while logging in.');
      setMessage('');
    }
  };

  return (
    <div
      className="relative flex flex-col items-center min-h-screen bg-black bg-fixed bg-cover bg-center pt-32 md:pt-40"
      style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-60 z-0" />

      {/* Form container */}
      <div className="relative z-10 lg:bg-black bg-opacity-70 rounded-2xl shadow-xl w-full max-w-xl md:max-w-3xl mx-4 p-6 md:p-12 lg:p-16">
        <h1 className="text-2xl lg:text-3xl font-bold text-center text-blue-200 mb-6">
          Sign In to Your Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            Log In
          </button>
        </form>

        <div className="mt-4 text-center h-8">
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : message ? (
            <p className="text-green-400">{message}</p>
          ) : (
            <span className="block invisible">&nbsp;</span>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-blue-200 text-lg lg:text-xl mb-3">
            New to HoodShop? Create your account and unlock exclusive benefits!
          </p>
          <Link
            to="/registration"
            className="inline-block my-3 bg-blue-700 hover:bg-blue-600 text-white px-7 py-3 rounded-lg transition duration-200"
          >
            Create Account
          </Link>

          <div className="mt-6 text-white text-left">
            <p className="mb-3 text-sm lg:text-xl text-center">
              By signing in, you unlock all the benefits of our store focused on football, hockey, and cycling.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm lg:text-xl">
              <li>Earn loyalty points with every purchase.</li>
              <li>Get up to 5% off your next order using your points.</li>
              <li>Manage your profile and update your avatar.</li>
              <li>Access exclusive member-only offers.</li>
            </ul>
            <p className="text-blue-200 text-sm lg:text-2xl text-center mt-4">
              Enter your credentials and enjoy the best of HoodShop!
            </p>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Login;
