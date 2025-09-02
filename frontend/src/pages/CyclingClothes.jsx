import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import ProductsCarousel from '../components/ProductsCarousel';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import ProductSection from '../components/ProductSection';

const CyclingClothesPage = () => {
  const [clothes, setClothes] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  const baseURL = 'https://hoodshop-project.onrender.com'; // 🔹 produkčný backend

  useEffect(() => {
    axios.get(`${baseURL}/products/cycling/clothes`)
      .then(response => {
        console.log('Response from backend:', response.data);
        setClothes(Array.isArray(response.data) ? response.data : response.data.products || []);
      })
      .catch(error => {
        console.error('Chyba pri načítavaní cyklistického oblečenia:', error);
      });
  }, []);

  const handleAddToCart = async (item) => {
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
          productId: item.id,
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

  // Carousel slides s absolútnou URL
  const slides = clothes.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: `${baseURL}${product.image}`, // 🔹 produkčný backend URL
  }));

  const highlighted = clothes.filter(p => p.highlight_title && p.description);
  const featured1 = highlighted[0];
  const featured2 = highlighted[1];

  return (
    <div>
      {/* HEAD TITLE */}
      <section className="relative text-center py-10 px-4 bg-gradient-to-br from-orange-400 via-black to-orange-400 text-white overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0 bg-[url('/img/cycling-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
            Premium <span className="text-blue-200">Cycling Clothes</span> for Every Ride
          </h1>
          <p className="text-md md:text-lg lg:text-xl text-gray-100 leading-relaxed">
            Discover our performance cycling wear, designed to keep you{' '}
            <span className="text-blue-200 font-medium">cool</span>,{' '}
            <span className="text-blue-200 font-medium">dry</span>, and{' '}
            <span className="text-blue-200 font-medium">fast</span> on the road or trail, even during long, intense rides.
          </p>
        </div>
      </section>

      {featured1 && (
        <FeaturedProduct 
          product={featured1} 
          handleAddToCart={handleAddToCart} 
          backgroundImage="/img/bg-cycling4.jpg" 
        />
      )}

      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {featured2 && (
        <FeaturedProductReversed
          product={featured2}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-cycling4.jpg"
        />
      )}

      <ProductSection
        title="Best Cycling Clothes"
        backgroundImage="/img/bg-cycling3.jpg"
        products={clothes}
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

export default CyclingClothesPage;
