import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
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
    
    setIsLoading(true);
    
    try {
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
          emailRedirectTo: `${window.location.origin}/login`,
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
