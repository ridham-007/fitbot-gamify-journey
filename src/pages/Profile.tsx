
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import MainLayout from '@/components/layout/MainLayout';
import UserProfile from '@/components/profile/UserProfile';
import { Award, Calendar, Dumbbell, Medal, Trophy, User, Settings } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

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

  React.useEffect(() => {
    // Redirect to login if not logged in
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null; // Don't render anything while redirecting
  }

  return (
    <MainLayout isLoggedIn={true}>
      <div className="bg-gray-50 dark:bg-fitDark-900 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* User Profile Component */}
          <UserProfile />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="space-y-6">
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
