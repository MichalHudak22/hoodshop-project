import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CustomCarousel = ({ slides }) => {
  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      spaceBetween={30}
      slidesPerView={1}
      loop={true}
      autoplay={{
        delay: 6000,
        disableOnInteraction: false,
      }}
      speed={1000}
      navigation
      pagination={{ clickable: true }}
      className="w-full h-[500px] xl:h-[650px] border-b-8 border-black"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
        <div
          className="w-full h-full bg-cover bg-center flex items-end justify-start xl:items-center xl:pl-12"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="bg-black bg-opacity-40 p-5 text-white max-w-lg text-left ml-0 xl:max-w-3xl xl:rounded-2xl xl:p-10">
            <h2 className="text-3xl font-luckiest font-bold tracking-widest text-outline mb-4 xl:text-[45px]">{slide.title}</h2>
            <p className="mb-4 xl:text-[24px]">{slide.description}</p>
             <Link to={slide.link}>
  <button className="bg-blue-700 hover:bg-blue-600 px-6 py-2 w-[210px] text-[22px] rounded-full text-white font-semibold transition duration-300">
    {slide.buttonText}
  </button>
</Link>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CustomCarousel;
