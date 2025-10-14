// src/components/ProductSection.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ProductSection = ({ title, products, backgroundImage, onAddToCart }) => {
  const [isMobile, setIsMobile] = useState(false);
  const baseURL = "https://hoodshop-project.onrender.com"; // produkčný backend

  // Sleduje veľkosť okna a určuje, či sme na mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // spusti pri načítaní
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      className={`relative py-12 px-2 md:px-6 bg-black overflow-hidden ${
        !isMobile ? "bg-fixed" : ""
      }`}
      style={{
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay pozadie */}
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      {/* Obsah sekcie */}
      <div className="relative z-10">
        <h2 className="text-xl md:text-2xl lg:text-4xl font-semibold text-center text-white mb-10">
          {title}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 max-w-screen-xl mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white bg-opacity-50 rounded-lg shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Link okolo obrázka a názvu, ale nie okolo tlačidla */}
              <Link to={`/product/${product.slug}`} className="block">
                <img
                  src={
                    product.image.startsWith("http")
                      ? product.image
                      : `${baseURL}${product.image}`
                  }
                  alt={product.name}
                  className="w-full h-64 object-contain p-2 md:p-4 bg-gray-50"
                />
                <div className="p-2 md:p-4 text-center">
                  <h3 className="min-h-[56px] text-lg md:text-xl font-semibold text-gray-800 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <strong>Brand:</strong> {product.brand}
                  </p>
                  <p className="text-green-600 font-bold text-lg mb-3">
                    {product.price} €
                  </p>
                </div>
              </Link>

              {/* Tlačidlo mimo Link, aby sa dalo kliknúť bez navigácie */}
              <div className="px-2 md:px-4 pb-4 text-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Zabránime kliknutiu na Link
                    if (onAddToCart) onAddToCart(product);
                  }}
                  className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold transition duration-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
