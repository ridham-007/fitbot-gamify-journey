
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExerciseDemoProps {
  exerciseName: string;
  animationUrl: string;
  description: string;
  muscleGroup: string;
  difficultyLevel: string;
  formTips: string[];
}

const ExerciseDemo = ({
  exerciseName,
  animationUrl,
  description,
  muscleGroup,
  difficultyLevel,
  formTips
}: ExerciseDemoProps) => {
  // Map difficulty level to color
  const getDifficultyColor = () => {
    switch (difficultyLevel.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">{exerciseName}</CardTitle>
            <Badge className={getDifficultyColor()}>{difficultyLevel}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{muscleGroup}</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-help">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Target muscle group: {muscleGroup}. {description.substring(0, 100)}...
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <img 
              src={animationUrl} 
              alt={`${exerciseName} demonstration`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400?text=Exercise+Demo';
              }}
            />
            {animationUrl && animationUrl.includes('youtube') && (
              <a 
                href={animationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="space-y-2">
            <h4 className="font-semibold">Form Tips:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {formTips && formTips.length > 0 ? (
                formTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))
              ) : (
                <li>Keep proper form throughout the exercise</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExerciseDemo;
