import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, Pause, CheckCircle, Clock, Trophy, Dumbbell, ChevronRight, 
  Award, Heart, Medal, Flame, BarChart2, Loader2, Save, RotateCcw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ExerciseDemo from '@/components/dashboard/ExerciseDemo';
import WorkoutProgress from '@/components/dashboard/WorkoutProgress';
import WorkoutService from '@/services/WorkoutService';
import SimpleWorkoutProgress from '@/components/dashboard/SimpleWorkoutProgress';
import { WorkoutProgressService, WorkoutSession } from '@/services/WorkoutProgressService';
import PreviousWorkouts from '@/components/dashboard/PreviousWorkouts';

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

const fetchUserStats = async (userId) => {
  if (!userId) return null;
  
  const { data: statsData, error: statsError } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (statsError) {
    throw new Error(statsError.message);
  }
  
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }
  
  return {
    ...statsData,
    username: profileData?.username || "Fitness Warrior"
  };
};

const completeWorkout = async ({ userId, workout, exercises, xpEarned }) => {
  const result = await WorkoutService.completeWorkout(userId, workout, exercises, xpEarned);
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to save workout');
  }
  
  return result.data;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [mockWorkout, setMockWorkout] = useState(defaultWorkout);
  const [isPaused, setIsPaused] = useState(false);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const { data: userStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => fetchUserStats(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: () => fetchUserAchievements(user?.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const { data: previousSessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ['previousWorkoutSessions', user?.id],
    queryFn: () => WorkoutProgressService.getRecentSessions(user?.id || ''),
    enabled: !!user?.id,
  });

  const progressMutation = useMutation({
    mutationFn: async ({ userId, workout, progress }: { 
      userId: string; 
      workout: any; 
      progress: number;
    }) => {
      return WorkoutService.saveWorkoutProgress(userId, workout, progress);
    }
  });

  const pauseWorkoutMutation = useMutation({
    mutationFn: async ({ userId, workout, currentProgress }: {
      userId: string;
      workout: any;
      currentProgress: any;
    }) => {
      return WorkoutService.pauseWorkout(userId, workout, currentProgress);
    },
    onSuccess: () => {
      toast({
        title: "Workout Paused",
        description: "Your progress has been saved. You can resume later.",
      });
      refetchSessions();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to pause workout: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const workoutMutation = useMutation({
    mutationFn: completeWorkout,
    onSuccess: () => {
      toast({
        title: "Workout Completed!",
        description: "Great job! Your progress has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['userStats', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userAchievements', user?.id] });
      refetchSessions();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save workout: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const { data: currentExerciseDemo, isLoading: isExerciseDemoLoading } = useQuery({
    queryKey: ['exercise-demo', mockWorkout.exercises[currentExerciseIndex]?.name, isWorkoutStarted],
    queryFn: async () => {
      if (!isWorkoutStarted) return null;
      
      return WorkoutProgressService.getExerciseDemo(mockWorkout.exercises[currentExerciseIndex].name);
    },
    enabled: isWorkoutStarted && currentExerciseIndex >= 0 && mockWorkout.exercises.length > 0
  });

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (isWorkoutStarted && !isPaused && user?.id) {
        WorkoutProgressService.saveProgress(user.id, {
          workout_type: mockWorkout.title,
          current_exercise_index: currentExerciseIndex,
          timer,
          is_resting: isResting,
          total_time: totalWorkoutTime,
          completed_exercises: mockWorkout.exercises.filter(ex => ex.completed).length
        });
      }
    }, 5000);

    return () => clearInterval(progressInterval);
  }, [isWorkoutStarted, isPaused, user?.id, currentExerciseIndex, timer, isResting, totalWorkoutTime, mockWorkout]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const checkForSavedWorkout = async () => {
      if (user?.id && !isWorkoutStarted) {
        const activeSession = await WorkoutProgressService.getActiveSession(user.id);
        
        if (activeSession) {
          toast({
            title: "Saved Workout Found",
            description: "You can resume your previous workout.",
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const savedWorkout = { ...defaultWorkout, title: activeSession.workout_type };
                  
                  setMockWorkout(savedWorkout);
                  setCurrentExerciseIndex(0);
                  setTimer(0);
                  setIsResting(false);
                  setIsWorkoutStarted(true);
                  setIsPaused(false);
                  setTotalWorkoutTime(activeSession.duration || 0);
                  
                  toast({
                    title: "Workout Resumed",
                    description: "Let's continue where you left off!",
                  });
                }}
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Resume
              </Button>
            ),
          });
        }
      }
    };
    
    checkForSavedWorkout();
  }, [user?.id, toast, isWorkoutStarted]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isWorkoutStarted && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setTimer(prevTimer => {
          const currentExercise = mockWorkout.exercises[currentExerciseIndex];
          const duration = isResting ? currentExercise.rest : currentExercise.duration;
          
          if (prevTimer >= duration) {
            if (isResting) {
              if (currentExerciseIndex < mockWorkout.exercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1);
              } else {
                clearInterval(intervalRef.current!);
                setIsWorkoutStarted(false);
                setIsPaused(false);
                
                const updatedExercises = [...mockWorkout.exercises];
                updatedExercises[currentExerciseIndex].completed = true;
                
                const xpEarned = mockWorkout.duration * 3;
                
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
              setIsResting(true);
              
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
        
        setTotalWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isWorkoutStarted, currentExerciseIndex, isResting, mockWorkout, user, workoutMutation, isPaused]);

  const startWorkout = () => {
    const resetExercises = mockWorkout.exercises.map(ex => ({...ex, completed: false}));
    setMockWorkout(prev => ({...prev, exercises: resetExercises}));
    setIsWorkoutStarted(true);
    setCurrentExerciseIndex(0);
    setTimer(0);
    setIsResting(false);
    setIsPaused(false);
    setTotalWorkoutTime(0);
    
    toast({
      title: "Workout Started",
      description: `Get ready for your ${mockWorkout.title} workout!`,
    });
  };

  const pauseWorkout = () => {
    setIsPaused(true);
    
    if (user?.id) {
      pauseWorkoutMutation.mutate({
        userId: user.id,
        workout: mockWorkout,
        currentProgress: {
          currentExerciseIndex,
          timer,
          isResting,
          completedExercises: mockWorkout.exercises,
          totalTime: totalWorkoutTime
        }
      });
    }
  };

  const resumeWorkout = () => {
    setIsPaused(false);
    
    toast({
      title: "Workout Resumed",
      description: "Let's keep going!",
    });
  };

  const handleResumeSession = (session: WorkoutSession) => {
    let exercises = [
      { name: "Jumping Jacks", duration: 45, rest: 15, completed: false },
      { name: "Push-ups", duration: 45, rest: 15, completed: false },
      { name: "Mountain Climbers", duration: 45, rest: 15, completed: false },
      { name: "Squats", duration: 45, rest: 15, completed: false },
      { name: "Plank", duration: 45, rest: 15, completed: false },
    ];
    
    if (session.exercise_state) {
      try {
        exercises = JSON.parse(session.exercise_state);
      } catch (e) {
        console.error('Failed to parse exercise state:', e);
      }
    }
    
    const savedWorkout = {
      ...defaultWorkout, 
      title: session.workout_type,
      exercises: exercises,
      difficulty: session.intensity || defaultWorkout.difficulty,
      caloriesBurn: session.calories || defaultWorkout.caloriesBurn
    };
    
    setMockWorkout(savedWorkout);
    setCurrentExerciseIndex(session.current_exercise_index || 0);
    setTimer(0);
    setIsResting(session.is_resting || false);
    setIsWorkoutStarted(true);
    setIsPaused(false);
    setTotalWorkoutTime(session.duration || 0);
    
    toast({
      title: "Workout Resumed",
      description: `Resuming ${session.workout_type} workout!`,
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
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
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-bold">Today's Workout</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal py-1">
                      <Clock className="h-3 w-3 mr-1" /> {mockWorkout.duration} min
                    </Badge>
                    {isWorkoutStarted && (
                      <Badge className="font-normal py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {formatTotalTime(totalWorkoutTime)}
                      </Badge>
                    )}
                  </div>
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
                    <div className="mt-4 md:mt-0 flex gap-2">
                      {!isWorkoutStarted ? (
                        <Button onClick={startWorkout} className="w-full md:w-auto">
                          <Play className="h-4 w-4 mr-2" />
                          Start Workout
                        </Button>
                      ) : (
                        <>
                          {isPaused ? (
                            <Button onClick={resumeWorkout} className="w-full md:w-auto">
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </Button>
                          ) : (
                            <Button variant="secondary" onClick={pauseWorkout} className="w-full md:w-auto">
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsWorkoutStarted(false);
                              setIsPaused(false);
                              
                              if (totalWorkoutTime > 60) {
                                toast({
                                  title: "Workout Saved",
                                  description: "Your partial progress has been saved.",
                                });
                                
                                if (user?.id) {
                                  WorkoutService.saveWorkoutProgress(user.id, mockWorkout, totalWorkoutTime);
                                }
                              }
                            }} 
                            className="w-full md:w-auto"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            End
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isWorkoutStarted && (
                    <WorkoutProgress
                      currentExercise={currentExerciseIndex + 1}
                      totalExercises={mockWorkout.exercises.length}
                      exerciseName={mockWorkout.exercises[currentExerciseIndex].name}
                      timeRemaining={isResting ? 
                        mockWorkout.exercises[currentExerciseIndex].rest - timer : 
                        mockWorkout.exercises[currentExerciseIndex].duration - timer}
                      totalTime={isResting ? 
                        mockWorkout.exercises[currentExerciseIndex].rest : 
                        mockWorkout.exercises[currentExerciseIndex].duration}
                      isPaused={isPaused}
                      exerciseDescription={currentExerciseDemo?.description}
                      videoUrl={currentExerciseDemo?.animation_url}
                    />
                  )}

                  <div className="space-y-3 mt-6">
                    <h4 className="font-semibold text-sm text-muted-foreground">Exercise Plan:</h4>
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
                          {exercise.rest > 0 && <span className="ml-1 text-xs text-gray-500">+{exercise.rest}s rest</span>}
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

              {!isWorkoutStarted && (
                <PreviousWorkouts
                  sessions={previousSessions}
                  onResumeSession={handleResumeSession}
                />
              )}
            </div>

            <div className="space-y-6">
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
