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

// Define the Challenge type
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
  created_by: string;
  created_at?: string;
  isJoined?: boolean;
  progress?: number;
  participants?: number;
  xpCost?: number;
  userChallengeId?: string;
}

// Define the UserChallenge type
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
  const [xpCost, setXpCost] = useState(100); // Fixed cost to create a challenge
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const createChallengeMutation = useMutation({
    mutationFn: async (newChallenge: Partial<Challenge>) => {
      if (!user) throw new Error('User not authenticated');
      
      await supabase.rpc('deduct_user_xp', {
        user_id_param: user.id,
        xp_amount: xpCost
      });

      const { data, error } = await supabase
        .from('challenges')
        .insert([newChallenge])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      
      toast({
        title: "Challenge Created!",
        description: `Your challenge has been created and ${xpCost} XP has been deducted.`,
      });
      
      setIsOpen(false);
      onCreateSuccess();
      
      setTitle('');
      setDescription('');
      setDifficulty('beginner');
      setCategory('cardio');
      setDuration('7');
      setXpReward('100');
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
    
    if (userXp < xpCost) {
      toast({
        title: "Insufficient XP",
        description: `You need ${xpCost} XP to create a challenge. You currently have ${userXp} XP.`,
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
        created_by: user.id
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
            Create a custom challenge for the community. Cost: {xpCost} XP
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
              <label htmlFor="xpReward" className="text-sm font-medium">XP Reward</label>
              <Input
                id="xpReward"
                type="number"
                min="50"
                max="1000"
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Your XP Balance: <span className="font-semibold">{userXp} XP</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Cost: <span className="font-semibold text-red-500">-{xpCost} XP</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting || userXp < xpCost}
              className="w-full"
            >
              {isSubmitting ? 'Creating...' : `Create Challenge (${xpCost} XP)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ChallengeLeaderboardDialog = ({ challengeId, title }: { challengeId: string, title: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['challengeLeaderboard', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('id, user_id, progress, user:user_id(id, profiles:profiles(username))')
        .eq('challenge_id', challengeId)
        .order('progress', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map((item: any) => ({
        user_id: item.user_id,
        progress: item.progress,
        username: item.user?.profiles?.username || `User ${item.user_id.substr(0, 4)}`
      }));
    },
    enabled: isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2">
          <Crown className="h-4 w-4 mr-2 text-yellow-500" />
          View Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {leaderboardData.map((entry: any, index: number) => (
                <div 
                  key={entry.user_id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md",
                    index === 0 ? "bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700" :
                    index === 1 ? "bg-gray-100 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700" :
                    index === 2 ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800" :
                    "bg-white dark:bg-fitDark-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs",
                      index === 0 ? "bg-yellow-500 text-white" :
                      index === 1 ? "bg-gray-400 text-white" :
                      index === 2 ? "bg-amber-600 text-white" :
                      "bg-fitDark-100 dark:bg-fitDark-700 text-fitDark-700 dark:text-fitDark-300"
                    )}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{entry.username || `User ${entry.user_id.substr(0, 4)}`}</span>
                    {index < 3 && (
                      <Badge variant={index === 0 ? "default" : "outline"} className="ml-2 animate-pulse">
                        {index === 0 ? "Leader" : index === 1 ? "Runner-up" : "Bronze"}
                      </Badge>
                    )}
                  </div>
                  <div className="font-semibold">{entry.progress}%</div>
                </div>
              ))}
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
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });
      
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
      
      const xpCost = Math.floor(challenge.xp_reward * 0.2);
      
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
                      <div className="h-8 bg-gray-200 dark:bg-fitDark-600 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges.map((challenge: Challenge) => (
                    <div key={challenge.id} className="bg-white dark:bg-fitDark-800 border border-gray-200 dark:border-fitDark-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold line-clamp-1">{challenge.title}</h3>
                          <Badge variant={
                            challenge.difficulty === 'beginner' ? 'outline' :
                            challenge.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                          }>
                            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {challenge.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium">{challenge.duration} days</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Reward</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{challenge.xp_reward} XP</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Start Date</span>
                            <span className="font-medium">{new Date(challenge.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Participants</span>
                            <span className="font-medium">{challenge.participants}</span>
                          </div>
                        </div>
                        
                        {challenge.isJoined ? (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">{challenge.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 dark:bg-fitDark-700 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    challenge.progress < 30 ? "bg-blue-500" :
                                    challenge.progress < 70 ? "bg-yellow-500" : "bg-green-500"
                                  )}
                                  style={{ width: `${challenge.progress}%` }}
                                />
                              </div>
                            </div>
                            {challenge.progress < 100 ? (
                              <Button 
                                onClick={() => challenge.userChallengeId && handleUpdateProgress(challenge.userChallengeId, challenge.progress)}
                                className="w-full"
                              >
                                Update Progress (+10%)
                              </Button>
                            ) : (
                              <Button className="w-full" variant="outline" disabled>
                                <Award className="h-4 w-4 mr-2" />
                                Challenge Completed
                              </Button>
                            )}
                            <ChallengeLeaderboardDialog challengeId={challenge.id} title={challenge.title} />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Join fee: <span className="font-medium text-red-500">{challenge.xpCost} XP</span>
                            </p>
                            <Button 
                              onClick={() => handleJoinChallenge(challenge.id, challenge.xpCost)}
                              className="w-full"
                            >
                              Join Challenge ({challenge.xpCost} XP)
                            </Button>
                            <ChallengeLeaderboardDialog challengeId={challenge.id} title={challenge.title} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Challenges Found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters or create a new challenge</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="joined" className="mt-0">
              {isLoadingChallenges || isLoadingUserChallenges ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 dark:bg-fitDark-700/20 p-6 rounded-lg animate-pulse">
                      <div className="h-6 w-2/3 bg-gray-200 dark:bg-fitDark-600 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 dark:bg-fitDark-600 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-fitDark-600 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredChallenges.filter(c => c.isJoined).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges
                    .filter(c => c.isJoined)
                    .map(challenge => (
                      <div key={challenge.id} className="bg-white dark:bg-fitDark-800 border border-gray-200 dark:border-fitDark-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold line-clamp-1">{challenge.title}</h3>
                            <Badge variant={
                              challenge.difficulty === 'beginner' ? 'outline' :
                              challenge.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                            }>
                              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {challenge.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Duration</span>
                              <span className="font-medium">{challenge.duration} days</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Reward</span>
                              <span className="font-medium text-green-600 dark:text-green-400">{challenge.xp_reward} XP</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Start Date</span>
                              <span className="font-medium">{new Date(challenge.start_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Participants</span>
                              <span className="font-medium">{challenge.participants}</span>
                            </div>
                          </div>
                          
                          {challenge.isJoined ? (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span className="font-medium">{challenge.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-fitDark-700 rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full transition-all",
                                      challenge.progress < 30 ? "bg-blue-500" :
                                      challenge.progress < 70 ? "bg-yellow-500" : "bg-green-500"
                                    )}
                                    style={{ width: `${challenge.progress}%` }}
                                  />
                                </div>
                              </div>
                              {challenge.progress < 100 ? (
                                <Button 
                                  onClick={() => challenge.userChallengeId && handleUpdateProgress(challenge.userChallengeId, challenge.progress)}
                                  className="w-full"
                                >
                                  Update Progress (+10%)
                                </Button>
                              ) : (
                                <Button className="w-full" variant="outline" disabled>
                                  <Award className="h-4 w-4 mr-2" />
                                  Challenge Completed
                                </Button>
                              )}
                              <ChallengeLeaderboardDialog challengeId={challenge.id} title={challenge.title} />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Join fee: <span className="font-medium text-red-500">{challenge.xpCost} XP</span>
                              </p>
                              <Button 
                                onClick={() => handleJoinChallenge(challenge.id, challenge.xpCost)}
                                className="w-full"
                              >
                                Join Challenge ({challenge.xpCost} XP)
                              </Button>
                              <ChallengeLeaderboardDialog challengeId={challenge.id} title={challenge.title} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Challenges Found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters or create a new challenge</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Challenges;
