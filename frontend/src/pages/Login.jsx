import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/thunks/authThunk.js';

const Login = () => {
  // const navigate = useNavigate();
  // const dispatch = useDispatch();

   const dispatch = useDispatch();
  const navigate = useNavigate();
  const {loading, error } = useSelector((state) => state.auth);

  const [pin, setPin] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

 //console.log(user);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin && agreedToTerms) {
     try {
      const user = await dispatch(loginUser({ pin })).unwrap(); // ✅ unwraps the fulfilled value
      console.log('Login successful:', user);
      navigate('/access');
    } catch (err) {
      console.error('Login failed:', err);
    }

    }
  };

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg sm:rounded-[20px] shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col lg:flex-row">
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
            <div
              className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hidden items-center justify-center"
              style={{ minHeight: '200px' }}
            >
              <div className="text-center">
                <img
                  src="/logo.png"
                  alt="Fotographiya Logo"
                  className="h-16 lg:h-20 w-auto object-contain"
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>

          <div className="lg:flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center mb-8 lg:mb-12">
              <img
                src="/logo.png"
                alt="Fotographiya Logo"
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>

            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2" style={{ fontFamily: 'cursive' }}>
                Welcome!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Log in to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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

              <button
                type="submit"
                disabled={!pin || !agreedToTerms || loading}
                className={`w-full py-3 sm:py-4 rounded-lg text-white font-medium text-sm sm:text-base transition-colors ${
                  pin && agreedToTerms && !loading
                    ? 'bg-black hover:bg-gray-800'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {loading ? 'Logging in...' : 'Continue'}
              </button>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
