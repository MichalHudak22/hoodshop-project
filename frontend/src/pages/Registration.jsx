import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [passwordMatchMessage, setPasswordMatchMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    // Kontrola zhody hesiel
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


   fetch(`${import.meta.env.VITE_API_BASE_URL}/user`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(submitData),
})
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert('Error: ' + data.error);
    } else if (data.message) {
      alert(data.message);
      navigate('/login');
    }
  })
  .catch(error => console.error('Registration error:', error));
};


  return (
    <div
      className="relative mt-10 pb-10 flex justify-center bg-fixed bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0" />

      <div className="relative z-10 bg-black bg-opacity-70 md:border-2 border-gray-600 py-8 lg:py-16 px-5 md:px-12 lg:px-12 rounded-2xl shadow-xl max-w-xl md:max-w-3xl w-full">
        
        {/* Úvodný text */}
        <div className="mb-8 text-white flex flex-col gap-3">
          <h2 className="text-3xl font-bold mb-4 text-blue-200 text-center">Welcome to HoodShop Registration!</h2>
          <p className="mb-3 lg:text-xl text-center">
            Our store focuses on football, hockey, and cycling, offering a wide selection of jerseys, balls, hockey sticks, bikes, helmets, skates, and other great accessories for these sports.
          </p>
          <p className="mb-3 text-blue-200 lg:text-2xl text-center">
            Here you can easily register and create your own account, which gives you many benefits:
          </p>
          <ul className="list-disc list-inside space-y-1 text-white lg:text-xl mb-4">
            <li>Earn loyalty points with every purchase.</li>
            <li>Redeem points as a discount of up to 5% from your previous purchase.</li>
            <li>Fill in your profile and set a photo as your avatar.</li>
            <li>Enjoy exclusive offers and discounts available only to registered users.</li>
          </ul>
           <p className="text-blue-200 lg:text-2xl text-center">Registration is quick and easy – get started now!</p>
        </div>

        <h1 className="text-3xl font-bold text-center text-blue-200 mb-6">User Registration</h1>

<form onSubmit={handleSubmit} className="space-y-4 max-w-md m-auto">
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
  <div className="min-h-[1.5rem] text-md text-center font-semibold">
    <p className={`${passwordMatchMessage.includes('match') ? 'text-green-400' : 'text-red-500'}`}>
      {passwordMatchMessage}
    </p>
  </div>

  <div className="pt-5 w-full">
    <button
      type="submit"
      className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200"
    >
      Create Account
    </button>
  </div>
</form>

      </div>
    </div>
  );
};

export default Registration;
