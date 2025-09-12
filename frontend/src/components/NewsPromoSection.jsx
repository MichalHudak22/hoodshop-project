const newsItems = [
  {
    title: 'Top 5 Must-Have Items for Football Season',
    description: 'Get ready for the pitch with our essential gear checklist.',
    linkText: 'Read More',
    href: '/blog/football-essentials',
  },
  {
    title: 'How to Choose the Best Bike Helmet',
    description: 'Safety first! Tips to find the perfect helmet for your rides.',
    linkText: 'Read More',
    href: '/blog/helmet-guide',
  },
  {
    title: 'Hockey Gear: What Beginners Need to Know',
    description: 'Starting out on the ice? Here’s your starter pack.',
    linkText: 'Read More',
    href: '/blog/hockey-gear-basics',
  },
];

const NewsPromoSection = () => {
  return (
    <section
  className="relative py-16 px-4 bg-black bg-cover bg-center overflow-hidden"
  style={{
    backgroundImage: "url('/img/bg-sports.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  }}
>
  <div className="absolute inset-0 bg-black bg-opacity-30"></div> {/* Tmavý overlay */}

  <div className="relative z-10 max-w-7xl mx-auto">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-12">
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
            href={item.href}
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
