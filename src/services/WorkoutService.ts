
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
  exercise_data: WorkoutExercise[] | any; // Fixed: Explicitly defined type
  completed_at: string;
  user_id: string;
  notes?: string;
}

interface WorkoutProgress {
  currentExerciseIndex: number;
  timer: number;
  isResting: boolean;
  completedExercises: WorkoutExercise[];
  currentTime: number;
}

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
  async getLastCompletedWorkout(userId: string): Promise<SavedWorkout | null> {
    try {
      // Explicitly define response type to prevent excessive type instantiation
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('completed_at::date', new Date().toISOString().split('T')[0])
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Changed from single() to maybeSingle() for safer behavior
      
      if (error) {
        console.error('Error fetching last completed workout:', error);
        return null;
      }
      
      // Handle case where data might be null
      if (!data) return null;
      
      // Ensure exercise_data is present (even if empty array)
      const workout = data as SavedWorkout;
      if (!workout.exercise_data) {
        workout.exercise_data = [];
      }
      
      return workout;
    } catch (error) {
      console.error('Exception when fetching last completed workout:', error);
      return null;
    }
  },

  async saveWorkoutProgress(userId: string, workout: WorkoutData, progress: number): Promise<{ success: boolean; error?: any; data?: any }> {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    
    try {
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
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          workout_type: workout.title,
          duration: workout.duration,
          calories_burned: workout.caloriesBurn,
          exercise_data: completedExercises, // This must match SavedWorkout interface
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
      
      const typedData = data as SavedWorkout[];
      return { success: true, data: typedData || [] };
    } catch (error) {
      console.error('Exception when fetching recent workouts:', error);
      return { success: false, error, data: [] };
    }
  },
  
  async pauseWorkout(userId: string, workout: WorkoutData, currentProgress: WorkoutProgress): Promise<{ success: boolean; error?: any; data?: any }> {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    
    try {
      const progressInfo = {
        currentExerciseIndex: currentProgress.currentExerciseIndex,
        timer: currentProgress.timer,
        isResting: currentProgress.isResting,
        completedExercises: currentProgress.completedExercises,
        currentTime: currentProgress.currentTime,
        timestamp: new Date().toISOString(),
        workout: workout
      };
      
      localStorage.setItem(`workout_state_${userId}`, JSON.stringify(progressInfo));
      
      const { data, error } = await supabase
        .from('user_workout_progress')
        .insert({
          user_id: userId,
          workout_type: workout.title,
          duration: currentProgress.currentTime || 0,
          calories: Math.round((currentProgress.currentTime / workout.duration) * workout.caloriesBurn),
          intensity: workout.difficulty,
          workout_date: new Date().toISOString().split('T')[0]
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
      const completedWorkout = await this.getLastCompletedWorkout(userId);
      if (completedWorkout) {
        return { success: false, error: 'Already completed workout today' };
      }
      
      const savedState = localStorage.getItem(`workout_state_${userId}`);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        const savedDate = new Date(parsedState.timestamp).toDateString();
        const currentDate = new Date().toDateString();
        
        if (savedDate === currentDate) {
          return { success: true, data: parsedState };
        }
      }
      
      const { data: progressData, error: progressError } = await supabase
        .from('user_workout_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('workout_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (progressError) {
        console.error('Error fetching workout progress:', progressError);
        return { success: false, error: progressError };
      }
      
      if (!progressData) {
        return { success: false, error: 'No workout in progress' };
      }
      
      const savedWorkoutState = localStorage.getItem(`workout_state_${userId}`);
      let workoutState = {};
      
      if (savedWorkoutState) {
        try {
          workoutState = JSON.parse(savedWorkoutState);
        } catch (e) {
          console.error('Error parsing saved workout state:', e);
        }
      }
      
      return {
        success: true,
        data: {
          ...workoutState,
          progress: progressData
        }
      };
    } catch (error) {
      console.error('Exception when resuming workout:', error);
      return { success: false, error };
    }
  }
};

export default WorkoutService;
