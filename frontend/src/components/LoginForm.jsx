
function LoginForm({ pin, setPin, agreedToTerms, setAgreedToTerms, handleSubmit,setAdmin,admin }) {

//   const [admin,setAdmin]=useState(false);



 
  


  return (
    <>
          {/* Login Form */}
        
                 <form onSubmit={handleSubmit} className="space-y-4 flex flex-col justify-center sm:space-y-6">
            {/* PIN Input */}
            <div>
              <input
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e)=>setPin(e.target.value)}
                className=" w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-black rounded-lg text-sm sm:text-base focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex justify-center items-center gap-2 sm:gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e)=>setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-black rounded focus:ring-blue-500 flex-shrink-0"
                required
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                I accept and agree to{' '}
                <a href="#" className="text-blue-500 underline hover:text-blue-700">
                  Terms and conditions
                </a>
                
              </label>
               <a className="text-blue-500 underline cursor-pointer hover:text-blue-700" onClick={()=>setAdmin(!admin)}>AdminSigin</a> 
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
    </>
     
  )
}

export default LoginForm