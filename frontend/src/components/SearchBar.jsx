import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const SearchBar = ({ onResultClick }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://hoodshop-project.onrender.com";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const wrapperRef = useRef(null);

  // Debounce vyhľadávanie
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 0) {
        axios
          .get(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`)
          .then((res) => {
            setResults(Array.isArray(res.data) ? res.data : []);
          })
          .catch((err) => {
            console.error("Search error:", err);
            setResults([]);
          });
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, API_BASE_URL]);

  // Zatvorenie pri kliknutí mimo komponent
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultClick = () => {
    setResults([]);
    if (onResultClick) {
      onResultClick();
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="Search product..."
        className="w-full p-2 rounded-md focus:outline-none text-black border border-gray-300"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <ul className="absolute z-50 w-full lg:w-[280px] bg-white border-4 border-blue-300 mt-1 rounded-md shadow-lg max-h-72 overflow-y-auto">
          {results.map((product) => (
            <li
              key={product.id}
              className="p-2 hover:bg-blue-100 text-black cursor-pointer"
            >
              <Link
                to={`/product/${product.slug}`}
                className="flex items-center gap-2 p-2 hover:bg-blue-100 text-black"
                onClick={handleResultClick}
              >
                <img
                  src={`${API_BASE_URL}${product.image}`}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <div>
                  <span className="font-semibold text-sm">{product.name}</span>
                  <span className="ml-1 text-gray-500 text-sm">({product.type})</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
