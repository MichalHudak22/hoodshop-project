import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';  // pridáme import kontextu
import ProductsCarousel from '../components/ProductsCarousel';
import ProductSection from '../components/ProductSection';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';

const HockeySticks = () => {
  const [sticks, setSticks] = useState([]);
  const { refreshCartCount } = useContext(CartContext);  // použijeme kontext
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/hockey/sticks`)
      .then(response => setSticks(response.data))
      .catch(error => console.error('Chyba pri načítavaní hokejok:', error));
  }, []);

  const handleAddToCart = async (stick) => {
    const sessionId = localStorage.getItem("sessionId");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(!token && sessionId && { "x-session-id": sessionId }),
        },
        body: JSON.stringify({
          productId: stick.id,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Product added to cart!");
        refreshCartCount();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage("Failed to add to cart: " + data.message);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Error adding to cart");
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // UPRAVA slides podľa vzoru iných stránok - žiadny full URL v image, používame name, bez buttonText a link
  const slides = sticks.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.image,  // relatívna cesta bez localhost
  }));

  const highlighted = sticks.filter(s => s.highlight_title && s.description);
  const featured1 = highlighted[0];
  const featured2 = highlighted[1];

  return (
    <div>
     {/* HEAD TITLE */}
<section
  className="relative text-center py-10 px-4 bg-gradient-to-br from-blue-600 via-black to-blue-900 text-white overflow-hidden border-b-4 border-black"
>
  <div className="absolute inset-0"></div>
  <div className="relative z-10 max-w-4xl mx-auto">
    <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
      Discover Elite <span className="text-blue-200">Hockey Sticks</span>
    </h1>
    <p className="text-md md:text-lg lg:text-xl text-gray-100 leading-relaxed">
      Dominate the rink with precision-engineered hockey sticks designed for{' '}
      <span className="text-blue-200 font-medium">power</span>,{' '}
      <span className="text-blue-200 font-medium">accuracy</span>, and{' '}
      <span className="text-blue-200 font-medium">performance</span>.
    </p>
  </div>
</section>


      {/* 1st FEATURED PRODUCT */}
      {featured1 && (
        <FeaturedProduct
          product={featured1}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-hockey4.jpg"
        />
      )}

      {/* CAROUSEL */}
      <div className="py-10 bg-black">
       <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* 2nd FEATURED PRODUCT */}
      {featured2 && (
        <FeaturedProductReversed
          product={featured2}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-hockey4.jpg"
        />
      )}

      {/* ALL PRODUCTS GRID */}
      <ProductSection
        title="Discover All Sticks"
        backgroundImage="/img/bg-hockey2.jpg"
        products={sticks}
        onAddToCart={handleAddToCart}
      />

      {/* ✅ MESSAGE NA STRED OBRAZOVKY */}
      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default HockeySticks;
