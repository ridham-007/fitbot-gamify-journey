
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieConsent from '../common/CookieConsent';

type MainLayoutProps = {
  children: React.ReactNode;
  isLoggedIn?: boolean;
  hideFooter?: boolean;
};

const MainLayout = ({ 
  children, 
  isLoggedIn = false, 
  hideFooter = false 
}: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-grow">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <CookieConsent />
    </div>
  );
};

export default MainLayout;
