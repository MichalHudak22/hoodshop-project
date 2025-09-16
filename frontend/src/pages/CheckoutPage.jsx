import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';  // cesta podľa projektu
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [useSavedData, setUseSavedData] = useState(false);
  const [profile, setProfile] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);
  const { refreshCartCount } = useContext(CartContext);


  const [formData, setFormData] = useState({
    full_name: '', profile_email: '', birth_date: '', mobile_number: '',
    address: '', city: '', postal_code: '', payment_method: 'card',
    card_number: '', card_expiry: '', card_cvc: '',
  });


  // DELIVERY pridaj stav na cenu doručenia
  const [deliveryMethod, setDeliveryMethod] = useState('DPD');
  const [deliveryCost, setDeliveryCost] = useState(0); // Už nie natvrdo
  const [shippingOptions, setShippingOptions] = useState([]); // Načítané z DB

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/config/shipping-prices`)
      .then(res => {
        // Prekonvertuj price na number
        console.log('🔽 API shipping-prices:', res.data);
        const options = (res.data || []).map(opt => ({
          ...opt,
          price: parseFloat(opt.price),
        }));

        setShippingOptions(options);

        // Nastav predvolenú cenu (napr. DPD)
        const dpd = options.find(opt => opt.name === 'DPD');
        if (dpd) {
          setDeliveryMethod('DPD');
          setDeliveryCost(dpd.price);
        }
      })
      .catch(err => console.error('Chyba pri načítaní cien dopravy:', err));
  }, []);

  const handleDeliveryChange = (e) => {
    const value = e.target.value;
    setDeliveryMethod(value);
    setFormData(f => ({ ...f, delivery_method: value }));

    const selected = shippingOptions.find(opt => opt.name === value);
    if (selected) {
      setDeliveryCost(parseFloat(selected.price));
    } else {
      setDeliveryCost(0);
    }
  };



  // pridanie poctu bodov z databazy 
  useEffect(() => {
    if (!user?.token) return;

    axios.get(`${API_BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => setProfile(res.data))
      .catch(err => console.error('Error loading profile:', err));
  }, [user]);

  // Vygenerovanie a uloženie session ID pre neprihláseného
  useEffect(() => {
    const sid = localStorage.getItem('sessionId') || uuidv4();
    localStorage.setItem('sessionId', sid);
    setSessionId(sid);
  }, []);

  // Načítanie košíka
  useEffect(() => {
    if (!sessionId) return;
    const headers = user?.token
      ? { Authorization: `Bearer ${user.token}` }
      : { 'x-session-id': sessionId };

    axios.get(`${API_BASE_URL}/api/cart`, { headers })
      .then(res => {
        setCartItems(res.data);
        setTotal(res.data.reduce((sum, i) => sum + i.price * i.quantity, 0));
      })
      .catch(err => console.error('Cart error:', err))
      .finally(() => setLoading(false));
  }, [sessionId, user]);

  // Načítanie údajov z profilu po zaškrtnutí checkboxu
  useEffect(() => {
    if (!user?.token) return;

    if (useSavedData) {
      // Načíta údaje z profilu
      axios.get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => {
          const d = res.data;
          setFormData(f => ({
            ...f,
            full_name: d.name || '',
            profile_email: d.profile_email || '',
            birth_date: d.birth_date?.split('T')[0] || '',
            mobile_number: d.mobile_number || '',
            address: d.address || '',
            city: d.city || '',
            postal_code: d.postal_code || '',
          }));
        })
        .catch(err => console.error('Profile error:', err));
    } else {
      // Resetuje všetky inputy na prázdne hodnoty
      setFormData({
        full_name: '',
        profile_email: '',
        birth_date: '',
        mobile_number: '',
        address: '',
        city: '',
        postal_code: '',
        payment_method: 'card',
      });
    }
  }, [useSavedData, user]);


  const handleChange = e =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const [processing, setProcessing] = useState(false);

 const handlePayment = async () => {
  const {
    full_name,
    profile_email,
    mobile_number,
    address,
    city,
    postal_code,
    payment_method,
    card_number,
    card_expiry,
    card_cvc
  } = formData;

  // Kontrola prázdnych povinných polí
  const requiredFields = [
    { field: 'full_name', label: 'Full Name' },
    { field: 'profile_email', label: 'Email' },
    { field: 'mobile_number', label: 'Mobile Number' },
    { field: 'address', label: 'Address' },
    { field: 'city', label: 'City' },
    { field: 'postal_code', label: 'Postal Code' },
  ];

  const missingFields = requiredFields.filter(({ field }) => !formData[field]);

  if (missingFields.length > 0) {
    const fieldNames = missingFields.map(f => f.label).join(', ');
    return alert(`Please fill in all required fields: ${fieldNames}`);
  }

  // ✉️ Validácia emailu
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(profile_email)) {
    return alert('Please enter a valid email address.');
  }

  // 📞 Validácia mobilného čísla (iba čísla, min. 9 číslic napr.)
  const phoneRegex = /^\d{9,}$/;
  if (!phoneRegex.test(mobile_number)) {
    return alert('Please enter a valid mobile number (only digits, at least 9 numbers).');
  }

  // 🏤 Validácia PSČ (iba čísla, napr. 5 číslic)
  const postalCodeRegex = /^\d+$/;
  if (!postalCodeRegex.test(postal_code)) {
    return alert('Please enter a valid postal code (only digits).');
  }

  // 💳 Ak je zvolená platba kartou, skontroluj aj kartu
  if (payment_method === 'card') {
    if (!card_number || !card_expiry || !card_cvc) {
      return alert('Please fill in all card details.');
    }
  }

  const headers = user?.token
    ? { Authorization: `Bearer ${user.token}` }
    : { 'x-session-id': sessionId };

  const discount = usedPoints * 0.10;
  const finalPrice = Math.max(total + deliveryCost - discount, 0);

  setProcessing(true);

  try {
    await axios.post(`${API_BASE_URL}/api/orders`, {
      ...formData,
      delivery_method: deliveryMethod,
      delivery_price: deliveryCost,
      total_price: finalPrice,
      cartItems,
      usedPoints,
    }, { headers });

    setUsedPoints(0);

    if (user?.token) {
      const res = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProfile(res.data);
    }

    await axios.delete(`${API_BASE_URL}/api/cart`, { headers });
    refreshCartCount();
    navigate('/thank-you');
  } catch (err) {
    console.error('Payment error:', err);
    alert('Payment failed. Try again.');
  } finally {
    setProcessing(false);
  }
};


  const discount = usedPoints * 0.10;
  const finalPrice = Math.max(total + deliveryCost - discount, 0);
  const estimatedEarnedPoints = finalPrice * 0.05 * 10;


  if (loading) return <p>Loading...</p>;

  return (
    <div className="relative bg-cover bg-center md:py-16"
      style={{ backgroundImage: "url('/img/bg-shop.jpg')", backgroundAttachment: 'fixed' }}>

      <div className="absolute inset-0 bg-black opacity-20 z-0" />

      {/* Obsah sekcie celeho formulara pre platbu */}
      <section className="relative z-10 w-full md:w-[90%] lg:w-[900px] mx-auto px-6 md:px-8 py-8 md:rounded-xl bg-black bg-opacity-30 md:bg-opacity-50 lg:border-2 border-gray-500">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-blue-200 text-center font-bold mb-6">Checkout</h1>

        {/* Checkbox pre načítanie údajov z profilu */}
        {user && (
          <div className="mb-4 text-center">
            <label className="inline-flex items-center text-blue-200 text-lg lg:text-xl">
              <input
                type="checkbox"
                checked={useSavedData}
                onChange={e => setUseSavedData(e.target.checked)}
                className="mx-3 scale-150"
              />
              Use saved profile Information
            </label>
          </div>
        )}


        {/* Formulár */}
        <div className="space-y-4 mb-6">
          {[
            ['full_name', 'Full Name', 'text'],
            ['profile_email', 'Email', 'email'],
            ['birth_date', 'Birth Date', 'date'],
            ['mobile_number', 'Mobile Number', 'tel'],
            ['address', 'Address', 'text'],
            ['city', 'City', 'text'],
            ['postal_code', 'Postal Code', 'text'],
          ].map(([name, label, type]) => (
            <div key={name} className="lg:flex lg:items-center lg:gap-4">
              <label className="block text-white font-semibold lg:w-40 lg:text-lg">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full lg:w-[80%] p-2 border rounded focus:outline-none focus:bg-blue-100"
                required={['full_name', 'profile_email', 'mobile_number', 'address', 'city', 'postal_code'].includes(name)}
              />
            </div>
          ))}



          {/* Payment sekcia */}
          <div className="text-white">
            {/* Nadpis nad celou sekciou, vycentrovaný */}
            <h2 className="text-2xl lg:text-3xl text-blue-200 font-bold text-center mb-6 pt-8">Payment Method</h2>

            <div className="lg:flex lg:items-start lg:gap-5 lg:text-xl">
              {/* Kontajner s radio buttonmi */}
              <div className="w-full lg:w-[40%] flex flex-col gap-3">
                {['card', 'paypal', 'cash'].map((method) => (
                  <label
                    key={method}
                    className={`
              flex items-center gap-3 p-3 rounded-lg cursor-pointer
              border border-gray-600
              hover:border-blue-500
              transition-colors duration-200
              ${formData.payment_method === method ? 'bg-blue-400 border-blue-600' : 'bg-gray-800'}
            `}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method}
                      checked={formData.payment_method === method}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-500 accent-blue-500 cursor-pointer"
                    />
                    <span className="capitalize select-none">
                      {method === 'card' ? 'Card' : method === 'paypal' ? 'PayPal' : 'Cash on delivery'}
                    </span>
                  </label>
                ))}
              </div>

              {/* Dynamické polia podľa platobnej metódy */}
              <div className="w-full lg:w-[60%] mt-6 lg:mt-0">
                {formData.payment_method === 'card' && (
                  <div className="space-y-4 text-white">
                    <div className="lg:flex lg:items-center lg:gap-4">
                      <label className="lg:w-40 font-semibold text-lg">Card Number</label>
                      <input
                        type="text"
                        name="card_number"
                        value={formData.card_number}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:bg-blue-100 text-black"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="lg:flex lg:items-center lg:gap-4">
                      <label className="lg:w-40 font-semibold text-lg">Expiry Date</label>
                      <input
                        type="month"
                        name="card_expiry"
                        value={formData.card_expiry}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:bg-blue-100 text-black"
                      />
                    </div>
                    <div className="lg:flex lg:items-center lg:gap-4">
                      <label className="lg:w-40 font-semibold text-lg">CVC</label>
                      <input
                        type="text"
                        name="card_cvc"
                        value={formData.card_cvc}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:bg-blue-100 text-black"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                )}

                {formData.payment_method === 'paypal' && (
                  <div className="text-white italic">
                    <p>You'll be redirected to PayPal to complete your purchase.</p>
                  </div>
                )}

                {formData.payment_method === 'cash' && (
                  <div className="text-white italic">
                    <p>Pay with cash upon delivery. Please prepare the exact amount.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Nadpis Delivery */}
        <h2 className="text-2xl lg:text-3xl text-blue-200 font-bold text-center mb-6 pt-8">
          Delivery Method
        </h2>

        <div className="flex flex-col gap-5">
          {shippingOptions.map(option => (
            <label
              key={option.name}
              className="flex w-[70%] md:w-[60%] m-auto items-center justify-between p-3 border rounded-lg cursor-pointer
                 bg-gray-50 peer-checked:bg-blue-200 peer-checked:text-blue-600"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  value={option.name}
                  className="w-5 h-5 peer"
                  onChange={handleDeliveryChange}
                  checked={deliveryMethod === option.name}
                />
                <div>
                  <p className="font-medium text-lg">{option.name}</p>
                </div>
              </div>
              <span className="font-semibold text-lg text-green-600">
                €{option.price.toFixed(2)}
              </span>
            </label>
          ))}
        </div>


        {/* Položky v košíku */}
        <ul className="space-y-4 mb-6">
          <h2 className='text-2xl lg:text-3xl text-blue-200 font-bold text-center pt-8'>Items in Your Cart</h2>
          {cartItems.map(item => (
            <li key={item.id} className="flex justify-between bg-white p-4 shadow rounded">
              <div className="flex items-center space-x-4">
                <img src={`${API_BASE_URL}${item.image}`} alt={item.name} className="w-20 h-20 object-contain rounded border" />
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p>Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="text-green-500 font-semibold text-sm md:text-lg">{(item.price * item.quantity).toFixed(2)} €</p>
            </li>
          ))}
        </ul>
        {/* Celková cena a tlačidlo */}
        <div className="text-center space-y-3">
          {/* Výpočet koľko bodov získa */}
          <div className="mt-8 text-center text-blue-300 font-semibold text-sm md:text-lg">
            You will earn {Math.round(estimatedEarnedPoints)} loyalty points from this order.
          </div>



          {/* Aktuálny stav bodov */}
          {profile && (
            <>
              <div className="mt-4 text-center text-yellow-400 font-semibold text-lg">
                You currently have {profile.loyalty_points} loyalty points ({(profile.loyalty_points * 0.10).toFixed(2)}€ in discounts).
              </div>

              {/* Vstupné pole na použitie bodov */}
              <div className="mt-2 text-center">
                <label className="block text-white mb-1" htmlFor="usePoints">
                  Use loyalty points (max {profile.loyalty_points}):
                </label>

                <input
                  type="number"
                  id="usePoints"
                  min={0}
                  max={profile.loyalty_points}
                  value={usedPoints}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    // 🔢 Maximálne použiteľné body podľa ceny (zaokrúhlené nahor)
                    const maxUsablePoints = Math.min(
                      profile.loyalty_points,
                      Math.ceil((total + deliveryCost) * 10)
                    );
                    if (val > maxUsablePoints) val = maxUsablePoints;
                    if (val < 0) val = 0;
                    setUsedPoints(val);
                  }}
                  className="text-black px-2 py-2 my-2 rounded w-32 text-center border-none font-bold text-xl outline-none focus:outline-none"
/>

                <div className="text-sm text-green-300 mt-1">
                  That’s a discount of {(usedPoints * 0.10).toFixed(2)}€
                </div>

                <div className="text-sm text-blue-300 mt-1">
                  Max usable for this order: {Math.min(profile.loyalty_points, Math.ceil((total + deliveryCost) * 10))} points
                </div>
              </div>

            </>
          )}

          {/* Zobrazenie finálnej ceny po zľave */}
          <h2 className="text-white text-lg lg:text-2xl font-semibold">
            Total: <span className="text-green-500 text-2xl font-semibold">
              {Math.max((total + deliveryCost - usedPoints * 0.10), 0).toFixed(2)}€
            </span>
          </h2>

          {/* Potvrdenie */}
          <button
            onClick={handlePayment}
            className="w-full lg:w-80 lg:text-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded"
          >
            Confirm and Pay
          </button>
        </div>

      </section>
    </div>
  );
};

export default CheckoutPage;
