import React, { useState, useEffect, useRef } from 'react';

const videoSources = [
  `${import.meta.env.VITE_API_BASE_URL}/video/football.mp4`,
  `${import.meta.env.VITE_API_BASE_URL}/video/hockey.mp4`,
  `${import.meta.env.VITE_API_BASE_URL}/video/cycling.mp4`,
];

export default function HeroVideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true); // true = visible, false = transparent
  const videoRef = useRef(null);

  useEffect(() => {
    const duration = 10000; // 10 sekúnd na jedno video
    const fadeDuration = 2000; // 2 sekundy fade

    const timeoutId = setTimeout(() => {
      setFade(false);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
        setFade(true);
      }, fadeDuration);
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [currentIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  return (
    <div className="relative w-full h-[40vh] overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoSources[currentIndex]}
        muted
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Overlay s obsahom */}
      <div className="absolute inset-0 flex items-center justify-start px-4 md:px-12">
        <div className="bg-black bg-opacity-40 p-4 md:p-6 md:rounded-lg max-w-3xl text-white">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-blue-200 drop-shadow-lg">
            Discover top sports equipment for football, hockey, and cycling
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-4 md:mb-6 drop-shadow-md">
            Shop with us and collect loyalty points you can use as a discount on your next purchase!
          </p>

          <a
            href="/sports"
            className="inline-block px-4 py-1 md:px-6 md:py-2 bg-blue-700 hover:bg-blue-600 rounded-md font-semibold text-sm md:text-base transition"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}
