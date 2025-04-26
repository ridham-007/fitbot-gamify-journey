
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, Timer } from 'lucide-react';

interface WorkoutProgressProps {
  currentExercise: number;
  totalExercises: number;
  exerciseName: string;
  timeRemaining: number;
  totalTime: number;
}

const WorkoutProgress = ({
  currentExercise,
  totalExercises,
  exerciseName,
  timeRemaining,
  totalTime
}: WorkoutProgressProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Workout Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Exercise {currentExercise} of {totalExercises}
          </span>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        
        <Progress value={(currentExercise / totalExercises) * 100} />
        
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
