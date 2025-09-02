import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BrandHeroSection from '../components/BrandHeroSection';
import bgImage from '../img/bg-brand.jpg';
import BrandsGrid from '../components/BrandsGrid';  // import nového komponentu

function Brands() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/brands`)
      .then(response => setBrands(response.data))
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
          {brands.map((brand) => (
            <a key={brand.id} href={`/brands/${brand.name.toLowerCase()}`}>
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${brand.brand_image}`}
                alt={brand.name}
                className="h-6 sm:h-10 w-[64px] object-contain transition-transform duration-300 hover:scale-110"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Grid so všetkými značkami cez nový komponent */}
      <BrandsGrid brands={brands} bgImage={bgImage} />
    </section>
  );
}

export default Brands;
