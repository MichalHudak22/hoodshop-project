import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const ProductsCarousel = ({ slides, handleAddToCart }) => {
  const [loadingIds, setLoadingIds] = useState([]);

  const handleClick = async (product) => {
    setLoadingIds((prev) => [...prev, product.id]);

    try {
      await handleAddToCart(product);
    } catch (error) {
      alert('Chyba pri pridávaní do košíka');
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== product.id));
    }
  };

  return (
    <>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        speed={1000}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        breakpoints={{
          320: { slidesPerView: 2 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
          1536: { slidesPerView: 6 },
        }}
        className="w-full h-[420px] relative z-20"
      >
        {slides.map((slide, index) => {
          const productSlug = slide.name.toLowerCase().replace(/\s+/g, '-');
          const isLoading = loadingIds.includes(slide.id);

          // Priprav správnu URL obrázka
          const imageUrl = slide.image.startsWith('http')
            ? slide.image
            : `${baseURL}${slide.image}`;

          return (
            <SwiperSlide key={index}>
              <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-start p-4 text-center hover:shadow-xl transition relative">
                <Link to={`/product/${productSlug}`} className="flex-grow hover:brightness-110">
                  <h2 className="text-[14px] md:text-lg font-bold mb-1 text-black">{slide.name}</h2>
                  <p className="text-sm text-gray-600 mb-2">{slide.brand}</p>
                  <img
                    src={imageUrl}
                    alt={slide.name}
                    className="h-[180px] md:h-[240px] mb-2 transition duration-300"
                  />
                  <p className="text-green-600 text-xl font-semibold mb-1">{slide.price} €</p>
                </Link>
                <button
                  onClick={() => handleClick(slide)}
                  disabled={isLoading}
                  className={`mt-2 w-full py-2 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-600 transition ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Pridávam...' : 'Add to Cart'}
                </button>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style>{`
        .swiper-pagination-bullet {
          background-color: #d1d5db; 
          opacity: 1;
          width: 12px;
          height: 12px;
          margin: 6px;
          transition: background-color 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          background-color: #2563eb;
        }

        .swiper-pagination {
          bottom: -5px !important;
          z-index: 20; 
          position: absolute; 
        }
      `}</style>
    </>
  );
};

export default ProductsCarousel;
