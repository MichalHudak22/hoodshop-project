import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FeaturedProductReversed = ({ product, handleAddToCart, backgroundImage }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // inicializácia pri načítaní
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!product) return null;

  const productSlug = product.name.toLowerCase().replace(/\s+/g, "-");
  const baseURL = "https://hoodshop-project.onrender.com"; // produkčný backend

  return (
    <section
      className={`relative py-10 md:py-16 px-6 mb-10 bg-black overflow-hidden border-b-4 border-black ${
        !isMobile ? "bg-fixed" : ""
      }`}
      style={{
        backgroundImage: `url(${backgroundImage || "/img/bg-football3.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      <div className="relative z-10">
        <h1 className="text-center text-xl md:text-2xl lg:text-4xl font-bold text-white mb-4 lg:mb-10">
          {product.highlight_title}
        </h1>

   <div className="flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8">
          {/* Obrázok produktu */}
          <Link to={`/product/${productSlug}`}>
            <img
              src={
                product.image.startsWith("http")
                  ? product.image
                  : `${baseURL}${product.image}`
              }
              alt={product.name}
              className="w-[70%] mx-auto md:max-w-sm rounded-lg shadow-xl object-contain hover:brightness-110 transition"
            />
          </Link>

          {/* Info sekcia */}
          <div className="max-w-xl text-center md:text-right">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-100">
              {product.name}
            </h2>
            <p className="text-lg text-gray-100 pb-2">
              <strong>Brand:</strong> {product.brand}
            </p>

            <div className="flex flex-row-reverse md:flex-row gap-3 items-center w-[250px] m-auto md:w-full md:justify-end">
              <button
                onClick={() => handleAddToCart(product)}
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 mb-2 font-bold rounded-xl text-lg transition duration-300"
              >
                Add to Cart
              </button>
              <p className="text-lg md:text-2xl bg-black bg-opacity-70 p-3 rounded-xl text-green-500 font-bold mb-2">
                {product.price} €
              </p>
            </div>

            <p className="text-[16px] md:text-lg text-white p-3 rounded-xl text-center md:text-right">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductReversed;
