import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  User, 
  Dumbbell, 
  Brain, 
  BarChart2, 
  Trophy,
  LogOut,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type NavbarProps = {
  isLoggedIn?: boolean;
};

const Navbar = ({ isLoggedIn: isLoggedInProp }: NavbarProps) => {
  const { isLoggedIn: isAuthLoggedIn, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const isLoggedIn = isLoggedInProp !== undefined ? isLoggedInProp : isAuthLoggedIn;

  useEffect(() => {
    const publicOnlyPaths = ['/', '/login', '/signup'];
    if (isLoggedIn && publicOnlyPaths.includes(location.pathname)) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, location.pathname, navigate]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
    
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-fitPurple-600">BubblyFit AI</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/trainer" className="text-gray-700 dark:text-gray-300 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-sm font-medium">
                  AI Trainer
                </Link>
                <Link to="/progress" className="text-gray-700 dark:text-gray-300 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-sm font-medium">
                  Progress
                </Link>
                <Link to="/challenges" className="text-gray-700 dark:text-gray-300 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-sm font-medium">
                  Challenges
                </Link>
                <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-sm font-medium">
                  Profile
                </Link>
                <Link to="/settings" className="text-gray-700 dark:text-gray-300 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-sm font-medium">
                  Settings
                </Link>
                <ThemeToggle />
                <Button 
                  variant="outline" 
                  size="sm"
                  className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/features" className="text-gray-700 dark:text-gray-300 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-sm font-medium">
                  Features
                </Link>
                <Link to="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </Link>
                <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-sm font-medium">
                  About
                </Link>
                <ThemeToggle />
                <div className="flex items-center ml-4 space-x-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-fitPurple-600 hover:bg-gray-100 dark:hover:bg-fitDark-800"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-96" : "max-h-0"
        )}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isLoggedIn ? (
            <>
              <Link 
                to="/dashboard" 
                className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fitDark-800 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Dumbbell className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
              <Link 
                to="/trainer" 
                className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fitDark-800 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Brain className="mr-2 h-5 w-5" />
                AI Trainer
              </Link>
              <Link 
                to="/progress" 
                className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fitDark-800 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <BarChart2 className="mr-2 h-5 w-5" />
                Progress
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fitDark-800 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <User className="mr-2 h-5 w-5" />
                Profile
              </Link>
              <Link 
                to="/challenges" 
                className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fitDark-800 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Challenges
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fitDark-800 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Link>
              <div className="pt-4 flex items-center justify-between px-3">
                <ThemeToggle />
                <Button 
                  className="w-32 flex items-center justify-center" 
                  variant="outline"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/features" 
                className="block text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fitDark-800 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="block text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fitDark-800 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="block text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-fitDark-800 hover:text-fitPurple-600 dark:hover:text-fitPurple-400 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 flex items-center justify-between px-3">
                <ThemeToggle />
                <div className="flex space-x-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full" variant="outline">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
