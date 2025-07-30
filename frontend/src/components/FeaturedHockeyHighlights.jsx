import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FeaturedHockeyHighlights = () => {
  const [featuredSticks, setFeaturedSticks] = useState([]);
  const [featuredJerseys, setFeaturedJerseys] = useState([]);
  const [featuredSkates, setFeaturedSkates] = useState([]);
  const [featuredHelmets, setFeaturedHelmets] = useState([]);

 const [errorMessage, setErrorMessage] = useState('');

useEffect(() => {
  setErrorMessage(''); // Vyčistí chybu pred novým načítaním

  // Dresy (jerseys)
  axios.get('http://localhost:3001/products/hockey/jersey')
    .then(response => {
      const highlightedJerseys = response.data.filter(item => item.highlight_title && item.description);
      setFeaturedJerseys(highlightedJerseys.slice(0, 2));
    })
    .catch(() => {
      setErrorMessage('Nepodarilo sa načítať hockey jerseys.');
    });

  // Korčule (skates)
  axios.get('http://localhost:3001/products/hockey/skates')
    .then(response => {
      const highlightedSkates = response.data.filter(item => item.highlight_title && item.description);
      setFeaturedSkates(highlightedSkates.slice(0, 2));
    })
    .catch(() => {
      setErrorMessage('Nepodarilo sa načítať hockey skates.');
    });

  // Prilby (helmets)
  axios.get('http://localhost:3001/products/hockey/helmets')
    .then(response => {
      const highlightedHelmets = response.data.filter(item => item.highlight_title && item.description);
      setFeaturedHelmets(highlightedHelmets.slice(0, 2));
    })
    .catch(() => {
      setErrorMessage('Nepodarilo sa načítať hockey helmets.');
    });
}, []);


  // Spojenie všetkých produktov do jedného poľa
  const featuredItems = [];

  for (let i = 0; i < 2; i++) {
    if (featuredJerseys[i]) {
      featuredItems.push({
        name: "Bauer",
        product: featuredJerseys[i],
        defaultBg: "/img/bauer-jersey.jpg",
      });
    }
    if (featuredSticks[i]) {
      featuredItems.push({
        name: "CCM",
        product: featuredSticks[i],
        defaultBg: "/img/ccm-stick.jpg",
      });
    }
    if (featuredSkates[i]) {
      featuredItems.push({
        name: "Reebok",
        product: featuredSkates[i],
        defaultBg: "/img/reebok-skates.jpg",
      });
    }
    if (featuredHelmets[i]) {
      featuredItems.push({
        name: "Warrior",
        product: featuredHelmets[i],
        defaultBg: "/img/warrior-helmet.jpg",
      });
    }
  }

  return (
    <section
      style={{
        backgroundImage: 'url(/img/bg-hockey2.jpg)',
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
            to={`/product/${product?.slug || ''}`}
            className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-lg hover:brightness-125 transition"
          >
            <h3 className="py-4 px-3 text-md md:min-h-[80px] font-bold bg-black text-white text-center">
              {product?.highlight_title || `${name} Featured Product`}
            </h3>
            <div className="relative h-64 overflow-hidden shadow-lg group">
              <img
                src={product ? `http://localhost:3001${product.image}` : defaultBg}
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

export default FeaturedHockeyHighlights;
