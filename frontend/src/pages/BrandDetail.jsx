import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import ProductsCarousel from "../components/ProductsCarousel";
import ProductSection from "../components/ProductSection";
import { CartContext } from "../context/CartContext";

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hoodshop-project.onrender.com';

const BrandDetail = () => {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  // Načítanie všetkých značiek (len raz)
  useEffect(() => {
    const fetchAllBrands = async () => {
      try {
        const res = await fetch(`${baseURL}/api/brands`);
        const data = await res.json();
        setBrands(data);
      } catch (error) {
        console.error("Chyba pri načítaní značiek:", error);
      }
    };
    fetchAllBrands();
  }, []);

  // Načítanie brandu podľa slug (len keď sa slug zmení)
  useEffect(() => {
    const fetchBrandAndProducts = async () => {
      if (!slug) return;

      try {
        const res = await fetch(`${baseURL}/api/brands/${slug}`);
        const data = await res.json();
        setBrand(data);

        // fetch products len raz po načítaní brandu
        if (data?.name) {
          const productRes = await fetch(`${baseURL}/products/brand/${data.name.toLowerCase()}`);
          const productData = await productRes.json();
          setProducts(productData);
        }
      } catch (error) {
        console.error("Chyba pri načítaní brandu alebo produktov:", error);
      }
    };

    fetchBrandAndProducts();
  }, [slug]); // ⚠️ iba slug ako dependency

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
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Product added to cart!");
        refreshCartCount();
      } else {
        setMessage("Failed to add to cart: " + data.message);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Error adding to cart");
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!brand) return <div className="text-white text-center py-10">Načítava sa...</div>;

  return (
    <section className="bg-black">
      {/* Hero sekcia */}
      <section
        className="relative py-16 px-6 bg-black overflow-hidden"
        style={{
          backgroundImage: `url(${baseURL}${brand.background_image || "/img/bg-default.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-white text-center mb-2 md:mb-16">
          <img
            src={`${baseURL}${brand.brand_image}`}
            alt={brand.name}
            className="mx-auto h-40 object-contain mb-6 rounded-xl"
          />
          <h2 className="text-2xl xl:text-4xl font-semibold mb-6 italic">{brand.brand_info}</h2>
          <p className="text-lg xl:text-2xl leading-relaxed text-blue-100">{brand.brand_text}</p>
        </div>
      </section>

      {/* Carousel */}
      {products.length > 0 && (
        <div className="relative z-10 pt-8 pb-3 bg-black">
          <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-6 text-center">
            Products by {brand.name}
          </h2>
          <ProductsCarousel slides={products} handleAddToCart={handleAddToCart} />
        </div>
      )}

      {/* Lišta značiek */}
      <div className="bg-white py-2 px-4 shadow-inner my-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-center py-5">Our Brand Collection</h1>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 xl:gap-8">
          {brands.map((b) => (
            <a key={b.id} href={`/brands/${b.name.toLowerCase()}`}>
              <img
                src={`${baseURL}${b.brand_image}`}
                alt={b.name}
                className="sm:h-10 w-[94px] lg:h-full object-contain transition-transform duration-300 hover:scale-110"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Sekcia produktov */}
      {products.length > 0 && (
        <ProductSection
          title={`Explore ${brand.name} Products`}
          products={products}
          backgroundImage={`${baseURL}${brand.background_image || "/img/bg-default.jpg"}`}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Message */}
      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </section>
  );
};

export default BrandDetail;
