
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Trophy, 
  Sparkles,
  StarHalf,
} from 'lucide-react';

interface ProfileStatsProps {
  userLevel: number;
  userXp: number;
  streak: number;
  workoutsCompleted: number;
}

const ProfileStats = ({ userLevel, userXp, streak, workoutsCompleted }: ProfileStatsProps) => {
  const xpToNextLevel = userLevel * 500;
  const xpPercentage = Math.min(Math.round((userXp / xpToNextLevel) * 100), 100);

  return (
    <Card className="mt-4 bg-gradient-to-br from-fitPurple-50 to-white dark:from-fitDark-900 dark:to-fitDark-800 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-fitPurple-500" />
          Profile Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fitPurple-400" />
              Level Progress
            </div>
            <div className="text-sm text-fitPurple-600 dark:text-fitPurple-400 font-medium">
              {userXp} / {xpToNextLevel} XP
            </div>
          </div>
          <Progress value={xpPercentage} className="h-2" />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {xpToNextLevel - userXp} XP to Level {userLevel + 1}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-fitPurple-100 to-white dark:from-fitDark-800 dark:to-fitDark-700 rounded-lg p-4 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <StarHalf className="w-4 h-4 text-fitPurple-500" />
              Streak
            </div>
            <div className="text-2xl font-bold text-fitDark-900 dark:text-white flex items-center">
              {streak}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">days</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-fitPurple-100 to-white dark:from-fitDark-800 dark:to-fitDark-700 rounded-lg p-4 transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Star className="w-4 h-4 text-fitPurple-500" />
              Workouts
            </div>
            <div className="text-2xl font-bold text-fitDark-900 dark:text-white flex items-center">
              {workoutsCompleted}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">total</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStats;
