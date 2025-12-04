import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import UserListAdmin from '../admin/UserListAdmin';
import OrdersSummary from '../admin/OrdersSummary';
import TopCustomers from '../admin/TopCustomers';
import ShippingPriceConfig from '../admin/ShippingPriceConfig';
import ColorfulTextEditor from '../admin/ColorfulTextEditor';
import AddProductForm from '../admin/AddProductForm';
import DeleteProduct from '../admin/DeleteProduct';
import AllOrders from '../admin/AllOrders';

function AdminPage() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [footballHeaderText, setFootballHeaderText] = useState({ title: '', paragraph: '' });
  const [hockeyHeaderText, setHockeyHeaderText] = useState({ title: '', paragraph: '' });
  const [cyclingHeaderText, setCyclingHeaderText] = useState({ title: '', paragraph: '' });

  // 🔒 Ochrana prístupu
  useEffect(() => {
    if (loading) return; // čakáme, kým AuthContext overí token

    if (!user || !user.token) {
      navigate('/login'); // presmerovanie, ak nie je prihlásený
      return;
    }

    if (user.role !== 'admin') {
      navigate('/'); // presmerovanie, ak nie je admin
    }
  }, [user, loading, navigate]);

  // ⏳ Loading počas overovania usera
  if (loading || !user) {
    return <div className="text-center text-white py-20">Loading...</div>;
  }

  // 🚫 Fallback – ak nie je admin
  if (user.role !== 'admin') {
    return <div className="text-center text-red-500 py-20">Access denied</div>;
  }

  return (
    <div
      className="relative min-h-screen text-white bg-fixed bg-cover bg-no-repeat bg-center pb-12 md:px-8"
      style={{ backgroundImage: "url('/img/bg-profile-1.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-0" />

      <div className="relative z-10 max-w-screen-2xl mx-auto space-y-10">
        {/* 🏷️ Nadpis */}
        <div className="pt-4 lg:pt-8 lg:pb-8 text-center w-full">
          <h1 className="text-2xl lg:text-4xl font-bold text-white">
            Welcome to the <span className="text-blue-200">Admin Panel</span>
          </h1>
        </div>

        {/* 📊 GRID: Orders summary & Top customers */}
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2 xl:grid-cols-6">
          <div className="lg:col-span-1 xl:col-span-3 bg-black bg-opacity-70 rounded-xl p-5 shadow-lg border border-gray-700">
            <OrdersSummary />
          </div>

          <div className="lg:col-span-1 xl:col-span-3 bg-black bg-opacity-70 rounded-xl p-5 shadow-lg border border-gray-700">
            <TopCustomers />
          </div>

          {/* 👥 User list */}
          <div className="lg:col-span-2 xl:col-span-6 flex justify-center w-full">
            <div className="bg-black bg-opacity-70 rounded-xl p-5 shadow-lg border border-gray-700 w-full max-w-3xl">
              <h2 className="text-2xl lg:text-3xl font-semibold text-center text-blue-200 mb-4">
                User List
              </h2>
              <UserListAdmin />
            </div>
          </div>
        </div>

        {/* 📦 All Orders */}
        <section>
          <AllOrders />
        </section>

        {/* ➕ Add Product */}
        <section>
          <AddProductForm />
        </section>

        {/* ❌ Delete Product */}
        <section>
          <DeleteProduct />
        </section>

        {/* 🚚 Shipping Price Config */}
        <section className="bg-black bg-opacity-70 rounded-xl p-5 shadow-lg border border-gray-700">
          <ShippingPriceConfig />
        </section>

        {/* 📝 Edit Section Headers */}
        <section className="bg-black bg-opacity-70 rounded-xl p-5 shadow-lg border border-gray-700">
          <h2 className="text-2xl lg:text-3xl font-semibold text-center text-blue-200 mb-8">
            Edit Section Headers
          </h2>

          {/* 🧭 Návod */}
          <div className="flex justify-center mb-12">
            <div className="rounded-xl p-5 text-center max-w-3xl w-full">
              <p className="text-sm md:text-base text-white text-left mx-auto max-w-[500px]">
                <strong className="text-blue-200 text-lg text-center block mb-2">
                  🛠 Instructions for Editing the Title and Text
                </strong>
                1. Type or paste text into the field.<br />
                2. Select the part you want to highlight.<br />
                3. Choose a color from the palette.<br />
                4. Click <em>“Change Color”</em>.<br />
                5. To change color again, remove old tags.<br />
                6. Click <em>“Save text”</em> to store changes.
              </p>
            </div>
          </div>

          {/* ✏️ Editors Grid */}
          <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
            <div className="border-t-4 border-gray-600 rounded-xl p-5 shadow-lg bg-black bg-opacity-50">
              <h3 className="text-xl font-semibold text-center text-blue-200 mb-4">
                Edit Football Section Title
              </h3>
              <ColorfulTextEditor
                sectionKey="football-home-header"
                onChange={setFootballHeaderText}
                initialText={footballHeaderText}
              />
            </div>

            <div className="border-t-4 border-gray-600 rounded-xl p-5 shadow-lg bg-black bg-opacity-50">
              <h3 className="text-xl font-semibold text-center text-blue-200 mb-4">
                Edit Hockey Section Title
              </h3>
              <ColorfulTextEditor
                sectionKey="hockey-home-header"
                onChange={setHockeyHeaderText}
                initialText={hockeyHeaderText}
              />
            </div>

            <div className="border-t-4 border-gray-600 rounded-xl p-5 shadow-lg bg-black bg-opacity-50">
              <h3 className="text-xl font-semibold text-center text-blue-200 mb-4">
                Edit Cycling Section Title
              </h3>
              <ColorfulTextEditor
                sectionKey="cycling-home-header"
                onChange={setCyclingHeaderText}
                initialText={cyclingHeaderText}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminPage;
