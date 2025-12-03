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
    const duration = 10000; // 10 sekúnd na jedno video (upravi podľa potreby)
    const fadeDuration = 2000; // 2 sekundy fade

    // Interval na prepínanie videí
    const timeoutId = setTimeout(() => {
      // Fade out
      setFade(false);

      // Po fade out prepni video a fade in
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
        setFade(true);
      }, fadeDuration);
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [currentIndex]);

  // Pri zmene videa načítaj a spusti prehrávanie
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => { });
    }
  }, [currentIndex]);

return (
 <div className="relative w-full min-h-[45vh] max-h-[45vh] overflow-hidden">
  <video
    ref={videoRef}
    src={videoSources[currentIndex]}
    muted
    playsInline
    className={`w-full h-full object-cover transition-opacity duration-1000 ${
      fade ? 'opacity-100' : 'opacity-0'
    }`}
  />

  <div className="absolute inset-0 flex items-end md:items-center justify-start md:px-4 md:pl-2 md:pt-32">
    <div className="bg-black bg-opacity-40 p-4 md:p-6 md:rounded-lg max-w-3xl text-white transform md:translate-y-12">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-blue-200 drop-shadow-lg">
        Discover top sports equipment for football, hockey, and cycling
      </h1>
      <p className="text-sm sm:text-base md:text-xl mb-4 md:mb-6 drop-shadow-md">
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
