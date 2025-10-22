import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import logo from '../img/logo.png';
import { Menu, X, User, ShoppingCart } from 'lucide-react';
import SportsDropdown from './SportsDropdown';
import SearchBar from './SearchBar';

 const baseURL = 'https://hoodshop-project.onrender.com'; // produkčný backend

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount, refreshCartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [sportsOpen, setSportsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const modalRef = useRef(null);

  const toggleProfileModal = () => setProfileModalOpen(!profileModalOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
    setProfileModalOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Zatvorenie modalu klikom mimo
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setProfileModalOpen(false);
      }
    };

    if (profileModalOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileModalOpen]);

  // Skryť/zobraziť header pri scrollovaní
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setIsVisible(currentScrollPos < prevScrollPos);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  // Refresh cartCount pri zmene používateľa alebo otvorení headeru
  useEffect(() => {
    refreshCartCount();
  }, [user, refreshCartCount]);

  return (
    <header className={`fixed w-full flex flex-col bg-black bg-opacity-90 text-white border-b border-white border-opacity-60 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      {/* Top bar */}
      <div className="flex justify-between items-center p-2 px-8">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-16 rounded-full hover:scale-105 transition-transform" />
        </Link>




        {/* Mobilné ikony */}
        <div className="flex items-center space-x-4 lg:hidden">
          <Link to="/cart" className="relative hover:text-blue-200">
            <ShoppingCart size={26} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          {user && (
            <button onClick={toggleProfileModal} className="hover:text-blue-200">
              <User size={26} />
            </button>
          )}

          {/* 🔒 Admin Link – zobrazí sa len ak má používateľ rolu 'admin' */}
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-blue-200 font-semibold text-xl">
              Admin
            </Link>
          )}

          <button onClick={toggleMenu} className="hover:text-blue-200">
            {menuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>


        </div>

        {/* Desktop navigácia */}
        <nav className="hidden lg:flex space-x-5 text-xl font-semibold">
          <Link to="/" className="hover:text-blue-200">Home</Link>
          <SportsDropdown />
          <Link to="/brands" className="hover:text-blue-200">Brands</Link>
          <Link to="/about" className="hover:text-blue-200">Project Info</Link>
        </nav>


        {/* Desktop ikony */}
        <div className="hidden lg:flex items-center space-x-3">
          <SearchBar />
          <Link to="/cart" className="relative hover:text-blue-200">
            <ShoppingCart size={26} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <>

              <button onClick={toggleProfileModal} className="hover:text-blue-200">
                <User size={26} />
              </button>

              {/* 🔒 Admin Link – len pre admina */}
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-200 font-semibold text-xl">
                  Admin
                </Link>
              )}

              <button onClick={handleLogout} className="hover:text-blue-200 font-semibold text-xl">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 text-xl">Login</Link>
            </>
          )}
        </div>

      </div>

    {menuOpen && (
  <div className="lg:hidden bg-black bg-opacity-90 p-4 flex flex-col space-y-4 text-xl items-center">
    <div className="w-full mb-4">
      <SearchBar onResultClick={() => setMenuOpen(false)} />
    </div>

    {/* WRAPPER ktorý drží obsah v strede, ale texty sú zarovnané vľavo */}
    <div className="w-full max-w-[120px] text-left space-y-4">
      <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-blue-200 block">Home</Link>

      <div>
        <div className="flex items-center justify-between">
          <Link to="/sports" onClick={() => setMenuOpen(false)} className="hover:text-blue-200 block">Sports</Link>
          <button onClick={() => setSportsOpen(!sportsOpen)} className="hover:text-blue-200">
            {sportsOpen ? '▲' : '▼'}
          </button>
        </div>
        {sportsOpen && (
          <div className="mt-2 space-y-2 text-base border border-gray-400 p-2 rounded-sm">
            <Link to="/sports/football" onClick={() => { setMenuOpen(false); setSportsOpen(false); }} className="hover:text-blue-200 block">Football</Link>
            <Link to="/sports/hockey" onClick={() => { setMenuOpen(false); setSportsOpen(false); }} className="hover:text-blue-200 block">Hockey</Link>
            <Link to="/sports/cycling" onClick={() => { setMenuOpen(false); setSportsOpen(false); }} className="hover:text-blue-200 block">Cycling</Link>
          </div>
        )}
      </div>

      <Link to="/brands" onClick={() => setMenuOpen(false)} className="hover:text-blue-200 block">Brands</Link>
      <Link to="/about" onClick={() => setMenuOpen(false)} className="hover:text-blue-200 block">Project Info</Link>

      {user ? (
        <button onClick={handleLogout} className="hover:text-blue-200 block">Logout</button>
      ) : (
        <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-blue-200 block">Login</Link>
      )}
    </div>
  </div>
)}



{profileModalOpen && user && (
  <div
    ref={modalRef}
    className="absolute top-[96px] right-8 bg-black text-white shadow-lg rounded-lg w-56 z-50 p-4 border-2 border-gray-400"
  >
    {/* Ak existuje profilová fotka */}
    {user.user_photo && (
<div className="flex justify-center mb-3">
  <img
    src={
      user?.user_photo
        ? user.user_photo.startsWith('http')
          ? user.user_photo
          : `${baseURL}${user.user_photo}`
        : 'https://res.cloudinary.com/dd8gjvv80/image/upload/v1755594977/default-avatar_z3c30l.jpg'
    }
    alt="Profile"
    className="w-16 h-16 rounded-full object-cover border-2 border-gray-500"
  />
</div>

    )}

    {/* Meno alebo email */}
    <h3 className="text-lg text-blue-200 font-bold mb-4 border-b pb-2 text-center">
      👤 {user?.name || user?.email || 'User'}
    </h3>

    <ul className="space-y-2 text-lg pl-3">
      <li>
        <Link
          to="/profile"
          onClick={() => setProfileModalOpen(false)}
          className="block hover:text-blue-200 border-b pb-1 font-semibold"
        >
          My Account
        </Link>
      </li>
      <li>
        <Link
          to="/profileloyaltypoints"
          onClick={() => setProfileModalOpen(false)}
          className="block hover:text-blue-200 border-b pb-1 font-semibold"
        >
          Loyalty Points
        </Link>
      </li>
      <li>
        <Link
          to="/profileorderhistory"
          onClick={() => setProfileModalOpen(false)}
          className="block hover:text-blue-200 font-semibold"
        >
          Order History
        </Link>
      </li>
    </ul>
  </div>
)}

    </header>
  );
};

export default Header;
