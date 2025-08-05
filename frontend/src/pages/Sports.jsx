import SportsCarousel from '../components/SportsCarousel';
import WhySport from '../components/WhySport';
import NewsPromoSection from '../components/NewsPromoSection';
import { Link } from 'react-router-dom';

function Sports() {
  const slides = [
    {
      id: 1,
      image: "../img/bg-football.jpg",
      title: "Football World Updates",
      description:
        "Dive into the world of football with our wide selection of gear. From jerseys and cleats to balls and shin guards, we’ve got everything you need. Be ready for every match with equipment you can rely on.",
      buttonText: "Football Shop",
      link: '/sports/football',
    },
    {
      id: 2,
      image: "../img/bg-hockey.jpg",
      title: "Hockey Gear & News",
      description:
        "Stay in the game with top-quality hockey equipment. Explore our collection of sticks, skates, helmets, and protective gear—everything you need whether you\'re hitting the ice or training off it. Gear up like a pro!",
      buttonText: "Hockey Shop",
      link: '/sports/hockey',
    },
    {
      id: 3,
      image: "../img/bg-cykling.jpg",
      title: "Gear Up & Ride",
      description:
        "Hit the road or trail with confidence. Browse our range of bikes, helmets, cycling apparel, and accessories designed for both casual riders and serious cyclists. Ride better, ride safer.",
      buttonText: "Cycling Shop",
      link: '/sports/cycling',
    },
  ];

  const cards = [
    {
      id: 1,
      image: '/img/bg-football.jpg',
      title: 'Football',
      description: 'Explore jerseys, cleats, balls, and everything you need to play like a pro.',
      buttonText: 'Football Shop',
      link: '/sports/football',
    },
    {
      id: 2,
      image: '/img/bg-hockey.jpg',
      title: 'Hockey',
      description: 'Get top-quality skates, sticks, and protective gear for the ice.',
      buttonText: 'Hockey Shop',
      link: '/sports/hockey',
    },
    {
      id: 3,
      image: '/img/bg-cykling.jpg',
      title: 'Cycling',
      description: 'Find helmets, apparel, and accessories for road and trail riding.',
      buttonText: 'Cycling Shop',
      link: '/sports/cycling',
    },
  ];

  return (
    <div className='relative top-[0px]'>
      {/* Sports Headline */}
      <section
        className="relative text-center py-10 px-4 bg-gradient-to-br from-blue-600 via-black to-blue-900 text-white overflow-hidden border-b-4 border-black"
      >
        <div className="absolute inset-0 bg-[url('/img/sports-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
            Explore Our <span className="text-blue-200">World of Sports</span>
          </h1>
          <p className="text-xl leading-relaxed drop-shadow-sm">
            From the pitch to the rink to the trail – find top gear and updates for{' '}
            <span className="text-blue-200 font-medium">football</span>,{' '}
            <span className="text-blue-200 font-medium">hockey</span>, and{' '}
            <span className="text-blue-200 font-medium">cycling</span>. Whether you're an amateur or a pro, we’ve got you covered.
          </p>
        </div>
      </section>

      {/* Carousel */}
      <div className="mt-[0px] pb-8 bg-black">
        <SportsCarousel slides={slides} />
      </div>

      {/* Sports cards */}
      <section
        className="relative py-12 px-4 bg-black bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('/img/bg-sports.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div> {/* Tmavý overlay */}

        <div className="relative z-10">
          <h1 className='text-4xl text-center py-5 text-white font-bold'>
            Explore Our Top Sports Categories
          </h1>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className="relative rounded-2xl overflow-hidden shadow-lg group bg-white"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 bg-white">
                  <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                  <p className="text-gray-600 mb-4">{card.description}</p>
                  <Link
                    to={card.link}
                    className="inline-block bg-blue-700 text-white px-4 py-2 hover:bg-blue-600 transition rounded-2xl"
                  >
                    {card.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* WhySport - info section */}
      <div className="mt-[0px]">
        <WhySport slides={slides} />
      </div>

      {/* NewsPromoSection */}
      <div className="mt-[0px]">
        <NewsPromoSection slides={slides} />
      </div>

    </div>
  );
}

export default Sports;
