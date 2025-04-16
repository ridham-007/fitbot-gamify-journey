
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fitnessGoal: '',
    experienceLevel: '',
    preferredWorkoutType: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure your passwords match.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            fitnessGoal: formData.fitnessGoal,
            experienceLevel: formData.experienceLevel,
            preferredWorkoutType: formData.preferredWorkoutType,
          },
        },
      });

      if (error) throw error;
      
      if (data) {
        toast({
          title: "Account created!",
          description: "Welcome to FitBot. Your fitness journey begins now!",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-fitDark-900">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {currentStep === 1 ? 'Create your account' : 'Set up your profile'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {currentStep === 1 
              ? 'Join FitBot and start your fitness journey' 
              : 'Tell us about your fitness preferences'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-fitDark-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {currentStep === 1 ? (
                <>
                  <div>
                    <Label htmlFor="email">
                      Email address
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="username">
                      Username
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className="block w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">
                      Password
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm Password
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="fitnessGoal">
                      What's your primary fitness goal?
                    </Label>
                    <div className="mt-1">
                      <select
                        id="fitnessGoal"
                        name="fitnessGoal"
                        required
                        value={formData.fitnessGoal}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 dark:border-fitDark-600 bg-white dark:bg-fitDark-700 shadow-sm focus:border-fitPurple-500 focus:ring-fitPurple-500 h-10 px-3"
                      >
                        <option value="">Select a goal</option>
                        <option value="weight-loss">Lose weight</option>
                        <option value="muscle-gain">Build muscle</option>
                        <option value="endurance">Improve endurance</option>
                        <option value="flexibility">Increase flexibility</option>
                        <option value="general-fitness">General fitness</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">
                      What's your fitness experience level?
                    </Label>
                    <div className="mt-1">
                      <select
                        id="experienceLevel"
                        name="experienceLevel"
                        required
                        value={formData.experienceLevel}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 dark:border-fitDark-600 bg-white dark:bg-fitDark-700 shadow-sm focus:border-fitPurple-500 focus:ring-fitPurple-500 h-10 px-3"
                      >
                        <option value="">Select experience level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="preferredWorkoutType">
                      What type of workouts do you prefer?
                    </Label>
                    <div className="mt-1">
                      <select
                        id="preferredWorkoutType"
                        name="preferredWorkoutType"
                        required
                        value={formData.preferredWorkoutType}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 dark:border-fitDark-600 bg-white dark:bg-fitDark-700 shadow-sm focus:border-fitPurple-500 focus:ring-fitPurple-500 h-10 px-3"
                      >
                        <option value="">Select workout type</option>
                        <option value="cardio">Cardio</option>
                        <option value="strength">Strength Training</option>
                        <option value="hiit">HIIT</option>
                        <option value="yoga">Yoga</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {currentStep === 1 
                    ? 'Continue' 
                    : isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </form>

            {currentStep === 1 && (
              <>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-fitDark-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-fitDark-800 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "Google Sign-up",
                          description: "Google authentication would be implemented here.",
                        });
                      }}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"
                          fill="currentColor"
                        />
                      </svg>
                      Sign up with Google
                    </Button>
                  </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-fitPurple-600 hover:text-fitPurple-500 dark:text-fitPurple-400 dark:hover:text-fitPurple-300"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                className="mt-4 w-full text-center text-sm text-fitPurple-600 hover:text-fitPurple-500 dark:text-fitPurple-400 dark:hover:text-fitPurple-300"
                onClick={() => setCurrentStep(1)}
              >
                Back to account details
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Signup;
