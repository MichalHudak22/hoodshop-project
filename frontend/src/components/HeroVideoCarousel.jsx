import React, { useState, useEffect, useRef } from 'react';

const videoSources = [
  `${import.meta.env.VITE_API_BASE_URL}/video/football.mp4`,
  `${import.meta.env.VITE_API_BASE_URL}/video/hockey.mp4`,
  `${import.meta.env.VITE_API_BASE_URL}/video/cycling.mp4`,
];

export default function HeroVideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const duration = 10000;
    const fadeDuration = 2000;

    const timeoutId = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % videoSources.length);
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
    <div className="relative w-full min-h-[40vh] max-h-[40vh] overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoSources[currentIndex]}
        muted
        playsInline
        className={`w-full h-full object-cover object-top transition-opacity duration-1000 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Overlay s obsahom */}
      <div className="absolute inset-0 flex items-end justify-start md:px-12 pb-4 md:pb-8">
        <div className="bg-black bg-opacity-40 p-4 md:p-6 md:rounded-lg max-w-3xl text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-blue-200 drop-shadow-lg">
            Discover top sports equipment for football, hockey, and cycling
          </h1>
          <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 drop-shadow-md">
            Shop with us and collect loyalty points you can use as a discount on your next purchase!
          </p>

          <a
            href="/sports"
            className="inline-block px-6 py-2 md:px-8 md:py-3 bg-blue-700 hover:bg-blue-600 rounded-md font-semibold text-base md:text-lg transition"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}
