import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BrandHeroSection = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/brands`)
      .then(response => {
        // Vyfiltrujeme len Adidas, Bauer a Trek
        const selectedBrands = response.data.filter(brand =>
          ['adidas', 'bauer', 'trek'].includes(brand.name.toLowerCase())
        );
        setBrands(selectedBrands);
      })
      .catch(err => console.error('Error loading brands:', err));
  }, []);

  if (brands.length === 0) {
    return <div className="text-center py-20">Loading brands...</div>;
  }

  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      spaceBetween={30}
      slidesPerView={1}
      loop={true}
      autoplay={{
        delay: 10000,
        disableOnInteraction: false,
      }}
      speed={1000}
      navigation
      pagination={{ clickable: true }}
      className="w-full h-[500px] xl:h-[600px] border-b-8 border-black"
    >
      {brands.map((brand) => {
        const slug = brand.name.toLowerCase();
        return (
          <SwiperSlide key={brand.id}>
            <div
              className="w-full h-full bg-cover bg-center relative flex items-end justify-start xl:items-center xl:pl-12"
              style={{
                backgroundImage: `url(${new URL(brand.background_image, import.meta.env.VITE_API_BASE_URL)})`
              }}

            >
              {/* Logo značky v pravom hornom rohu */}
              <img
                src={new URL(brand.brand_image, import.meta.env.VITE_API_BASE_URL).toString()}
                alt={`${brand.name} logo`}
                className="absolute top-6 right-6 w-24 xl:w-32 h-auto z-20 bg-white p-2 rounded-lg shadow-md"
              />

              {/* Text a tlačidlo */}
              <div className="bg-black bg-opacity-50 p-5 text-white max-w-lg text-left ml-0 xl:max-w-3xl xl:rounded-2xl xl:p-10 z-10">
                <h2 className="text-3xl font-luckiest font-bold tracking-widest text-outline mb-4 xl:text-[45px]">{brand.name}</h2>
                <p className="mb-4 xl:text-[24px]">{brand.brand_info}</p>
                <p className="mb-4 xl:text-2xl text-blue-200 font-semibold">{brand.brand_Text}</p>
                <Link to={`/brands/${slug}`}>
                  <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 w-[210px] text-[22px] rounded-xl text-white font-semibold transition duration-300">
                    Explore {brand.name}
                  </button>
                </Link>
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default BrandHeroSection;
