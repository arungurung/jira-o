import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="container mx-auto mt-5 px-4">{children}</div>;
};

export default Layout;
