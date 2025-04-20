
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface ExerciseVideoProps {
  name: string;
  description: string;
  videoUrl: string;
  category: string;
  difficulty: string;
  muscleGroup: string;
}

const ExerciseVideo = ({ name, description, videoUrl, category, difficulty, muscleGroup }: ExerciseVideoProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">{name}</CardTitle>
            <Badge variant="secondary" className="capitalize">{difficulty}</Badge>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="capitalize">{category}</Badge>
            <Badge variant="outline" className="capitalize">{muscleGroup}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video">
            <iframe
              src={videoUrl}
              title={name}
              className="absolute inset-0 w-full h-full rounded-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExerciseVideo;
