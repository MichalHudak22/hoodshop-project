import React from 'react';

function BrandsGrid({ brands, bgImage }) {
  return (
    <section
      className="relative py-16 px-6 bg-black overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold my-8 text-white text-center">All Brands</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {brands.map((brand) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  const imgPath = brand.brand_image.replace(/^\//, '');
  const fullUrl = `${baseUrl}/${imgPath}`;
  console.log('Brand image URL:', fullUrl);
  
  return (
    <a key={brand.id} href={`/brands/${brand.name.toLowerCase()}`} className="group block rounded-xl overflow-hidden shadow-lg ...">
      <div
        className="h-40 w-full bg-center bg-no-repeat bg-contain bg-white transition duration-300 group-hover:brightness-110"
        style={{
          backgroundImage: `url(${fullUrl})`,
        }}
      ></div>
      <div className="bg-black min-h-[75px] flex text-white text-center items-center justify-center py-2">
        <span className="text-md font-semibold">{brand.brand_info}</span>
      </div>
    </a>
  );
})}

        </div>
      </div>
    </section>
  );
}

export default BrandsGrid;
