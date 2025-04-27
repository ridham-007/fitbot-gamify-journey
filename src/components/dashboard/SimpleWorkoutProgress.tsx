
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, RefreshCw } from 'lucide-react';

interface SimpleWorkoutProgressProps {
  currentExercise: number;
  totalExercises: number;
  exerciseName: string;
  timeElapsed: number;
  totalTime: number;
  isPaused: boolean;
}

const SimpleWorkoutProgress = ({
  currentExercise,
  totalExercises,
  exerciseName,
  timeElapsed,
  totalTime,
  isPaused
}: SimpleWorkoutProgressProps) => {
  // Calculate progress percentages
  const exerciseProgress = (currentExercise / totalExercises) * 100;
  const timeProgress = (timeElapsed / totalTime) * 100;

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {isPaused ? (
            <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />
          ) : (
            <Timer className="h-5 w-5 text-green-500" />
          )}
          Current Workout Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exercise Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Exercise Progress</span>
            <span>{Math.round(exerciseProgress)}%</span>
          </div>
          <Progress value={exerciseProgress} className="h-2" />
          <div className="text-sm text-muted-foreground">
            Exercise {currentExercise} of {totalExercises}: {exerciseName}
          </div>
        </div>

        {/* Time Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Time Elapsed</span>
            <span>{formatTime(timeElapsed)} / {formatTime(totalTime)}</span>
          </div>
          <Progress value={timeProgress} className="h-2" />
        </div>

        {isPaused && (
          <div className="text-sm text-yellow-500 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Workout Paused
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleWorkoutProgress;
