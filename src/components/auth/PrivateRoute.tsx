
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isLoggedIn, user } = useUser();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Add a small delay to ensure auth state is properly loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-fitPurple-600" />
      </div>
    );
  }

  // If not logged in, redirect to login page with return path
  if (!isLoggedIn) {
    console.log("User not logged in, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If logged in, render children
  return <>{children}</>;
};

export default PrivateRoute;
