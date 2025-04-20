
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Trophy, Flame, Clock, Dumbbell, BarChart2, Zap, Share2, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';

interface WorkoutData {
  date: string;
  name: string;
  xp: number;
  workouts: number;
  minutes: number;
}

const fetchWeeklyData = async (userId: string | undefined): Promise<WorkoutData[]> => {
  if (!userId) return [];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  const weeklyData: WorkoutData[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    weeklyData.push({
      date: date.toISOString().split('T')[0],
      name: daysOfWeek[date.getDay()],
      xp: 0,
      workouts: 0,
      minutes: 0
    });
  }
  
  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_at', sevenDaysAgo.toISOString())
    .order('completed_at', { ascending: true });
    
  if (error) {
    throw new Error(error.message);
  }
  
  workouts.forEach(workout => {
    const workoutDate = new Date(workout.completed_at).toISOString().split('T')[0];
    const dayIndex = weeklyData.findIndex(day => day.date === workoutDate);
    
    if (dayIndex !== -1) {
      // Calculate XP based on duration (3 XP per minute)
      const xpEstimate = workout.calories_burned || workout.duration * 3;
      
      weeklyData[dayIndex].xp += xpEstimate;
      weeklyData[dayIndex].workouts += 1;
      weeklyData[dayIndex].minutes += workout.duration;
    }
  });
  
  return weeklyData;
};

const fetchMonthlyData = async (userId: string | undefined): Promise<WorkoutData[]> => {
  if (!userId) return [];
  
  const twentyEightDaysAgo = new Date();
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 27);
  
  const monthlyData: WorkoutData[] = Array.from({ length: 4 }, (_, i) => ({
    name: `W${i+1}`,
    date: '',
    xp: 0,
    workouts: 0,
    minutes: 0
  }));
  
  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_at', twentyEightDaysAgo.toISOString())
    .order('completed_at', { ascending: true });
    
  if (error) {
    throw new Error(error.message);
  }
  
  workouts.forEach(workout => {
    const workoutDate = new Date(workout.completed_at);
    const daysSinceStart = Math.floor(
      (workoutDate.getTime() - twentyEightDaysAgo.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weekIndex = Math.min(3, Math.floor(daysSinceStart / 7));
    
    // Calculate XP based on duration (3 XP per minute)
    const xpEstimate = workout.calories_burned || workout.duration * 3;
    
    monthlyData[weekIndex].xp += xpEstimate;
    monthlyData[weekIndex].workouts += 1;
    monthlyData[weekIndex].minutes += workout.duration;
  });
  
  return monthlyData;
};

const fetchWorkoutHistory = async (userId: string | undefined) => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(10);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data.map(workout => ({
    id: workout.id,
    date: workout.completed_at,
    name: workout.workout_type,
    duration: workout.duration,
    // Calculate XP based on duration (3 XP per minute) or calories if available
    xp: workout.calories_burned || workout.duration * 3,
    completed: true
  }));
};

const fetchUserAchievements = async (userId: string | undefined) => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      id,
      earned_at,
      achievements (
        id,
        name,
        description,
        icon,
        xp_reward
      )
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
    .limit(4);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data.map(item => ({
    id: item.achievements.id,
    name: item.achievements.name,
    date: item.earned_at,
    xp: item.achievements.xp_reward
  }));
};

