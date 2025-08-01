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

  const handleSubmit = (e) => {
  e.preventDefault();

  fetch('http://localhost:3001/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        setError(data.error);
        setMessage('');
      } else if (data.message === 'Email is not verified. Please verify your account before logging in.') {
        // Speciálna správa pre neoverený email
        setError('Email is not verified. Please verify your account before logging in.');
        setMessage('');
      } else {
        setMessage(data.message);
        setError('');

        login({
          email: data.email,
          name: data.name,
          role: data.role,
          token: data.token,
        });

        refreshCartCount();
        navigate('/profile');
      }
    })
    .catch((err) => {
      console.error('Error during login:', err);
      setError('An error occurred while logging in.');
      setMessage('');
    });
};


  return (
    <div
      className="relative mt-10 pb-10 flex justify-center bg-fixed bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0" />

      <div className="relative z-10 bg-black bg-opacity-70 md:border-2 border-gray-600 py-8 lg:py-16 px-5 md:px-12 lg:px-12 rounded-2xl shadow-xl max-w-xl md:max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-center text-blue-200 mb-6">
          Sign In to Your Account
        </h1>

        <div className="mb-8 text-white flex flex-col gap-3">
          <h2 className="text-3xl font-bold mb-4 text-blue-200 text-center">
            Welcome back to HoodShop!
          </h2>
          <p className="mb-3 lg:text-xl text-center">
            By signing in, you unlock all the benefits of our store focused on football, hockey, and cycling.
          </p>
          <ul className="list-disc list-inside space-y-1 text-white lg:text-xl mb-4">
            <li>Earn loyalty points with every purchase.</li>
            <li>Get up to 5% off your next order using your points.</li>
            <li>Manage your profile and update your avatar.</li>
            <li>Access exclusive member-only offers.</li>
          </ul>
          <p className="text-blue-200 lg:text-2xl text-center">
            Enter your credentials and enjoy the best of HoodShop!
          </p>
        </div>

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
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Log In
            </button>
          </div>
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
          <p className="text-white">
            New to HoodShop? Create your account and unlock exclusive benefits!
          </p>
          <Link
            to="/registration"
            className="inline-block mt-2 bg-blue-700 hover:bg-blue-600 text-white px-7 py-3 rounded-lg transition duration-200"
          >
            Create Account
          </Link>
        </div>

      
      </div>
    </div>
  );
}

export default Login;
