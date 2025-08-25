import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // <- pridaj import

// Lazy load stránok
const Home = lazy(() => import('./pages/Home'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const UserDetailPage = lazy(() => import('./admin/UserDetailPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));


const Sports = lazy(() => import('./pages/Sports'));

const FootballPage = lazy(() => import('./pages/FootballPage'));
const FootballJerseys = lazy(() => import('./pages/FootballJerseys'));
const FootballBalls = lazy(() => import('./pages/FootballBalls'));
const FootballCleats = lazy(() => import('./pages/FootballCleats'));
const FootballShinguards = lazy(() => import('./pages/FootballShinguards'));

const HockeyPage = lazy(() => import('./pages/HockeyPage'));
const HockeyJerseys = lazy(() => import('./pages/HockeyJersesys'));
const HockeySticks = lazy(() => import('./pages/HockeySticks'));
const HockeySkates = lazy(() => import('./pages/HockeySkates'));
const HockeyHelmets = lazy(() => import('./pages/HockeyHelmets'));

const CyclingPage = lazy(() => import('./pages/CyclingPage'));
const CyklingBikes = lazy(() => import('./pages/CyklingBikes'));
const CyclingGloves = lazy(() => import('./pages/CyclingGloves'));
const CyclingHelmets = lazy(() => import('./pages/CyclingHelmets'));
const CyclingClothes = lazy(() => import('./pages/CyclingClothes'));

const Brands = lazy(() => import('./pages/Brands'));
const About = lazy(() => import('./pages/About'));
const Registration = lazy(() => import('./pages/Registration'));
const Login = lazy(() => import('./pages/Login'));

const Profile = lazy(() => import('./pages/Profile'));
const ProfileOrderHistory = lazy(() => import('./pages/ProfileOrderHistory'));
const ProfileLoyaltyPoints = lazy(() => import('./pages/ProfileLoyaltyPoints'));

const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const BrandDetail = lazy(() => import('./pages/BrandDetail'));

const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const NotFound = lazy(() => import('./pages/NotFound'));


function App() {
  useEffect(() => {
    if (!localStorage.getItem("sessionId")) {
      const newSessionId = uuidv4();
      localStorage.setItem("sessionId", newSessionId);
    }
  }, []);

  return (
    <Router>
      <CartProvider> {/* OBALÍME TÝMTO VŠETKO, ČO POTREBUJE PRÍSTUP KU KART CONTEXT */}
        <AuthProvider>

          <Header />
          <div className="pt-[89px]">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/user/:id" element={<UserDetailPage />} />
                <Route path="/sports" element={<Sports />} />
                <Route path="/sports/football" element={<FootballPage />} />
                <Route path="/sports/football/jersey" element={<FootballJerseys />} />
                <Route path="/sports/football/ball" element={<FootballBalls />} />
                <Route path="/sports/football/cleats" element={<FootballCleats />} />
                <Route path="/sports/football/shinguards" element={<FootballShinguards />} />
                <Route path="/sports/hockey" element={<HockeyPage />} />
                <Route path="/sports/hockey/jersey" element={<HockeyJerseys />} />
                <Route path="/sports/hockey/sticks" element={<HockeySticks />} />
                <Route path="/sports/hockey/skates" element={<HockeySkates />} />
                <Route path="/sports/hockey/helmets" element={<HockeyHelmets />} />
                <Route path="/sports/cycling" element={<CyclingPage />} />
                <Route path="/sports/cycling/bike" element={<CyklingBikes />} />
                <Route path="/sports/cycling/gloves" element={<CyclingGloves />} />
                <Route path="/sports/cycling/helmets" element={<CyclingHelmets />} />
                <Route path="/sports/cycling/clothes" element={<CyclingClothes />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/about" element={<About />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profileorderhistory" element={<ProfileOrderHistory />} />
                <Route path="/profileloyaltypoints" element={<ProfileLoyaltyPoints />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/brands/:slug" element={<BrandDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />

        </AuthProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
