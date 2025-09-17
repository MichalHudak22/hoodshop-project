import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown } from "react-icons/fa";

const SportsDropdown = () => {
  const [showSportsMenu, setShowSportsMenu] = useState(false);
  const sportsMenuTimeout = useRef(null);

  const handleMouseEnter = () => {
    // Ak už beží timeout na zatváranie, stopni ho
    if (sportsMenuTimeout.current) {
      clearTimeout(sportsMenuTimeout.current);
      sportsMenuTimeout.current = null;
    }

    // Nastav timeout na otvorenie po 1 sekunde
    sportsMenuTimeout.current = setTimeout(() => {
      setShowSportsMenu(true);
      sportsMenuTimeout.current = null;
    }, 400);
  };

  const handleMouseLeave = () => {
    // Ak už beží timeout na otváranie, stopni ho
    if (sportsMenuTimeout.current) {
      clearTimeout(sportsMenuTimeout.current);
      sportsMenuTimeout.current = null;
    }

    // Nastav timeout na zatvorenie po 1,5 sekunde
    sportsMenuTimeout.current = setTimeout(() => {
      setShowSportsMenu(false);
      sportsMenuTimeout.current = null;
    }, 800);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
<Link
  to="/sports"
  className="hover:text-blue-200 relative z-20 flex items-center gap-1"
>
  Sports <FaChevronDown className="w-3 h-3 mt-[2px]" />
</Link>

      {showSportsMenu && (
        <div
          className="fixed top-[97px] left-0 w-full bg-black bg-opacity-95 py-4 transition-all duration-300 z-10"
          style={{ pointerEvents: 'all' }}
        >
          <div className="max-w-full mx-auto flex px-4">
            {/* Football column */}
            <div
              className="w-1/3 relative flex flex-col items-center space-y-2 px-4 bg-cover bg-center group"
              style={{ backgroundImage: 'url(/img/bg-football.jpg)' }}
            >
              <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative z-10 flex flex-col items-center space-y-2 py-10">
                <Link to="/sports/football" className="text-[#dce5ff] text-3xl mb-2 border-b font-bold">Football</Link>
                <Link to="/sports/football/jersey" className="hover:text-[#dce5ff] text-2xl">Jerseys</Link>
                <Link to="/sports/football/ball" className="hover:text-[#dce5ff] text-2xl">Balls</Link>
                <Link to="/sports/football/cleats" className="hover:text-[#dce5ff] text-2xl">Cleats</Link>
                <Link to="/sports/football/shinguards" className="hover:text-[#dce5ff] text-2xl">Shinguards</Link>
              </div>
            </div>


            {/* Hockey column */}
          <div
            className="w-1/3 relative flex flex-col items-center space-y-2 px-4 bg-cover bg-center group"
            style={{ backgroundImage: 'url(/img/bg-hockey.jpg)' }}
          >
            <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center space-y-2 py-10">
              <Link to="/sports/hockey" className="text-[#dce5ff] text-3xl mb-2 border-b font-bold">Hockey</Link>
              <Link to="/sports/hockey/jersey" className="hover:text-[#dce5ff] text-2xl">Jerseys</Link>
              <Link to="/sports/hockey/sticks" className="hover:text-[#dce5ff] text-2xl">Sticks</Link>
              <Link to="/sports/hockey/skates" className="hover:text-[#dce5ff] text-2xl">Skates</Link>
              <Link to="/sports/hockey/helmets" className="hover:text-[#dce5ff] text-2xl">Helmets</Link>
            </div>
          </div>


            {/* Cycling column */}
         <div
            className="w-1/3 relative flex flex-col items-center space-y-2 px-4 bg-cover bg-center group"
            style={{ backgroundImage: 'url(/img/bg-cykling.jpg)' }}
          >
            <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center space-y-2 py-10">
              <Link to="/sports/cycling" className="text-[#dce5ff] text-3xl mb-2 border-b font-bold">Cycling</Link>
              <Link to="/sports/cycling/clothes" className="hover:text-[#dce5ff] text-2xl">Clothing</Link>
              <Link to="/sports/cycling/bikes" className="hover:text-[#dce5ff] text-2xl">Bikes</Link>
              <Link to="/sports/cycling/helmets" className="hover:text-[#dce5ff] text-2xl">Helmets</Link>
              <Link to="/sports/cycling/gloves" className="hover:text-[#dce5ff] text-2xl">Gloves</Link>
            </div>
          </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SportsDropdown;
