
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import MainLayout from '@/components/layout/MainLayout';
import ChallengeCard, { ChallengeType } from '@/components/challenges/ChallengeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Challenges = () => {
  const navigate = useNavigate();
  const { isLoggedIn, addXp } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  
  // Generate some mock challenges
  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Mock challenge data
    const today = new Date();
    const mockChallenges: ChallengeType[] = [
      {
        id: '1',
        title: '30-Day Strength Challenge',
        description: 'Build muscle and strength with this progressive challenge. Complete daily strength workouts for 30 days.',
        category: 'strength',
        difficulty: 'intermediate',
        participants: 248,
        duration: 30,
        xpReward: 500,
        startDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000),
        isActive: true,
        progress: 15,
        isJoined: true
      },
      {
        id: '2',
        title: 'Cardio Boost Week',
        description: 'Increase your endurance with 7 days of progressive cardio workouts. Get your heart pumping!',
        category: 'cardio',
        difficulty: 'beginner',
        participants: 157,
        duration: 7,
        xpReward: 200,
        startDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        id: '3',
        title: 'Mindfulness Marathon',
        description: 'Improve your mental wellbeing with 14 days of guided meditation and mindfulness exercises.',
        category: 'mindfulness',
        difficulty: 'beginner',
        participants: 95,
        duration: 14,
        xpReward: 300,
        startDate: today,
        endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        id: '4',
        title: 'Flexibility Focus',
        description: 'Improve your range of motion with this 21-day stretching and flexibility program.',
        category: 'flexibility',
        difficulty: 'intermediate',
        participants: 132,
        duration: 21,
        xpReward: 350,
        startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000),
        isActive: false
      },
      {
        id: '5',
        title: 'Clean Eating Challenge',
        description: 'Transform your diet with this 30-day nutrition plan. Learn to eat clean and feel great!',
        category: 'nutrition',
        difficulty: 'advanced',
        participants: 89,
        duration: 30,
        xpReward: 600,
        startDate: today,
        endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        id: '6',
        title: 'HIIT Challenge',
        description: 'High-intensity interval training for maximum results in minimum time. 14 days of intense workouts!',
        category: 'cardio',
        difficulty: 'advanced',
        participants: 77,
        duration: 14,
        xpReward: 400,
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        progress: 50,
        isJoined: true
      }
    ];
    
    setChallenges(mockChallenges);
  }, [isLoggedIn, navigate]);
  
  const handleJoinChallenge = (challengeId: string) => {
    setChallenges(prevChallenges => 
      prevChallenges.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, isJoined: true, progress: 0 } 
          : challenge
      )
    );
    
    // Award some XP for joining a challenge
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      addXp(50); // Award 50 XP for joining a challenge
      
      toast({
        title: "XP Awarded!",
        description: `You earned 50 XP for joining a new challenge!`,
      });
    }
  };
  
  // Filter challenges based on search and filter
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'joined') return matchesSearch && challenge.isJoined;
    if (filter === 'active') return matchesSearch && challenge.isActive && !challenge.isJoined;
    if (filter === 'upcoming') return matchesSearch && !challenge.isActive;
    
    return matchesSearch;
  });
  
  return (
    <MainLayout isLoggedIn={true}>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Trophy className="h-8 w-8 mr-2 text-yellow-500" />
              Challenges
            </h1>
            <p className="text-muted-foreground mt-1">Join challenges to boost your fitness journey and earn rewards</p>
          </div>
          <Button className="hidden sm:flex badge-glow">
            Create Challenge
          </Button>
        </div>
        
        <div className="bg-white dark:bg-fitDark-800 rounded-lg shadow-sm p-6 mb-8">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <TabsList className="mb-4 sm:mb-0">
                <TabsTrigger value="all">All Challenges</TabsTrigger>
                <TabsTrigger value="joined">My Challenges</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map(challenge => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge} 
                    onJoin={handleJoinChallenge} 
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="joined" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.filter(c => c.isJoined).length > 0 ? (
                  filteredChallenges
                    .filter(c => c.isJoined)
                    .map(challenge => (
                      <ChallengeCard 
                        key={challenge.id} 
                        challenge={challenge} 
                        onJoin={handleJoinChallenge} 
                      />
                    ))
                ) : (
                  <div className="col-span-3 py-16 text-center">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Challenges Joined Yet</h3>
                    <p className="text-muted-foreground mb-6">Join a challenge to track your progress and earn rewards</p>
                    <Button onClick={() => setFilter('active')}>
                      Browse Active Challenges
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges
                  .filter(c => c.isActive && !c.isJoined)
                  .map(challenge => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge} 
                      onJoin={handleJoinChallenge} 
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges
                  .filter(c => !c.isActive)
                  .map(challenge => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge} 
                      onJoin={handleJoinChallenge} 
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Challenges;
