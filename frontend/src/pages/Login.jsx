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
      

// export default function FotografiyaLogin() {
//   const [pin, setPin] = useState('');
//   const [isAccepted, setIsAccepted] = useState(false);

//   const handleSubmit = () => {
//     if (pin && isAccepted) {
//       console.log('Login attempted with PIN:', pin);
// 
//     }
//   };

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

        {/* Right Side - Login Form */}
        <div className="lg:flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center mb-8 lg:mb-12">
            <img 
              src="/logo.png" 
              alt="Fotographiya Logo" 
              className="h-8 sm:h-10 w-auto object-contain"
            />
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
     )
};
          
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
//               <div className="w-5 h-5 bg-white rounded-full"></div>
//             </div>
//             <span className="text-2xl font-medium italic text-black">Fotografiya</span>
//           </div>
//           <h1 className="text-4xl font-bold italic text-black">Welcome!</h1>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
//           {/* Photo Section */}
//           <div className="flex justify-center">
//             <div className="w-64 h-80 bg-gray-900 rounded-2xl overflow-hidden shadow-lg relative">
//               {/* Traditional couple illustration */}
//               <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-green-600 to-red-700"></div>
//               <div className="absolute inset-4 flex items-center justify-center">
//                 {/* Male figure */}
//                 <div className="relative mr-4">
//                   <div className="w-16 h-20 bg-gradient-to-b from-amber-400 to-red-600 rounded-t-full"></div>
//                   <div className="w-12 h-12 bg-amber-200 rounded-full mx-auto -mt-6 border-2 border-white"></div>
//                   <div className="w-20 h-24 bg-gradient-to-b from-red-700 to-amber-800 rounded-b-lg -mt-2"></div>
//                   {/* Crown/hat */}
//                   <div className="w-8 h-4 bg-yellow-400 rounded-t-lg mx-auto -mt-32 mb-2"></div>
//                 </div>
                
//                 {/* Female figure */}
//                 <div className="relative">
//                   <div className="w-16 h-20 bg-gradient-to-b from-green-400 to-emerald-600 rounded-t-full"></div>
//                   <div className="w-12 h-12 bg-amber-200 rounded-full mx-auto -mt-6 border-2 border-white"></div>
//                   <div className="w-20 h-24 bg-gradient-to-b from-green-700 to-emerald-800 rounded-b-lg -mt-2"></div>
//                   {/* Veil/dupatta */}
//                   <div className="w-10 h-6 bg-green-300 rounded-t-lg mx-auto -mt-32 mb-2 opacity-70"></div>
//                 </div>
//               </div>
              
//               {/* Decorative elements */}
//               <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full opacity-80"></div>
//               <div className="absolute top-8 left-6 w-2 h-2 bg-yellow-300 rounded-full opacity-60"></div>
//             </div>
//           </div>

//           {/* Login Section */}
//           <div className="space-y-6">
//             <div className="text-center md:text-left">
//               <p className="text-gray-600 text-lg mb-6">Log in to continue</p>
//             </div>

//             <div className="space-y-6">
//               <div>
//                 <input
//                   type="password"
//                   placeholder="Enter your PIN"
//                   value={pin}
//                   onChange={(e) => setPin(e.target.value)}
//                   className="w-full px-4 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
//                 />
//               </div>

//               <div className="flex items-start space-x-3">
//                 <input
//                   type="checkbox"
//                   id="terms"
//                   checked={isAccepted}
//                   onChange={(e) => setIsAccepted(e.target.checked)}
//                   className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black focus:ring-2 mt-1"
//                 />
//                 <label htmlFor="terms" className="text-gray-700 text-sm leading-relaxed">
//                   I accept and agree to{' '}
//                   {/* isko anchor tag mei change karna h */}
//                   <span className="text-blue-600 underline hover:text-blue-800 transition-colors cursor-pointer">
//                     Terms and conditions
//                   </span>
//                 </label>
//               </div>

//               <button
//                 onClick={handleSubmit}
//                 className={`w-full py-4 rounded-xl text-lg font-medium transition-all ${
//                   pin && isAccepted
//                     ? 'bg-black text-white hover:bg-gray-800 cursor-pointer shadow-lg hover:shadow-xl'
//                     : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                 }`}
//                 disabled={!pin || !isAccepted}
//               >
//                 Continue
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
  // </div>
  //);
//};

export default Login; 
