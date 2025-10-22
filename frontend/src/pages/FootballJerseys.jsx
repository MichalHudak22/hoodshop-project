import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import ProductsCarousel from '../components/ProductsCarousel';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import ProductSection from '../components/ProductSection';

const FootballJerseys = () => {
  const [jerseys, setJerseys] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  const baseURL = 'https://hoodshop-project.onrender.com';

  useEffect(() => {
    axios.get(`${baseURL}/products/football/jersey`)
      .then(response => {
        console.log('Response from backend:', response.data);
        setJerseys(Array.isArray(response.data) ? response.data : response.data.products || []);
      })
      .catch(error => {
        console.error('Chyba pri načítavaní football dresov:', error);
        setJerseys([]);
      });
  }, []);

  const handleAddToCart = async (jersey) => {
    const sessionId = localStorage.getItem("sessionId");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${baseURL}/api/cart`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(!token && sessionId && { "x-session-id": sessionId }),
        },
        body: JSON.stringify({
          productId: jersey.id,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Product added to cart!");
        refreshCartCount();
      } else {
        setMessage("Failed to add to cart: " + data.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Error adding to cart");
    }

    setTimeout(() => setMessage(''), 3000);
  };

const slides = Array.isArray(jerseys) ? jerseys.map(product => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  price: product.price,
  image: product.image, // iba Cloudinary URL
  slug: product.slug,
})) : [];


  const highlightedJerseys = Array.isArray(jerseys)
    ? jerseys.filter(jersey => jersey.highlight_title && jersey.description)
    : [];

  const featuredJersey = highlightedJerseys[0];
  const featuredJersey2 = highlightedJerseys[1];

  return (
    <div>
      <section className="relative text-center py-5 px-4 bg-gradient-to-br from-green-600 via-black to-green-700 text-white overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0 bg-[url('/img/football-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 tracking-wide drop-shadow-md">
            Discover Iconic <span className="text-blue-200">Football Jerseys</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-100 leading-relaxed">
            Explore our exclusive collection of football jerseys – from legendary clubs and national teams,
            featuring designs worn by your favorite players on the world’s biggest stages like the{' '}
            <span className="text-blue-200 font-medium">UEFA Champions League</span> and{' '}
            <span className="text-blue-200 font-medium">World Cup</span> finals.
          </p>
        </div>
      </section>

      <FeaturedProduct
        product={featuredJersey}
        handleAddToCart={handleAddToCart}
        backgroundImage="/img/bg-football3.jpg"
      />

      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      <FeaturedProductReversed
        product={featuredJersey2}
        handleAddToCart={handleAddToCart}
        backgroundImage="/img/bg-football3.jpg"
      />

      <ProductSection
        title="All Football Jerseys"
        backgroundImage="/img/bg-football5.jpg"
        products={jerseys}
        onAddToCart={handleAddToCart}
      />

      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default FootballJerseys;
