import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FeaturedFootballHighlights = () => {
  const [featuredBalls, setFeaturedBalls] = useState([]);
  const [featuredJerseys, setFeaturedJerseys] = useState([]);
  const [featuredCleats, setFeaturedCleats] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL;

  const fixCloudinaryUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('https//')) return url.replace('https//', 'https://');
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  };

  useEffect(() => {
    setErrorMessage('');

    const fetchProducts = async (type, setter) => {
      try {
        const res = await axios.get(`${apiBase}/products/football/${type}`);
        const highlighted = res.data
          .filter((p) => p.highlight_title && p.description)
          .map((p) => ({ ...p, image: fixCloudinaryUrl(p.image) }));
        setter(highlighted.slice(0, 2));
      } catch (err) {
        console.error(`[ERROR] Fetch ${type} failed:`, err);
        setErrorMessage(`Nepodarilo sa načítať football ${type}.`);
      }
    };

    fetchProducts('ball', setFeaturedBalls);
    fetchProducts('jersey', setFeaturedJerseys);
    fetchProducts('cleats', setFeaturedCleats);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [apiBase]);

  const featuredItems = [];
  for (let i = 0; i < 2; i++) {
    if (featuredJerseys[i]) featuredItems.push({ name: 'Nike', product: featuredJerseys[i] });
    if (featuredCleats[i]) featuredItems.push({ name: 'Puma', product: featuredCleats[i] });
    if (featuredBalls[i]) featuredItems.push({ name: 'Adidas', product: featuredBalls[i] });
  }

  return (
    <section
      className={`w-full ${!isMobile ? 'bg-fixed' : ''}`}
      style={{
        backgroundImage: 'url(/img/bg-football4.jpg)',
        backgroundSize: isMobile ? 'contain' : 'cover', // mobile - contain, desktop - cover
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto px-4 lg:px-5 xl:px-8 py-14 lg:py-6 bg-black bg-opacity-50 lg:bg-opacity-50 lg:border-[7px] lg:border-black lg:rounded-lg max-w-5xl xl:max-w-[80%]">
        <h2 className="text-xl md:text-2xl lg:text-3xl text-white bg-black xl:bg-transparent py-4 font-bold text-center mb-5">
          Discover More You May Enjoy
        </h2>

        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

        <div className="w-full xl:w-[90%] 2xl:max-w-[90%] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {featuredItems.map(({ name, product }, index) => (
            <Link
              key={`${name}-${index}`}
              to={`/product/${product?.slug || ''}`}
              className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-lg hover:brightness-125 transition"
            >
              <h3 className="py-4 px-3 text-[14px] md:min-h-[80px] font-bold bg-black text-white text-center">
                {product?.highlight_title || `${name} Featured Product`}
              </h3>

              <div className="relative h-64 overflow-hidden shadow-lg group">
                <img
                  src={fixCloudinaryUrl(product.image)}
                  alt={product.highlight_title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              </div>

              <div className="bg-black bg-opacity-90 text-white text-sm p-4 flex-1">
                {product?.description || `Explore top products from ${name}.`}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedFootballHighlights;
