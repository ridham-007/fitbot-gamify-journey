
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
      const { data, error } = await supabase
        .from('user_workout_progress')
        .insert({
          user_id: userId,
          workout_type: workout.title,
          duration: currentProgress.currentTime || 0,
          calories: Math.round((currentProgress.currentTime / workout.duration) * workout.caloriesBurn),
          intensity: workout.difficulty,
          satisfaction_rating: null,
          notes: JSON.stringify({
            currentExerciseIndex: currentProgress.currentExerciseIndex,
            timer: currentProgress.timer,
            isResting: currentProgress.isResting,
            completedExercises: currentProgress.completedExercises,
            status: 'paused'
          })
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error pausing workout:', error);
        return { success: false, error };
      }
      
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
      if (localData) {
        const parsedData = JSON.parse(localData);
        
        // Check if the saved workout is from today
        const savedDate = new Date(parsedData.timestamp).toDateString();
        const currentDate = new Date().toDateString();
        
        if (savedDate === currentDate) {
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
      
      // Parse the notes field to get the saved workout state
      try {
        // Make sure the notes field is properly typed when used
        const workoutState = data.notes ? JSON.parse(data.notes as string) : {};
        
        return {
          success: true,
          data: {
            workout: {
              title: data.workout_type,
              duration: data.duration,
              difficulty: data.intensity || 'Intermediate',
              caloriesBurn: data.calories || 0
            },
            currentProgress: {
              currentExerciseIndex: workoutState.currentExerciseIndex || 0,
              timer: workoutState.timer || 0,
              isResting: workoutState.isResting || false,
              completedExercises: workoutState.completedExercises || []
            },
            timestamp: data.created_at
          }
        };
      } catch (parseError) {
        return { success: false, error: 'Invalid saved workout data' };
      }
    } catch (error) {
      console.error('Exception when resuming workout:', error);
      return { success: false, error };
    }
  }
};

export default WorkoutService;
