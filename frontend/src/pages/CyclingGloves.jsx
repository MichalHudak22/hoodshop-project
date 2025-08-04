import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import ProductsCarousel from '../components/ProductsCarousel';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import ProductSection from '../components/ProductSection';

const CyclingGloves = () => {
  const [gloves, setGloves] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

 useEffect(() => {
  axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/cycling/gloves`)
    .then(response => {
      setGloves(response.data);
    })
    .catch(error => {
      console.error('Chyba pri načítavaní cycling rukavíc:', error);
    });
}, []);

const handleAddToCart = async (jersey) => {
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
        productId: jersey.id,
        quantity: 1,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage("Product added to cart!");
      refreshCartCount();

      // automaticky zmizne po 3 sekundách
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

  const slides = gloves.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.image, // relatívna cesta bez prefixu
  }));

  // Výber 2 zvýraznených produktov
  const highlighted = gloves.filter(p => p.highlight_title && p.description);
  const featured1 = highlighted[0];
  const featured2 = highlighted[1];

  return (
    <div>
      {/* HEAD TITLE */}
      <section
        className="relative text-center py-10 px-4 bg-gradient-to-br from-orange-400 via-black to-orange-400 text-white overflow-hidden border-b-4 border-black"
      >
        <div className="absolute inset-0 bg-[url('/img/cycling-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
            Discover Premium <span className="text-blue-200">Cycling Gloves</span>
          </h1>
         <p className="text-md md:text-lg lg:text-xl text-gray-100 leading-relaxed">
            Ride longer and more{' '}
            <span className="text-blue-200 font-medium">comfortably</span> with our selection of{' '}
            <span className="text-blue-200 font-medium">high-performance</span> cycling gloves, designed for grip, breathability, and endurance.
          </p>

        </div>
      </section>


      {/* 1st FEATURED GLOVE */}
      {featured1 && (
        <FeaturedProduct
          product={featured1}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-cycling4.jpg"
        />
      )}

      {/* CAROUSEL */}
      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* 2nd FEATURED GLOVE */}
      {featured2 && (
        <FeaturedProductReversed
          product={featured2}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-cycling4.jpg"
        />
      )}

      {/* ALL GLOVES */}
      <ProductSection
        title="Best Cycling Gloves"
        backgroundImage="/img/bg-cycling3.jpg"
        products={gloves}
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

export default CyclingGloves;
