import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import Logo from "./Logo"
function DashboardNav({ toggleSidebar }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white px-4 sm:px-8 py-2 flex justify-between  items-center shadow">
      {/* Left: Logo (hidden on mobile) */}
      <div className="text-xl font-bold text-indigo-600 hidden sm:block">
        <Logo size='sm'/>
      </div>

      {/* Center: Search input - always visible */}
      <div className="flex flex-1 justify-center items-center space-x-2 sm:ml-0 ml-10">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-md px-2 py-1  focus:outline-none"
        />
      </div>

      {/* Right: Notification + Hamburger */}
      <div className="flex items-center gap-4 ml-2 sm:ml-0">
        {/* Notification Icon */}
        <button className="relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 text-xs text-white bg-red-500 rounded-full">
            3
          </span>
        </button>

        {/* Hamburger (only on mobile) */}
        <button className="sm:hidden block" onClick={toggleSidebar}>
          <Menu className="w-6 h-6 text-gray-800" />
        </button>
      </div>
    </div>
  );
}

export default DashboardNav;
