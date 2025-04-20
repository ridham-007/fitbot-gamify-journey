
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Search, Filter, Award } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import CreateChallengeDialog from '@/components/challenges/CreateChallengeDialog';
import ChallengeLeaderboardDialog from '@/components/challenges/ChallengeLeaderboardDialog';
import { ChallengeType } from '@/types/challenge';

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
    
    return challenges.map((challenge: any) => {
      const userChallenge = userChallenges.find((uc: any) => uc.challenge_id === challenge.id);
      
      // Random participants count for UI purposes
      const participants = Math.floor(Math.random() * 200) + 10;
      
      const now = new Date();
      const startDate = new Date(challenge.start_date);
      const endDate = new Date(challenge.end_date);
      
      return {
        ...challenge,
        isJoined: !!userChallenge,
        progress: userChallenge?.progress || 0,
        participants,
        xpCost: challenge.join_price_xp,
        userChallengeId: userChallenge?.id,
        isCreatedByUser: challenge.created_by === user?.id,
        isActive: now >= startDate && now <= endDate
      };
    });
  }, [challenges, userChallenges, user]);
  
  const filteredChallenges = React.useMemo(() => {
    if (!processedChallenges) return [];
    
    return processedChallenges.filter((challenge: ChallengeType) => {
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
                      <div className="h-8 bg-gray-200 dark:bg-fitDark-600 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges.map((challenge: any) => (
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
                        
                        {challenge.isCreatedByUser && (
                          <Badge variant="outline" className="mb-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                            Created by you
                          </Badge>
                        )}
                        
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
                              disabled={userXp < challenge.xpCost}
                            >
                              {userXp < challenge.xpCost ? 'Not enough XP' : `Join Challenge (${challenge.xpCost} XP)`}
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
                    .map((challenge: any) => (
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
                          
                          {challenge.isCreatedByUser && (
                            <Badge variant="outline" className="mb-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                              Created by you
                            </Badge>
                          )}
                          
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
                          </div>
                          
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
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Joined Challenges</h3>
                  <p className="text-muted-foreground mb-6">You haven't joined any challenges yet</p>
                  <Button onClick={() => setFilter('all')}>Browse Challenges</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active" className="mt-0">
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
              ) : (() => {
                const activeChallenges = filteredChallenges.filter(c => c.isActive && !c.isJoined);
                
                return activeChallenges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeChallenges.map((challenge: any) => (
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
                          
                          {challenge.isCreatedByUser && (
                            <Badge variant="outline" className="mb-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                              Created by you
                            </Badge>
                          )}
                          
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
                              <span className="text-muted-foreground">End Date</span>
                              <span className="font-medium">{new Date(challenge.end_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Participants</span>
                              <span className="font-medium">{challenge.participants}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Join fee: <span className="font-medium text-red-500">{challenge.xpCost} XP</span>
                            </p>
                            <Button 
                              onClick={() => handleJoinChallenge(challenge.id, challenge.xpCost)}
                              className="w-full"
                              disabled={userXp < challenge.xpCost}
                            >
                              {userXp < challenge.xpCost ? 'Not enough XP' : `Join Challenge (${challenge.xpCost} XP)`}
                            </Button>
                            <ChallengeLeaderboardDialog challengeId={challenge.id} title={challenge.title} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Active Challenges</h3>
                    <p className="text-muted-foreground mb-6">There are no active challenges at the moment</p>
                    <Button onClick={() => setFilter('all')}>Browse All Challenges</Button>
                  </div>
                );
              })()}
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-0">
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
              ) : (() => {
                const now = new Date();
                const upcomingChallenges = filteredChallenges.filter(c => {
                  const startDate = new Date(c.start_date);
                  return now < startDate;
                });
                
                return upcomingChallenges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingChallenges.map((challenge: any) => (
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
                          
                          {challenge.isCreatedByUser && (
                            <Badge variant="outline" className="mb-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                              Created by you
                            </Badge>
                          )}
                          
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
                              <span className="text-muted-foreground">Starts</span>
                              <span className="font-medium">{new Date(challenge.start_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Participants</span>
                              <span className="font-medium">{challenge.participants}</span>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <span className="font-medium">Coming soon!</span> This challenge will start in {Math.ceil((new Date(challenge.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Registration fee: <span className="font-medium text-red-500">{challenge.xpCost} XP</span>
                            </p>
                            <Button 
                              onClick={() => handleJoinChallenge(challenge.id, challenge.xpCost)}
                              className="w-full"
                              disabled={userXp < challenge.xpCost}
                            >
                              {userXp < challenge.xpCost ? 'Not enough XP' : `Register (${challenge.xpCost} XP)`}
                            </Button>
                            <ChallengeLeaderboardDialog challengeId={challenge.id} title={challenge.title} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Upcoming Challenges</h3>
                    <p className="text-muted-foreground mb-6">There are no upcoming challenges at the moment</p>
                    <Button onClick={() => setFilter('all')}>Browse All Challenges</Button>
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Challenges;
