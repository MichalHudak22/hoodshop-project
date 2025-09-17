import React, { useState } from 'react';
import UserListAdmin from '../admin/UserListAdmin';
import OrdersSummary from '../admin/OrdersSummary';
import TopCustomers from '../admin/TopCustomers';
import ShippingPriceConfig from '../admin/ShippingPriceConfig';
import ColorfulTextEditor from '../admin/ColorfulTextEditor';
import AddProductForm from '../admin/AddProductForm';
import DeleteProduct from '../admin/DeleteProduct';
import AllOrders from '../admin/AllOrders';

function AdminPage() {
  const [footballHeaderText, setFootballHeaderText] = useState({ title: '', paragraph: '' });
  const [hockeyHeaderText, setHockeyHeaderText] = useState({ title: '', paragraph: '' });
  const [cyclingHeaderText, setCyclingHeaderText] = useState({ title: '', paragraph: '' });

  return (
    <div
      className="relative min-h-screen text-white bg-fixed bg-cover bg-no-repeat bg-center pb-12 md:px-8"
      style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50 z-0" />

      <div className="relative z-10 max-w-screen-2xl mx-auto space-y-10">
        {/* Nadpis */}
        <div className="py-8 text-center bg-black w-full">
          <h1 className="text-2xl lg:text-4xl font-bold text-white">
            Welcome to the <span className="text-blue-200">Admin Panel</span>
          </h1>
        </div>

        {/* GRID LAYOUT: Summary, Users */}
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2 xl:grid-cols-6">
          <div className="lg:col-span-1 xl:col-span-3 bg-black bg-opacity-70 md:rounded-xl p-5 shadow-lg border border-gray-700">
            <OrdersSummary />
          </div>
               <div className="lg:col-span-1 xl:col-span-3 bg-black bg-opacity-70 md:rounded-xl p-5 shadow-lg border border-gray-700">
            <TopCustomers/>
          </div>
          <div className="bg-black bg-opacity-60 md:bg-opacity-70 md:rounded-xl p-5 shadow-lg lg:col-span-1 xl:col-span-4 border border-gray-700">
            <h2 className="text-2xl lg:text-3xl font-semibold text-center text-blue-200 mb-4">User List</h2>
            <UserListAdmin />
          </div>

        </div>

         {/* All Orders */}
        <div className="">
          <AllOrders />
        </div>

        {/* Add New Product */}
        <div className="">
          <AddProductForm />
        </div>

        {/* DELETE New Product */}
        <div className="">
          <DeleteProduct />
        </div>

        {/* ShippingPrice - nastavenie ceny pre dpd gls a slovak post */}
        <div className="bg-black bg-opacity-70 md:rounded-xl p-2 md:p-5 shadow-lg lg:col-span-2 xl:col-span-6 border border-gray-700">
          <ShippingPriceConfig />
        </div>

        {/* EDIT SECTION HEADERS */}
        <section className="bg-black bg-opacity-70 md:rounded-xl p-5 shadow-lg border border-gray-700">
          <h2 className="text-2xl lg:text-3xl font-semibold text-center text-blue-200 mb-8">
            Edit Section Headers
          </h2>

          {/* Instructions */}
          <div className="flex justify-center mb-12">
            <div className="md:rounded-xl md:p-5 md:text-center max-w-[380px] md:max-w-3xl w-full">
              <p className="text-sm md:text-base text-left max-w-[450px] mx-auto text-white">
                <strong className="text-blue-200 text-sm md:text-lg text-center block mb-2">🛠 Instructions for Editing the Title and Text</strong>
                1. Type or paste text into the field.<br />
                2. Select the part of the text you want to highlight with color.<br />
                3. Choose a color from the palette.<br />
                4. Click the <em>“Change Color”</em> button.<br />
                5. To change color, remove old tags and repeat.<br />
                6. Click the <em>“Save text”</em> button to save your changes.
              </p>
            </div>
          </div>

          {/* Editors Grid */}
          <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
            <div className="border-t-4 lg:border border-gray-600 md:rounded-xl md:p-5 shadow-lg md:bg-black md:bg-opacity-50">
              <h3 className="text-xl font-semibold text-center text-blue-200 mb-4">
                Edit Football Section Title
              </h3>
              <ColorfulTextEditor
                sectionKey="football-home-header"
                onChange={setFootballHeaderText}
                initialText={footballHeaderText}
              />
            </div>
            <div className="border-t-4 lg:border border-gray-600 rounded-xl md:p-5 shadow-lg md:bg-black md:bg-opacity-50">
              <h3 className="text-xl font-semibold text-center text-blue-200 mb-4">
                Edit Hockey Section Title
              </h3>
              <ColorfulTextEditor
                sectionKey="hockey-home-header"
                onChange={setHockeyHeaderText}
                initialText={hockeyHeaderText}
              />
            </div>
            <div className="border-t-4 lg:border border-gray-600 rounded-xl md:p-5 shadow-lg md:bg-black md:bg-opacity-50">
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
