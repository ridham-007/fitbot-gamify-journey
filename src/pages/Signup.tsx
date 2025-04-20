
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import AccountForm, { AccountFormValues } from '@/components/auth/AccountForm';
import ProfileForm, { ProfileFormValues } from '@/components/auth/ProfileForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileFormSchema } from '@/components/auth/ProfileForm';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [accountData, setAccountData] = useState<AccountFormValues | null>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fitnessGoal: '',
      experienceLevel: '',
      preferredWorkoutType: '',
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during Google sign up",
        variant: "destructive",
      });
    }
  };

  const handleAccountSubmit = (values: AccountFormValues) => {
    console.log("Account form submitted:", values);
    setAccountData(values);
    setCurrentStep(2);
  };

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    if (!accountData) {
      console.error("Account data is missing");
      toast({
        title: "Error",
        description: "Please complete step 1 first",
        variant: "destructive",
      });
      setCurrentStep(1);
      return;
    }
    
    console.log("Profile form submitted:", values);
    console.log("With account data:", accountData);
    
    setIsLoading(true);
    
    try {
      console.log("Submitting to Supabase with:", {
        email: accountData.email,
        password: accountData.password,
        userData: {
          username: accountData.username,
          fitnessGoal: values.fitnessGoal,
          experienceLevel: values.experienceLevel,
          preferredWorkoutType: values.preferredWorkoutType,
        }
      });

      const { data, error } = await supabase.auth.signUp({
        email: accountData.email,
        password: accountData.password,
        options: {
          data: {
            username: accountData.username,
            fitnessGoal: values.fitnessGoal,
            experienceLevel: values.experienceLevel,
            preferredWorkoutType: values.preferredWorkoutType,
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
      console.error("Signup error:", error);
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during signup",
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
            {currentStep === 1 ? (
              <>
                <AccountForm onSubmit={handleAccountSubmit} />
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
                    <button 
                      onClick={handleGoogleSignUp}
                      className="w-full flex items-center justify-center bg-white dark:bg-fitDark-700 border border-gray-300 dark:border-fitDark-600 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-fitDark-600"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"
                          fill="currentColor"
                        />
                      </svg>
                      Sign up with Google
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <ProfileForm 
                onSubmit={handleProfileSubmit} 
                onBack={() => setCurrentStep(1)}
                isLoading={isLoading}
                form={profileForm}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Signup;
