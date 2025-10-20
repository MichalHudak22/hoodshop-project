import React from 'react';
import { Link } from 'react-router-dom';

const CyclingCategories = () => {
  return (
    <section
      className="py-12"
      style={{
        backgroundImage: 'url(/img/bg-cycling4.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="mx-auto px-4 lg:px-5 xl:px-8 py-6 bg-black bg-opacity-40 lg:bg-opacity-50 lg:border-[7px] lg:border-black lg:rounded-lg max-w-5xl xl:max-w-[80%]">
        <h2 className="text-xl lg:text-3xl font-bold mb-8 text-center text-white">Explore Cycling Categories</h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4 md:gap-x-12 md:gap-y-12">
          {[
            { to: "clothes", bg: "/img/bg-cyclingclothes.jpg", label: "Clothes" },
            { to: "bike", bg: "/img/bg-cyclingbikes.jpg", label: "Bikes" },
            { to: "helmets", bg: "/img/bg-cyclinghelmets.jpg", label: "Helmets" },
            { to: "gloves", bg: "/img/bg-cyclinggloves.jpg", label: "Gloves" },
          ].map(({ to, bg, label }) => (
            <Link
              key={to}
              to={to}
              className="relative flex flex-col justify-start h-[250px] md:h-[300px] text-white text-xl font-semibold rounded-lg shadow-md overflow-hidden group hover:brightness-125 transition"
            >
              {/* Zväčšujúci sa pozadový obrázok */}
              <div
                className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${bg})` }}
              ></div>

              {/* Polopriehľadný overlay */}
              <div className="absolute inset-0 bg-black opacity-10 rounded-lg"></div>

              {/* Text */}
              <span className="relative z-10 bg-gray-200 text-black px-4 py-2 rounded-b-none rounded-t-lg w-full text-center text-2xl">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CyclingCategories;
