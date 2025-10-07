import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import ProfileNavigation from '../components/ProfileNavigation';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProfileLoyaltyPoints() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [displayPoints, setDisplayPoints] = useState(0);

  // Načítanie profilu
  useEffect(() => {
    if (!user?.token) return;

    axios
      .get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.error('Chyba pri načítaní profilu:', err));
  }, [user]);

  // Animácia bodov
  useEffect(() => {
    if (!profile) return;
    const totalPoints = profile.loyalty_points;
    const duration = 5000; // 5 sekúnd
    const intervalTime = 20; // ms medzi krokmi
    const steps = duration / intervalTime;
    const increment = totalPoints / steps;

    let currentPoints = 0;
    const interval = setInterval(() => {
      currentPoints += increment;
      if (currentPoints >= totalPoints) {
        currentPoints = totalPoints;
        clearInterval(interval);
      }
      setDisplayPoints(Math.floor(currentPoints));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [profile]);

  return (
    <div className="relative min-h-[100vh] text-white flex flex-col items-center bg-fixed bg-cover bg-no-repeat bg-center"
         style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-30 z-0" />

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="py-8 text-center bg-black w-full">
          <h1 className="text-2xl lg:text-4xl font-bold text-white">
            Points & <span className="text-blue-200">Rewards</span>
          </h1>
        </div>

        <div className="w-full lg:max-w-2xl">
          <ProfileNavigation />

          {profile && (
            <div className="mt-6 bg-black bg-opacity-50 md:bg-opacity-70 p-6 lg:rounded-xl shadow-md text-center lg:border-2 border-gray-600">
              <h3 className="text-2xl font-semibold text-blue-100 mb-2">Welcome, {profile.name}!</h3>
              <p className="text-lg text-white">
                You currently have 
                <span className="font-bold text-5xl p-3 text-yellow-400">
                  <br className='md:hidden' />{displayPoints}
                </span> loyalty points.
              </p>
              <p className="text-xl mt-2 text-white">
                That’s worth approximately{' '}
                <span className="text-yellow-400 font-semibold">
                  {(displayPoints * 0.10).toFixed(2)}€
                </span>{' '}
                in discounts!
              </p>
            </div>
          )}

          {!profile && (
            <div className="mt-6 text-center text-gray-300">Loading your profile...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileLoyaltyPoints;
