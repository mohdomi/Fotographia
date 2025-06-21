import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin && agreedToTerms) {
      // Add authentication logic here
      console.log('PIN:', pin);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2 sm:p-4">
      {/* Login Card */}
      <div className="bg-white rounded-lg sm:rounded-[20px] shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col lg:flex-row">
        {/* Left Side - Image */}
        <div className="lg:flex-1 relative h-48 sm:h-64 lg:h-auto">
          <img 
            src="/image.jpg" 
            alt="Wedding Couple" 
            className="w-full h-full object-cover"
            style={{ minHeight: '200px' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback gradient background */}
          <div 
            className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hidden items-center justify-center"
            style={{ minHeight: '200px' }}
          >
            <div className="text-center text-white">
              <div className="text-4xl lg:text-6xl mb-4">📸</div>
              <div className="text-lg lg:text-xl font-semibold">Fotographiya</div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 lg:mb-12">
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-lg sm:text-xl">📸</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-black">Fotographiya</span>
          </div>

          {/* Welcome Text */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2" style={{ fontFamily: 'cursive' }}>
              Welcome!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Log in to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* PIN Input */}
            <div>
              <input
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg text-sm sm:text-base focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2 sm:gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                required
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                I accept and agree to{' '}
                <a href="#" className="text-blue-500 underline hover:text-blue-700">
                  Terms and conditions
                </a>
              </label>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={!pin || !agreedToTerms}
              className={`w-full py-3 sm:py-4 rounded-lg text-white font-medium text-sm sm:text-base transition-colors ${
                pin && agreedToTerms
                  ? 'bg-black hover:bg-gray-800'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
