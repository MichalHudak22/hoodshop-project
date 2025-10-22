// src/components/HeadTitle.jsx
const HeadTitle = ({
  title,
  highlight,
  description,
  bgImage,
  gradientFrom = "green-600",
  gradientVia = "black",
  gradientTo = "green-700"
}) => {
  return (
    <section
      className={`relative text-center py-4 px-4 bg-gradient-to-br from-${gradientFrom} via-${gradientVia} to-${gradientTo} text-white overflow-hidden border-b-4 border-black`}
    >
      {/* Pozadie */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Obsah */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 tracking-wide drop-shadow-md">
          {title} <span className="text-blue-200">{highlight}</span>
        </h1>
        <p className="text-sm md:text-lg text-gray-100 leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
};

export default HeadTitle;
