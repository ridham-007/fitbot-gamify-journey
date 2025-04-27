
import { supabase } from '@/integrations/supabase/client';

interface WorkoutSession {
  id: string;
  user_id: string;
  workout_type: string;
  current_exercise_index: number;
  timer: number;
  is_resting: boolean;
  total_time: number;
  completed_exercises: number;
  created_at: string;
}

export const WorkoutProgressService = {
  async saveProgress(userId: string, progressData: Partial<WorkoutSession>): Promise<{ success: boolean; error?: any }> {
    if (!userId) return { success: false, error: 'No user ID provided' };

    try {
      const { data, error } = await supabase
        .from('user_workout_progress')
        .upsert({
          user_id: userId,
          workout_type: progressData.workout_type,
          duration: progressData.total_time,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving workout progress:', error);
        return { success: false, error };
      }

      return { success: true, data };
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
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception when fetching recent sessions:', error);
      return [];
    }
  }
};

export default WorkoutProgressService;
