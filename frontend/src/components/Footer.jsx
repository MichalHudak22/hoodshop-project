import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">

        {/* Left text */}
        <div className="text-center md:text-left">
          <p className="text-lg font-semibold">© 2025 HoodShop. All rights reserved.</p>
          <p className="text-sm opacity-70">Your favorite store for sports equipment.</p>
        </div>

        {/* Logo in center */}
        <div className="flex justify-center">
          <img
            src="/img/logo.png"
            alt="Logo"
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Right links → stacked */}
        <div className="flex flex-col items-center md:items-start gap-2 text-lg">
          <Link to="/sports/football" className="hover:text-gray-300">
            Football
          </Link>
          <Link to="/sports/hockey" className="hover:text-gray-300">
            Hockey
          </Link>
          <Link to="/sports/cycling" className="hover:text-gray-300">
            Cycling
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
