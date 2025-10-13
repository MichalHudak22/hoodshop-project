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

  // refs pre parallax sekcie
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const [section1Offset, setSection1Offset] = useState(0);
  const [section2Offset, setSection2Offset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const updateSectionOffset = (ref, setOffset) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const visible = Math.min(Math.max(windowHeight - rect.top, 0), rect.height);
        setOffset(visible);
      };

      updateSectionOffset(section1Ref, setSection1Offset);
      updateSectionOffset(section2Ref, setSection2Offset);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // načítanie carousel produktov
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/products/carousel-top`)
      .then((res) => res.json())
      .then((data) => setCarouselSlides(data))
      .catch((e) => console.error('Chyba pri načítaní carousel produktov:', e));
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
    <div className="bg-black text-white min-h-screen flex flex-col">
      <HeroVideoCarousel />

      {/* ✅ PARALLAX SEKCIa 1 */}
      <div ref={section1Ref} className="relative mt-6 md:mt-14 overflow-hidden min-h-screen">
        <div
          className="absolute inset-0 opacity-70 will-change-transform transition-all duration-75 ease-linear"
          style={{
            backgroundImage: "url('/img/bg-sports.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: `center ${section1Offset * 0.3}px`,
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

      {/* ✅ PARALLAX SEKCIa 2 */}
      <div ref={section2Ref} className="relative mt-16 overflow-hidden min-h-screen">
        <div
          className="absolute inset-0 opacity-70 will-change-transform transition-all duration-75 ease-linear"
          style={{
            backgroundImage: "url('/img/bg-sports.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: `center ${section2Offset * 0.3}px`,
          }}
        />
        <div className="relative z-10">
          <HomeBrands />
        </div>

        {/* ✅ Toast message */}
        {message && (
          <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
