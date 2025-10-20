import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileNavigation from '../components/ProfileNavigation';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProfileLoyaltyPoints() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // hook na presmerovanie
  const [profile, setProfile] = useState(null);
  const [displayPoints, setDisplayPoints] = useState(0);

  // ✅ Presmerovanie neprihlásených
  useEffect(() => {
    if (!user?.token) {
      navigate('/login'); // ak nie je prihlásený, presmeruj na login
    }
  }, [user, navigate]);

  // Načítanie profilu
  useEffect(() => {
    if (!user?.token) return;

    axios
      .get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.error('Chyba pri načítaní profilu:', err));
  }, [user]);

  // Animácia bodov
  useEffect(() => {
    if (!profile) return;

    const totalPoints = profile.loyalty_points || 0;
    const duration = 3000; // ms
    const intervalTime = 20; // ms
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

  // Zabránime renderu, kým prebieha presmerovanie
  if (!user?.token) return null;

  return (
    <div
      className="relative min-h-[100vh] text-white flex flex-col items-center bg-fixed bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-30 z-0" />

      <div className="relative z-10 w-full flex flex-col items-center">


        <div className="w-full lg:max-w-2xl">
          <ProfileNavigation />

          {profile ? (
            <div className="lg:mt-6 bg-black bg-opacity-50 md:bg-opacity-70 p-6 lg:rounded-xl shadow-md text-center lg:border-2 border-gray-600">
              {/* Nadpis */}
              <div className="pb-8 text-center w-full">
                <h1 className="text-2xl lg:text-4xl font-bold text-white">
                  Points & <span className="text-blue-200">Rewards</span>
                </h1>
              </div>
              <p className="text-lg text-white">
                You currently have{' '}
                <span className="font-bold text-5xl p-3 text-yellow-400">
                  <br className="md:hidden" />
                  {displayPoints}
                </span>{' '}
                loyalty points.
              </p>
              <p className="text-xl mt-2 text-white">
                That’s worth approximately{' '}
                <span className="text-yellow-400 font-semibold">
                  {(displayPoints * 0.10).toFixed(2)}€
                </span>{' '}
                in discounts!
              </p>
            </div>
          ) : (
            <div className="mt-6 text-center text-gray-300">
              Loading your profile...
            </div>
          )}
        </div>

        {/* Info o vernostných bodoch */}
        <div className="max-w-5xl mx-auto bg-black bg-opacity-50 md:bg-opacity-70 shadow-md lg:rounded-2xl py-6 lg:py-10 p-2 lg:p-6 lg:mt-10 text-gray-800 lg:border-2 border-gray-600">
          <h2 className="text-2xl text-blue-100 font-bold mb-4 text-center">
            🎁 Loyalty Points – Your Reward for Every Purchase
          </h2>
          <p className="mb-4 text-white">
            We truly value every customer, and that’s why we’ve introduced a{' '}
            <strong>loyalty program</strong> that rewards you for shopping with
            us.
          </p>
          <p className="mb-4 text-white">
            With every purchase, you automatically earn{' '}
            <strong>loyalty points</strong>. The amount you receive equals{' '}
            <strong>5% of your total order value</strong>. These points are
            added to your account immediately after checkout and can be used as
            a discount on your next purchase.
          </p>
          <h3 className="text-2xl text-blue-100 font-semibold mt-6 mb-2">
            🔍 How does it work?
          </h3>
          <ul className="list-disc list-inside space-y-1 mb-4 text-white">
            <li>
              💸 For every 100 € spent, you earn <strong>50 points</strong>
            </li>
            <li>🧾 <strong>10 points = 1 €</strong> discount</li>
            <li>
              🛒 You can apply your points as a full or partial discount on
              your next order
            </li>
            <li>
              🔐 Loyalty points are available only to{' '}
              <strong>registered and logged-in users</strong>
            </li>
          </ul>
          <p className="mb-4 text-white">
            <em>Example:</em> If you spend 60 €, you’ll earn 30 points, which
            gives you a 3 € discount on your next purchase. The more you shop,
            the more you save – it’s that simple.
          </p>
          <p className="font-medium text-center mt-6 text-white">
            💡 Loyalty points are our way of saying <strong>thank you</strong>{' '}
            for your trust and continued support. Shop, earn, and enjoy the
            rewards you deserve!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileLoyaltyPoints;
