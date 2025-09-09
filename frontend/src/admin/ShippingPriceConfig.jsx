import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SHIPPING_METHODS = ['DPD', 'GLS', 'Slovak Post'];

export default function ShippingPriceConfig() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dirtyFields, setDirtyFields] = useState(new Set());
  const [message, setMessage] = useState(null); // hláška pre používateľa
  const [messageType, setMessageType] = useState(''); // success | info | error
useEffect(() => {
  async function fetchPrices() {
    try {
      const res = await axios.get(`${baseURL}/api/config/shipping-prices`);

      if (Array.isArray(res.data)) {
        const pricesObj = {};
        res.data.forEach(({ name, price }) => {
          pricesObj[name] = price != null ? price.toString() : '';
        });
        setPrices(pricesObj);
      } else {
        setError('Očakával som pole s cenami dopravy');
      }
    } catch (e) {
      setError('Chyba pri načítaní cien dopravy');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  fetchPrices();
}, [baseURL]); // <- pridaj aj baseURL ako dependency


  const handleChange = (method, value) => {
    if (
      value === '' ||
      (/^\d{0,3}(\.\d{0,2})?$/.test(value) && parseFloat(value) <= 999.99)
    ) {
      setPrices(prev => ({ ...prev, [method]: value }));
      setDirtyFields(prev => new Set(prev).add(method));
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const changedMethods = Array.from(dirtyFields);
    if (changedMethods.length === 0) {
      showMessage('No prices have been changed.', 'info');
      return;
    }

    try {
      await Promise.all(
        changedMethods.map(name =>
          axios.post('/api/config/shipping-prices', {
            name,
            price: prices[name] === '' ? 0 : parseFloat(prices[name])
          })
        )
      );

      setDirtyFields(new Set());
      showMessage('Delivery prices have been saved.', 'success');
    } catch (e) {
      setError('Chyba pri ukladaní cien dopravy');
      console.error(e);
    }
  };

  if (loading) return <p>Načítavam ceny dopravy...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <>
      <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold my-3 text-center text-blue-200">Set Delivery Prices</h3>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4">
        {SHIPPING_METHODS.map(method => (
          <div key={method} className="mb-4 flex items-center gap-3">
            <label
              htmlFor={method}
              className="font-bold text-gray-100 w-28 text-right"
            >
              {method}:
            </label>
            <input
              id={method}
              type="text"
              value={prices[method] ?? ''}
              onChange={e => handleChange(method, e.target.value)}
              className="flex-1 p-1.5 text-gray-900 max-w-[100px] bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              inputMode="decimal"
              pattern="^\d*\.?\d{0,2}$"
            />
          </div>
        ))}
        <div className="flex justify-center mt-6 flex-col items-center">
          <button
            type="submit"
            className="w-[190px] text-center bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 text-sm md:text-lg rounded-lg transition"
          >
            Save delivery prices
          </button>

          {/* Info Message with fixed height */}
          <div className="h-6 mt-2">
            {message && (
              <p className={`text-sm transition-opacity duration-300 ${
                messageType === 'success' ? 'text-green-400' : 'text-yellow-300'
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
