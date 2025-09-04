import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import bgImage from '../img/bg-brand.jpg';

const HomeBrands = () => {
  const [brands, setBrands] = useState([]);
  const baseURL = 'https://hoodshop-project.onrender.com';

  useEffect(() => {
    axios
      .get(`${baseURL}/api/brands/selected`)
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
      className="relative py-12 px-6 bg-black overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-6 text-white text-center">Top Brands</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          {brands.map(brand => {
            const slug = brand.name.toLowerCase();
            return (
              <Link
                key={brand.id}
                to={`/brands/${slug}`}
                className="group block rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 border-2 border-black hover:border-2 hover:border-white"
              >
                <div
                  className="h-40 w-full bg-center bg-no-repeat bg-contain bg-white transition duration-300 group-hover:brightness-110"
                  style={{
                    backgroundImage: `url(${baseURL}${brand.brand_image})`,
                  }}
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
            className="inline-block bg-black text-white px-6 py-5 rounded-xl font-semibold transition duration-300 text-2xl border-2 border-gray-400 hover:border-2 hover:border-white"
          >
            View All Brands
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBrands;
