
import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

import LoginForm from '../components/LoginForm';
import { useDispatch } from 'react-redux';
import { Adminlogin, loginUser } from '../store/thunks/authThunk';
import { toast } from 'react-toastify';

function Login() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [admin, setAdmin] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin && agreedToTerms) {
      if (admin) {
        try {
          await dispatch(Adminlogin({ password: pin })).unwrap();
          toast.success("Welcome back Admin");
          navigate("/dashboard");
        } catch (error) {
          toast.error(error || "Login failed");
        }

      } else {

        try {
          await dispatch(loginUser({ pin })).unwrap(); // only proceeds if successful
          toast.success("Login successful");
          navigate('/client');
        } catch (error) {
          // catch the rejected value here
          toast.error(error || "Login failed");
        }
      }
    }
  };

  return (
    <div className="maindiv h-screen w-screen grid grid-rows-[40px_1fr]  py-4 px-4 sm:p-8">
      {/* Header */}
      <div className="header h-[40px] px-4  sm:px-10 flex justify-between items-center">
        {/* Logo - Always visible */}
        <div className="w-1/2 flex mb-2 items-center h-full">
          <img
            src="/logo/logo.png"
            alt="logo"
            className="h-full w-auto object-contain"
          />
          <img
            src="/logo/title.png"
            alt="title"
            className="h-full w-auto object-contain ml-0"
          />
        </div>

        {/* Welcome text - only on larger screens */}
        <div className="w-1/2 justify-center hidden md:flex mt-10">
          <h1 className="rage-welcome">Welcome!</h1>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-20 py-6 sm:py-10">
        {/* Left Column - Image */}
        <div className="w-full flex items-center justify-center  md:px-20 sm:px-20">
          <img
            src="https://media.istockphoto.com/id/2027127656/photo/vibrant-colored-closed-wooden-doors-in-a-row-on-blue-sky-and-sea-background-choice-and.webp?a=1&b=1&s=612x612&w=0&k=20&c=i_Ymb_iVtRFAdccY2x7dRarxDCyII1k2XEDU3MVGL4w="
            alt=""
            className="h-[300px] md:h-full w-auto object-cover rounded-md"
          />
        </div>

        {/* Right Column - Form */}

        <div className="w-full p-4 self-start h-full flex flex-col justify-center">
          <div className="mb-6 lg:mb-8">
            <p className="font-bold text-black text-center text-sm sm:text-base">

              {admin ? "Log in as Admin" : "Log in to continue"}
            </p>
          </div>
          <LoginForm pin={pin}
            setPin={setPin}
            agreedToTerms={agreedToTerms}
            setAgreedToTerms={setAgreedToTerms}
            handleSubmit={handleSubmit}
            setAdmin={setAdmin}
            admin={admin} />

        </div>
      </div>
    </div>
  );
}

export default Login;
