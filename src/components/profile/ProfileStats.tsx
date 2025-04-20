
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Trophy, 
  Sparkles,
  StarHalf,
  Dumbbell,
  Flame,
  Award,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileStatsProps {
  userLevel: number;
  userXp: number;
  streak: number;
  workoutsCompleted: number;
}

const ProfileStats = ({ userLevel, userXp, streak, workoutsCompleted }: ProfileStatsProps) => {
  const xpToNextLevel = userLevel * 500;
  const xpPercentage = Math.min(Math.round((userXp / xpToNextLevel) * 100), 100);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={staggerChildren}
    >
      <Card className="mt-4 bg-gradient-to-br from-fitPurple-50 to-white dark:from-fitDark-900 dark:to-fitDark-800 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fitPurple-600 to-fitPurple-400">
              Your Fitness Stats
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <motion.div variants={fadeInUp}>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Level Progress
              </div>
              <div className="text-sm text-fitPurple-600 dark:text-fitPurple-400 font-medium">
                {userXp} / {xpToNextLevel} XP
              </div>
            </div>
            
            <div className="relative">
              <Progress value={xpPercentage} className="h-3 overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                  style={{ 
                    width: "30%", 
                    transform: `translateX(${xpPercentage}%)`,
                    filter: "blur(8px)" 
                  }}
                />
              </Progress>
            </div>
            
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>Current: Level {userLevel}</span>
              <span>{xpToNextLevel - userXp} XP to Level {userLevel + 1}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              variants={fadeInUp}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.1), 0 8px 10px -6px rgba(124, 58, 237, 0.1)" 
              }}
              className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-fitDark-800 rounded-lg p-4 border border-amber-100 dark:border-amber-800"
            >
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Current Streak
              </div>
              <div className="mt-3 text-center">
                <div className="text-3xl font-bold text-amber-500 dark:text-amber-400 flex items-center justify-center">
                  {streak}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">days</span>
                </div>
                
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <Star 
                        className={`w-4 h-4 ${i < Math.min(streak, 5) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}`} 
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.1), 0 8px 10px -6px rgba(124, 58, 237, 0.1)" 
              }}
              className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-fitDark-800 rounded-lg p-4 border border-blue-100 dark:border-blue-800"
            >
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-blue-500" />
                Total Workouts
              </div>
              <div className="mt-3 text-center">
                <div className="text-3xl font-bold text-blue-500 dark:text-blue-400">
                  {workoutsCompleted}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  completed sessions
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            variants={fadeInUp}
            className="flex justify-center"
          >
            <Badge className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none">
              <Award className="w-4 h-4 mr-2" />
              {userLevel < 5 ? 'Fitness Rookie' : 
               userLevel < 10 ? 'Fitness Enthusiast' : 
               userLevel < 20 ? 'Fitness Pro' : 'Fitness Master'}
            </Badge>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileStats;
