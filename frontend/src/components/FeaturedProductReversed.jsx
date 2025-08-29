// src/components/FeaturedProductReversed.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const FeaturedProductReversed = ({ product, backgroundImage }) => {
  if (!product) return null;

  const { handleAddToCart } = useContext(CartContext);
  const productSlug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');

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
    <section className="relative py-16 px-6 mb-10 bg-black overflow-hidden border-b-4 border-black">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage || '/img/bg-football3.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.5,
        }}
      ></div>

      <div className="relative z-10">
        <h1 className="text-center text-xl md:text-2xl lg:text-4xl font-bold text-white mb-4 lg:mb-10">
          {product.highlight_title}
        </h1>

        <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-8">
          <Link to={`/product/${productSlug}`}>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${product.image}`}
              alt={product.name}
              className="max-w-sm rounded-lg shadow-xl object-contain hover:brightness-110"
            />
          </Link>

          <div className="max-w-xl text-center md:text-right">
            <h2 className="text-2xl font-bold mb-2 text-gray-100">{product.name}</h2>
            <p className="text-lg text-gray-100 pb-2"><strong>Brand:</strong> {product.brand}</p>

            <div className="flex flex-row-reverse md:flex-row gap-3 items-center w-[250px] m-auto md:w-full md:justify-end">
              <button
                onClick={handleAdd}
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 mb-2 font-bold rounded-xl text-lg transition duration-300"
              >
                Add to Cart
              </button>

              <p className="text-lg md:text-2xl bg-black bg-opacity-70 p-3 rounded-xl text-green-500 font-bold mb-2">
                {product.price} €
              </p>
            </div>

            <p className="text-lg text-white p-3 rounded-xl text-center md:text-left">{product.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductReversed;
