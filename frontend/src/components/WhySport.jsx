const WhySport = () => {
  const sections = [
    {
      title: 'Why Play Football?',
      benefits: [
        'Improves cardiovascular health and stamina.',
        'Enhances teamwork and communication.',
        'Builds leg strength and coordination.',
        'Boosts mental focus and discipline.',
      ],
    },
    {
      title: 'Why Play Hockey?',
      benefits: [
        'Develops agility and fast reflexes.',
        'Great full-body workout on ice.',
        'Teaches strategic thinking in fast-paced situations.',
        'Builds resilience and team spirit.',
      ],
    },
    {
      title: 'Why Cycle?',
      benefits: [
        'Low-impact cardio suitable for all ages.',
        'Strengthens legs and core muscles.',
        'Promotes mental well-being and reduces stress.',
        'Environmentally friendly transportation.',
      ],
    },
  ];

  return (
  <section className="bg-[#102b5e] py-16 px-4">
  <div className="max-w-8xl mx-auto rounded-xl shadow-lg xl:p-8">
    <h2 className="text-4xl font-bold text-center text-gray-100 mb-12">
      Why Sports Matter
    </h2>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      {sections.map((sport, idx) => (
        <div
          key={idx}
          className="bg-[#0b1d3f] rounded-lg p-6 shadow-md md:w-[420px] md:m-auto lg:w-full h-full"
        >
          <h3 className="text-2xl font-semibold text-gray-100 mb-3">
            {sport.title}
          </h3>
          <ul className="text-gray-300 space-y-2 text-md lg:text-base list-disc list-outside break-words whitespace-normal">
            {sport.benefits.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>


  );
};

export default WhySport;
