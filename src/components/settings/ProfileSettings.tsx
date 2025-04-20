
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const profileFormSchema = z.object({
  username: z.string()
    .min(2, { message: "Username must be at least 2 characters." })
    .max(50, { message: "Username must not exceed 50 characters." }),
  fitnessGoal: z.string().optional(),
  experienceLevel: z.string().optional(),
  preferredWorkoutType: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettings = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      fitnessGoal: "",
      experienceLevel: "",
      preferredWorkoutType: "",
    },
  });

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error fetching profile:", error);
            toast({
              title: "Error",
              description: "Failed to fetch profile information.",
              variant: "destructive",
            });
            return;
          }
          
          if (data) {
            form.reset({
              username: data.username || '',
              fitnessGoal: data.fitness_goal || '',
              experienceLevel: data.experience_level || '',
              preferredWorkoutType: data.preferred_workout_type || '',
            });
            
            if (data.avatar_url) {
              try {
                const { data: storageData } = supabase.storage
                  .from('avatars')
                  .getPublicUrl(data.avatar_url);
                  
                if (storageData) {
                  setAvatarUrl(storageData.publicUrl);
                }
              } catch (error) {
                console.error('Error getting avatar URL:', error);
              }
            }
          }
        } catch (err) {
          console.error("Unexpected error fetching profile:", err);
        }
      };
      
      fetchProfile();
    }
  }, [user, form, toast]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          fitness_goal: data.fitnessGoal,
          experience_level: data.experienceLevel,
          preferred_workout_type: data.preferredWorkoutType,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error("Profile update error:", error);
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        });
      }
    } catch (error) {
      console.error("Unexpected error during profile update:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated.",
          variant: "destructive",
        });
        return;
      }
      
      // Create a filename that starts with user ID
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}.${fileExt}`;
      
      // Upload the file
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          title: "Upload Failed",
          description: `Failed to upload avatar: ${uploadError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: filePath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        toast({
          title: "Error",
          description: "Avatar uploaded but failed to update profile.",
          variant: "destructive",
        });
        return;
      }
      
      // Get public URL for the uploaded avatar
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (urlData) {
        setAvatarUrl(urlData.publicUrl);
        console.log("Avatar URL set to:", urlData.publicUrl);
      }

      toast({
        title: "Success",
        description: "Avatar updated successfully.",
      });
    } catch (error) {
      console.error("Unexpected avatar upload error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during avatar upload.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your profile information and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Avatar" />
            ) : (
              <AvatarFallback>{form.getValues("username")?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">Update your profile picture</p>
            <Input
              id="change-avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isLoading}
              className="hidden"
            />
            <label
              htmlFor="change-avatar"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-secondary h-10 px-4 py-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Change Avatar
                </>
              )}
            </label>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fitnessGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fitness Goal</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lose weight, gain muscle" {...field} />
                  </FormControl>
                  <FormDescription>What are you hoping to achieve?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>How experienced are you with fitness?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredWorkoutType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Workout Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cardio, Strength Training" {...field} />
                  </FormControl>
                  <FormDescription>What type of workouts do you enjoy?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="px-0">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
