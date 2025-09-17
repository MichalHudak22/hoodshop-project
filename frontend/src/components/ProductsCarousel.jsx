import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
    <div className="relative">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        speed={1000}
        navigation
        pagination={{
          clickable: true,
          el: '.custom-pagination',
        }}
        spaceBetween={20}
        breakpoints={{
          320: { slidesPerView: 2 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
          1536: { slidesPerView: 6 },
        }}
        className="w-full h-[380px] relative z-20"
      >
        {slides.map((slide, index) => {
          const productSlug = slide.slug;
          const isLoading = loadingIds.includes(slide.id);

          // Použijeme iba URL z databázy (Cloudinary)
          const imageUrl = slide.image.trim();

          return (
            <SwiperSlide key={index}>
              <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-start p-4 text-center hover:shadow-xl transition relative">
                <h2 className="h-[42px] text-lg font-bold mb-1 text-black">
                  <Link
                    to={`/product/${productSlug}`}
                    className="hover:underline"
                  >
                    {slide.name}
                  </Link>
                </h2>

                <p className="text-sm text-gray-600 my-2">{slide.brand}</p>

                <Link to={`/product/${productSlug}`} className="block">
                  <img
                    src={imageUrl}
                    alt={slide.name}
                    className="h-[180px] mb-2 transition duration-300 hover:brightness-110"
                  />
                </Link>

                <p className="text-green-600 text-xl font-semibold mb-1">
                  {slide.price} €
                </p>

                <button
                  onClick={() => handleClick(slide)}
                  disabled={isLoading}
                  className={`mt-2 w-full py-2 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-600 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {isLoading ? 'Pridávam...' : 'Add to Cart'}
                </button>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="custom-pagination flex justify-center mt-4"></div>

      <style>{`
        .custom-pagination .swiper-pagination-bullet {
          background-color: #d1d5db;
          opacity: 1;
          width: 12px;
          height: 12px;
          margin: 6px;
          transition: background-color 0.3s ease;
        }
        .custom-pagination .swiper-pagination-bullet-active {
          background-color: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default ProductsCarousel;
