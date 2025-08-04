import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FeaturedFootballighlights = () => {
  const [featuredBalls, setFeaturedBalls] = useState([]);
  const [featuredJerseys, setFeaturedJerseys] = useState([]);
  const [featuredCleats, setFeaturedCleats] = useState([]);

 const [errorMessage, setErrorMessage] = useState('');

useEffect(() => {
  setErrorMessage(''); // Vyčistí chybu pred načítaním

  // Lopty
  axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/football/ball`)
    .then(response => {
      const highlightedBalls = response.data.filter(ball => ball.highlight_title && ball.description);
      setFeaturedBalls(highlightedBalls.slice(0, 2));
    })
    .catch(() => {
      setErrorMessage('Nepodarilo sa načítať football lôpt.');
    });

  // Dresy
  axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/football/jersey`)
    .then(response => {
      const highlightedJerseys = response.data.filter(jersey => jersey.highlight_title && jersey.description);
      setFeaturedJerseys(highlightedJerseys.slice(0, 2));
    })
    .catch(() => {
      setErrorMessage('Nepodarilo sa načítať football dresov.');
    });

  // Kopačky
  axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/football/cleats`)
    .then(response => {
      const highlightedCleats = response.data.filter(cleat => cleat.highlight_title && cleat.description);
      setFeaturedCleats(highlightedCleats.slice(0, 2));
    })
    .catch(() => {
      setErrorMessage('Nepodarilo sa načítať football kopačiek.');
    });
}, []);


  // Spojenie všetkých produktov do jedného poľa
  const featuredItems = [];

for (let i = 0; i < 2; i++) {
  if (featuredJerseys[i]) {
    featuredItems.push({
      name: "Nike",
      product: featuredJerseys[i],
      defaultBg: "/img/nike-jersey.jpg",
    });
  }
  if (featuredCleats[i]) {
    featuredItems.push({
      name: "Puma",
      product: featuredCleats[i],
      defaultBg: "/img/puma-cleats.jpg",
    });
  }
  if (featuredBalls[i]) {
    featuredItems.push({
      name: "Adidas",
      product: featuredBalls[i],
      defaultBg: "/img/adidas-ball.jpg",
    });
  }
}

  return (
   <section
  style={{
    backgroundImage: 'url(/img/bg-football4.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  }}
  className="py-12 w-full"
>
  {/* Overlay pre priehľadné čierne pozadie */}
  <div className="xl:w-[80%] 2xl:w-[65%] m-auto xl:bg-black xl:bg-opacity-50 xl:border-[7px] xl:border-black xl:pb-8 xl:rounded-xl">
    <h2 className="text-xl md:text-2xl lg:text-3xl text-white bg-black xl:bg-transparent py-4 font-bold text-center mb-5">
      Discover More You May Enjoy
    </h2>

    <div className="w-full xl:w-[90%] 2xl:max-w-[90%] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
     {featuredItems.map(({ name, product, defaultBg }, index) => (
      <Link
        key={`${name}-${index}`}
        to={`/product/${product?.slug || ''}`}  // Tu ide URL podľa slug produktu
        className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-lg hover:brightness-125 transition"
      >
        {/* Nadpis */}
        <h3 className="py-4 px-3 text-md md:min-h-[80px] font-bold bg-black text-white text-center">
          {product?.highlight_title || `${name} Featured Product`}
        </h3>

        {/* Obrázok s efektom priblíženia */}
        <div className="relative h-64 overflow-hidden shadow-lg group">
          <img
            src={product ? `${import.meta.env.VITE_API_BASE_URL}
${product.image}` : defaultBg}
            alt={product?.highlight_title || `${name} default`}
            className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        </div>

        {/* Popis */}
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

export default FeaturedFootballighlights;
