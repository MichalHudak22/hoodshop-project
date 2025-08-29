import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllOrders = () => {
  const API = import.meta.env.VITE_API_BASE_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API}/api/orders/admin`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (Array.isArray(res.data)) {
          setOrders(res.data);
        } else if (Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
        } else {
          console.warn('Neočakávaný formát dát z API:', res.data);
          setOrders([]);
        }
      } catch (err) {
        console.error('Chyba pri načítaní objednávok:', err);
        setError('Nepodarilo sa načítať objednávky.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API]);

  const terms = searchTerm.toLowerCase().split(' ').filter(Boolean);

  const filteredOrders = Array.isArray(orders) 
  ? orders.filter(order => 
      terms.every(term =>
        (order.order_number || '').toLowerCase().includes(term) ||
        (order.user_email || '').toLowerCase().includes(term)
      )
    )
  : [];

  return (
    <div className="bg-black bg-opacity-70 md:rounded-xl p-5 border border-gray-700">
      <h2 className="text-2xl lg:text-3xl font-semibold text-center text-blue-200 mb-4">All Orders</h2>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by order number or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-[50%] px-4 py-2 rounded-lg bg-gray-900 text-white text-center placeholder-gray-400 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="rounded-lg shadow-lg max-h-[650px] xl:max-h-[900px] mb-10 overflow-y-scroll scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-800 max-w-5xl mx-auto mt-10">
        {loading && <p className="text-green-400 text-center">Načítavam objednávky...</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}

        {filteredOrders.length > 0 ? (
          <div className="space-y-7 md:px-10">
            {filteredOrders.map((order) => {
              const subtotal = order.items.reduce(
                (sum, item) => sum + item.quantity * parseFloat(item.item_price),
                0
              );
              const delivery = parseFloat(order.delivery_price);
              const pointsValue = order.used_points * 0.1;
              const finalTotal = subtotal + delivery - pointsValue;

              return (
                <div
                  key={order.id}
                  className="border border-blue-100 rounded-xl p-6 shadow-sm bg-gray-900 text-white"
                >
                  <div className="text-xl font-bold text-blue-300 text-center mt-2 md:mt-0">
                    Order No. {order.order_number}
                  </div>

                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                    <div className="text-sm text-center text-blue-100 mt-2">
                      {new Date(order.created_at).toLocaleDateString('sk-SK')}{' '}
                      {new Date(order.created_at).toLocaleTimeString('sk-SK', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:justify-between md:gap-10">
                    <div className="flex-1 space-y-2 mb-6 md:mb-0">
                      <p><strong className="text-blue-200">User email:</strong> {order.user_email}</p>
                      <p><strong className="text-blue-200">Full name:</strong> {order.full_name}</p>
                      <p><strong className="text-blue-200">Profile email:</strong> {order.profile_email}</p>
                      <p><strong className="text-blue-200">Address:</strong> {order.address}, {order.city} {order.postal_code}</p>
                      <div className="mt-4 space-y-1">
                        <p><strong className="text-blue-200">Payment method:</strong> {order.payment_method}</p>
                        <p><strong className="text-blue-200">Used points:</strong> {order.used_points}</p>
                      </div>
                    </div>


                    <div className="flex-1">
                      {order.items && order.items.length > 0 && (
                        <div>
                          <p className="font-semibold mb-2 text-blue-200">Products:</p>
                          <ul className="list-none list-inside space-y-1 text-sm md:text-md">
                            {order.items.map((item, index) => {
                              const price = parseFloat(item.item_price);
                              const total = item.quantity * price;
                              return (
                                <li key={index}>
                                  {item.product_name} – {item.quantity}×{price.toFixed(2)} € = {total.toFixed(2)} €
                                </li>
                              );
                            })}
                          </ul>

                          <div className="mt-4 space-y-1 text-right">
                            <p>
                              <span className="text-blue-200">Subtotal: </span>
                              {subtotal.toFixed(2)} €
                            </p>
                            <p>
                              <span className="text-blue-200">+ Shipping: </span>
                              {order.delivery_method} ({delivery.toFixed(2)} €)
                            </p>
                            <p>
                              <span className="text-blue-200">- Used points: </span>
                              -{order.used_points} ({pointsValue.toFixed(2)} €)
                            </p>
                            <hr className="my-1 border-gray-600" />
                            <p className="text-green-400 text-xl font-bold">
                              Final Price: {finalTotal.toFixed(2)} €
                            </p>
                          </div>

                        </div>
                      )}
                    </div>
                  </div>


                </div>
              );
            })}
          </div>
        ) : (
          !loading && <p className="text-center text-lg text-red-500">No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default AllOrders;
