import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  width = 32, 
  height = 32, 
  className = '' 
}) => {
  return (
    <img
      src="/portfolio-egg-logo.png"
      alt="Portfolio Egg"
      width={width}
      height={height}
      className={className}
    />
  );
};

export const LogoIcon: React.FC<LogoProps> = ({ 
  width = 24, 
  height = 24, 
  className = '' 
}) => {
  return (
    <img
      src="/favicon.png"
      alt="Portfolio Egg"
      width={width}
      height={height}
      className={className}
    />
  );
};

export default Logo; 