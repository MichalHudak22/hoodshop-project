import React, { useEffect, useState } from 'react';
import axios from 'axios';

function OrdersSummary() {
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0, totalUsedPoints: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [summaryRes, topProductsRes] = await Promise.all([
          axios.get('/api/orders/summary', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/orders/top-products', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        // Debug: čo naozaj dostávame
        console.log('summaryRes.data:', summaryRes.data);
        console.log('topProductsRes.data:', topProductsRes.data);

        // Bezpečne nastavíme summary
        if (summaryRes.data && typeof summaryRes.data === 'object') {
          setSummary({
            totalOrders: summaryRes.data.totalOrders ?? 0,
            totalRevenue: summaryRes.data.totalRevenue ?? 0,
            totalUsedPoints: summaryRes.data.totalUsedPoints ?? 0
          });
        } else {
          setSummary({ totalOrders: 0, totalRevenue: 0, totalUsedPoints: 0 });
        }

        // Bezpečne nastavíme topProducts
        if (Array.isArray(topProductsRes.data)) {
          setTopProducts(topProductsRes.data);
        } else {
          setTopProducts([]);
        }

      } catch (err) {
        setError('Nepodarilo sa načítať sumár objednávok alebo rebríček produktov.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  if (loading) return <p className="text-blue-300 text-center mt-4">Načítavam sumár objednávok...</p>;
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  const pointsToEuro = (points) => ((points || 0) / 10).toFixed(2);

  return (
    <div className="p-4 max-w-md mx-auto rounded-lg shadow-lg text-blue-300">
      <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-5 text-center text-blue-200">
        Orders Summary
      </h3>

      <div className="flex flex-col space-y-4">

        <div className="flex justify-between items-center bg-gray-700 bg-opacity-50 text-lg rounded-md p-3">
          <span>Total number of orders:</span>
          <span className="font-semibold bg-yellow-400 text-black text-3xl lg:text-4xl p-2 rounded-lg">
            {summary.totalOrders}
          </span>
        </div>

        <div className="flex flex-col bg-gray-700 bg-opacity-50 text-lg rounded-md p-3">
          <div className="flex justify-between">
            <span>Total loyalty points used:</span>
            <span className="font-semibold text-yellow-400 text-lg">
              {summary.totalUsedPoints.toLocaleString('sk-SK')}
            </span>
          </div>
          <div className="flex justify-between mt-1 text-[15px] italic">
            <span>Value in euros (10 points = 1 €):</span>
            <span className="text-yellow-400">{pointsToEuro(summary.totalUsedPoints)} €</span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-700 bg-opacity-50 text-lg rounded-md p-3">
          <span>Total revenue:</span>
          <span className="font-bold bg-green-400 text-black p-2 rounded-lg text-2xl lg:text-3xl 2xl:text-4xl">
            {summary.totalRevenue.toLocaleString('sk-SK')} €
          </span>
        </div>

        <div className="bg-gray-800 bg-opacity-70 p-4 rounded-md mt-4">
          <h4 className="text-lg font-semibold mb-2 text-center text-blue-200">Top 10 Best-Selling Products</h4>
          {(!Array.isArray(topProducts) || topProducts.length === 0) ? (
            <p className="text-sm text-gray-400 text-center">Žiadne dáta o predajoch.</p>
          ) : (
            <ul className="space-y-1 text-base text-yellow-300">
              {topProducts.map((product, index) => (
                <li key={product.id ?? index} className="flex justify-between">
                  <span className="font-medium text-white">{index + 1}. {product.name || 'Unknown'}</span>
                  <span>{product.quantity ?? 0} ks</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

export default OrdersSummary;
