import React from 'react';
import { Link } from 'react-router-dom';

const sports = [
  {
    name: 'Football',
    image: '/img/bg-football.jpg',
    categories: [
      { name: 'Jerseys', link: '/sports/football/jersey' },
      { name: 'Balls', link: '/sports/football/ball' },
      { name: 'Cleats', link: '/sports/football/cleats' },
      { name: 'Shinguards', link: '/sports/football/shinguards' },
    ],
    link: '/sports/football',
  },
  {
    name: 'Hockey',
    image: '/img/bg-hockey.jpg',
    categories: [
      { name: 'Jerseys', link: '/sports/hockey/jersey' },
      { name: 'Sticks', link: '/sports/hockey/sticks' },
      { name: 'Skates', link: '/sports/hockey/skates' },
      { name: 'Helmets', link: '/sports/hockey/helmets' },
    ],
    link: '/sports/hockey',
  },
  {
    name: 'Cycling',
    image: '/img/bg-cykling.jpg',
    categories: [
      { name: 'Clothing', link: '/sports/cycling/clothes' },
      { name: 'Bikes', link: '/sports/cycling/bike' },
      { name: 'Helmets', link: '/sports/cycling/helmets' },
      { name: 'Gloves', link: '/sports/cycling/gloves' },
    ],
    link: '/sports/cycling',
  },
];

export default function SportsSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Nadpis nad kartami */}
      <h1 className="text-4xl font-bold mb-8 text-center">
        Find Gear for Your Favorite Sport
      </h1>

      {/* Grid s kartami */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sports.map(({ name, image, categories, link }) => (
          <div
            key={name}
            className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer group"
          >
            {/* Obrázok */}
            <img
              src={image}
              alt={name}
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Overlay s kategóriami a tlačidlom, viditeľný pri hover */}
            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white p-4">
              <h3 className="text-2xl font-bold mb-4">{name}</h3>

              <ul className="mb-6 space-y-1">
                {categories.map(({ name: catName, link: catLink }) => (
                  <li key={catName} className="text-lg">
                    <Link to={catLink} className="hover:text-blue-300 transition">
                      {catName}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link to={link} className="px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded-xl font-semibold transition">
                View Equipment
              </Link>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
