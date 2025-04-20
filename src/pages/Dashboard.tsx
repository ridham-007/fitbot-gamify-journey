import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { Play, CheckCircle, Clock, Trophy, Dumbbell, ChevronRight, Award, Heart, Medal, Flame, BarChart2, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

// Mock workout structure
const defaultWorkout = {
  title: "Full Body HIIT",
  description: "High intensity interval training targeting all major muscle groups",
  duration: 30,
  difficulty: "Intermediate",
  caloriesBurn: 320,
  exercises: [
    { name: "Jumping Jacks", duration: 45, rest: 15, completed: false },
    { name: "Push-ups", duration: 45, rest: 15, completed: false },
    { name: "Mountain Climbers", duration: 45, rest: 15, completed: false },
    { name: "Squats", duration: 45, rest: 15, completed: false },
    { name: "Plank", duration: 45, rest: 15, completed: false },
  ]
};

// Get the user's current achievements
const fetchUserAchievements = async (userId) => {
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
    .eq('user_id', userId);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data.map(item => ({
    id: item.achievements.id,
    name: item.achievements.name,
    description: item.achievements.description,
    icon: item.achievements.icon,
    xp_reward: item.achievements.xp_reward,
    earned_at: item.earned_at,
    completed: true
  }));
};

// Get user profile and stats combined
const fetchUserStats = async (userId) => {
  if (!userId) return null;
  
  // Get user stats
  const { data: statsData, error: statsError } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (statsError) {
    throw new Error(statsError.message);
  }
  
  // Get user profile to get username
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }
  
  // Combine the data
  return {
    ...statsData,
    username: profileData?.username || "Fitness Warrior"
  };
};

