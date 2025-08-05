import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BrandHeroSection from '../components/BrandHeroSection';
import bgImage from '../img/bg-brand.jpg';
import BrandsGrid from '../components/BrandsGrid';  // import nového komponentu
import { Link } from 'react-router-dom';

function Brands() {
  const [brands, setBrands] = useState([]);

  // Pomocná funkcia na overenie, či je URL full (s http alebo https)
  function isFullUrl(url) {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/brands`)
      .then(response => {
        setBrands(response.data);
      })
      .catch(err => console.error('Error loading brands:', err));
  }, []);

  return (
    <section className="bg-gray-900">
      {/* Carousel */}
      <div className="relative z-10">
        <BrandHeroSection />
      </div>

      {/* Lišta s logami značiek */}
      <div className="bg-white py-2 px-4 shadow-inner">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 xl:gap-8">
          {brands.map((brand) => {
            const imgUrl = isFullUrl(brand.brand_image)
              ? brand.brand_image
              : `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/${brand.brand_image.replace(/^\//, '')}`;


            return (
              <Link key={brand.id} to={`/brands/${brand.name.toLowerCase()}`}>
                <img
                  src={imgUrl}
                  alt={brand.name}
                  className="h-6 sm:h-10 w-[64px] object-contain transition-transform duration-300 hover:scale-110"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid so všetkými značkami cez nový komponent */}
      <BrandsGrid brands={brands} bgImage={bgImage} />
    </section>
  );
}

export default Brands;
