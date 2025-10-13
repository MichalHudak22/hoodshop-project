import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import bgImage from '../img/bg-brand.jpg';

const HomeBrands = () => {
  const [brands, setBrands] = useState([]);
  const [offsetY, setOffsetY] = useState(0);
  const sectionRef = useRef(null);

  // Scroll paralax
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const visible = Math.min(Math.max(windowHeight - rect.top, 0), rect.height);
      setOffsetY(visible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch brands
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/brands/selected`)
      .then(response => setBrands(response.data))
      .catch(error => console.error('Error loading brands:', error));
  }, []);

  const brandTexts = {
    Nike: 'Inspires athletic performance',
    Adidas: 'Brand for athletes',
    Bauer: 'Hockey dominance',
    Trek: 'Leaders in cycling'
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-8 md:py-12 px-6 bg-black overflow-hidden min-h-screen"
    >
      {/* Paralax pozadie */}
      <div
        className="absolute inset-0 opacity-70 will-change-transform transition-transform duration-75 ease-linear"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: `center ${offsetY * 0.4}px`, // 💫 rovnaká rýchlosť ako HomeCategories
        }}
      />

      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-white text-center">Top Brands</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          {brands.map(brand => {
            const slug = brand.name.toLowerCase();
            return (
              <Link
                key={brand.id}
                to={`/brands/${slug}`}
                className="group block rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 border-2 border-black hover:border-white"
              >
                <div
                  className="h-40 w-full bg-center bg-no-repeat bg-contain bg-white transition duration-300 group-hover:brightness-110"
                  style={{ backgroundImage: `url(${import.meta.env.VITE_API_BASE_URL}${brand.brand_image})` }}
                ></div>
                <div className="bg-black text-white text-center py-2">
                  <span className="text-lg font-semibold">
                    {brandTexts[brand.name] || brand.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            to="/brands"
            className="inline-block bg-black text-white px-6 py-5 rounded-xl font-semibold transition duration-300 text-2xl border-2 border-gray-400 hover:border-white"
          >
            View All Brands
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBrands;
