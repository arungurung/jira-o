const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center pt-20 pb-5">
      {children}
    </div>
  );
};

export default Layout;
