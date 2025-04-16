import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Edit, LogOut } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

type ProfileData = {
  username: string;
  fitnessGoal: string;
  preferredWorkoutType: string;
  experienceLevel: string;
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userLevel, userXp, streak, logout } = useUser();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    fitnessGoal: '',
    preferredWorkoutType: '',
    experienceLevel: '',
  });
  const [joinDate, setJoinDate] = useState('');
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Calculate XP needed for next level
    setXpToNextLevel(userLevel * 500);
    
    fetchUserProfile();
    fetchUserStats();
    
    // Format join date
    const createdAt = user.created_at;
    if (createdAt) {
      const date = new Date(createdAt);
      setJoinDate(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
  }, [user, userLevel]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, fitness_goal, preferred_workout_type, experience_level')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfileData({
          username: data.username || '',
          fitnessGoal: data.fitness_goal || '',
          preferredWorkoutType: data.preferred_workout_type || '',
          experienceLevel: data.experience_level || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('workouts_completed')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setWorkoutsCompleted(data.workouts_completed);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
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
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profileData.username,
          fitness_goal: profileData.fitnessGoal,
          preferred_workout_type: profileData.preferredWorkoutType,
          experience_level: profileData.experienceLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      setIsEditMode(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate XP percentage
  const xpPercentage = Math.min(Math.round((userXp / (xpToNextLevel)) * 100), 100);

  return (
    <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="h-32 bg-gradient-to-r from-fitPurple-500 to-fitPurple-700"></div>
      <div className="px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-fitDark-800 shadow-md">
                <AvatarFallback className="bg-fitPurple-100 dark:bg-fitPurple-900 text-fitPurple-600 dark:text-fitPurple-400 text-2xl">
                  {profileData.username ? profileData.username.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 bg-fitPurple-600 text-white p-1.5 rounded-full shadow-sm hover:bg-fitPurple-700 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4">
              <div className="flex items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-fitDark-900 dark:text-white">
                  {profileData.username}
                </h1>
                <Badge className="ml-2 bg-fitPurple-100 text-fitPurple-700 dark:bg-fitPurple-900/30 dark:text-fitPurple-300">
                  Level {userLevel}
                </Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Joined on {joinDate}
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            {isEditMode ? (
              <>
                <Button 
                  onClick={() => setIsEditMode(false)} 
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(true)} className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Profile Stats */}
      <div className="px-4 sm:px-6 pb-6">
        <Card className="mt-4 bg-gray-50 dark:bg-fitDark-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Profile Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* XP Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Level Progress
                </div>
                <div className="text-sm text-fitPurple-600 dark:text-fitPurple-400 font-medium">
                  {userXp} / {xpToNextLevel} XP
                </div>
              </div>
              <Progress value={xpPercentage} className="h-2" />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {xpToNextLevel - userXp} XP to Level {userLevel + 1}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-fitDark-800 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Streak
                </div>
                <div className="text-2xl font-bold text-fitDark-900 dark:text-white flex items-center">
                  {streak}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">days</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-fitDark-800 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Workouts
                </div>
                <div className="text-2xl font-bold text-fitDark-900 dark:text-white flex items-center">
                  {workoutsCompleted}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">total</span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-fitDark-700">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Fitness Goal
                </div>
                {isEditMode ? (
                  <Select
                    value={profileData.fitnessGoal}
                    onValueChange={(value) => handleChange('fitnessGoal', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select fitness goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight-loss">Lose weight</SelectItem>
                      <SelectItem value="muscle-gain">Build muscle</SelectItem>
                      <SelectItem value="endurance">Improve endurance</SelectItem>
                      <SelectItem value="flexibility">Increase flexibility</SelectItem>
                      <SelectItem value="general-fitness">General fitness</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-fitDark-900 dark:text-white">
                    {profileData.fitnessGoal === 'weight-loss' && 'Lose weight'}
                    {profileData.fitnessGoal === 'muscle-gain' && 'Build muscle'}
                    {profileData.fitnessGoal === 'endurance' && 'Improve endurance'}
                    {profileData.fitnessGoal === 'flexibility' && 'Increase flexibility'}
                    {profileData.fitnessGoal === 'general-fitness' && 'General fitness'}
                    {!profileData.fitnessGoal && 'Not specified'}
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Preferred Workout Type
                </div>
                {isEditMode ? (
                  <Select
                    value={profileData.preferredWorkoutType}
                    onValueChange={(value) => handleChange('preferredWorkoutType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select workout type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="strength">Strength Training</SelectItem>
                      <SelectItem value="hiit">HIIT</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-fitDark-900 dark:text-white">
                    {profileData.preferredWorkoutType === 'cardio' && 'Cardio'}
                    {profileData.preferredWorkoutType === 'strength' && 'Strength Training'}
                    {profileData.preferredWorkoutType === 'hiit' && 'HIIT'}
                    {profileData.preferredWorkoutType === 'yoga' && 'Yoga'}
                    {profileData.preferredWorkoutType === 'mixed' && 'Mixed'}
                    {!profileData.preferredWorkoutType && 'Not specified'}
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Experience Level
                </div>
                {isEditMode ? (
                  <Select
                    value={profileData.experienceLevel}
                    onValueChange={(value) => handleChange('experienceLevel', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-fitDark-900 dark:text-white">
                    {profileData.experienceLevel === 'beginner' && 'Beginner'}
                    {profileData.experienceLevel === 'intermediate' && 'Intermediate'}
                    {profileData.experienceLevel === 'advanced' && 'Advanced'}
                    {!profileData.experienceLevel && 'Not specified'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
