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

        if (!res.ok) {
          throw new Error(`Chyba pri načítaní: ${res.status}`);
        }

        const data = await res.json();

        // Kontrola, či naozaj je pole
        if (!Array.isArray(data)) {
          throw new Error("Neočakávaná odpoveď zo servera");
        }

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

  if (loading) return <p className="text-gray-500">Načítavam top zákazníkov...</p>;
  if (error) return <p className="text-red-500">Chyba: {error}</p>;

  return (
    <section className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🏆 Top 5 zákazníkov</h2>
      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Meno</th>
            <th className="p-2 border">Počet objednávok</th>
            <th className="p-2 border">Spolu zaplatené (€)</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, index) => (
            <tr key={c.user_id} className="text-center">
              <td className="p-2 border font-semibold">{index + 1}</td>
              <td className="p-2 border">{c.full_name}</td>
              <td className="p-2 border">{c.orders_count}</td>
              <td className="p-2 border">{Number(c.total_spent).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
