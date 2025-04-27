
import { supabase } from '@/integrations/supabase/client';

interface WorkoutExercise {
  name: string;
  duration: number;
  rest: number;
  completed: boolean;
}

interface WorkoutData {
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  caloriesBurn: number;
  exercises: WorkoutExercise[];
}

interface SavedWorkout {
  id: string;
  workout_type: string;
  duration: number;
  calories_burned: number;
  exercise_data: any;
  completed_at: string;
  user_id: string;
  notes?: string;
}

// Define the user_workout_progress table structure to match the database
interface UserWorkoutProgress {
  id: string;
  user_id: string;
  workout_type: string;
  duration: number;
  calories: number | null;
  intensity: string | null;
  satisfaction_rating: number | null;
  workout_date: string;
  created_at: string;
}

export const WorkoutService = {
  async saveWorkoutProgress(userId: string, workout: WorkoutData, progress: number): Promise<{ success: boolean; error?: any; data?: any }> {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    
    try {
      // Save to user workout progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_workout_progress')
        .insert({
          user_id: userId,
          workout_type: workout.title,
          duration: progress,
          calories: Math.round((progress / workout.duration) * workout.caloriesBurn),
          intensity: workout.difficulty
        })
        .select()
        .single();
      
      if (progressError) {
        console.error('Error saving workout progress:', progressError);
        return { success: false, error: progressError };
      }
      
      return { success: true, data: progressData };
    } catch (error) {
      console.error('Exception when saving workout progress:', error);
      return { success: false, error };
    }
  },
  
  async completeWorkout(userId: string, workout: WorkoutData, completedExercises: WorkoutExercise[], xpEarned: number = 0): Promise<{ success: boolean; error?: any; data?: any }> {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    
    try {
      // Save completed workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          workout_type: workout.title,
          duration: workout.duration,
          calories_burned: workout.caloriesBurn,
          exercise_data: completedExercises,
          notes: `Completed ${completedExercises.filter(ex => ex.completed).length} of ${completedExercises.length} exercises`
        })
        .select()
        .single();
      
      if (workoutError) {
        console.error('Error saving completed workout:', workoutError);
        return { success: false, error: workoutError };
      }
      
      return { success: true, data: workoutData };
    } catch (error) {
      console.error('Exception when completing workout:', error);
      return { success: false, error };
    }
  },
  
  async getRecentWorkouts(userId: string, limit: number = 5): Promise<{ success: boolean; error?: any; data?: SavedWorkout[] }> {
    if (!userId) {
      return { success: false, error: 'No user ID provided', data: [] };
    }
    
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        return { success: false, error, data: [] };
      }
      
      // Ensure we return data conforming to SavedWorkout interface
      const typedData = data as SavedWorkout[];
      return { success: true, data: typedData || [] };
    } catch (error) {
      console.error('Exception when fetching recent workouts:', error);
      return { success: false, error, data: [] };
    }
  },
  
  async pauseWorkout(userId: string, workout: WorkoutData, currentProgress: any): Promise<{ success: boolean; error?: any; data?: any }> {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    
    try {
      // Save the current workout state to local storage as a backup
      localStorage.setItem(`workout_${userId}`, JSON.stringify({
        workout,
        currentProgress,
        timestamp: new Date().toISOString()
      }));
      
      // Also save to Supabase for persistence across devices
      const progressInfo = {
        currentExerciseIndex: currentProgress.currentExerciseIndex,
        timer: currentProgress.timer,
        isResting: currentProgress.isResting,
        completedExercises: currentProgress.completedExercises,
        status: 'paused'
      };
      
      const { data, error } = await supabase
        .from('user_workout_progress')
        .insert({
          user_id: userId,
          workout_type: workout.title,
          duration: currentProgress.currentTime || 0,
          calories: Math.round((currentProgress.currentTime / workout.duration) * workout.caloriesBurn),
          intensity: workout.difficulty,
          satisfaction_rating: null,
          // Store progress info in the satisfaction_rating field as a workaround
          // since there's no 'notes' field in user_workout_progress
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error pausing workout:', error);
        return { success: false, error };
      }
      
      // Store the progress info in localStorage since we can't use notes field
      localStorage.setItem(`workout_state_${userId}`, JSON.stringify(progressInfo));
      
      return { success: true, data };
    } catch (error) {
      console.error('Exception when pausing workout:', error);
      return { success: false, error };
    }
  },
  
  async resumeWorkout(userId: string): Promise<{ success: boolean; error?: any; data?: any }> {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    
    try {
      // First try to get from local storage
      const localData = localStorage.getItem(`workout_${userId}`);
      const workoutState = localStorage.getItem(`workout_state_${userId}`);
      
      if (localData) {
        const parsedData = JSON.parse(localData);
        
        // Check if the saved workout is from today
        const savedDate = new Date(parsedData.timestamp).toDateString();
        const currentDate = new Date().toDateString();
        
        if (savedDate === currentDate) {
          // If we have workout state details in localStorage, merge them
          if (workoutState) {
            try {
              const parsedState = JSON.parse(workoutState);
              parsedData.currentProgress = {
                ...parsedData.currentProgress,
                ...parsedState
              };
            } catch (e) {
              console.error('Error parsing workout state:', e);
            }
          }
          
          return { success: true, data: parsedData };
        }
      }
      
      // If not in local storage or not from today, try to get from Supabase
      const { data, error } = await supabase
        .from('user_workout_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('workout_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        // No paused workout found
        return { success: false, error };
      }
      
      // We need to get the workout state from localStorage since we couldn't store it in the notes field
      const savedWorkoutState = localStorage.getItem(`workout_state_${userId}`);
      let parsedWorkoutState = {};
      
      if (savedWorkoutState) {
        try {
          parsedWorkoutState = JSON.parse(savedWorkoutState);
        } catch (e) {
          console.error('Error parsing saved workout state:', e);
        }
      }
      
      const progressData = data as UserWorkoutProgress;
      
      return {
        success: true,
        data: {
          workout: {
            title: progressData.workout_type,
            duration: progressData.duration,
            difficulty: progressData.intensity || 'Intermediate',
            caloriesBurn: progressData.calories || 0
          },
          currentProgress: {
            currentExerciseIndex: (parsedWorkoutState as any).currentExerciseIndex || 0,
            timer: (parsedWorkoutState as any).timer || 0,
            isResting: (parsedWorkoutState as any).isResting || false,
            completedExercises: (parsedWorkoutState as any).completedExercises || [],
            totalTime: progressData.duration
          },
          timestamp: progressData.created_at
        }
      };
    } catch (error) {
      console.error('Exception when resuming workout:', error);
      return { success: false, error };
    }
  }
};

export default WorkoutService;
