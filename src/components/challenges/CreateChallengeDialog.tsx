
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface CreateChallengeDialogProps {
  onCreateSuccess: () => void;
}

const CreateChallengeDialog = ({ onCreateSuccess }: CreateChallengeDialogProps) => {
  const { user, userXp } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [category, setCategory] = useState('cardio');
  const [duration, setDuration] = useState('7');
  const [xpReward, setXpReward] = useState('100');
  const [joinPrice, setJoinPrice] = useState('50');
  const [firstPlaceReward, setFirstPlaceReward] = useState('500');
  const [secondPlaceReward, setSecondPlaceReward] = useState('300');
  const [thirdPlaceReward, setThirdPlaceReward] = useState('200');
  const [isOpen, setIsOpen] = useState(false);
  
  const queryClient = useQueryClient();

  const createChallengeMutation = useMutation({
    mutationFn: async (newChallenge: {
      title: string;
      description: string;
      category: string;
      difficulty: string;
      xp_reward: number;
      duration: number;
      start_date: string;
      end_date: string;
      join_price_xp: number;
      first_place_reward: number;
      second_place_reward: number;
      third_place_reward: number;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log("Creating challenge with user ID:", user.id);
      
      const { data, error } = await supabase
        .from('challenges')
        .insert([{
          ...newChallenge,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Challenge creation error:', error);
        throw error;
      }
      
      if (data) {
        const { error: joinError } = await supabase
          .from('user_challenges')
          .insert({
            user_id: user.id,
            challenge_id: data.id,
            progress: 0
          });
        
        if (joinError) {
          console.error('Error auto-joining challenge:', joinError);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      
      toast({
        title: "Challenge Created!",
        description: "Your challenge has been created successfully and you're automatically joined.",
      });
      
      setIsOpen(false);
      onCreateSuccess();
      
      setTitle('');
      setDescription('');
      setDifficulty('beginner');
      setCategory('cardio');
      setDuration('7');
      setXpReward('100');
      setJoinPrice('50');
      setFirstPlaceReward('500');
      setSecondPlaceReward('300');
      setThirdPlaceReward('200');
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Challenge",
        description: error.message || "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a challenge.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const now = new Date();
      const durationDays = parseInt(duration);
      const endDate = new Date(now);
      endDate.setDate(now.getDate() + durationDays);
      
      const newChallenge = {
        title,
        description,
        category,
        difficulty,
        xp_reward: parseInt(xpReward),
        duration: durationDays,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        join_price_xp: parseInt(joinPrice),
        first_place_reward: parseInt(firstPlaceReward),
        second_place_reward: parseInt(secondPlaceReward),
        third_place_reward: parseInt(thirdPlaceReward)
      };
      
      createChallengeMutation.mutate(newChallenge);
    } catch (error: any) {
      toast({
        title: "Error Creating Challenge",
        description: error.message || "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 badge-glow">
          <Plus className="h-4 w-4" />
          Create Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Create New Challenge
          </DialogTitle>
          <DialogDescription>
            Create a custom challenge for the community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Challenge Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 7-Day Cardio Boost"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your challenge..."
              className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">Duration (days)</label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="90"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="joinPrice" className="text-sm font-medium">Join Price (XP)</label>
              <Input
                id="joinPrice"
                type="number"
                min="0"
                value={joinPrice}
                onChange={(e) => setJoinPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Winner Rewards (XP)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstPlace" className="text-sm text-muted-foreground">1st Place</label>
                <Input
                  id="firstPlace"
                  type="number"
                  min="0"
                  value={firstPlaceReward}
                  onChange={(e) => setFirstPlaceReward(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="secondPlace" className="text-sm text-muted-foreground">2nd Place</label>
                <Input
                  id="secondPlace"
                  type="number"
                  min="0"
                  value={secondPlaceReward}
                  onChange={(e) => setSecondPlaceReward(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="thirdPlace" className="text-sm text-muted-foreground">3rd Place</label>
                <Input
                  id="thirdPlace"
                  type="number"
                  min="0"
                  value={thirdPlaceReward}
                  onChange={(e) => setThirdPlaceReward(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Creating...' : 'Create Challenge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChallengeDialog;
