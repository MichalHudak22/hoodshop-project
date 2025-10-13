import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FeaturedHockeyHighlights = () => {
  const [featuredSticks, setFeaturedSticks] = useState([]);
  const [featuredJerseys, setFeaturedJerseys] = useState([]);
  const [featuredSkates, setFeaturedSkates] = useState([]);
  const [featuredHelmets, setFeaturedHelmets] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const fixCloudinaryUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('https')) return url;
    return `${baseURL}${url}`;
  };

  useEffect(() => {
    setErrorMessage('');

    const fetchProducts = async (category, setter) => {
      try {
        const res = await axios.get(`${baseURL}/products/hockey/${category}`);
        const highlighted = res.data
          .filter((p) => p.highlight_title && p.description)
          .map((p) => ({ ...p, image: fixCloudinaryUrl(p.image) }));
        setter(highlighted.slice(0, 2));
      } catch (err) {
        console.error(`Nepodarilo sa načítať hockey ${category}:`, err);
        setErrorMessage(`Nepodarilo sa načítať hockey ${category}.`);
      }
    };

    fetchProducts('jersey', setFeaturedJerseys);
    fetchProducts('skates', setFeaturedSkates);
    fetchProducts('helmets', setFeaturedHelmets);
    fetchProducts('sticks', setFeaturedSticks);
  }, [baseURL]);

  // Spojíme všetky produkty do jedného poľa, max 6
  const featuredItems = [];
  const categories = [
    { items: featuredJerseys, name: 'Bauer', defaultBg: '/img/bauer-jersey.jpg' },
    { items: featuredSkates, name: 'Reebok', defaultBg: '/img/reebok-skates.jpg' },
    { items: featuredHelmets, name: 'Warrior', defaultBg: '/img/warrior-helmet.jpg' },
  ];

  let count = 0;
  for (let i = 0; i < 2 && count < 6; i++) {
    for (const cat of categories) {
      if (cat.items[i] && count < 6) {
        featuredItems.push({
          name: cat.name,
          product: cat.items[i],
          defaultBg: cat.defaultBg,
        });
        count++;
      }
    }
  }

  return (
    <section
      className="py-12 w-full bg-fixed"
      style={{
        backgroundImage: 'url(/img/bg-hockey2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="xl:w-[80%] 2xl:w-[65%] m-auto xl:bg-black xl:bg-opacity-50 xl:border-[7px] xl:border-black xl:pb-8 xl:rounded-xl">
        <h2 className="text-xl md:text-2xl lg:text-3xl text-white bg-black xl:bg-transparent py-4 font-bold text-center mb-5">
          Discover More You May Enjoy
        </h2>

        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

        <div className="w-full xl:w-[90%] 2xl:max-w-[90%] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {featuredItems.map(({ name, product, defaultBg }, index) => (
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
                  src={product ? product.image : defaultBg}
                  alt={product?.highlight_title || `${name} default`}
                  className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-110"
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

export default FeaturedHockeyHighlights;
