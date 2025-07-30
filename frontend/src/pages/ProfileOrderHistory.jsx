import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileNavigation from '../components/ProfileNavigation';

function OrderHistory() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    // Načítať údaje o používateľovi
    fetch('http://localhost:3001/user/profile', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUser(data);

          // Načítať objednávky
        fetch('http://localhost:3001/api/order-history/history', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` },
})
  .then((res) => res.json())
  .then((ordersData) => {
    console.log('Orders data from endpoint:', ordersData);  // <-- tu pridaj console.log
     // Skontroluj, čo obsahuje prvá objednávka
  if (ordersData.length > 0) {
    console.log('First order items:', ordersData[0].items);
  }
    if (ordersData.error) {
      setError(ordersData.error);
    } else {
      setOrders(ordersData);
    }
  })
  .catch(() => setError('Chyba pri načítaní objednávok'));

        }
      })
      .catch(() => setError('Chyba pri načítaní údajov o používateľovi'));
  }, [navigate]);

  return (
   <div
  className="relative text-white flex flex-col items-center bg-fixed bg-cover bg-no-repeat bg-center"
  style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black opacity-30 z-0" />

  {/* Obsah */}
  <div className="relative z-10 w-full flex flex-col items-center min-h-screen">
    {error && <div className="text-red-500">{error}</div>}

    {user && <div className="text-green-500"></div>}
    
    {/* Nadpis */}
    <div className="py-8 text-center bg-black w-full">
      <h1 className="text-2xl lg:text-4xl font-bold text-white">
        My ORder <span className="text-blue-200">History</span>
      </h1>
    </div>

    {/* Profile Navigation */}
    <div className="w-full lg:max-w-2xl">
      <ProfileNavigation />
    </div>

{/* Order History */}    
<div className="w-full px-4">
  {orders.length === 0 && <p>Nemáte žiadne objednávky.</p>}

  {orders.map((order) => {
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = Number(order.total_price);

    return (
      <div
        key={order.id}
        className="lg:w-[85%] xl:w-[1024px] m-auto mb-6 p-4 border-2 border-gray-600 rounded-xl bg-black bg-opacity-80"
      >
        <h2 className="text-center text-xl lg:text-2xl text-blue-200 pb-3">
  <strong>Order No.</strong> {order.order_number}
</h2>


        <div className="flex flex-col items-center md:flex-row justify-around text-md lg:text-lg">
          <div className="mb-4 text-left w-[235px]">
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Name:</strong> {order.full_name}</p>
            <p><strong>Email:</strong> {order.profile_email}</p>
            <p><strong>Status:</strong> {order.status || 'not specified'}</p>
            <p><strong>Payment:</strong> {order.payment_method}</p>
            <p><strong>Total Items:</strong> {totalQuantity}</p>
          </div>

          <div className="mb-4 text-left w-[235px]">
            <strong>Items:</strong>
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

       {/* Zobrazenie použitých bodov, ak existujú */}
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
