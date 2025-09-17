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
        // Použitie plnej URL backendu
        const BACKEND_URL = 'https://hoodshop-project.onrender.com';

        const [summaryRes, topProductsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/orders/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BACKEND_URL}/api/orders/top-products`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);



        // Validácia dát
        const summaryData = summaryRes && typeof summaryRes.data === 'object' ? summaryRes.data : null;
        const topProductsData = Array.isArray(topProductsRes?.data) ? topProductsRes.data : [];

        setSummary(summaryData || { totalOrders: 0, totalRevenue: 0, totalUsedPoints: 0 });
        setTopProducts(topProductsData);

      } catch (err) {
        console.error('Chyba pri načítaní dát:', err);
        setError('Nepodarilo sa načítať sumár objednávok alebo rebríček produktov.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  if (loading) return <p className="text-center text-blue-400">Načítavam sumár objednávok...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const pointsToEuro = (points) => (points / 10).toFixed(2);

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-5 text-center text-blue-200">
        Orders Summary
      </h3>

      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center bg-gray-700 bg-opacity-50 p-3 rounded-md">
          <span>Total number of orders:</span>
          <span className="font-semibold bg-yellow-400 text-black text-3xl lg:text-4xl p-2 rounded-lg">
            {summary.totalOrders ?? 0}
          </span>
        </div>

        <div className="flex flex-col bg-gray-700 bg-opacity-50 rounded-md p-3">
          <div className="flex justify-between">
            <span>Total loyalty points used:</span>
            <span className="font-semibold text-yellow-400 text-lg">
              {summary.totalUsedPoints?.toLocaleString('sk-SK') ?? 0}
            </span>
          </div>
          <div className="flex justify-between mt-1 text-[15px] italic">
            <span>Value in euros (10 points = 1 €):</span>
            <span className="text-yellow-400">{pointsToEuro(summary.totalUsedPoints ?? 0)} €</span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-700 bg-opacity-50 rounded-md p-3">
          <span>Total revenue:</span>
          <span className="font-bold bg-green-400 text-black p-2 rounded-lg text-2xl lg:text-3xl 2xl:text-4xl">
            {summary.totalRevenue?.toLocaleString('sk-SK') ?? 0} €
          </span>
        </div>

        {/* Top produkty */}
        <div className="bg-gray-700 bg-opacity-50 p-3 rounded-md mt-4">
          <h4 className="text-lg font-semibold mb-2 text-center text-blue-200">
            Top 10 Best-Selling Products
          </h4>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">Žiadne dáta o predajoch.</p>
          ) : (
            <ul className="space-y-2 lg:space-y-3 text-base">
              {topProducts.map((product, index) => (
                <li key={index} className="flex justify-between">
                  <span className="flex items-center">
                    <span className="text-yellow-300 font-medium mr-2">{index + 1}.</span>
                    <span className="text-white font-medium">{product.name || 'Unknown'}</span>
                  </span>
                  <span className="text-yellow-300">{product.quantity ?? 0} ks</span>
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
