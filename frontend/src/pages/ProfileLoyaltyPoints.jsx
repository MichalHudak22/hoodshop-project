import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import ProfileNavigation from '../components/ProfileNavigation';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProfileLoyaltyPoints() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.token) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfile(response.data);
      } catch (err) {
        console.error('Chyba pri načítaní profilu:', err);
        setError('Nepodarilo sa načítať profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading user info...
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen text-white flex flex-col items-center bg-fixed bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-30 z-0" />
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="py-8 text-center bg-black w-full">
          <h1 className="text-2xl lg:text-4xl font-bold text-white">
            Points & <span className="text-blue-200">Rewards</span>
          </h1>
        </div>

        <div className="w-full lg:max-w-2xl px-4">
          <ProfileNavigation />

          {loading && (
            <div className="mt-6 text-center text-gray-300">Loading your profile...</div>
          )}

          {error && (
            <div className="mt-6 text-center text-red-400">{error}</div>
          )}

          {profile && (
            <div className="mt-6 bg-black bg-opacity-70 p-6 rounded-xl shadow-md text-center border-2 border-gray-600">
              <h3 className="text-2xl font-semibold text-blue-100 mb-2">
                Welcome, {profile.name}!
              </h3>
              <p className="text-lg text-white">
                You currently have{' '}
                <span className="font-bold text-5xl p-3 text-yellow-400">
                  <br className="md:hidden" />
                  {profile.loyalty_points}
                </span>{' '}
                loyalty points.
              </p>
              <p className="text-xl mt-2 text-white">
                That’s worth approximately{' '}
                <span className="text-yellow-400 font-semibold">
                  {(profile.loyalty_points * 0.10).toFixed(2)}€
                </span>{' '}
                in discounts!
              </p>
            </div>
          )}

          {/* Info o vernostnych bodoch */}
          <div className="max-w-5xl mx-auto bg-black bg-opacity-70 shadow-md rounded-2xl p-6 mt-10 text-gray-800 border-2 border-gray-600">
            <h2 className="text-2xl text-blue-100 font-bold mb-4 text-center">
              🎁 Loyalty Points – Your Reward for Every Purchase
            </h2>
            <p className="mb-4 text-white">
              We truly value every customer, and that’s why we’ve introduced a <strong>loyalty program</strong> that rewards you for shopping with us.
            </p>
            <p className="mb-4 text-white">
              With every purchase, you automatically earn <strong>loyalty points</strong>. The amount you receive equals <strong>5% of your total order value</strong>. These points are added to your account immediately after checkout and can be used as a discount on your next purchase.
            </p>
            <h3 className="text-2xl text-blue-100 font-semibold mt-6 mb-2">🔍 How does it work?</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 text-white">
              <li>💸 For every 100 € spent, you earn <strong>50 points</strong></li>
              <li>🧾 <strong>10 points = 1 €</strong> discount</li>
              <li>🛒 You can apply your points as a full or partial discount on your next order</li>
              <li>🔐 Loyalty points are available only to <strong>registered and logged-in users</strong></li>
            </ul>
            <p className="mb-4 text-white">
              <em>Example:</em> If you spend 60 €, you’ll earn 30 points, which gives you a 3 € discount on your next purchase. The more you shop, the more you save – it’s that simple.
            </p>
            <p className="font-medium text-center mt-6 text-white">
              💡 Loyalty points are our way of saying <strong>thank you</strong> for your trust and continued support. Shop, earn, and enjoy the rewards you deserve!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileLoyaltyPoints;
