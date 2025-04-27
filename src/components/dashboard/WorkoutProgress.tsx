
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
    <Card className="border-2 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Current Exercise</CardTitle>
          <div className="flex items-center gap-2">
            {isPaused ? (
              <span className="text-sm flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-1 rounded-md">
                <AlertCircle className="h-4 w-4" /> Paused
              </span>
            ) : (
              <span className="text-sm flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-md">
                <Timer className="h-4 w-4" /> In Progress
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Exercise {currentExercise} of {totalExercises}</span>
            <span>{totalExercises - currentExercise} remaining</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 rounded-full p-1.5">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{exerciseName}</h3>
                <p className="text-sm text-muted-foreground">Current Exercise</p>
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {formatTime(timeRemaining)}
            </div>
          </div>
          <Progress 
            value={timeProgressPercentage} 
            className="h-1.5"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutProgress;
