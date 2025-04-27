
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Calendar } from 'lucide-react';
import { WorkoutSession } from '@/services/WorkoutProgressService';

interface PreviousWorkoutsProps {
  sessions: WorkoutSession[];
  onResumeSession: (session: WorkoutSession) => void;
}

const PreviousWorkouts = ({ sessions, onResumeSession }: PreviousWorkoutsProps) => {
  if (sessions.length === 0) {
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
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date for better display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Previous Workouts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className="bg-gray-50 dark:bg-fitDark-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-fitDark-900 dark:text-white">{session.workout_type}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm flex items-center text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(session.duration)}
                  </span>
                  <span className="text-sm flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(session.workout_date || session.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.intensity && (
                  <Badge variant="outline" className="capitalize">
                    {session.intensity}
                  </Badge>
                )}
                <Button 
                  size="sm" 
                  onClick={() => onResumeSession(session)}
                  className="bg-fitPurple-600 hover:bg-fitPurple-700"
                >
                  <Play className="h-3 w-3 mr-1" /> Resume
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" className="w-full text-sm text-gray-500 dark:text-gray-400">
          View all workout history
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PreviousWorkouts;
