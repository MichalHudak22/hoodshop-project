import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const baseURL = 'https://hoodshop-project.onrender.com';

const Registration = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [passwordMatchMessage, setPasswordMatchMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password' || name === 'confirmPassword') {
      const password = name === 'password' ? value : formData.password;
      const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;

      if (password && confirmPassword) {
        if (password === confirmPassword) {
          setPasswordMatchMessage('Passwords match ✅');
        } else {
          setPasswordMatchMessage('Passwords do not match ❌');
        }
      } else {
        setPasswordMatchMessage('');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.password.length < 10) {
      alert('Password must be at least 10 characters long.');
      return;
    }

    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };

    fetch(`${baseURL}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert('Error: ' + data.error);
        } else if (data.message) {
          alert(data.message);
          navigate('/login');
        }
      })
      .catch((error) => console.error('Registration error:', error));
  };

  return (
    <div
      className="relative flex flex-col items-center min-h-screen bg-black bg-fixed bg-cover bg-center lg:mt-12"
      style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-60 z-0" />

      {/* Form container */}
      <div className="relative z-10 bg-black bg-opacity-70 md:border-2 border-gray-600 lg:rounded-2xl shadow-xl w-full max-w-xl md:max-w-3xl lg:max-w-4xl p-6 md:p-12 lg:p-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-200 mb-6">
          Welcome to HoodShop Registration!
        </h2>
        <p className="text-white text-lg lg:text-xl text-center my-3">
          Registration is quick and easy – get started now!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            maxLength={16}
            required
            className="w-full p-3 rounded-lg text-lg font-semibold bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-black placeholder:font-bold"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg text-lg font-semibold bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-black placeholder:font-bold"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg text-lg font-bold bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-black placeholder:font-bold"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg text-lg font-bold bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-black placeholder:font-bold"
          />

          {/* Rezervované miesto pre hlášku */}
          <div className="min-h-[1.5rem] text-[14px] text-center font-semibold">
            <p className={`${passwordMatchMessage.includes('match') ? 'text-green-400' : 'text-red-500'}`}>
              {passwordMatchMessage}
            </p>
          </div>

          <button
            type="submit"
            className="w-full lg:w-[200px] block mx-auto bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-white">

          <p className="mb-3 text-blue-200 text-lg lg:text-xl">
            Here you can easily register and create your own account, which gives you many benefits:
          </p>

          <ul className="list-disc list-inside space-y-1 text-sm lg:text-xl text-white text-left mx-auto max-w-md">
            <li>Earn loyalty points with every purchase.</li>
            <li>Redeem points as a discount of up to 5% from your previous purchase.</li>
            <li>Fill in your profile and set a photo as your avatar.</li>
            <li>Enjoy exclusive offers and discounts available only to registered users.</li>
          </ul>

          <p className="mb-3 lg:text-xl">
            Our store focuses on football, hockey, and cycling, offering a wide selection of jerseys, balls, hockey sticks, bikes, helmets, skates, and more.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Registration;
