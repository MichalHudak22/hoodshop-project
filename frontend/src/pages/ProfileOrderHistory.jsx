import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileNavigation from '../components/ProfileNavigation';

function OrderHistory() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    // Načítať údaje o používateľovi
    fetch(`${import.meta.env.VITE_API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
        } else {
          setUser(data);

          // Načítať objednávky
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/order-history/history`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((ordersData) => {
              if (ordersData.error) {
                setError(ordersData.error);
                setOrders([]);
              } else if (Array.isArray(ordersData)) {
                setOrders(ordersData);
              } else {
                setOrders([]);
              }
              setLoading(false);
            })
            .catch(() => {
              setError('Chyba pri načítaní objednávok');
              setLoading(false);
            });
        }
      })
      .catch(() => {
        setError('Chyba pri načítaní údajov o používateľovi');
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="relative w-full min-h-screen bg-cover bg-no-repeat bg-center" style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-30 z-0" />

      {/* Obsah */}
      <div className="relative z-10 w-full max-w-[1024px] mx-auto pb-10 px-4 mt-10 flex flex-col">

        {/* Nadpis */}
        <div className="py-8 text-center bg-black w-full">
          <h1 className="text-2xl lg:text-4xl font-bold text-white">
            Your<span className="text-blue-200">Orders</span>
          </h1>
        </div>

        {/* Profile Navigation */}
        <div className="w-full lg:max-w-2xl mx-auto">
          <ProfileNavigation />
        </div>

        {loading && <p className='text-green-400'>Načítavam objednávky...</p>}

        {!loading && error && <p className="text-red-500">{error}</p>}

        {!loading && !error && orders.length === 0 && <p className="text-white">Nemáte žiadne objednávky.</p>}

        {!loading && orders.length > 0 && orders.map((order) => {
          const itemsArray = Array.isArray(order.items) ? order.items : [];

          const totalQuantity = itemsArray.reduce((sum, item) => {
            return sum + (Number(item.quantity) || 0);
          }, 0);

          const totalPrice = Number(order.total_price) || 0;
          const usedPoints = Number(order.used_points) || 0;

          return (
            <div
              key={order.id}
              className="lg:w-[85%] xl:w-[1024px] m-auto mb-6 p-4 border-2 border-gray-600 rounded-xl bg-black bg-opacity-80"
            >
              <h2 className="text-center text-xl lg:text-2xl text-blue-200 pb-3">
                <strong>Order No.</strong> {order.order_number}
              </h2>

              <div className="flex flex-col items-center md:flex-row justify-around text-md lg:text-lg">
                <div className="mb-4 text-left w-[235px] text-white">
                  <p>
                    <strong className='text-blue-100'>Date:</strong>{' '}
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : 'unknown'}
                  </p>

                  <p><strong className='text-blue-100'>Name:</strong> {order.full_name || 'unknown'}</p>
                  <p><strong className='text-blue-100'>Email:</strong> {order.profile_email || 'unknown'}</p>
                  <p><strong className='text-blue-100'>Status:</strong> {order.status || 'not specified'}</p>
                  <p><strong className='text-blue-100'>Payment:</strong> {order.payment_method || 'not specified'}</p>
                  <p><strong className='text-blue-100'>Total Items:</strong> {totalQuantity}</p>
                </div>

                <div className="mb-4 text-left w-[235px]">
                  <strong className='text-blue-100'>Items:</strong>
                  <ul className="list-none">
                    {itemsArray.map((item) => (
                      <li className="text-sm text-white" key={item.id}>
                        {item.product_name || 'Unnamed product'} - {item.quantity || 0} pcs - {item.price || 0} €
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pôvodná cena pred zľavou */}
              <p className="mt-1 font-semibold text-center text-lg text-green-600">
                <strong className="text-white">Total Price:</strong>{' '}
                {(totalPrice + usedPoints * 0.10).toFixed(2)} €
              </p>

              {/* Zobrazenie použitých bodov, ak existujú */}
              {usedPoints > 0 && (
                <p className="text-center font-semibold text-white text-lg mt-2">
                  <strong className="text-white">Used Points:</strong> {usedPoints} -{' '}
                  <span className="text-green-600">({(usedPoints * 0.10).toFixed(2)} €)</span>
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
  );
}

export default OrderHistory;