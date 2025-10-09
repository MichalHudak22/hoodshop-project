const newsItems = [
  {
    title: 'Find the Perfect Football Cleats',
    description: 'Discover how the right pair of cleats can boost your performance on the pitch.',
    linkText: 'Read More',
    href: '/sports/football/cleats', // ⚽ futbalové kopačky
  },
  {
    title: 'How to Choose the Best Bike Helmet',
    description: 'Safety first! Tips to find the perfect helmet for your rides.',
    linkText: 'Read More',
    href: '/sports/cycling/helmets', // 🚴 prilby
  },
  {
    title: 'Hockey Skates Buying Guide',
    description: 'From fit to blade type — learn how to pick the right skates for the ice.',
    linkText: 'Read More',
    href: '/sports/hockey/skates', // 🏒 hokejové korčule
  },
];


const NewsPromoSection = () => {
  const frontendURL = import.meta.env.VITE_FRONTEND_URL; // vezmeme URL frontendu z .env

  return (
    <section
      className="relative py-16 px-4 bg-black bg-cover bg-center bg-fixed overflow-hidden"
      style={{
        backgroundImage: "url('/img/bg-sports.jpg')",
        backgroundSize: 'cover',        // zachovať
        backgroundPosition: 'center',   // zachovať
        backgroundAttachment: 'fixed',  // desktop parallax
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-6 md:mb-12">
          Tips, News & Promos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-100 rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-[#102b5e] mb-3">{item.title}</h3>
              <p className="text-gray-700 mb-4">{item.description}</p>
              <a
                href={`${frontendURL}${item.href}`} // 👉 tu poskladáme finálnu URL
                className="inline-block text-[#102b5e] font-medium hover:underline"
              >
                {item.linkText} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsPromoSection;
