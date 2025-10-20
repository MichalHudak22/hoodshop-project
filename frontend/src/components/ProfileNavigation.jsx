import React from 'react';
import { Link } from 'react-router-dom';


function ProfileNavigation() {
  return (
<div className="w-full bg-black mb-4">
  <div className="flex w-full max-w-5xl mx-auto h-[80px] sm:h-[70px] lg:max-w-full lg:justify-around">
    <Link
      to="/profile"
      className="flex-1 flex items-center justify-center bg-black text-white hover:text-blue-200 text-[12px] sm:text-[16px] lg:text-[20px] font-bold transition-all duration-300 border border-gray-500 hover:border-blue-200"
    >
      My Account
    </Link>
    <Link
      to="/profileloyaltypoints"
      className="flex-1 flex items-center justify-center bg-black text-white hover:text-blue-200 text-[12px] sm:text-[16px] lg:text-[20px] font-bold transition-all duration-300 border border-gray-500 hover:border-blue-200"
    >
      Loyalty Points
    </Link>
    <Link
      to="/profileorderhistory"
      className="flex-1 flex items-center justify-center bg-black text-white hover:text-blue-200 text-[12px] sm:text-[16px] lg:text-[20px] font-bold transition-all duration-300 border border-gray-500 hover:border-blue-200"
    >
      Order History
    </Link>
  </div>
</div>

  );
}

export default ProfileNavigation;
