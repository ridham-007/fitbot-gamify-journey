
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Crown, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ChallengeLeaderboardDialogProps {
  challengeId: string;
  title: string;
}

const ChallengeLeaderboardDialog = ({ challengeId, title }: ChallengeLeaderboardDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['challengeLeaderboard', challengeId, isOpen],
    queryFn: async () => {
      console.log("Fetching leaderboard data for challenge:", challengeId);
      
      // First, fetch user_challenges data
      const { data: userChallenges, error: userChallengesError } = await supabase
        .from('user_challenges')
        .select('id, user_id, progress')
        .eq('challenge_id', challengeId)
        .order('progress', { ascending: false })
        .limit(20);
      
      if (userChallengesError) {
        console.error("Error fetching user challenges:", userChallengesError);
        throw userChallengesError;
      }
      
      // For each user challenge, fetch the profile info
      const userChallengesWithProfiles = await Promise.all(
        userChallenges.map(async (uc) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', uc.user_id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile for user:", uc.user_id, profileError);
            return {
              ...uc,
              username: `User ${uc.user_id.slice(0, 4)}`,
              avatar_url: null
            };
          }
          
          return {
            ...uc,
            username: profileData?.username || `User ${uc.user_id.slice(0, 4)}`,
            avatar_url: profileData?.avatar_url
          };
        })
      );
      
      console.log("Leaderboard data:", userChallengesWithProfiles);
      
      // Assign ranks based on ordered data
      return userChallengesWithProfiles.map((item, index) => ({
        ...item,
        rank: index + 1,
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

export default ChallengeLeaderboardDialog;
