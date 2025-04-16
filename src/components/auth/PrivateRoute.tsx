
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isLoggedIn } = useUser();
  const location = useLocation();

  // If not logged in, redirect to login page with return path
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If logged in, render children
  return <>{children}</>;
};

export default PrivateRoute;
