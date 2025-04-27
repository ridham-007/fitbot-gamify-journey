
import { supabase } from '@/integrations/supabase/client';

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_type: string;
  current_exercise_index?: number;
  timer?: number;
  is_resting?: boolean;
  total_time?: number;
  completed_exercises?: number;
  created_at: string;
  duration?: number;
  calories?: number;
  intensity?: string;
  satisfaction_rating?: number;
  workout_date?: string;
  exercise_state?: string;
  is_completed?: boolean;
  completed_at?: string;  // Added this to fix the previous build error
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
          current_exercise_index: progressData.current_exercise_index || 0,
          is_resting: progressData.is_resting || false,
          created_at: new Date().toISOString(),
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

      // Transform the data to match WorkoutSession interface
      const sessions: WorkoutSession[] = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        workout_type: item.workout_type,
        current_exercise_index: item.current_exercise_index || 0,
        timer: 0,
        is_resting: item.is_resting || false,
        total_time: item.duration || 0,
        completed_exercises: 0,
        created_at: item.created_at,
        duration: item.duration,
        calories: item.calories,
        intensity: item.intensity,
        satisfaction_rating: item.satisfaction_rating,
        workout_date: item.workout_date,
        exercise_state: item.exercise_state,
        is_completed: item.is_completed
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
      
      return {
        id: data.id,
        user_id: data.user_id,
        workout_type: data.workout_type,
        current_exercise_index: data.current_exercise_index || 0,
        timer: 0,
        is_resting: data.is_resting || false,
        total_time: data.duration || 0,
        completed_exercises: 0,
        created_at: data.created_at,
        duration: data.duration,
        calories: data.calories,
        intensity: data.intensity,
        workout_date: data.workout_date,
        exercise_state: data.exercise_state,
        is_completed: data.is_completed
      };
    } catch (error) {
      console.error('Exception when fetching active session:', error);
      return null;
    }
  },
  
  async getExerciseDemo(exerciseName: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('exercise_demonstrations')
        .select('*')
        .eq('exercise_name', exerciseName)
        .maybeSingle();
        
      if (error || !data) {
        console.error('Error fetching exercise demo:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Exception when fetching exercise demo:', error);
      return null;
    }
  }
};

export default WorkoutProgressService;

