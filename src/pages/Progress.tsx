
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Trophy, Flame, Clock, Dumbbell, BarChart2, Zap, Share2 } from 'lucide-react';

// Mock data
const weeklyData = [
  { name: 'Mon', xp: 120, workouts: 1, minutes: 30 },
  { name: 'Tue', xp: 150, workouts: 1, minutes: 35 },
  { name: 'Wed', xp: 0, workouts: 0, minutes: 0 },
  { name: 'Thu', xp: 200, workouts: 2, minutes: 45 },
  { name: 'Fri', xp: 180, workouts: 1, minutes: 40 },
  { name: 'Sat', xp: 0, workouts: 0, minutes: 0 },
  { name: 'Sun', xp: 250, workouts: 2, minutes: 60 },
];

const monthlyData = [
  { name: 'W1', xp: 700, workouts: 5, minutes: 150 },
  { name: 'W2', xp: 900, workouts: 6, minutes: 180 },
  { name: 'W3', xp: 800, workouts: 5, minutes: 165 },
  { name: 'W4', xp: 950, workouts: 7, minutes: 210 },
];

const workoutHistory = [
  { id: 1, date: '2023-04-14', name: 'Full Body HIIT', duration: 30, xp: 150, completed: true },
  { id: 2, date: '2023-04-13', name: 'Upper Body Strength', duration: 45, xp: 200, completed: true },
  { id: 3, date: '2023-04-11', name: 'Core & Cardio', duration: 25, xp: 120, completed: true },
  { id: 4, date: '2023-04-10', name: 'Leg Day Challenge', duration: 40, xp: 180, completed: true },
  { id: 5, date: '2023-04-08', name: 'Recovery Stretching', duration: 20, xp: 80, completed: true },
];

const recentAchievements = [
  { id: 1, name: 'First Workout', date: '2023-03-25', xp: 50 },
  { id: 2, name: '3-Day Streak', date: '2023-03-29', xp: 100 },
  { id: 3, name: 'Cardio Enthusiast', date: '2023-04-05', xp: 150 },
  { id: 4, name: 'Level 3 Unlocked', date: '2023-04-09', xp: 200 },
];

const Progress = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  // Format date string to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <MainLayout isLoggedIn={true}>
      <div className="bg-gray-50 dark:bg-fitDark-900 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-fitDark-900 dark:text-white">
                Your Progress
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your fitness journey and achievements
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Last 30 days
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white dark:bg-fitDark-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total XP</p>
                    <h3 className="text-2xl font-bold text-fitDark-900 dark:text-white mt-1">2,850</h3>
                  </div>
                  <div className="bg-fitPurple-100 dark:bg-fitPurple-900/30 p-2 rounded-lg">
                    <Trophy className="h-5 w-5 text-fitPurple-600 dark:text-fitPurple-400" />
                  </div>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center mt-2">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>+450 XP this week</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-fitDark-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Workouts</p>
                    <h3 className="text-2xl font-bold text-fitDark-900 dark:text-white mt-1">21</h3>
                  </div>
                  <div className="bg-fitGreen-100 dark:bg-fitGreen-900/30 p-2 rounded-lg">
                    <Dumbbell className="h-5 w-5 text-fitGreen-600 dark:text-fitGreen-400" />
                  </div>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center mt-2">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>5 workouts this week</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-fitDark-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Minutes</p>
                    <h3 className="text-2xl font-bold text-fitDark-900 dark:text-white mt-1">705</h3>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center mt-2">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>210 minutes this week</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-fitDark-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Calories Burned</p>
                    <h3 className="text-2xl font-bold text-fitDark-900 dark:text-white mt-1">6,240</h3>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                    <Flame className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center mt-2">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>1,890 calories this week</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="bg-white dark:bg-fitDark-800 lg:col-span-2">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl font-bold flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-fitPurple-600 dark:text-fitPurple-400" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="weekly" className="mt-4">
                  <TabsList className="mb-4">
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                  <TabsContent value="weekly" className="mt-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={weeklyData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                          <Bar dataKey="xp" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  <TabsContent value="monthly" className="mt-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlyData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="xp" 
                            stroke="#8B5CF6" 
                            strokeWidth={3}
                            dot={{ r: 6, fill: '#8B5CF6', strokeWidth: 0 }}
                            activeDot={{ r: 8, fill: '#8B5CF6', strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-fitDark-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center p-3 bg-gray-50 dark:bg-fitDark-900 rounded-lg">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-fitPurple-100 dark:bg-fitPurple-900/30 flex items-center justify-center mr-3">
                        <Trophy className="h-5 w-5 text-fitPurple-600 dark:text-fitPurple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-fitDark-900 dark:text-white truncate">
                          {achievement.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {achievement.date}
                        </p>
                      </div>
                      <div className="flex items-center bg-fitPurple-100 dark:bg-fitPurple-900/30 px-2 py-1 rounded text-xs text-fitPurple-700 dark:text-fitPurple-300 font-medium">
                        +{achievement.xp} XP
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-fitPurple-600 hover:text-fitPurple-700 hover:bg-fitPurple-50 dark:text-fitPurple-400 dark:hover:text-fitPurple-300 dark:hover:bg-fitPurple-900/20">
                    View all achievements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workout History */}
          <Card className="bg-white dark:bg-fitDark-800 mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-fitPurple-600 dark:text-fitPurple-400" />
                Workout History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-fitDark-700">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Workout</th>
                      <th className="pb-3 font-medium">Duration</th>
                      <th className="pb-3 font-medium">XP Earned</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workoutHistory.map((workout) => (
                      <tr key={workout.id} className="border-b border-gray-100 dark:border-fitDark-700 hover:bg-gray-50 dark:hover:bg-fitDark-900/50">
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(workout.date)}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <Dumbbell className="h-4 w-4 text-fitPurple-500 mr-2" />
                            <span className="text-sm font-medium text-fitDark-900 dark:text-white">
                              {workout.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-300">
                          {workout.duration} min
                        </td>
                        <td className="py-4">
                          <div className="inline-flex items-center bg-fitPurple-100 dark:bg-fitPurple-900/30 px-2 py-1 rounded text-xs text-fitPurple-700 dark:text-fitPurple-300 font-medium">
                            +{workout.xp} XP
                          </div>
                        </td>
                        <td className="py-4">
                          {workout.completed ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                              In Progress
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" className="text-fitPurple-600 hover:text-fitPurple-700 hover:bg-fitPurple-50 dark:text-fitPurple-400 dark:hover:text-fitPurple-300 dark:hover:bg-fitPurple-900/20">
                  Load more
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-6 flex-col space-y-2">
              <Dumbbell className="h-6 w-6 mb-1 text-fitPurple-600 dark:text-fitPurple-400" />
              <span className="font-medium text-fitDark-900 dark:text-white">Start Today's Workout</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">Continue your fitness journey</p>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex-col space-y-2">
              <Trophy className="h-6 w-6 mb-1 text-yellow-500" />
              <span className="font-medium text-fitDark-900 dark:text-white">View Leaderboard</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">See how you rank against others</p>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex-col space-y-2">
              <BarChart2 className="h-6 w-6 mb-1 text-fitGreen-600 dark:text-fitGreen-400" />
              <span className="font-medium text-fitDark-900 dark:text-white">Set New Goals</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">Update your fitness objectives</p>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Progress;
