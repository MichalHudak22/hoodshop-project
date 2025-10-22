import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import HeadTitle from '../components/HeadTitle';
import ProductsCarousel from '../components/ProductsCarousel';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import ProductSection from '../components/ProductSection';

const CyclingGloves = () => {
  const [gloves, setGloves] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  const baseURL = 'https://hoodshop-project.onrender.com'; // 🔹 produkčný backend

  useEffect(() => {
    axios.get(`${baseURL}/products/cycling/gloves`)
      .then(response => {
        console.log('Response from backend:', response.data);
        setGloves(Array.isArray(response.data) ? response.data : response.data.products || []);
      })
      .catch(error => {
        console.error('Chyba pri načítavaní cycling rukavíc:', error);
      });
  }, []);

  const handleAddToCart = async (glove) => {
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
          productId: glove.id,
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

  // Carousel slides
  const slides = gloves.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.image,
    slug: product.slug,
  }));

  // Výber 2 zvýraznených produktov
  const highlighted = gloves.filter(p => p.highlight_title && p.description);
  const featured1 = highlighted[0];
  const featured2 = highlighted[1];

  return (
    <div>
      {/* HEAD TITLE */}
      <HeadTitle
        title="Discover Premium"
        highlight="Cycling Gloves"
        bgImage="/img/cycling-bg.jpg"
        gradientFrom="orange-400"
        gradientVia="black"
        gradientTo="orange-400"
        description={
          <>
            Ride longer and more{' '}
            <span className="text-blue-200 font-medium">comfortably</span> with our selection of{' '}
            <span className="text-blue-200 font-medium">high-performance</span> cycling gloves, designed for grip, breathability, and endurance.
          </>
        }
      />

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

      {/* MESSAGE NA STRED OBRAZOVKY */}
      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default CyclingGloves;
