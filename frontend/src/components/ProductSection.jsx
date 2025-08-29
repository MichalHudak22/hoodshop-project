// src/components/ProductSection.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const ProductSection = ({ title, products, backgroundImage }) => {
  const { handleAddToCart } = useContext(CartContext);

const handleAdd = (e) => {
  e.preventDefault();
  e.stopPropagation();

  // vždy iba productId a quantity
  const payload = {
    productId: product.id,       // použijeme id produktu
    quantity: product.quantity ?? 1, // default 1
  };

  console.log('FeaturedProductReversed Add to Cart payload:', payload);

  handleAddToCart(payload);
};


  return (
    <section className="relative py-12 px-6 bg-black overflow-hidden">
      {/* Overlay pozadie */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("${backgroundImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          opacity: 0.6,
        }}
      ></div>

      {/* Obsah sekcie */}
      <div className="relative z-10">
        <h2 className="text-xl md:text-2xl lg:text-4xl font-semibold text-center text-white mb-10">
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-screen-xl mx-auto">
          {products.map(product => {
            const productSlug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');

            let imageUrl = product.image;
            if (!imageUrl.startsWith('http')) {
              imageUrl = `${import.meta.env.VITE_API_BASE_URL}${imageUrl}`;
            }

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg"
              >
                <Link to={`/product/${productSlug}`} className="block">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-64 object-contain p-4 bg-gray-50"
                  />
                  <div className="p-4 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-1"><strong>Brand:</strong> {product.brand}</p>
                    <p className="text-green-600 font-bold text-lg mb-3">{product.price} €</p>
                  </div>
                </Link>

                <div className="px-4 pb-4 text-center">
                  <button
                    onClick={(e) => handleAdd(product, e)}
                    className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm transition duration-300"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
