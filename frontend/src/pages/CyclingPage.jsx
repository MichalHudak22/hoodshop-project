import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import ProductsCarousel from '../components/ProductsCarousel';
import CyclingCategories from '../components/CyclingCategories';
import FeaturedCyclingHighlights from '../components/FeaturedCyclingHighlights';

// Pomocná funkcia na vykreslenie farebného textu ako vo ColorfulTextEditor
const parseColoredText = (text) => {
  const pattern = /\[color=(#[0-9a-fA-F]{6}|[a-zA-Z]+)\](.*?)\[\/color\]/g;
  const parts = [];
  let lastIndex = 0;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const [wholeMatch, color, content] = match;
    const index = match.index;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <span key={index} style={{ color }}>
        {content}
      </span>
    );

    lastIndex = index + wholeMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const CyclingPage = () => {
  const [carouselProducts, setCarouselProducts] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  // Title & paragraph state
  const [title, setTitle] = useState('');
  const [paragraph, setParagraph] = useState('');

  // Section key pre cycling header
  const sectionKey = 'cycling-home-header';

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/cycling/carousel`)
      .then(response => setCarouselProducts(response.data))
      .catch(error => console.error('Chyba pri načítavaní carousel produktov:', error));
  }, []);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/config/section/${sectionKey}`)
      .then(response => {
        const data = response.data || {};
        setTitle(data.title || '');
        setParagraph(data.paragraph || '');
      })
      .catch(error => {
        console.error('Chyba pri načítaní textu sekcie:', error);
      });
  }, [sectionKey]);

  const handleAddToCart = async (product) => {
    const sessionId = localStorage.getItem("sessionId");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(!token && sessionId ? { "x-session-id": sessionId } : {}),
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

        // automaticky zmizne po 3 sekundách
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage("Failed to add to cart: " + (data.message || 'Unknown error'));
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Error adding to cart");
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const slides = carouselProducts.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.image,
  }));

  return (
    <div>
      {/* HEAD TITLE */}
      <section
        className="relative text-center py-10 px-4 bg-gradient-to-br from-orange-400 via-black to-orange-400 text-white overflow-hidden border-b-4 border-black"
      >
        <div className="absolute inset-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
            {parseColoredText(title)}
          </h1>
          <p className="text-md md:text-xl lg:text-2xl leading-relaxed drop-shadow-sm max-w-4xl mx-auto">
            {parseColoredText(paragraph)}
          </p>
        </div>
      </section>

      {/* CYCLING CATEGORIES */}
      <CyclingCategories />

      {/* CAROUSEL */}
      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* FEATURED HIGHLIGHTS */}
      <FeaturedCyclingHighlights />

        {/* ✅ MESSAGE NA STRED OBRAZOVKY */}
      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default CyclingPage;
