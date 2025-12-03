import { Link } from "react-router-dom";
import logo from '../img/logo.png';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-5 border-t border-white border-opacity-60">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-evenly gap-5">

        {/* Logo */}
        <div className="flex justify-center">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-16 rounded-full hover:scale-105 transition-transform" />
          </Link>
        </div>

        {/* text */}
        <div className="text-center md:text-left">
          <p className="text-lg font-semibold">© 2025 HoodSport Shop. All rights reserved.</p>
          <p className="text-base text-blue-200">Your favorite store for sports equipment.</p>
        </div>

        {/* Right links → stacked */}
        <div className="flex md:flex-col items-center md:items-start gap-2 text-lg">
          <Link to="/sports/football" className="hover:text-blue-200">
            Football
          </Link>
          <Link to="/sports/hockey" className="hover:text-blue-200">
            Hockey
          </Link>
          <Link to="/sports/cycling" className="hover:text-blue-200">
            Cycling
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
