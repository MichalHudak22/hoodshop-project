import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import ProductsCarousel from '../components/ProductsCarousel';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import ProductSection from '../components/ProductSection';

const FootballJerseys = () => {
  const [jerseys, setJerseys] = useState([]);
  const [message, setMessage] = useState('');
  const { handleAddToCart } = useContext(CartContext);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/products/football/jersey`)
      .then((res) => setJerseys(res.data))
      .catch((err) => console.error('Chyba pri načítavaní football dresov:', err));
  }, []);

  // Wrapper pre hlášku
  const addToCartWithMessage = async (product) => {
    try {
      await handleAddToCart(product);
      setMessage('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      setMessage('Error adding to cart');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const highlightedJerseys = jerseys.filter((j) => j.highlight_title && j.description);
  const featuredJersey = highlightedJerseys[0];
  const featuredJersey2 = highlightedJerseys[1];

  const slides = jerseys.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.image,
  }));

  return (
    <div>
      {/* HEAD TITLE */}
      <section className="relative text-center py-10 px-4 bg-gradient-to-br from-green-600 via-black to-green-700 text-white overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
            Discover Iconic <span className="text-blue-200">Football Jerseys</span>
          </h1>
          <p className="text-md md:text-lg lg:text-xl text-gray-100 leading-relaxed">
            Explore our exclusive collection of football jerseys – from legendary clubs and national teams,
            featuring designs worn by your favorite players on the world’s biggest stages like the{' '}
            <span className="text-blue-200 font-medium">UEFA Champions League</span> and{' '}
            <span className="text-blue-200 font-medium">World Cup</span> finals.
          </p>
        </div>
      </section>

      {/* 1st FEATURED JERSEY */}
      <FeaturedProduct
        product={featuredJersey}
        handleAddToCart={addToCartWithMessage}
        backgroundImage="/img/bg-football3.jpg"
      />

      {/* CAROUSEL */}
      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={addToCartWithMessage} />
      </div>

      {/* 2nd FEATURED JERSEY */}
      <FeaturedProductReversed
        product={featuredJersey2}
        handleAddToCart={addToCartWithMessage}
        backgroundImage="/img/bg-football3.jpg"
      />

      {/* ALL JERSEYS */}
      <ProductSection
        title="All Football Jerseys"
        backgroundImage="/img/bg-football5.jpg"
        products={jerseys}
        onAddToCart={addToCartWithMessage}
      />

      {/* MESSAGE */}
      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default FootballJerseys;
