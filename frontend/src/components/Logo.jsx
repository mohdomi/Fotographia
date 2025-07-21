import React from 'react';

const Logo = ({ size = 'md', className = '' }) => {
  // Size classes mapping
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12'
  };

  return (
    <div className='flex'>
    <img
    src='logo/logo.png'
     className={`${sizeClasses[size] || sizeClasses.md} w-auto object-contain ${className}`}
     alt='Fotographiya Logo'
    />
    <img 
      src="/logo/title.png" 
      alt="Fotographiya title" 
      className={`${sizeClasses[size] || sizeClasses.md} w-auto object-contain ${className}`}
    />
    </div>
  );
};

export default Logo; 