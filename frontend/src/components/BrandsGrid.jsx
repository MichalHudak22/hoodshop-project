import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function BrandsGrid({ brands, bgImage }) {
  const [isMobile, setIsMobile] = useState(false);

  // Sleduj veľkosť okna a nastav, či je mobil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // inicializácia
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      className={`relative py-10 md:py-16 md:px-6 bg-black overflow-hidden ${!isMobile ? 'bg-fixed' : ''}`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: isMobile ? 'scroll' : 'fixed', // kľúčová zmena
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-5 md:mb-8 md:mt-8 text-white text-center">
          All Brands
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {brands.map((brand) => {
            const slug = brand.name.toLowerCase();

            const imageUrl = brand.brand_image.startsWith('/')
              ? `${import.meta.env.VITE_API_BASE_URL}${brand.brand_image}`
              : `${import.meta.env.VITE_API_BASE_URL}/img/brands/${brand.brand_image}`;

            return (
              <Link
                key={brand.id}
                to={`/brands/${slug}`}
                className="group block rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 filter group-hover:brightness-125 border-2 border-black hover:border-white"
              >
                <div
                  className="h-40 w-full bg-center bg-no-repeat bg-contain bg-white transition duration-300 group-hover:brightness-110"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                ></div>

                <div className="bg-black min-h-[75px] flex text-white text-center items-center justify-center py-2">
                  <span className="text-[14px] font-semibold">
                    {brand.brand_info || brand.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BrandsGrid;
