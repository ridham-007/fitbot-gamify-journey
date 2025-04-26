
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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
            <Badge>{difficultyLevel}</Badge>
          </div>
          <Badge variant="outline">{muscleGroup}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img 
              src={animationUrl} 
              alt={`${exerciseName} demonstration`}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="space-y-2">
            <h4 className="font-semibold">Form Tips:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {formTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExerciseDemo;
