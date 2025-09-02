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
            const slug = brand.name.toLowerCase();
            return (
              <a
                key={brand.id}
                href={`/brands/${slug}`}
                className="group block rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 filter group-hover:brightness-125 border-2 border-black hover:border-2 hover:border-white"
              >
                <div
                  className="h-40 w-full bg-center bg-no-repeat bg-contain bg-white transition duration-300 group-hover:brightness-110"
                  style={{
                    backgroundImage: `url(${import.meta.env.VITE_API_BASE_URL}${brand.brand_image})`,
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