// Complete a workout and save it to the database
const completeWorkout = async ({ userId, workout, exercises, xpEarned }) => {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: userId,
      workout_type: workout.title,
      duration: workout.duration,
      calories_burned: workout.caloriesBurn,
      exercise_data: exercises,
      xp_earned: xpEarned
    });
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [mockWorkout, setMockWorkout] = useState(defaultWorkout);
  
  // Use React Query to fetch user stats and achievements
  const { data: userStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => fetchUserStats(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: () => fetchUserAchievements(user?.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // For when we complete a workout
  const workoutMutation = useMutation({
    mutationFn: completeWorkout,
    onSuccess: () => {
      toast({
        title: "Workout Completed!",
        description: "Great job! Your progress has been saved.",
      });
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save workout: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    let interval = null;
    
    if (isWorkoutStarted) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          const currentExercise = mockWorkout.exercises[currentExerciseIndex];
          const duration = isResting ? currentExercise.rest : currentExercise.duration;
          
          if (prevTimer >= duration) {
            // Time is up for current exercise/rest
            if (isResting) {
              // Rest is over, move to next exercise
              if (currentExerciseIndex < mockWorkout.exercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1);
              } else {
                // Workout completed
                clearInterval(interval);
                setIsWorkoutStarted(false);
                
                // Mark exercise as completed
                const updatedExercises = [...mockWorkout.exercises];
                updatedExercises[currentExerciseIndex].completed = true;
                
                // Calculate XP earned (based on duration and difficulty)
                const xpEarned = mockWorkout.duration * 3; // Simple XP calculation
                
                // Save workout to database if user is logged in
                if (user && user.id) {
                  workoutMutation.mutate({
                    userId: user.id,
                    workout: mockWorkout,
                    exercises: updatedExercises,
                    xpEarned
                  });
                }
              }
              setIsResting(false);
            } else {
              // Exercise is over, start rest
              setIsResting(true);
              
              // Mark exercise as completed
              const updatedExercises = [...mockWorkout.exercises];
              updatedExercises[currentExerciseIndex].completed = true;
              setMockWorkout(prev => ({
                ...prev,
                exercises: updatedExercises
              }));
            }
            return 0;
          }
          return prevTimer + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutStarted, currentExerciseIndex, isResting, mockWorkout, user, workoutMutation]);

  const startWorkout = () => {
    // Reset workout state
    const resetExercises = mockWorkout.exercises.map(ex => ({...ex, completed: false}));
    setMockWorkout(prev => ({...prev, exercises: resetExercises}));
    setIsWorkoutStarted(true);
    setCurrentExerciseIndex(0);
    setTimer(0);
    setIsResting(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const calculateTimerProgress = () => {
    if (!isWorkoutStarted) return 0;
    const currentExercise = mockWorkout.exercises[currentExerciseIndex];
    const duration = isResting ? currentExercise.rest : currentExercise.duration;
    return (timer / duration) * 100;
  };

  if (statsLoading || achievementsLoading) {
    return (
      <MainLayout isLoggedIn={true}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout isLoggedIn={true}>
      <div className="bg-gray-50 dark:bg-fitDark-900 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-fitDark-900 dark:text-white">
                Welcome back, {userStats?.username || "Fitness Warrior"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Ready for today's workout challenge?
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div className="bg-white dark:bg-fitDark-800 rounded-lg shadow-sm px-4 py-2 flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
                  <div className="font-semibold text-fitDark-900 dark:text-white">{userStats?.streak || 0} days</div>
                </div>
              </div>
              <div className="bg-white dark:bg-fitDark-800 rounded-lg shadow-sm px-4 py-2 flex items-center">
                <Award className="h-5 w-5 text-fitPurple-500 mr-2" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Level</div>
                  <div className="font-semibold text-fitDark-900 dark:text-white">{userStats?.level || 1}</div>
                </div>
              </div>
              <div className="bg-white dark:bg-fitDark-800 rounded-lg shadow-sm px-4 py-2 flex items-center">
                <Flame className="h-5 w-5 text-fitGreen-500 mr-2" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">XP</div>
                  <div className="font-semibold text-fitDark-900 dark:text-white">{userStats?.xp || 0}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Today's Workout */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-bold">Today's Workout</CardTitle>
                  <Badge variant="outline" className="font-normal py-1">
                    <Clock className="h-3 w-3 mr-1" /> {mockWorkout.duration} min
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-fitDark-900 dark:text-white">
                        {mockWorkout.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {mockWorkout.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <Badge variant="secondary" className="text-xs">
                          {mockWorkout.difficulty}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Flame className="h-4 w-4 text-red-500 mr-1" />
                          {mockWorkout.caloriesBurn} cal
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      {!isWorkoutStarted ? (
                        <Button onClick={startWorkout} className="w-full md:w-auto">
                          <Play className="h-4 w-4 mr-2" />
                          Start Workout
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => setIsWorkoutStarted(false)} className="w-full md:w-auto">
                          Pause Workout
                        </Button>
                      )}
                    </div>
                  </div>

                  {isWorkoutStarted && (
                    <div className="bg-gray-50 dark:bg-fitDark-950 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-fitDark-900 dark:text-white">
                            {isResting ? "Rest" : mockWorkout.exercises[currentExerciseIndex].name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isResting ? "Catch your breath" : "Keep pushing!"}
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-fitPurple-600">
                          {formatTime(isResting 
                            ? mockWorkout.exercises[currentExerciseIndex].rest - timer 
                            : mockWorkout.exercises[currentExerciseIndex].duration - timer)}
                        </div>
                      </div>
                      <Progress value={calculateTimerProgress()} className="h-2" />
                    </div>
                  )}

                  <div className="space-y-3">
                    {mockWorkout.exercises.map((exercise, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                          currentExerciseIndex === index && isWorkoutStarted
                            ? 'bg-fitPurple-50 dark:bg-fitPurple-900/20 border border-fitPurple-200 dark:border-fitPurple-800'
                            : 'hover:bg-gray-50 dark:hover:bg-fitDark-800'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                            {exercise.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-fitDark-700 flex items-center justify-center text-xs">
                                {index + 1}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-fitDark-900 dark:text-white">
                            {exercise.name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {exercise.duration}s
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full text-fitPurple-600 hover:text-fitPurple-700 hover:bg-fitPurple-50 dark:text-fitPurple-400 dark:hover:text-fitPurple-300 dark:hover:bg-fitPurple-900/20">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Switch to another workout
                  </Button>
                </CardFooter>
              </Card>

              {/* Level Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold">Level Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-fitPurple-100 dark:bg-fitPurple-900 flex items-center justify-center text-fitPurple-600 dark:text-fitPurple-400 mr-2">
                        {userStats?.level || 1}
                      </div>
                      <span className="font-medium text-fitDark-900 dark:text-white">
                        {userStats?.level <= 3 ? "Fitness Rookie" : 
                         userStats?.level <= 6 ? "Fitness Enthusiast" : "Fitness Master"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {userStats?.xp % 500 / 5}% to Level {(userStats?.level || 1) + 1}
                    </div>
                  </div>
                  <Progress value={(userStats?.xp % 500) / 5} className="h-2 mb-4" />
                  
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-6">
                    <span>0 XP</span>
                    <span>500 XP</span>
                  </div>
                  
                  <div className="bg-fitPurple-50 dark:bg-fitPurple-900/20 rounded-lg p-4 border border-fitPurple-100 dark:border-fitPurple-800">
                    <div className="flex items-start">
                      <div className="bg-fitPurple-100 dark:bg-fitPurple-800 rounded-full p-2 mr-4">
                        <Trophy className="h-5 w-5 text-fitPurple-600 dark:text-fitPurple-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-fitDark-900 dark:text-white">
                          Level {(userStats?.level || 1) + 1} Reward
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Unlock advanced HIIT workouts and earn the "Fitness Enthusiast" badge!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Next Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold">Recommended For You</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-between group" onClick={() => navigate('/progress')}>
                    <div className="flex items-center">
                      <div className="bg-fitPurple-100 dark:bg-fitPurple-900/30 rounded-full p-1.5 mr-3">
                        <BarChart2 className="h-4 w-4 text-fitPurple-600 dark:text-fitPurple-400" />
                      </div>
                      <span>Check Weekly Progress</span>
                    </div>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-between group" onClick={() => navigate('/trainer')}>
                    <div className="flex items-center">
                      <div className="bg-fitPurple-100 dark:bg-fitPurple-900/30 rounded-full p-1.5 mr-3">
                        <Dumbbell className="h-4 w-4 text-fitPurple-600 dark:text-fitPurple-400" />
                      </div>
                      <span>Create Custom Workout</span>
                    </div>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold">Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.length > 0 ? (
                    achievements.slice(0, 4).map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center p-3 rounded-lg bg-fitPurple-50 dark:bg-fitPurple-900/20 border border-fitPurple-200 dark:border-fitPurple-800"
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-fitPurple-100 dark:bg-fitPurple-800 text-fitPurple-600 dark:text-fitPurple-300">
                          <Medal />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-fitDark-900 dark:text-white">
                              {achievement.name}
                            </h4>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Completed
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback to show these achievements for new users
                    [
                      { id: 1, name: "First Workout", description: "Complete your first workout", icon: <Medal />, completed: false },
                      { id: 2, name: "3-Day Streak", description: "Work out for 3 consecutive days", icon: <Flame />, completed: false },
                      { id: 3, name: "Level 5 Reached", description: "Reach fitness level 5", icon: <Award />, completed: false },
                      { id: 4, name: "Cardio Master", description: "Complete 10 cardio workouts", icon: <Heart />, completed: false },
                    ].map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`flex items-center p-3 rounded-lg bg-gray-50 dark:bg-fitDark-800 border border-gray-200 dark:border-fitDark-700`}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gray-200 dark:bg-fitDark-700 text-gray-500 dark:text-gray-400">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-fitDark-900 dark:text-white">
                            {achievement.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <Button 
                    variant="ghost" 
                    className="w-full text-fitPurple-600 hover:text-fitPurple-700 hover:bg-fitPurple-50 dark:text-fitPurple-400 dark:hover:text-fitPurple-300 dark:hover:bg-fitPurple-900/20"
                    onClick={() => navigate('/profile')}
                  >
                    View all achievements
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
