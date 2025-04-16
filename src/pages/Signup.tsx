
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const accountFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const profileFormSchema = z.object({
  fitnessGoal: z.string().min(1, "Please select a fitness goal"),
  experienceLevel: z.string().min(1, "Please select your experience level"),
  preferredWorkoutType: z.string().min(1, "Please select a workout type"),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [accountData, setAccountData] = useState<AccountFormValues | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fitnessGoal: '',
      experienceLevel: '',
      preferredWorkoutType: '',
    },
    mode: "onChange", // Validate on change to give immediate feedback
  });

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
      // Log form values for debugging
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
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(handleAccountSubmit)} className="space-y-6">
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" autoComplete="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={accountForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" autoComplete="username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={accountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" autoComplete="new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={accountForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" autoComplete="new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Continue
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="fitnessGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's your primary fitness goal?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weight-loss">Lose weight</SelectItem>
                            <SelectItem value="muscle-gain">Build muscle</SelectItem>
                            <SelectItem value="endurance">Improve endurance</SelectItem>
                            <SelectItem value="flexibility">Increase flexibility</SelectItem>
                            <SelectItem value="general-fitness">General fitness</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's your fitness experience level?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="preferredWorkoutType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What type of workouts do you prefer?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select workout type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cardio">Cardio</SelectItem>
                            <SelectItem value="strength">Strength Training</SelectItem>
                            <SelectItem value="hiit">HIIT</SelectItem>
                            <SelectItem value="yoga">Yoga</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

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
                      type="button"
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Signup;
