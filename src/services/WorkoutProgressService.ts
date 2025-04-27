
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from './WorkoutService';

// Represents the workout progress as stored in the database
export interface DatabaseWorkoutProgress {
  id: string;
  user_id: string;
  workout_type: string;
  duration?: number;
  calories?: number;
  intensity?: string;
  satisfaction_rating?: number;
  workout_date?: string;
  created_at: string;
  current_exercise_index?: number;
  is_resting?: boolean;
  exercise_state?: string;
  is_completed?: boolean;
  timer_position?: number;
}

// Represents the workout session used in the UI
export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_type: string;
  current_exercise_index: number;
  timer: number;
  is_resting: boolean;
  total_time: number;
  completed_exercises: number;
  created_at: string;
  duration?: number;
  calories?: number;
  intensity?: string;
  satisfaction_rating?: number;
  workout_date?: string;
  exercise_state?: string;
  is_completed?: boolean;
  timer_position?: number;
}

// Exercise demonstration data
export interface ExerciseDemo {
  id: string;
  exercise_name: string;
  description?: string;
  animation_url: string;
  form_tips?: string[];
  muscle_group: string;
  difficulty_level: string;
}

export const WorkoutProgressService = {
  async saveProgress(userId: string, progressData: Partial<WorkoutSession>): Promise<{ success: boolean; error?: any }> {
    if (!userId) return { success: false, error: 'No user ID provided' };

    try {
      const { error } = await supabase
        .from('user_workout_progress')
        .insert({
          user_id: userId,
          workout_type: progressData.workout_type,
          duration: progressData.total_time,
          calories: progressData.calories || Math.round((progressData.total_time || 0) * 2),
          intensity: progressData.intensity || 'medium',
          workout_date: new Date().toISOString().split('T')[0],
          current_exercise_index: progressData.current_exercise_index,
          timer_position: progressData.timer || 0,
          is_resting: progressData.is_resting || false,
          created_at: new Date().toISOString(),
          exercise_state: progressData.exercise_state,
          is_completed: false
        })
        .select();

      if (error) {
        console.error('Error saving workout progress:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception when saving workout progress:', error);
      return { success: false, error };
    }
  },

  async getRecentSessions(userId: string): Promise<WorkoutSession[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_workout_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent sessions:', error);
        return [];
      }

      const sessions: WorkoutSession[] = (data || []).map((item: DatabaseWorkoutProgress) => ({
        id: item.id,
        user_id: item.user_id,
        workout_type: item.workout_type,
        current_exercise_index: item.current_exercise_index || 0,
        timer: item.timer_position || 0,
        is_resting: item.is_resting || false,
        total_time: item.duration || 0,
        completed_exercises: item.exercise_state ? JSON.parse(item.exercise_state).filter((ex: WorkoutExercise) => ex.completed).length : 0,
        created_at: item.created_at,
        duration: item.duration,
        calories: item.calories,
        intensity: item.intensity,
        workout_date: item.workout_date,
        exercise_state: item.exercise_state,
        is_completed: item.is_completed,
        timer_position: item.timer_position
      }));

      return sessions;
    } catch (error) {
      console.error('Exception when fetching recent sessions:', error);
      return [];
    }
  },

  async getActiveSession(userId: string): Promise<WorkoutSession | null> {
    if (!userId) return null;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_workout_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('workout_date', today)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error || !data) {
        console.error('Error fetching active session:', error);
        return null;
      }

      let exercises: WorkoutExercise[] = [];
      try {
        if (data.exercise_state) {
          exercises = JSON.parse(data.exercise_state);
        }
      } catch (e) {
        console.error('Error parsing exercise state:', e);
      }
      
      // Explicitly casting data to DatabaseWorkoutProgress to ensure TypeScript recognizes timer_position
      const item = data as DatabaseWorkoutProgress;
      
      return {
        id: item.id,
        user_id: item.user_id,
        workout_type: item.workout_type,
        current_exercise_index: item.current_exercise_index || 0,
        timer: item.timer_position || 0,
        is_resting: item.is_resting || false,
        total_time: item.duration || 0,
        completed_exercises: exercises.filter(ex => ex.completed).length,
        created_at: item.created_at,
        duration: item.duration,
        calories: item.calories,
        intensity: item.intensity,
        workout_date: item.workout_date,
        exercise_state: item.exercise_state,
        is_completed: item.is_completed,
        timer_position: item.timer_position
      };
    } catch (error) {
      console.error('Exception when fetching active session:', error);
      return null;
    }
  },

  async getExerciseDemo(exerciseName: string): Promise<ExerciseDemo | null> {
    try {
      // Normalize the exercise name for search
      const normalizedName = exerciseName.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('exercise_demonstrations')
        .select('*')
        .ilike('exercise_name', `%${normalizedName}%`)
        .limit(1)
        .maybeSingle();
      
      if (error || !data) {
        console.error('Error fetching exercise demo:', error);
        return null;
      }
      
      return data as ExerciseDemo;
    } catch (error) {
      console.error('Exception when fetching exercise demo:', error);
      return null;
    }
  }
};

export default WorkoutProgressService;
