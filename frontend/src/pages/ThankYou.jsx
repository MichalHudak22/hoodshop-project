// src/pages/ThankYou.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-8">
      <h1 className="text-4xl font-bold mb-4 text-green-700">Thank You for Your Order!</h1>
      <p className="text-lg mb-6 text-gray-700">
        Your order has been received and is being processed.
      </p>
      <Link
        to="/"
        className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default ThankYou;
