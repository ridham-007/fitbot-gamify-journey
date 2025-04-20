
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import MainLayout from '@/components/layout/MainLayout';
import UserProfile from '@/components/profile/UserProfile';
import { Award, Calendar, Dumbbell, Medal, Settings, Trophy } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

  // Mock achievements data
  const achievements = [
    { id: 1, name: 'First Workout', description: 'Complete your first workout', icon: <Medal className="w-5 h-5" />, date: 'Mar 25', completed: true },
    { id: 2, name: '3-Day Streak', description: 'Work out for 3 consecutive days', icon: <Award className="w-5 h-5" />, date: 'Mar 29', completed: true },
    { id: 3, name: 'Level 5 Reached', description: 'Reach fitness level 5', icon: <Trophy className="w-5 h-5" />, date: '', completed: false },
    { id: 4, name: 'Cardio Master', description: 'Complete 10 cardio workouts', icon: <Dumbbell className="w-5 h-5" />, date: '', completed: false },
    { id: 5, name: 'Morning Person', description: 'Complete 5 workouts before 9am', icon: <Calendar className="w-5 h-5" />, date: 'Apr 05', completed: true },
    { id: 6, name: 'Consistency King', description: 'Complete 20 workouts', icon: <Trophy className="w-5 h-5" />, date: 'Apr 10', completed: true },
  ];

  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <MainLayout isLoggedIn={true}>
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-fitDark-900 dark:to-fitDark-800 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header Component */}
          <UserProfile />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Sidebar - Quick Actions */}
            <div className="space-y-6">
              <Card className="bg-white dark:bg-fitDark-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/trainer')}
                  >
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Start New Workout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/challenges')}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    View Challenges
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="bg-white dark:bg-fitDark-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Completed workout', time: '2 hours ago', type: 'HIIT Training' },
                      { action: 'Earned badge', time: '1 day ago', type: 'Consistency King' },
                      { action: 'Joined challenge', time: '2 days ago', type: 'Summer Shred' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 mt-2 rounded-full bg-fitPurple-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-fitDark-900 dark:text-white">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.time} • {activity.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <Card className="bg-white dark:bg-fitDark-800">
                <CardHeader className="pb-2">
                  <Tabs defaultValue="achievements" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="achievements">Achievements</TabsTrigger>
                      <TabsTrigger value="stats">Workout Stats</TabsTrigger>
                    </TabsList>

                    <TabsContent value="achievements" className="mt-6">
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

                    <TabsContent value="stats" className="mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Workout Distribution</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {[
                                { type: 'Strength', percentage: 45, color: 'bg-fitPurple-500' },
                                { type: 'Cardio', percentage: 30, color: 'bg-blue-500' },
                                { type: 'HIIT', percentage: 15, color: 'bg-orange-500' },
                                { type: 'Yoga', percentage: 10, color: 'bg-green-500' },
                              ].map((stat) => (
                                <div key={stat.type} className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{stat.type}</span>
                                    <span className="font-medium text-fitDark-900 dark:text-white">{stat.percentage}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-100 dark:bg-fitDark-700 rounded-full">
                                    <div
                                      className={`h-full rounded-full ${stat.color}`}
                                      style={{ width: `${stat.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Monthly Progress</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {[
                                { label: 'Workouts Completed', value: '24', change: '+8' },
                                { label: 'Average Duration', value: '45min', change: '+5min' },
                                { label: 'Calories Burned', value: '12,450', change: '+2,800' },
                                { label: 'Personal Records', value: '5', change: '+2' },
                              ].map((metric) => (
                                <div key={metric.label} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                                  <div className="text-right">
                                    <span className="block font-medium text-fitDark-900 dark:text-white">
                                      {metric.value}
                                    </span>
                                    <span className="text-xs text-green-600 dark:text-green-400">
                                      {metric.change} this month
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
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
