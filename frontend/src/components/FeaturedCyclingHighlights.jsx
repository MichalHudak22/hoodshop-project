import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FeaturedCyclingHighlights = () => {
  const [featuredBikes, setFeaturedBikes] = useState([]);
  const [featuredClothes, setFeaturedClothes] = useState([]);
  const [featuredHelmets, setFeaturedHelmets] = useState([]);

 const [errorMessage, setErrorMessage] = useState('');

// ...

useEffect(() => {
  setErrorMessage(''); // vymažeme chybu pred novým fetchom

  axios.get('${import.meta.env.VITE_API_BASE_URL}
/products/cycling/bike')
    .then(response => {
      const highlighted = response.data.filter(p => p.highlight_title && p.description);
      setFeaturedBikes(highlighted.slice(0, 2));
    })
    .catch(() => {
      setErrorMessage('Nepodarilo sa načítať cycling bikes.');
    });

  axios.get('${import.meta.env.VITE_API_BASE_URL}
/products/cycling/clothes')
    .then(response => {
      const highlighted = response.data.filter(p => p.highlight_title && p.description);
      setFeaturedClothes(highlighted.slice(0, 2));
    })
    .catch(() => {
      setErrorMessage('Nepodarilo sa načítať cycling clothes.');
    });

  axios.get('${import.meta.env.VITE_API_BASE_URL}
/products/cycling/helmets')
    .then(response => {
      const highlighted = response.data.filter(p => p.highlight_title && p.description);
      setFeaturedHelmets(highlighted.slice(0, 2));
    })
    .catch(() => {
      setErrorMessage('Nepodarilo sa načítať cycling helmets.');
    });
}, []);


  const featuredItems = [];

  for (let i = 0; i < 2; i++) {
    if (featuredClothes[i]) {
      featuredItems.push({
        name: "Santini",
        product: featuredClothes[i],
        defaultBg: "/img/cycling-clothes.jpg",
      });
    }
    if (featuredHelmets[i]) {
      featuredItems.push({
        name: "Kask",
        product: featuredHelmets[i],
        defaultBg: "/img/cycling-helmets.jpg",
      });
    }
    if (featuredBikes[i]) {
      featuredItems.push({
        name: "Specialized",
        product: featuredBikes[i],
        defaultBg: "/img/cycling-bikes.jpg",
      });
    }
  }

  return (
    <section
      style={{
        backgroundImage: 'url(/img/bg-cycling3.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
      className="py-12 w-full"
    >
      <div className="xl:w-[80%] 2xl:w-[65%] m-auto xl:bg-black xl:bg-opacity-50 xl:border-[7px] xl:border-black xl:pb-8 xl:rounded-xl">
        <h2 className="text-xl md:text-2xl lg:text-3xl text-white bg-black xl:bg-transparent py-4 font-bold text-center mb-5">
          Discover More You May Enjoy
        </h2>

        <div className="w-full xl:w-[90%] 2xl:max-w-[90%] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
         {featuredItems.map(({ name, product, defaultBg }, index) => (
        <Link
          key={`${name}-${index}`}
          to={`/product/${product?.slug || ''}`}
          className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-lg hover:brightness-125 transition"
        >
          <h3 className="py-4 px-3 text-md md:min-h-[80px] font-bold bg-black text-white text-center">
            {product?.highlight_title || `${name} Featured Product`}
          </h3>
          <div className="relative h-64 overflow-hidden shadow-lg group">
            <img
              src={product ? `${import.meta.env.VITE_API_BASE_URL}
${product.image}` : defaultBg}
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

export default FeaturedCyclingHighlights;
