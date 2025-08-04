import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import ProductsCarousel from "../components/ProductsCarousel";
import ProductSection from "../components/ProductSection"; // Dôležité
import { CartContext } from "../context/CartContext";

const BrandDetail = () => {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAllBrands = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/brands`);
        const data = await res.json();
        setBrands(data);
      } catch (error) {
        console.error("Chyba pri načítaní značiek:", error);
      }
    };
    fetchAllBrands();
  }, []);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/brands/${slug}`);
        const data = await res.json();
        setBrand(data);

        if (data && data.name) {
          const productRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/brand/${data.name}`);
          const productData = await productRes.json();
          setProducts(productData);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Chyba pri načítaní:", error);
      }
    };
    fetchBrand();
  }, [slug]);

  const handleAddToCart = async (product) => {
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

  if (!brand) {
    return <div className="text-white text-center py-10">Načítava sa...</div>;
  }

  return (
    <section className="bg-black">
      {/* Hero sekcia */}
      <section
        className="relative py-16 px-6 bg-black overflow-hidden"
        style={{
          backgroundImage: `url(${import.meta.env.VITE_API_BASE_URL}
${brand.background_image || "/img/bg-default.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Čierne overlay pozadie */}
        <div className="absolute inset-0 bg-black opacity-40 z-0"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-white text-center mb-16">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}
${brand.brand_image}`}
            alt={brand.name}
            className="mx-auto h-40 object-contain mb-6 rounded-xl"
          />
          <h2 className="text-2xl xl:text-4xl font-semibold mb-6 italic">{brand.brand_info}</h2>
          <p className="text-lg xl:text-2xl leading-relaxed text-blue-100">{brand.brand_text}</p>
        </div>
      </section>

      {/* Carousel */}
      {products.length > 0 && (
        <div className="relative z-10 p-8 bg-black">
          <h2 className="text-4xl font-semibold text-white mb-6 text-center bg-black">
            Products by {brand.name}
          </h2>
          <ProductsCarousel slides={products} handleAddToCart={handleAddToCart} />
        </div>
      )}


      {/* Lišta s logami značiek mimo overlay sekcie */}
      <div className="bg-white py-2 px-4 shadow-inner my-8">
        <h1 className="text-4xl font-semibold text-center py-5">Our Brand Collection</h1>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 xl:gap-8">
          {brands.map((brand) => (
            <a key={brand.id} href={`/brands/${brand.name.toLowerCase()}`}>
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${brand.brand_image}`}
                alt={brand.name}
                className="sm:h-10 w-[94px] lg:h-full object-contain transition-transform duration-300 hover:scale-110"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Sekcia s ďalšími produktmi */}
      <ProductSection
        title={`Explore ${brand.name} Products`}
        products={products}
        backgroundImage={`${import.meta.env.VITE_API_BASE_URL}
${brand.background_image || "/img/bg-default.jpg"}`}

        onAddToCart={handleAddToCart}
      />

      {/* ✅ MESSAGE NA STRED OBRAZOVKY */}
      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </section>
  );
};

export default BrandDetail;
