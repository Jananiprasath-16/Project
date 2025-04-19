import React from 'react';

const NavBar = () => {
  const links = [
    {
      name: 'Home',
      path: '/',
    },
    {
      name: 'Virtual Professor',
      path: '/virtual-professor',
    },
    {
      name: 'Concept Visualizer',
      path: '/concept-visualizer',
    },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-6 py-3">
      <div className="backdrop-blur-md bg-white/30 rounded-full border border-blue-100 shadow-lg px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="font-bold text-xl">
            EduMind <span className="text-blue-500">AI</span>
          </a>
        </div>

        <div className="flex items-center space-x-8">
          {links.map((link) => (
            <div key={link.name}>
              <a
                href={link.path}
                className="hover:text-blue-500 transition-colors duration-200 font-medium"
              >
                {link.name}
              </a>
            </div>
          ))}

          <div className="ml-6 flex items-center space-x-4">
            <a
              href="/signup"
              className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 py-2 px-6 rounded-full transition-all duration-200 shadow-md flex items-center justify-center font-medium border border-blue-200"
            >
              Sign Up
            </a>
            <a
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full transition-all duration-200 shadow-md flex items-center justify-center font-medium"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;