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
    <img 
      src="/logo/title.png" 
      alt="Fotographiya Logo" 
      className={`${sizeClasses[size] || sizeClasses.md} w-auto object-contain ${className}`}
    />
  );
};

export default Logo; 