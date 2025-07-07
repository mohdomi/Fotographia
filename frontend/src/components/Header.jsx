import React, { useState } from 'react';
import Logo from './Logo';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/slice/authSlice';
import LogoutButton from './LogoutButton';

const Header = ({ 
  showTimer = false, 
  userName = '', 
  notificationCount = 0,
  className = '' 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch=useDispatch();
  return (
    <header className={`bg-white shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <Logo size="md" />
          </div>

          {/* Center Navigation - Hide on mobile */}
          {showTimer && (
            <div className="hidden md:flex items-center gap-2">
              <div className="bg-indigo-900 rounded-full py-1 px-4 flex items-center gap-2">
                <button className="px-2 md:px-3 py-1 text-white text-xs md:text-sm font-medium">
                  1<br/>month
                </button>
                <button className="px-2 md:px-3 py-1 text-white text-xs md:text-sm font-medium">
                  19<br/>days
                </button>
                <button className="px-2 md:px-3 py-1 text-white text-xs md:text-sm font-medium">
                  12<br/>hours
                </button>
                <button className="px-2 md:px-3 py-1 text-white text-xs md:text-sm font-medium">
                  55<br/>sec
                </button>
              </div>
              <div className="text-xs text-gray-500 text-center">
                Time Limit
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* User Profile */}
          {userName && (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg className="w-5 md:w-6 h-5 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificationCount > 0 && (
                    <>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notificationCount}
                    </span>
                    </>
                  )}

                  {/*  For testing purpose  */}
                  <LogoutButton/>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">{userName}</div>
                </div>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {showTimer && (
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="bg-indigo-900 rounded-full py-1 px-4 flex items-center gap-2">
                  <button className="px-2 py-1 text-white text-xs font-medium">
                    1<br/>month
                  </button>
                  <button className="px-2 py-1 text-white text-xs font-medium">
                    19<br/>days
                  </button>
                  <button className="px-2 py-1 text-white text-xs font-medium">
                    12<br/>hours
                  </button>
                  <button className="px-2 py-1 text-white text-xs font-medium">
                    55<br/>sec
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Time Limit
                </div>
              </div>
            )}
            
            {userName && (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="relative">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificationCount > 0 && (
                    <>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notificationCount}
                    </span>
                      <button className="bg-blue-500 w-full" onClick={async()=>await dispatch(logoutUser)}>Logout</button>
                    </>
                  )}
                 
                </div>
                <div className="text-sm font-medium text-gray-800">{userName}</div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Blue accent line */}
      {/* <div className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></div> */}
    </header>
  );
};

export default Header; 