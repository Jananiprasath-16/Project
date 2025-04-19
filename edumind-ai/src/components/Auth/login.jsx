import React, { useState } from 'react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login clicked');
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-100 to-blue-200 px-4 overflow-hidden">
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,50,100,0.15)] w-full max-w-md p-10 border border-blue-200/50 transform transition-all hover:scale-105 duration-700">
        {/* Animated background particles */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-float top-0 left-0"></div>
          <div className="absolute w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-float-delayed bottom-0 right-0"></div>
        </div>

        <h2 className="text-4xl font-extrabold text-blue-800 mb-8 text-center tracking-tight drop-shadow-md">
          Welcome Back
        </h2>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 p-4 rounded-xl border border-blue-200/50 hover:bg-blue-50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-500 ease-out font-medium transform hover:-translate-y-1"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Log in with Google
          </button>

          <button
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white p-4 rounded-xl border border-blue-300/50 hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-500 ease-out font-medium transform hover:-translate-y-1"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"
              />
            </svg>
            Log in with Facebook
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-blue-200/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-transparent px-4 text-blue-600 font-medium tracking-wide">Or use email</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full p-4 rounded-xl bg-white/50 border border-blue-200/50 text-blue-900 placeholder-blue-400/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/70 transition-all duration-500 shadow-inner"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-4 rounded-xl bg-white/50 border border-blue-200/50 text-blue-900 placeholder-blue-400/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/70 transition-all duration-500 shadow-inner"
              required
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl mt-8 hover:from-blue-600 hover:to-blue-700 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-500 font-semibold text-lg transform hover:-translate-y-1"
        >
          Log In to EduMind
        </button>

        <p className="mt-6 text-center text-blue-600">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-500 hover:text-blue-700 font-semibold transition-colors duration-300">
            Sign Up
          </a>
        </p>
      </div>
    </section>
  );
};

export default Login;