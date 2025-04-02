import React from 'react';

interface SafeFragmentProps {
  children: React.ReactNode;
}

const SafeFragment: React.FC<SafeFragmentProps> = ({ children }) => {
  return <>{children}</>;
};

export default SafeFragment; 