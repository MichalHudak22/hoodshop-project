import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import ProductsCarousel from '../components/ProductsCarousel';
import FootballCategories from '../components/FootballCategories';
import FeaturedFootballHighlights from '../components/FeaturedFootballHighlights';

const FootballPage = () => {
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [titleFromDB, setTitleFromDB] = useState('');
  const [paragraphFromDB, setParagraphFromDB] = useState('');
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');
  

useEffect(() => {
  // Načítanie carousel produktov
  axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/football/carousel`)
    .then(response => {
      setCarouselProducts(response.data);
    })
    .catch(error => {
      console.error('Chyba pri načítaní carousel produktov:', error);
    });

  // Načítanie titulku a paragrafu z backendu
  axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/config/section/football-home-header`)
    .then(response => {
      setTitleFromDB(response.data.title || '');
      setParagraphFromDB(response.data.paragraph || '');
    })
    .catch(error => {
      console.error('Chyba pri načítaní header textu:', error);
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


  const slides = carouselProducts.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.image,
  }));

  // Funkcia na parsovanie [color=#xxxxxx]text[/color]
  function parseColorTags(text) {
    if (!text) return null;
    const regex = /\[color=(#[0-9a-fA-F]{6})\](.*?)\[\/color\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <span key={match.index} style={{ color: match[1] }}>
          {match[2]}
        </span>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
  }

  return (
    <div>
      {/* HEAD TITLE */}
     <section
  className="relative text-center py-10 px-4 bg-gradient-to-br from-green-600 via-black to-green-700 text-white overflow-hidden border-b-4 border-black"
>
  <div className="absolute inset-0 bg-[url('/img/football-bg.jpg')] bg-cover bg-center opacity-20"></div>
  <div className="relative z-10 max-w-4xl mx-auto">
    <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
      {parseColorTags(titleFromDB)}
    </h1>
    <p className="text-[14px] md:text-xl lg:text-2xl leading-relaxed drop-shadow-sm">
      {parseColorTags(paragraphFromDB)}
    </p>
  </div>
</section>


      {/* FOOTBALL CATEGORIES */}
      <FootballCategories />

      {/* CAROUSEL */}
      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* FEATURED HIGHLIGHTS */}
      <FeaturedFootballHighlights />

        {/* ✅ MESSAGE NA STRED OBRAZOVKY */}
      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default FootballPage;
