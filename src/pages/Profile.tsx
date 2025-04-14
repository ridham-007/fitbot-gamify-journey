
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { Settings, User, Medal, Award, Trophy, Calendar, Dumbbell, Edit, LogOut, Camera } from 'lucide-react';

// Mock user data
const userData = {
  username: 'FitnessWarrior',
  level: 4,
  xp: 1450,
  xpToNextLevel: 500,
  joinDate: 'March 25, 2023',
  streak: 2,
  workoutsCompleted: 21,
  fitnessGoal: 'Lose weight and build strength',
  preferredWorkoutType: 'HIIT',
  experienceLevel: 'Intermediate',
};

// Mock achievements data
const achievements = [
  { id: 1, name: 'First Workout', description: 'Complete your first workout', icon: <Medal />, date: 'Mar 25', completed: true },
  { id: 2, name: '3-Day Streak', description: 'Work out for 3 consecutive days', icon: <Award />, date: 'Mar 29', completed: true },
  { id: 3, name: 'Level 5 Reached', description: 'Reach fitness level 5', icon: <Trophy />, date: '', completed: false },
  { id: 4, name: 'Cardio Master', description: 'Complete 10 cardio workouts', icon: <Dumbbell />, date: '', completed: false },
  { id: 5, name: 'Morning Person', description: 'Complete 5 workouts before 9am', icon: <Calendar />, date: 'Apr 05', completed: true },
  { id: 6, name: 'Consistency King', description: 'Complete 20 workouts', icon: <Trophy />, date: 'Apr 10', completed: true },
];

