import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Search, Filter, Plus, Award, Crown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  start_date: string;
  end_date: string;
  xp_reward: number;
  join_price_xp: number;
  first_place_reward?: number;
  second_place_reward?: number;
  third_place_reward?: number;
  created_by: string | null;
  isJoined?: boolean;
  progress?: number;
  participants?: number;
  xpCost?: number;
  userChallengeId?: string;
  rank?: number;
  reward_claimed?: boolean;
}

interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  joined_at: string;
  completed_at: string | null;
  challenge: Challenge;
}

const CreateChallengeDialog = ({ onCreateSuccess }: { onCreateSuccess: () => void }) => {
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

const ChallengeLeaderboardDialog = ({ challengeId, title }: { challengeId: string, title: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['challengeLeaderboard', challengeId, isOpen],
    queryFn: async () => {
      console.log("Fetching leaderboard data for challenge:", challengeId);
      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          id, 
          user_id, 
          progress, 
          profiles:user_id(id, username, avatar_url)
        `)
        .eq('challenge_id', challengeId)
        .order('progress', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error("Error fetching leaderboard:", error);
        throw error;
      }
      
      console.log("Leaderboard data:", data);
      
      // Assign ranks based on ordered data
      return data.map((item, index) => ({
        ...item,
        rank: index + 1,
        username: item.profiles?.username || `User ${item.user_id.slice(0, 4)}`,
        isCurrentUser: item.user_id === user?.id
      }));
    },
    enabled: isOpen,
    refetchOnWindowFocus: false
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2">
          <Crown className="h-4 w-4 mr-2 text-yellow-500" />
          View Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {title} Leaderboard
          </DialogTitle>
          <DialogDescription>
            Top performers in this challenge
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : leaderboardData && leaderboardData.length > 0 ? (
            <div className="space-y-4">
              {/* Podium for top 3 */}
              <div className="flex justify-around items-end h-40 mb-6">
                {/* 2nd place */}
                {leaderboardData.length > 1 && (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <Avatar className="h-16 w-16 border-2 border-gray-300">
                        <AvatarFallback className="bg-gray-200 text-gray-700">
                          {leaderboardData[1].username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 h-24 w-20 flex flex-col items-center justify-end p-2 rounded-t-md">
                      <span className="font-semibold text-xs truncate w-full text-center">{leaderboardData[1].username}</span>
                      <span className="font-bold">{leaderboardData[1].progress}%</span>
                    </div>
                  </div>
                )}
                
                {/* 1st place */}
                {leaderboardData.length > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <Avatar className="h-20 w-20 border-2 border-yellow-400">
                        <AvatarFallback className="bg-yellow-100 text-yellow-700">
                          {leaderboardData[0].username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 h-32 w-24 flex flex-col items-center justify-end p-2 rounded-t-md shadow-md">
                      <Trophy className="h-6 w-6 text-yellow-500 mb-1" />
                      <span className="font-semibold text-sm truncate w-full text-center">{leaderboardData[0].username}</span>
                      <span className="font-bold text-lg">{leaderboardData[0].progress}%</span>
                    </div>
                  </div>
                )}
                
                {/* 3rd place */}
                {leaderboardData.length > 2 && (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <Avatar className="h-14 w-14 border-2 border-amber-300">
                        <AvatarFallback className="bg-amber-50 text-amber-700">
                          {leaderboardData[2].username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/10 h-16 w-20 flex flex-col items-center justify-end p-2 rounded-t-md">
                      <span className="font-semibold text-xs truncate w-full text-center">{leaderboardData[2].username}</span>
                      <span className="font-bold">{leaderboardData[2].progress}%</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Full leaderboard table */}
              <div className="max-h-[300px] overflow-y-auto pr-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead className="text-right">Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.map((entry) => (
                      <TableRow 
                        key={entry.user_id} 
                        className={cn(
                          entry.isCurrentUser && "bg-blue-50 dark:bg-blue-900/20",
                          entry.rank === 1 && "bg-yellow-50 dark:bg-yellow-900/20",
                          entry.rank === 2 && "bg-gray-50 dark:bg-gray-800/40",
                          entry.rank === 3 && "bg-amber-50 dark:bg-amber-900/10"
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                            entry.rank === 1 ? "bg-yellow-500 text-white" :
                            entry.rank === 2 ? "bg-gray-400 text-white" :
                            entry.rank === 3 ? "bg-amber-600 text-white" :
                            "bg-fitDark-100 dark:bg-fitDark-700 text-fitDark-700 dark:text-fitDark-300"
                          )}>
                            {entry.rank}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className={cn(
                                entry.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                                entry.rank === 2 ? "bg-gray-100 text-gray-800" :
                                entry.rank === 3 ? "bg-amber-100 text-amber-800" :
                                "bg-blue-100 text-blue-800"
                              )}>
                                {entry.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className={cn(
                              "font-medium", 
                              entry.isCurrentUser && "font-bold"
                            )}>
                              {entry.username}
                              {entry.isCurrentUser && (
                                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {entry.progress}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-10 w-10 text-muted-foreground opacity-40 mb-2" />
              <p className="text-muted-foreground">No participants yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Challenges = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, userXp } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();
  
  const { data: challenges, isLoading: isLoadingChallenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      console.log("Fetching all challenges");
      const { data, error } = await supabase
        .from('challenges')
        .select('*');
      
      if (error) {
        console.error("Error loading challenges:", error);
        throw error;
      }
      
      console.log("Loaded challenges:", data);
      return data || [];
    }
  });
  
  const { data: userChallenges, isLoading: isLoadingUserChallenges } = useQuery({
    queryKey: ['userChallenges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching user challenges for user:", user.id);
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*, challenge:challenge_id(*)')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error loading user challenges:", error);
        throw error;
      }
      
      console.log("Loaded user challenges:", data);
      return data || [];
    },
    enabled: !!user
  });
  
  const joinChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, xpCost }: { challengeId: string, xpCost: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error: deductError } = await supabase.rpc('deduct_user_xp', {
        user_id_param: user.id,
        xp_amount: xpCost
      });
      
      if (deductError) throw deductError;
      
      const { data, error } = await supabase
        .from('user_challenges')
        .insert([
          { challenge_id: challengeId, user_id: user.id, progress: 0 }
        ])
        .select('*, challenge:challenge_id(*)')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      
      toast({
        title: "Challenge Joined!",
        description: `You've joined the "${data.challenge.title}" challenge.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Joining Challenge",
        description: error.message || "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const updateProgressMutation = useMutation({
    mutationFn: async ({ userChallengeId, progress }: { userChallengeId: string, progress: number }) => {
      const { data, error } = await supabase
        .from('user_challenges')
        .update({ progress })
        .eq('id', userChallengeId)
        .select('*, challenge:challenge_id(*)')
        .single();
      
      if (error) throw error;
      
      if (progress === 100 && !data.completed_at) {
        await supabase
          .from('user_challenges')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', userChallengeId);
        
        await supabase.rpc('add_user_xp', {
          user_id_param: user?.id,
          xp_amount: data.challenge.xp_reward
        });
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      
      if (variables.progress === 100 && data.challenge) {
        queryClient.invalidateQueries({ queryKey: ['userStats'] });
        
        toast({
          title: "Challenge Completed! 🎉",
          description: `Congratulations! You earned ${data.challenge.xp_reward} XP for completing "${data.challenge.title}"`,
        });
      } else {
        toast({
          title: "Progress Updated",
          description: `Your challenge progress has been updated to ${variables.progress}%`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Progress",
        description: error.message || "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleJoinChallenge = (challengeId: string, xpCost: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to join challenges.",
        variant: "destructive",
      });
      return;
    }
    
    joinChallengeMutation.mutate({ challengeId, xpCost });
  };
  
  const handleUpdateProgress = (userChallengeId: string, currentProgress: number) => {
    let newProgress = currentProgress + 10;
    if (newProgress > 100) newProgress = 100;
    
    updateProgressMutation.mutate({ userChallengeId, progress: newProgress });
  };
  
  const processedChallenges = React.useMemo(() => {
    if (!challenges || !userChallenges) return [];
    
    return challenges.map((challenge: Challenge) => {
      const userChallenge = userChallenges.find((uc: UserChallenge) => uc.challenge_id === challenge.id);
      
      const participants = Math.floor(Math.random() * 200) + 10;
      
      const xpCost = challenge.join_price_xp;
      
      return {
        ...challenge,
        isJoined: !!userChallenge,
        progress: userChallenge?.progress || 0,
        participants,
        xpCost,
        userChallengeId: userChallenge?.id
      };
    });
  }, [challenges, userChallenges]);
  
  const filteredChallenges = React.useMemo(() => {
    if (!processedChallenges) return [];
    
    return processedChallenges.filter((challenge: Challenge) => {
      const matchesSearch = 
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filter === 'all') return matchesSearch;
      if (filter === 'joined') return matchesSearch && challenge.isJoined;
      if (filter === 'active') {
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);
        return matchesSearch && now >= startDate && now <= endDate && !challenge.isJoined;
      }
      if (filter === 'upcoming') {
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        return matchesSearch && now < startDate;
      }
      
      return matchesSearch;
    });
  }, [processedChallenges, searchQuery, filter]);
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/challenges' } });
    }
  }, [isLoggedIn, navigate]);
  
  const handleRefreshChallenges = () => {
    console.log("Refreshing challenges data");
    queryClient.invalidateQueries({ queryKey: ['challenges'] });
    queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
  };

  return (
    <MainLayout isLoggedIn={true}>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Trophy className="h-8 w-8 mr-2 text-yellow-500" />
              Challenges
            </h1>
            <p className="text-muted-foreground mt-1">Join challenges to boost your fitness journey and earn rewards</p>
          </div>
          <div className="flex gap-2">
            <CreateChallengeDialog onCreateSuccess={handleRefreshChallenges} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-fitDark-800 rounded-lg shadow-sm p-6 mb-8">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <TabsList className="mb-4 sm:mb-0">
                <TabsTrigger value="all" onClick={() => setFilter('all')}>All Challenges</TabsTrigger>
                <TabsTrigger value="joined" onClick={() => setFilter('joined')}>My Challenges</TabsTrigger>
                <TabsTrigger value="active" onClick={() => setFilter('active')}>Active</TabsTrigger>
                <TabsTrigger value="upcoming" onClick={() => setFilter('upcoming')}>Upcoming</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search challenges..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select onValueChange={(value) => setFilter(value)} defaultValue="all">
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="joined">Joined</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {isLoadingChallenges || isLoadingUserChallenges ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-gray-50 dark:bg-fitDark-700/20 p-6 rounded-lg animate-pulse">
                      <div className="h-6 w-2/3 bg-gray-200 dark:bg-fitDark-600 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 dark:bg-fitDark-600 rounded mb-4"></div>
                      <div className="h
