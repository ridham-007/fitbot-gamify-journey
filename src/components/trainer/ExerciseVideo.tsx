
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown, ChevronUp, Play, Award } from 'lucide-react';

interface ExerciseVideoProps {
  name: string;
  description: string;
  videoUrl: string;
  category: string;
  difficulty: string;
  muscleGroup: string;
}

const ExerciseVideo = ({ name, description, videoUrl, category, difficulty, muscleGroup }: ExerciseVideoProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Map difficulty to color
  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300',
    expert: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300'
  };
  
  // Get color based on difficulty or default to a neutral color
  const getDifficultyColor = () => {
    return difficultyColors[difficulty.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`overflow-hidden transition-all duration-300 ${isHovered ? 'shadow-md' : 'shadow-sm'}`}>
        <CardHeader className="space-y-1 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              {difficulty === 'beginner' && <Award className="h-4 w-4 text-green-500" />}
              {difficulty === 'advanced' && <Award className="h-4 w-4 text-red-500" />}
              {name}
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`capitalize ${getDifficultyColor()}`}
            >
              {difficulty}
            </Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="capitalize bg-fitPurple-100 text-fitPurple-700 dark:bg-fitPurple-900 dark:text-fitPurple-300">
              {category}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {muscleGroup}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <motion.div 
            className="relative aspect-video rounded-md overflow-hidden group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <iframe
              src={videoUrl}
              title={name}
              className="absolute inset-0 w-full h-full rounded-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <motion.div 
              className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <Button size="sm" className="bg-white text-black hover:bg-fitPurple-100">
                <Play className="h-4 w-4 mr-1" /> Watch Now
              </Button>
            </motion.div>
          </motion.div>
          
          <div>
            <AnimatePresence>
              {expanded ? (
                <motion.p 
                  key="full-description"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-muted-foreground mb-2"
                >
                  {description}
                </motion.p>
              ) : (
                <motion.p 
                  key="truncated-description"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-muted-foreground line-clamp-2 mb-2"
                >
                  {description}
                </motion.p>
              )}
            </AnimatePresence>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="text-xs flex items-center p-0 h-6 hover:bg-transparent hover:text-fitPurple-600 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" /> Show more
                </>
              )}
            </Button>
          </div>
          
          <motion.div 
            className="flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center hover:bg-fitPurple-50 hover:text-fitPurple-600 hover:border-fitPurple-200 transition-colors"
            >
              <Info className="h-3 w-3 mr-1" /> Exercise details
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExerciseVideo;
