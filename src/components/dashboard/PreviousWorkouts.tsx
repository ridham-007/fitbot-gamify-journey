
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Calendar, ArrowRight, AlertCircle } from 'lucide-react';
import { WorkoutSession } from '@/services/WorkoutProgressService';
import { cn } from '@/lib/utils';

interface PreviousWorkoutsProps {
  sessions: WorkoutSession[];
  onResumeSession: (session: WorkoutSession) => void;
}

const PreviousWorkouts = ({ sessions, onResumeSession }: PreviousWorkoutsProps) => {
  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Previous Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">No workout history yet. Start your first workout!</p>
        </CardContent>
      </Card>
    );
  }

  // Format time display
  const formatTime = (seconds: number | undefined) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date for better display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-bold flex items-center">
          Recent Workouts
          <span className="ml-2 bg-fitPurple-100 text-fitPurple-700 dark:bg-fitPurple-900/30 dark:text-fitPurple-300 text-xs rounded-full px-2 py-0.5">
            {sessions.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sessions.map((session) => (
            <div 
              key={session.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-fitDark-800 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-3 text-amber-600 dark:text-amber-300">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-fitDark-900 dark:text-white">{session.workout_type}</h4>
                      {session.intensity && (
                        <Badge variant="outline" className="ml-2 capitalize text-xs">
                          {session.intensity}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(session.timer || 0)} / {formatTime(session.total_time || 0)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(session.workout_date || session.created_at)}
                      </span>
                      <span>
                        ~{session.calories || Math.round((session.total_time || 0) * 2)} cal
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => onResumeSession(session)}
                  className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1"
                >
                  <Play className="h-3 w-3" /> Resume ({formatTime(session.timer || 0)})
                </Button>
              </div>
              
              <div className="mt-3">
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                  <div 
                    className="h-full bg-amber-600" 
                    style={{ 
                      width: `${Math.min(100, Math.max(5, ((session.current_exercise_index || 0) / 5) * 100))}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="ghost" className="w-full text-sm text-gray-500 dark:text-gray-400 gap-1">
          View workout history <ArrowRight className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PreviousWorkouts;
