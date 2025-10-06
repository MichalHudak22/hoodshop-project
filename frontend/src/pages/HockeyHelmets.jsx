import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import ProductsCarousel from '../components/ProductsCarousel';
import ProductSection from '../components/ProductSection';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import { CartContext } from '../context/CartContext';

const HockeyHelmets = () => {
  const [helmets, setHelmets] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  // Base URL pre Render
  const baseURL = "https://hoodshop-project.onrender.com";

  useEffect(() => {
    axios.get(`${baseURL}/products/hockey/helmets`)
      .then(response => setHelmets(response.data))
      .catch(error => console.error('Chyba pri načítavaní hokejových prilieb::', error));
  }, []);

  const handleAddToCart = async (product) => {
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
          productId: product.id,
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

  // Slides pre carousel s absolútnymi URL
  const slides = helmets.map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    image: p.image,
    slug: p.slug, 
  }));

  // Zvýraznené produkty
  const highlighted = helmets.filter(h => h.highlight_title && h.description);
  const featured1 = highlighted[0];
  const featured2 = highlighted[1];

  return (
    <div>
      {/* HEAD TITLE */}
      <section className="relative text-center py-10 px-4 bg-gradient-to-br from-blue-600 via-black to-blue-900 text-white overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0 bg-[url('/img/football-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
            Premium <span className="text-blue-200">Hockey Helmets</span>
          </h1>
          <p className="text-[14px] md:text-lg lg:text-xl text-gray-100 leading-relaxed">
            Stay protected on the ice with our top-tier selection of hockey helmets offering the best in{' '}
            <span className="text-blue-200 font-medium">safety</span> and{' '}
            <span className="text-blue-200 font-medium">comfort</span>.
          </p>
        </div>
      </section>

      {/* 1st FEATURED */}
      {featured1 && (
        <FeaturedProduct
          product={featured1}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-hockey4.jpg"
        />
      )}

      {/* CAROUSEL */}
      <div className="py-10 bg-black border-y-4 border-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* 2nd FEATURED */}
      {featured2 && (
        <FeaturedProductReversed
          product={featured2}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-hockey4.jpg"
        />
      )}

      {/* ALL PRODUCTS */}
      <ProductSection
        title="Discover All Helmets"
        backgroundImage="/img/bg-hockey2.jpg"
        products={helmets}
        onAddToCart={handleAddToCart}
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

export default HockeyHelmets;
