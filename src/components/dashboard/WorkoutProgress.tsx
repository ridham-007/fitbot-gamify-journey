
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, Timer, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface WorkoutProgressProps {
  currentExercise: number;
  totalExercises: number;
  exerciseName: string;
  timeRemaining: number;
  totalTime: number;
  isPaused?: boolean;
}

const WorkoutProgress = ({
  currentExercise,
  totalExercises,
  exerciseName,
  timeRemaining,
  totalTime,
  isPaused = false
}: WorkoutProgressProps) => {
  const { toast } = useToast();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentExercise / totalExercises) * 100;
  const timeProgressPercentage = (timeRemaining / totalTime) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <span>Workout Progress</span>
          {isPaused && (
            <span className="text-sm flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-1 rounded-md">
              <AlertCircle className="h-4 w-4" /> Paused
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Exercise {currentExercise} of {totalExercises}
          </span>
          <div className="flex items-center gap-2">
            <Timer className={cn("h-4 w-4", isPaused ? "text-amber-500" : "text-primary")} />
            <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Current Exercise Time</span>
            <span>{100 - Math.round(timeProgressPercentage)}%</span>
          </div>
          <Progress value={100 - timeProgressPercentage} className="h-1.5 bg-gray-100 dark:bg-gray-800" />
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 rounded-full p-1">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{exerciseName}</h3>
              <p className="text-sm text-muted-foreground">Current Exercise</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutProgress;
