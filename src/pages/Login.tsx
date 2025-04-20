
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import AccountForm from '@/components/auth/AccountForm';
import {GoogleButton} from '@/components/auth/GoogleButton';
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitPurple-500 via-fitPurple-600 to-fitPurple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Floating shapes for background animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay animate-pulse-scale" />
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-white/5 rounded-full mix-blend-overlay animate-pulse-scale delay-300" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full mix-blend-overlay animate-pulse-scale delay-700" />
        </div>

        <Card className="w-full backdrop-blur-xl bg-white/90 dark:bg-fitDark-800/90 shadow-2xl animate-slide-up">
          <CardContent className="pt-8 pb-6 px-6">
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-fitPurple-600 to-fitPurple-400 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Sign in to continue your fitness journey
              </p>
            </div>

            <div className="space-y-6">
              <GoogleButton className="w-full animate-slide-up delay-100" />
              
              <div className="relative">
                <Separator className="absolute inset-0 flex items-center" aria-hidden="true">
                  <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                </Separator>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-fitDark-800">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="animate-slide-up delay-200">
                <AccountForm mode="login" />
              </div>

              <div className="text-center space-y-4 animate-slide-up delay-300">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="text-fitPurple-600 dark:text-fitPurple-400 hover:text-fitPurple-700 dark:hover:text-fitPurple-300 p-0"
                    onClick={() => navigate('/signup')}
                  >
                    Sign up
                  </Button>
                </p>
                <Button
                  variant="link"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot your password?
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
