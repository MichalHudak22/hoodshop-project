// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
     <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <h1 className="text-5xl font-bold mb-4">Page Not Found</h1>
      <p className="text-lg mb-6">Sorry, the page you are looking for does not exist.</p>
      <Link
        to="/"
        className="text-white border-2 border-white px-6 py-3 rounded-lg text-lg hover:bg-white hover:text-black transition duration-300"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