// Mock badges data
const badges = [
  { id: 1, name: 'Fitness Rookie', description: 'Reach level 1', icon: 'R', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 2, name: 'Fitness Enthusiast', description: 'Reach level 5', icon: 'E', color: 'bg-fitPurple-100 text-fitPurple-600 dark:bg-fitPurple-900/30 dark:text-fitPurple-400' },
  { id: 3, name: 'HIIT Expert', description: 'Complete 15 HIIT workouts', icon: 'H', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState(userData);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('isLoggedIn');
    
    // Show toast notification
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to home page
    navigate('/');
  };

  const handleSaveProfile = () => {
    setIsEditMode(false);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <MainLayout isLoggedIn={true}>
      <div className="bg-gray-50 dark:bg-fitDark-900 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-fitDark-800 rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="h-32 bg-gradient-to-r from-fitPurple-500 to-fitPurple-700"></div>
            <div className="px-4 sm:px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white dark:border-fitDark-800 shadow-md">
                      <AvatarFallback className="bg-fitPurple-100 dark:bg-fitPurple-900 text-fitPurple-600 dark:text-fitPurple-400 text-2xl">
                        FW
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
                        Level {profileData.level}
                      </Badge>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      Joined on {profileData.joinDate}
                    </p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-2">
                  {isEditMode ? (
                    <>
                      <Button onClick={() => setIsEditMode(false)} variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        Save Changes
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Stats */}
              <Card className="bg-white dark:bg-fitDark-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <User className="h-5 w-5 mr-2 text-fitPurple-600 dark:text-fitPurple-400" />
                    Profile Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* XP Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Level Progress
                      </div>
                      <div className="text-sm text-fitPurple-600 dark:text-fitPurple-400 font-medium">
                        {profileData.xp} / {profileData.xp + profileData.xpToNextLevel} XP
                      </div>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {profileData.xpToNextLevel} XP to Level {profileData.level + 1}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-fitDark-900 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Streak
                      </div>
                      <div className="text-2xl font-bold text-fitDark-900 dark:text-white flex items-center">
                        {profileData.streak}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">days</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-fitDark-900 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Workouts
                      </div>
                      <div className="text-2xl font-bold text-fitDark-900 dark:text-white flex items-center">
                        {profileData.workoutsCompleted}
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
                        <select
                          name="fitnessGoal"
                          value={profileData.fitnessGoal}
                          onChange={handleChange}
                          className="w-full rounded-md border-gray-300 dark:border-fitDark-600 bg-white dark:bg-fitDark-700 shadow-sm focus:border-fitPurple-500 focus:ring-fitPurple-500 h-10 px-3"
                        >
                          <option value="Lose weight and build strength">Lose weight and build strength</option>
                          <option value="Build muscle mass">Build muscle mass</option>
                          <option value="Improve cardio endurance">Improve cardio endurance</option>
                          <option value="Increase flexibility">Increase flexibility</option>
                          <option value="General fitness">General fitness</option>
                        </select>
                      ) : (
                        <div className="text-sm text-fitDark-900 dark:text-white">
                          {profileData.fitnessGoal}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Preferred Workout Type
                      </div>
                      {isEditMode ? (
                        <select
                          name="preferredWorkoutType"
                          value={profileData.preferredWorkoutType}
                          onChange={handleChange}
                          className="w-full rounded-md border-gray-300 dark:border-fitDark-600 bg-white dark:bg-fitDark-700 shadow-sm focus:border-fitPurple-500 focus:ring-fitPurple-500 h-10 px-3"
                        >
                          <option value="HIIT">HIIT</option>
                          <option value="Strength Training">Strength Training</option>
                          <option value="Cardio">Cardio</option>
                          <option value="Yoga">Yoga</option>
                          <option value="Mixed">Mixed</option>
                        </select>
                      ) : (
                        <div className="text-sm text-fitDark-900 dark:text-white">
                          {profileData.preferredWorkoutType}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Experience Level
                      </div>
                      {isEditMode ? (
                        <select
                          name="experienceLevel"
                          value={profileData.experienceLevel}
                          onChange={handleChange}
                          className="w-full rounded-md border-gray-300 dark:border-fitDark-600 bg-white dark:bg-fitDark-700 shadow-sm focus:border-fitPurple-500 focus:ring-fitPurple-500 h-10 px-3"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      ) : (
                        <div className="text-sm text-fitDark-900 dark:text-white">
                          {profileData.experienceLevel}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card className="bg-white dark:bg-fitDark-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                    Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {badges.map((badge) => (
                      <div key={badge.id} className="flex flex-col items-center text-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-2 ${badge.color}`}>
                          {badge.icon}
                        </div>
                        <div className="text-xs font-medium text-fitDark-900 dark:text-white">
                          {badge.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {badge.description}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-fitPurple-600 hover:text-fitPurple-700 hover:bg-fitPurple-50 dark:text-fitPurple-400 dark:hover:text-fitPurple-300 dark:hover:bg-fitPurple-900/20">
                    View all badges
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="bg-white dark:bg-fitDark-800">
                <CardHeader className="pb-2">
                  <Tabs defaultValue="achievements">
                    <TabsList>
                      <TabsTrigger value="achievements" className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2" />
                        Achievements
                      </TabsTrigger>
                      <TabsTrigger value="history" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Workout History
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="achievements" className="mt-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {achievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className={`flex items-center p-4 rounded-lg ${
                              achievement.completed
                                ? 'bg-fitPurple-50 dark:bg-fitPurple-900/20 border border-fitPurple-200 dark:border-fitPurple-800'
                                : 'bg-gray-50 dark:bg-fitDark-900 border border-gray-200 dark:border-fitDark-700'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                              achievement.completed
                                ? 'bg-fitPurple-100 dark:bg-fitPurple-800 text-fitPurple-600 dark:text-fitPurple-300'
                                : 'bg-gray-200 dark:bg-fitDark-700 text-gray-500 dark:text-gray-400'
                            }`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-fitDark-900 dark:text-white">
                                  {achievement.name}
                                </h4>
                                {achievement.completed && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    {achievement.date}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-fitDark-900 dark:text-white mb-2">
                          Workout History
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                          Track your workout history, see your progress, and analyze your performance over time.
                        </p>
                        <Button onClick={() => navigate('/progress')}>
                          View Full History
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-6">
                      <div className="max-w-xl mx-auto">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium text-fitDark-900 dark:text-white mb-4">
                              Account Settings
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  value="user@example.com"
                                  disabled={!isEditMode}
                                  className="w-full rounded-md border-gray-300 dark:border-fitDark-600 bg-white dark:bg-fitDark-700 shadow-sm focus:border-fitPurple-500 focus:ring-fitPurple-500 h-10 px-3 disabled:bg-gray-100 disabled:dark:bg-fitDark-800"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Username
                                </label>
                                <input
                                  type="text"
                                  value={profileData.username}
                                  disabled={!isEditMode}
                                  className="w-full rounded-md border-gray-300 dark:border-fitDark-600 bg-white dark:bg-fitDark-700 shadow-sm focus:border-fitPurple-500 focus:ring-fitPurple-500 h-10 px-3 disabled:bg-gray-100 disabled:dark:bg-fitDark-800"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-6 border-t border-gray-200 dark:border-fitDark-700">
                            <h3 className="text-lg font-medium text-fitDark-900 dark:text-white mb-4">
                              Notification Preferences
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-fitDark-900 dark:text-white">
                                    Workout Reminders
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Get notifications for your scheduled workouts
                                  </div>
                                </div>
                                <div className="h-6 w-11 rounded-full bg-fitPurple-600 relative cursor-pointer">
                                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-fitDark-900 dark:text-white">
                                    Achievement Alerts
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Get notified when you earn a new achievement
                                  </div>
                                </div>
                                <div className="h-6 w-11 rounded-full bg-fitPurple-600 relative cursor-pointer">
                                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-fitDark-900 dark:text-white">
                                    Weekly Summaries
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Receive a weekly summary of your progress
                                  </div>
                                </div>
                                <div className="h-6 w-11 rounded-full bg-gray-300 dark:bg-fitDark-700 relative cursor-pointer">
                                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-6 border-t border-gray-200 dark:border-fitDark-700">
                            <Button variant="destructive" className="flex items-center">
                              <LogOut className="h-4 w-4 mr-2" />
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