const fetchUserStats = async (userId: string | undefined) => {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

const ProgressUI = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const { data: weeklyData = [], isLoading: weeklyLoading } = useQuery({
    queryKey: ['weeklyProgress', user?.id],
    queryFn: () => fetchWeeklyData(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: monthlyData = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthlyProgress', user?.id],
    queryFn: () => fetchMonthlyData(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workoutHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['workoutHistory', user?.id],
    queryFn: () => fetchWorkoutHistory(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentAchievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['recentAchievements', user?.id],
    queryFn: () => fetchUserAchievements(user?.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => fetchUserStats(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getTotalMinutes = () => {
    const weeklyMinutes = weeklyData.reduce((sum, day) => sum + day.minutes, 0);
    const monthlyMinutes = monthlyData.reduce((sum, week) => sum + week.minutes, 0);
    return monthlyMinutes;
  };

  const getWeeklyMinutes = () => {
    return weeklyData.reduce((sum, day) => sum + day.minutes, 0);
  };

  // Calculate user's level progress
  const getLevelProgress = () => {
    if (!userStats) return 0;
    const currentLevelXP = userStats.xp - (userStats.level - 1) * 1000;
    return Math.min(100, (currentLevelXP / 1000) * 100);
  };

  if (weeklyLoading || monthlyLoading || historyLoading || achievementsLoading || statsLoading) {
    return (
      <MainLayout isLoggedIn={true}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your progress data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white dark:bg-fitDark-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total XP</p>
                    <h3 className="text-2xl font-bold text-fitDark-900 dark:text-white mt-1">{userStats?.xp || 0}</h3>
                  </div>
                  <div className="bg-fitPurple-100 dark:bg-fitPurple-900/30 p-2 rounded-lg">
                    <Trophy className="h-5 w-5 text-fitPurple-600 dark:text-fitPurple-400" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Level {userStats?.level || 1}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {Math.floor(getLevelProgress())}%
                    </span>
                  </div>
                  <Progress value={getLevelProgress()} className="h-1.5" />
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center mt-2">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>+{weeklyData.reduce((sum, day) => sum + day.xp, 0)} XP this week</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-fitDark-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Workouts</p>
                    <h3 className="text-2xl font-bold text-fitDark-900 dark:text-white mt-1">{userStats?.workouts_completed || 0}</h3>
                  </div>
                  <div className="bg-fitGreen-100 dark:bg-fitGreen-900/30 p-2 rounded-lg">
                    <Dumbbell className="h-5 w-5 text-fitGreen-600 dark:text-fitGreen-400" />
                  </div>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center mt-2">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>{weeklyData.reduce((sum, day) => sum + day.workouts, 0)} workouts this week</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-fitDark-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Minutes</p>
                    <h3 className="text-2xl font-bold text-fitDark-900 dark:text-white mt-1">
                      {getTotalMinutes()}
                    </h3>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center mt-2">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>{getWeeklyMinutes()} minutes this week</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-fitDark-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Calories Burned</p>
                    <h3 className="text-2xl font-bold text-fitDark-900 dark:text-white mt-1">
                      {getTotalMinutes() * 10}
                    </h3>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                    <Flame className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center mt-2">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>{getWeeklyMinutes() * 10} calories this week</span>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  {recentAchievements.length > 0 ? (
                    recentAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center p-3 bg-gray-50 dark:bg-fitDark-900 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-fitPurple-100 dark:bg-fitPurple-900/30 flex items-center justify-center mr-3">
                          <Trophy className="h-5 w-5 text-fitPurple-600 dark:text-fitPurple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-fitDark-900 dark:text-white truncate">
                            {achievement.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(achievement.date)}
                          </p>
                        </div>
                        <div className="flex items-center bg-fitPurple-100 dark:bg-fitPurple-900/30 px-2 py-1 rounded text-xs text-fitPurple-700 dark:text-fitPurple-300 font-medium">
                          +{achievement.xp} XP
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Complete workouts to earn achievements!</p>
                    </div>
                  )}
                  <Button variant="ghost" className="w-full text-fitPurple-600 hover:text-fitPurple-700 hover:bg-fitPurple-50 dark:text-fitPurple-400 dark:hover:text-fitPurple-300 dark:hover:bg-fitPurple-900/20" onClick={() => navigate('/profile')}>
                    View all achievements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-fitDark-800 mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-fitPurple-600 dark:text-fitPurple-400" />
                Workout History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workoutHistory.length > 0 ? (
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
              ) : (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No workouts yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Complete your first workout to see your history</p>
                  <Button onClick={() => navigate('/dashboard')} variant="default">
                    Start a Workout
                  </Button>
                </div>
              )}
              {workoutHistory.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" className="text-fitPurple-600 hover:text-fitPurple-700 hover:bg-fitPurple-50 dark:text-fitPurple-400 dark:hover:text-fitPurple-300 dark:hover:bg-fitPurple-900/20">
                    Load more
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-6 flex-col space-y-2" onClick={() => navigate('/dashboard')}>
              <Dumbbell className="h-6 w-6 mb-1 text-fitPurple-600 dark:text-fitPurple-400" />
              <span className="font-medium text-fitDark-900 dark:text-white">Start Today's Workout</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">Continue your fitness journey</p>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex-col space-y-2" onClick={() => navigate('/challenges')}>
              <Trophy className="h-6 w-6 mb-1 text-yellow-500" />
              <span className="font-medium text-fitDark-900 dark:text-white">View Leaderboard</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">See how you rank against others</p>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex-col space-y-2" onClick={() => navigate('/settings')}>
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

export default ProgressUI;
