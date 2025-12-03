import React from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const ProjectInfo = () => {
  const paragraphs = [
    "I developed this project from scratch as a full-featured e-commerce web application focused on sports equipment. It is a portfolio project that showcases my skills in both frontend and backend development.",
    "One of the key features is the loyalty points system, where logged-in users earn points with each purchase that they can redeem as discounts on future orders.",
    "Users can browse from over 168 base products across multiple sports (football, hockey, cycling), with administrators having the ability to add new products or remove existing ones. Products can be filtered by type (jerseys, helmets, gloves, balls, etc.), and each product includes its own detail page with price, category, brand, and an option to add it to the shopping cart. The cart updates dynamically and users can proceed to a simulated checkout that includes delivery options, payment methods, and full form validation.",
    "This project also includes a classic product search by name. When users click on a searched product, they are redirected directly to its detail page. Additionally, I focused heavily on responsiveness to ensure the app looks and works well on both small and large devices.",
  ];

  return (
    <div
      className="relative min-h-[100vh] text-white flex flex-col items-center bg-fixed bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
    >
      <div className="pt-8 text-center bg-black/80 w-full z-10">
        <h1 className="text-2xl lg:text-4xl font-bold text-white">
          About This <span className="text-blue-200">Project</span>
        </h1>
      </div>

      <div className="absolute inset-0 bg-black opacity-30 z-0" />

      <div className="relative z-10 w-full py-10 px-4 lg:px-24 max-w-7xl mx-auto text-gray-200 bg-black/60 lg:rounded-xl shadow-md">
        <div className="space-y-6 text-sm md:text-lg xl:text-xl leading-relaxed">
          {paragraphs.map((text, i) => (
            <motion.p
              key={i}
              className="text-white sm:text-center"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              {text}
            </motion.p>
          ))}

          {/* Technologies */}
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="text-2xl text-center font-semibold mt-10 text-blue-100"
          >
            🛠️ Technologies Used
          </motion.h2>
          <motion.ul
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="list-disc space-y-2 px-4 mx-auto max-w-2xl text-left text-gray-200"
          >
            <li><strong>Frontend:</strong> React + Tailwind CSS</li>
            <li><strong>Backend:</strong> Express (Node.js) with a modular routes/controllers architecture</li>
            <li><strong>Database:</strong> TiDB Cloud (MySQL-compatible) + MySQL Workbench for schema design and data management</li>
            <li><strong>Authentication:</strong> JWT, bcrypt, and email verification (SendGrid)</li>
            <li><strong>Security:</strong> Input validation, XSS & SQL injection protection, and brute-force defense</li>
            <li><strong>Deployment:</strong> Render (hosting for backend & environment variable configuration)</li>
          </motion.ul>


          {/* Admin Capabilities */}
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={6}
            className="text-2xl text-center font-semibold mt-10 text-blue-100"
          >
            🧑‍💼 Admin Capabilities
          </motion.h2>

          <motion.p
            className="text-center"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={7}
          >
            Admins can access a dedicated dashboard with full control over the application:
          </motion.p>

          <motion.ul
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={8}
            className="list-disc space-y-2 px-4 mx-auto max-w-2xl text-left text-gray-200"
          >
            <li>📦 <strong>Order Summary:</strong> Total number of orders, total loyalty points used, total revenue (€), top 10 best-selling products (by number of units sold), top 10 customers by total purchases in the shop</li>
            <li>👥 <strong>User Management:</strong> Full user list, role control, order history, delete user</li>
            <li>🛍️ <strong>Product Management:</strong> Add/Delete products by name, with image, price, description</li>
            <li>🚚 <strong>Delivery Settings:</strong> Modify delivery pricing</li>
            <li>🏷️ <strong>Homepage & UI Configuration:</strong> Customize Football, Hockey, Cycling pages</li>
          </motion.ul>


          {/* User Features */}
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={11}
            className="text-2xl text-center font-semibold  mt-10 text-blue-100"
          >
            👤 User Features
          </motion.h2>

          <motion.ul
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={12}
            className="list-disc space-y-2 px-4 mx-auto max-w-2xl text-left text-gray-200"
          >
            <li>Account registration with email verification</li>
            <li>Editable profile page with avatar upload</li>
            <li>Cart for both guests and logged-in users</li>
            <li>Checkout with contact info, delivery, and payment</li>
            <li>5% loyalty point reward system per order</li>
            <li>Order history and points tracking</li>
          </motion.ul>


          {/* Security */}
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={9}
            className="text-2xl text-center font-semibold mt-10 text-blue-100"
          >
            🔐 Security Highlights
          </motion.h2>

          <motion.ul
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={10}
            className="list-disc space-y-2 px-4 mx-auto max-w-2xl text-left text-gray-200"
          >
            <li>Passwords hashed with bcrypt</li>
            <li>5 failed login attempts trigger a 5-minute account lock</li>
            <li>Inactive users are automatically logged out after 6 hours</li>
            <li>Sanitized input to prevent SQL injection and XSS attacks</li>
          </motion.ul>

          <motion.p
            className="text-white sm:text-center"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={13}
          >
            The backend architecture utilizes modular Express controllers and routes, ensuring clean, reusable, and maintainable code. I connected the frontend and backend on Render, integrating it with a TiDB database, configuring environment variables, and ensuring seamless communication across the full stack.
          </motion.p>


          <motion.p
            className="text-white sm:text-center"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={14}
          >
           I see this project as an important full-stack JavaScript application (React and Node.js) where I went through the complete development process — from planning to implementation, including backend, frontend, database design, and deployment.
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
