
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Calendar, Award } from "lucide-react";
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type ChallengeType = {
  id: string;
  title: string;
  description: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'mindfulness' | 'nutrition';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  participants: number;
  duration: number; // in days
  xpReward: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  progress?: number; // 0-100
  isJoined?: boolean;
  xpCost?: number;
  created_by?: string | null;
  isCreatedByUser?: boolean;
};

type ChallengeCardProps = {
  challenge: ChallengeType;
  onJoin: (id: string) => void;
};

const getCategoryColor = (category: ChallengeType['category']) => {
  switch (category) {
    case 'strength':
      return 'bg-red-500';
    case 'cardio':
      return 'bg-blue-500';
    case 'flexibility':
      return 'bg-yellow-500';
    case 'mindfulness':
      return 'bg-green-500';
    case 'nutrition':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

const getDifficultyColor = (difficulty: ChallengeType['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500';
    case 'intermediate':
      return 'bg-yellow-500';
    case 'advanced':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onJoin }) => {
  const { userXp, user } = useUser();
  const { toast } = useToast();
  
  const handleJoin = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to join challenges.",
        variant: "destructive",
      });
      return;
    }
    
    if (challenge.xpCost && userXp < challenge.xpCost) {
      toast({
        title: "Not Enough XP!",
        description: `You need ${challenge.xpCost - userXp} more XP to join this challenge.`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First attempt to join the challenge
      const { error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          progress: 0
        });
      
      if (error) {
        console.error("Error joining challenge:", error);
        toast({
          title: "Error",
          description: `Failed to join challenge: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      // If successful, invoke the callback
      onJoin(challenge.id);
      
      toast({
        title: "Challenge Joined!",
        description: `You've successfully joined the ${challenge.title} challenge.`,
      });
    } catch (error) {
      console.error("Error in handleJoin:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Calculate days remaining
  const today = new Date();
  const endDate = new Date(challenge.endDate);
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <Card className="w-full h-full hover:shadow-lg transition-all duration-300">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="font-bold text-lg">{challenge.title}</h3>
            <div className="flex space-x-2 mt-1">
              <Badge className={`${getCategoryColor(challenge.category)}`}>
                {challenge.category}
              </Badge>
              <Badge className={`${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </Badge>
              {challenge.isCreatedByUser && (
                <Badge variant="outline" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                  Created by you
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
            <span className="font-bold text-sm">{challenge.xpReward} XP</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
        
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-gray-500" />
              <span>{challenge.participants} participants</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              <span>{challenge.duration} days</span>
            </div>
          </div>
          
          {challenge.isJoined && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Your progress</span>
                <span>{challenge.progress}%</span>
              </div>
              <Progress value={challenge.progress} className="h-2" />
            </div>
          )}
          
          {daysRemaining > 0 && challenge.isActive && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-md text-xs text-center">
              <span className="font-medium">{daysRemaining} days remaining</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {challenge.isJoined ? (
          <Button variant="outline" className="w-full">
            <Award className="mr-2 h-4 w-4" />
            View Details
          </Button>
        ) : challenge.isCreatedByUser ? (
          <Button variant="outline" className="w-full" disabled>
            <Award className="mr-2 h-4 w-4" />
            Your Challenge
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleJoin} 
            disabled={!challenge.isActive || (challenge.xpCost !== undefined && userXp < challenge.xpCost)}
          >
            {challenge.xpCost !== undefined && userXp < challenge.xpCost 
              ? 'Not enough XP' 
              : challenge.xpCost 
                ? `Join Challenge (${challenge.xpCost} XP)` 
                : 'Join Challenge'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
