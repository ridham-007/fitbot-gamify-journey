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
  exercise_data: WorkoutExercise[];
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

export const WorkoutService = {
  async getLastCompletedWorkout(userId: string): Promise<SavedWorkout | null> {
    if (!userId) return null;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .gte('completed_at', `${today}T00:00:00`)
        .lt('completed_at', `${today}T23:59:59`)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error || !data) return null;
      
      return {
        ...data,
        exercise_data: data.exercise_data || []
      } as SavedWorkout;
    } catch (error) {
      console.error('Error fetching last completed workout:', error);
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

  async resumeWorkout(userId: string): Promise<{ success: boolean; error?: any; data?: any }> {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    
    try {
      const { data: progressData } = await supabase
        .from('user_workout_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('workout_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!progressData) {
        return { success: false, error: 'No workout in progress' };
      }
      
      return {
        success: true,
        data: progressData
      };
    } catch (error) {
      console.error('Error resuming workout:', error);
      return { success: false, error };
    }
  }
};

export default WorkoutService;
