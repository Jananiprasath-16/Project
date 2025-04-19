import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 overflow-hidden">
      {/* Background Particles Effect */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-full bg-[url('https://source.unsplash.com/random/1920x1080/?abstract')] opacity-5 bg-cover bg-center animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-screen">
        {/* Logo/Brand */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-down">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">EduMind</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-3xl font-light text-center max-w-3xl mb-10 leading-relaxed text-gray-700 animate-fade-in-up">
          Your AI-powered virtual professor and concept visualizer, simplifying the toughest educational challenges with intelligent solutions and dynamic mind maps.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          <a
            href="/virtual-professor"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Explore AI Professor
          </a>
          <a
            href="/concept-visualizer"
            className="px-8 py-4 bg-transparent border-2 border-purple-600 hover:bg-purple-600 hover:text-white text-purple-600 font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Try Concept Visualizer
          </a>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div className="flex items-start space-x-4 animate-slide-in-left">
            <div className="p-3 bg-blue-600/10 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">AI Virtual Professor</h3>
              <p className="text-gray-600">Get instant solutions to the hardest queries in any educational field with our intelligent assistant.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 animate-slide-in-right">
            <div className="p-3 bg-purple-600/10 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Concept Visualizer</h3>
              <p className="text-gray-600">Transform complex concepts into clear, interactive mind maps for better understanding.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-left {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right {
          0% {
            opacity: 0;
            transform: translateX(20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.2s both;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out 0.4s both;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out 0.4s both;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;