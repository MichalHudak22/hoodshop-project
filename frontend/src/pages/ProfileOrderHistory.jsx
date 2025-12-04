import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileNavigation from '../components/ProfileNavigation';

const baseURL = 'https://hoodshop-project.onrender.com';

function OrderHistory() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // nový stav
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Načítať údaje o používateľovi
        const resUser = await fetch(`${baseURL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await resUser.json();

        if (userData.error) {
          setError(userData.error);
          setLoading(false);
          return;
        }
        setUser(userData);

        // Načítať objednávky
        const resOrders = await fetch(`${baseURL}/api/order-history/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersData = await resOrders.json();

        if (ordersData.error) {
          setError(ordersData.error);
        } else {
          setOrders(ordersData);
          if (ordersData.length > 0) console.log('First order items:', ordersData[0].items);
        }
      } catch (err) {
        console.error(err);
        setError('Chyba pri načítaní údajov');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrders();
  }, [navigate]);

  return (
    <div
      className="relative text-white flex flex-col items-center bg-fixed bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/img/bg-profile-1.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-40 z-0" />

      {/* Obsah */}
      <div className="relative z-10 w-full flex flex-col items-center min-h-screen">
        {error && <div className="text-red-500">{error}</div>}

        {user && <div className="text-green-500"></div>}

        {/* Profile Navigation */}
        <div className="w-full lg:max-w-2xl mb-4">
          <ProfileNavigation />
        </div>

        {/* Nadpis */}
        <div className="pb-8 pt-4 text-center w-full">
          <h1 className="text-2xl lg:text-4xl font-bold text-white">
            My Order <span className="text-blue-200">History</span>
          </h1>
        </div>

        {/* Order History */}
        <div className="w-full px-2 lg:px-4">
          {loading && <p className='text-lg text-green-300 text-center'>Loading orders...</p>}

          {!loading && orders.length === 0 && <p>You have no orders.</p>}

          {!loading && orders.map((order) => {
            const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = Number(order.total_price);

            return (
              <div
                key={order.id}
                className="lg:w-[85%] xl:w-[1024px] m-auto mb-6 p-4 border-2 border-gray-600 rounded-xl bg-black bg-opacity-70"
              >
                <h2 className="text-center text-xl lg:text-2xl text-blue-200 pb-3">
                  <strong>Order No.</strong> {order.order_number}
                </h2>

                <div className="flex flex-col items-center md:flex-row justify-around text-[14px] lg:text-lg">
                  <div className="mb-4 text-left w-[260px]">
                    <p><strong className='text-blue-100'>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                    <p><strong className='text-blue-100'>Name:</strong> {order.full_name}</p>
                    <p><strong className='text-blue-100'>Email:</strong> {order.profile_email}</p>
                    <p><strong className='text-blue-100'>Status:</strong> {order.status || 'not specified'}</p>
                    <p><strong className='text-blue-100'>Payment:</strong> {order.payment_method}</p>
                    <p><strong className='text-blue-100'>Total Items:</strong> {totalQuantity}</p>
                  </div>

                  <div className="mb-4 text-left w-[260px]">
                    <strong className='text-blue-100'>Items:</strong>
                    <ul className="list-none">
                      {order.items.map((item) => (
                        <li className="text-sm" key={item.id}>
                          {item.product_name} - {item.quantity} pcs - {item.price} €
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pôvodná cena pred zľavou */}
                <p className="mt-1 font-semibold text-center text-lg text-green-600">
                  <strong className="text-white">Total Price:</strong> {(totalPrice + order.used_points * 0.10).toFixed(2)} €
                </p>

                {/* Zobrazenie použitých bodov */}
                {order.used_points > 0 && (
                  <p className="text-center font-semibold text-white text-lg mt-2">
                    <strong className="text-white">Used Points:</strong> {order.used_points} - 
                    <span className="text-green-600"> ({(order.used_points * 0.10).toFixed(2)} €)</span>
                  </p>
                )}

                {/* Cena ktorú užívateľ zaplatil (po zľave) */}
                <p className="mt-2 font-semibold text-center text-xl text-green-400">
                  <strong className="text-white">Amount Paid:</strong> {totalPrice.toFixed(2)} €
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;
