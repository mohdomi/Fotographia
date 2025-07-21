import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';


const Sidebar = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '⏳', label: 'Pending', path: '/dashboard/pending' },
    { icon: '📂', label: 'Current', path: '/dashboard/current' },
    { icon: '✅', label: 'Completed', path: '/dashboard/completed' }
  ];

  const isActive = (path) => {
    if (location.pathname === '/add-project' && path === '/dashboard') {
      return false;
    }
    return location.pathname === path;
  };

  return (
    <aside className={`w-full lg:w-[220px] bg-[#222] text-white flex flex-col lg:pt-6 lg:pb-6 lg:pl-0 lg:pr-0 lg:min-h-screen p-3 lg:p-0 ${className}`}>
      <div className="flex items-center gap-3 font-['Pacifico'] text-lg lg:text-[1.3rem] px-3 lg:px-6 pb-4 lg:pb-8">
        <Logo size="lg" />
      </div>
      
      <nav className="flex flex-row lg:flex-col gap-2 px-0 lg:px-3 overflow-x-auto lg:overflow-visible">
        {navItems.map((item, index) => (
          <a 
            key={index}
            href="#"
            className={`text-white no-underline py-2 lg:py-3 px-3 lg:px-[18px] rounded-lg text-sm lg:text-[1.08rem] flex items-center gap-2 lg:gap-[10px] transition-all duration-200 ${
              isActive(item.path) 
                ? 'bg-white text-[#181818]' 
                : 'hover:bg-white hover:text-[#181818]'
            } whitespace-nowrap`}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.path);
            }}
          >
            <span>{item.icon}</span>
            <span className="hidden sm:block">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 