import { useEffect, useState } from "react";

export default function TopCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchTopCustomers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/top-customers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error(`Chyba pri načítaní: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Neočakávaná odpoveď zo servera");

        setCustomers(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCustomers();
  }, [API_BASE_URL]);

  if (loading) return <p className="text-center text-blue-400">Načítavam top zákazníkov...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="p-6 max-w-3xl mx-auto">
      <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-5 text-center text-blue-200">
        Top 5 zákazníkov
      </h3>

      {customers.length === 0 ? (
        <p className="text-center text-gray-400">Žiadne dáta k dispozícii.</p>
      ) : (
        <div className="flex flex-col space-y-3">
          {customers.map((c, index) => (
            <div
              key={c.user_id}
              className="flex justify-between items-center bg-gray-700 bg-opacity-50 p-3 rounded-md"
            >
              <span className="font-semibold text-yellow-300 w-6">{index + 1}</span>
              <span className="flex-1 text-white">{c.full_name}</span>
              <span className="font-bold text-yellow-400 px-2 py-1 rounded-lg bg-gray-900">
                {c.orders_count} orders
              </span>
              <span className="font-bold text-green-400 px-2 py-1 rounded-lg bg-gray-900">
                {Number(c.total_spent).toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
