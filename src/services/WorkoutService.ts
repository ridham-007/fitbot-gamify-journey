
import { supabase } from '@/integrations/supabase/client';

export interface WorkoutExercise {
  name: string;
  duration: number;
  rest: number;
  completed: boolean;
}

export interface WorkoutData {
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  caloriesBurn: number;
  exercises: WorkoutExercise[];
}

export interface SavedWorkout {
  id: string;
  workout_type: string;
  duration: number;
  calories_burned: number;
  exercise_state?: string;
  completed_at: string;
  user_id: string;
  notes?: string;
}

export interface WorkoutProgress {
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
      
      return data as SavedWorkout;
    } catch (error) {
      console.error('Error fetching last completed workout:', error);
      return null;
    }
  },

  async saveWorkoutProgress(userId: string, workout: WorkoutData, progress: number, currentExerciseIndex: number = 0, isResting: boolean = false): Promise<{ success: boolean; error?: any; data?: any }> {
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
          intensity: workout.difficulty,
          workout_date: new Date().toISOString().split('T')[0],
          current_exercise_index: currentExerciseIndex,
          is_resting: isResting,
          exercise_state: JSON.stringify(workout.exercises),
          is_completed: false
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
  
  async pauseWorkout(userId: string, workout: WorkoutData, currentProgress: any): Promise<{ success: boolean; error?: any; data?: any }> {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('user_workout_progress')
        .insert({
          user_id: userId,
          workout_type: workout.title,
          duration: currentProgress.totalTime || 0,
          calories: Math.round((currentProgress.totalTime / workout.duration) * workout.caloriesBurn),
          intensity: workout.difficulty,
          workout_date: new Date().toISOString().split('T')[0],
          current_exercise_index: currentProgress.currentExerciseIndex,
          is_resting: currentProgress.isResting,
          exercise_state: JSON.stringify(workout.exercises),
          is_completed: false
        })
        .select()
        .single();
      
      if (progressError) {
        console.error('Error pausing workout:', progressError);
        return { success: false, error: progressError };
      }
      
      return { success: true, data: progressData };
    } catch (error) {
      console.error('Exception when pausing workout:', error);
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
          exercise_state: JSON.stringify(completedExercises),
          notes: `Completed ${completedExercises.filter(ex => ex.completed).length} of ${completedExercises.length} exercises`
        })
        .select()
        .single();
      
      if (workoutError) {
        console.error('Error saving completed workout:', workoutError);
        return { success: false, error: workoutError };
      }
      
      await supabase
        .from('user_workout_progress')
        .insert({
          user_id: userId,
          workout_type: workout.title,
          duration: workout.duration * 60,
          calories: workout.caloriesBurn,
          intensity: workout.difficulty,
          workout_date: new Date().toISOString().split('T')[0],
          satisfaction_rating: 5,
          is_completed: true,
          current_exercise_index: completedExercises.length - 1,
          exercise_state: JSON.stringify(completedExercises)
        });
      
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
      
      return { success: true, data: data as SavedWorkout[] };
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
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!progressData) {
        return { success: false, error: 'No workout in progress' };
      }
      
      // Try to parse saved exercise state if available
      let exercises = [
        { name: "Jumping Jacks", duration: 45, rest: 15, completed: false },
        { name: "Push-ups", duration: 45, rest: 15, completed: false },
        { name: "Mountain Climbers", duration: 45, rest: 15, completed: false },
        { name: "Squats", duration: 45, rest: 15, completed: false },
        { name: "Plank", duration: 45, rest: 15, completed: false },
      ];
      
      if (progressData.exercise_state) {
        try {
          exercises = JSON.parse(progressData.exercise_state);
        } catch (e) {
          console.error('Failed to parse exercise state:', e);
        }
      }
      
      const workout = {
        title: progressData.workout_type,
        description: `Resumed ${progressData.workout_type} workout`,
        duration: Math.ceil((progressData.duration || 0) / 60),
        difficulty: progressData.intensity || 'Intermediate',
        caloriesBurn: progressData.calories || 300,
        exercises: exercises
      };
      
      return {
        success: true,
        data: {
          workout,
          currentProgress: {
            currentExerciseIndex: progressData.current_exercise_index || 0,
            timer: 0,
            isResting: progressData.is_resting || false,
            totalTime: progressData.duration || 0
          }
        }
      };
    } catch (error) {
      console.error('Error resuming workout:', error);
      return { success: false, error };
    }
  }
};

export default WorkoutService;
