import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const baseURL = 'https://hoodshop-project.onrender.com'; // produkčné URL

function UserDetailPage() {
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [error, setError] = useState(null);
  const [ordersError, setOrdersError] = useState(null);

  // 1) Načítanie cien dopravy z DB
  useEffect(() => {
    axios
      .get(`${baseURL}/api/config/shipping-prices`)
      .then(res => {
        const opts = (res.data || []).map(o => ({
          name: o.name,
          price: parseFloat(o.price),
        }));
        setShippingOptions(opts);
      })
      .catch(err => console.error('Chyba pri načítaní cien dopravy:', err));
  }, []);

  // 2) Načítanie používateľa
  useEffect(() => {
    if (!token) {
      setError('Missing token – you are not logged in');
      return;
    }
    fetch(`${baseURL}/user/admin/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load user data');
        return res.json();
      })
      .then(setUser)
      .catch(err => setError(err.message));
  }, [id, token]);

  // 3) Načítanie histórie objednávok
  useEffect(() => {
    if (!token) return;
    fetch(`${baseURL}/api/order-history/history/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load orders');
        return res.json();
      })
      .then(setOrders)
      .catch(err => setOrdersError(err.message));
  }, [id, token]);

  if (error)
    return <p className="text-red-500 text-center">{error}</p>;
  if (!user)
    return <p className="text-white text-center">Loading user data...</p>;

  const ordersCount = orders.length;
  const totalSpent = orders.reduce(
    (sum, o) => sum + parseFloat(o.total_price || 0),
    0
  );

  return (
    <div
      className="relative min-h-screen text-white flex flex-col items-center bg-fixed bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-30 z-0" />

      <div className="relative z-10 w-full md:px-6 pb-12 space-y-10">
        {/* Nadpis */}
        <div className="pt-8 md:pb-8 text-center bg-black w-full">
          <h1 className="text-2xl lg:text-4xl font-bold text-white">
            User Details for <span className="text-blue-200">{user.name}</span>
          </h1>
        </div>

        {/* User Info */}
        <div className="max-w-2xl mx-auto bg-black bg-opacity-80 p-3 md:p-8 md:rounded-2xl shadow-2xl border-2 border-gray-600 space-y-6">
          <h2 className="text-2xl font-bold text-blue-200 border-b border-gray-600 pb-2 text-center">
            User Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-100 text-sm sm:text-base">
            {[
              ['Email', user.email],
              ['Address', user.address || '-'],
              ['Profile email', user.profile_email],
              ['City', user.city || '-'],
              [
                'Date of birth',
                user.birth_date
                  ? new Date(user.birth_date).toLocaleDateString('sk-SK')
                  : '-',
              ],
              ['Postal code', user.postal_code || '-'],
              ['Phone', user.mobile_number || '-'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between items-center bg-gray-800 bg-opacity-50 p-3 rounded-lg border border-gray-600"
              >
                <span className="text-blue-300 font-medium">{label}:</span>
                <span className="text-right">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center space-y-2 text-base sm:text-lg">
            <p className="text-blue-300 font-semibold">
              Total orders:{' '}
              <span className="text-white">{ordersCount}</span>
            </p>
            <p className="font-semibold">
              Total spent:{' '}
              <span className="text-green-400 font-bold text-xl">
                {totalSpent.toFixed(2)} €
              </span>
            </p>
          </div>
        </div>

        {/* Orders */}
        <div className="max-w-7xl mx-auto bg-black bg-opacity-80 p-3 md:p-6 lg:px-24 md:rounded-xl shadow-lg border-2 border-gray-600 mt-10">
          <h2 className="text-2xl font-bold text-blue-200  pb-3 text-center">
            Orders
          </h2>

          {ordersError && (
            <p className="text-red-500 text-center mb-6 font-semibold">
              {ordersError}
            </p>
          )}

          {orders.length === 0 ? (
            <p className="text-red-500 text-lg text-center font-medium">
              This user has no orders.
            </p>
          ) : (
            orders.map(order => (

              <div
                key={order.id}
                className="border-2 border-gray-600 rounded-lg p-3 md:p-6 bg-gray-900 shadow-md hover:shadow-blue-600 transition-shadow duration-300 mb-12"
              >
                {/* rop section - order info */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-5">
                  <div className="text-sm md:text-base font-semibold text-blue-300 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('sk-SK')}{' '}
                    {new Date(order.created_at).toLocaleTimeString('sk-SK', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex flex-col items-center flex-grow px-4">
                    <div className="text-xl md:text-2xl font-bold text-blue-500 text-center mb-6 tracking-wide">
                      Order No.{' '}
                      <span className="text-blue-200">
                        {order.order_number}
                      </span>
                    </div>

                    <div
                      className="
                        w-full flex flex-col md:flex-row justify-center items-start md:items-center md:space-x-12 space-y-4 md:space-y-0 px-4"
                    >
                      {/* Prvá skupina: Full Name, Email, Mobile Number */}
                      <div className="flex flex-col space-y-2 text-left w-full md:w-auto">
                        {[
                          ['Full Name', order.full_name],
                          ['Email', order.profile_email],
                          ['Mobile Number', order.mobile_number],
                        ].map(([lbl, val]) => (
                          <div key={lbl} className="w-full md:min-w-[150px]">
                            <span className="font-semibold text-blue-300">{lbl}:</span> {val}
                          </div>
                        ))}
                      </div>

                      {/* Druhá skupina: Address, City, Postal Code */}
                      <div className="flex flex-col space-y-2 text-left w-full md:w-auto">
                        {[
                          ['Address', order.address],
                          ['City', order.city],
                          ['Postal Code', order.postal_code],
                        ].map(([lbl, val]) => (
                          <div key={lbl} className="w-full md:min-w-[150px]">
                            <span className="font-semibold text-blue-300">{lbl}:</span> {val}
                          </div>
                        ))}
                      </div>
                    </div>


                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <table className="hidden md:table w-full text-sm text-left text-gray-200 border border-gray-700 rounded-md mb-6">
                    <thead className="bg-gray-800 text-blue-400 uppercase text-xs sm:text-sm tracking-wide">
                      <tr>
                        <th className="px-4 py-3 border border-gray-600">
                          Product
                        </th>
                        <th className="px-4 py-3 border border-gray-600 text-center">
                          Quantity
                        </th>
                        <th className="px-4 py-3 border border-gray-600 text-right">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className={`border border-gray-700 ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'
                            }`}
                        >
                          <td className="px-4 py-2 border border-gray-600 max-w-xs truncate">
                            {item.product_name} - {item.price} €
                          </td>
                          <td className="px-4 py-2 border border-gray-600 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 border border-gray-600 text-right">
                            {(item.price * item.quantity).toFixed(2)} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-800 rounded-lg p-4 shadow-inner border border-gray-700"
                      >
                        <div className="text-blue-400 font-semibold mb-2">
                          Product
                        </div>
                        <div className="mb-3 text-gray-200 truncate">
                          {item.product_name} - {item.price} €
                        </div>
                        <div className="text-blue-400 font-semibold mb-2">
                          Quantity
                        </div>
                        <div className="mb-3 text-gray-200">
                          {item.quantity}
                        </div>
                        <div className="text-blue-400 font-semibold mb-2">
                          Price
                        </div>
                        <div className="text-gray-200">
                          {(item.price * item.quantity).toFixed(2)} €
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-8 text-gray-300 text-sm gap-5 sm:gap-0">
                  <div className="space-y-1">
                    <div>
                      <span className="font-semibold text-blue-400 text-sm">
                        Delivery:
                      </span>{' '}
                      {order.delivery_method || 'Unknown'} —{' '}
                      <span className="text-green-500 font-bold">
                        {(parseFloat(order.delivery_price) || 0).toFixed(2)} €
                      </span>


                    </div>

                    <div>
                      <span className="font-semibold text-blue-400 text-sm">
                        Used Points:
                      </span>{' '}
                      {order.used_points ?? 0}
                      <span className="text-red-700 md:text-lg lg:text-xl font-semibold"> -
                        {((order.used_points ?? 0) / 10).toFixed(2)} €
                      </span>

                    </div>
                  </div>

                  <div className="text-green-500 font-extrabold text-lg sm:text-xl text-right whitespace-nowrap">
                    Total: {order.total_price} €
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default UserDetailPage;
