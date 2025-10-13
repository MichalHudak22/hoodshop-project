import { useRef, useState, useEffect, useContext } from 'react';
import HeroVideoCarousel from '../components/HeroVideoCarousel';
import HomeCategories from '../components/HomeCategories';
import ProductsCarousel from '../components/ProductsCarousel';
import HomeBrands from '../components/HomeBrands';
import { CartContext } from '../context/CartContext';

function Home() {
  const [carouselSlides, setCarouselSlides] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  const sectionRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // kontrola, či ide o mobil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // paralax scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const visible = Math.min(Math.max(windowHeight - rect.top, 0), rect.height);
      setOffset(visible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // načítanie carousel produktov
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/products/carousel-top`)
      .then(res => res.json())
      .then(data => setCarouselSlides(data))
      .catch(e => console.error('Chyba pri načítaní carousel produktov:', e));
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

  return (
    <div className="bg-black text-white flex flex-col min-h-screen">
      <HeroVideoCarousel />

      {/* ✅ PARALLAX HomeCategories */}
      <div ref={sectionRef} className="relative mt-6 md:mt-14 overflow-hidden">
        <div
          className="absolute inset-0 opacity-70 will-change-transform transition-transform duration-75 ease-linear"
          style={{
            backgroundImage: "url('/img/bg-sports.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: isMobile
              ? `center ${offset * 0.4}px` // JS paralax na mobile
              : 'center',                // fixed na desktop
            backgroundAttachment: isMobile ? 'scroll' : 'fixed',
          }}
        />
        <div className="relative z-10">
          <HomeCategories />
        </div>
      </div>

      {/* ✅ Popular Products */}
      <div className="pt-5">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center">
          Popular Products
        </h2>
        <ProductsCarousel slides={carouselSlides} handleAddToCart={handleAddToCart} />
      </div>

      {/* ✅ HomeBrands */}
      <HomeBrands />

      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
}

export default Home;
