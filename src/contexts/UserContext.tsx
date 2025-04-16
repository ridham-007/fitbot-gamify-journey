
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

type UserContextType = {
  isLoggedIn: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  userLevel: number;
  userXp: number;
  addXp: (amount: number) => Promise<void>;
  streak: number;
  updateStreak: (value: number) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userXp, setUserXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session);
        
        // If user just signed in, fetch their stats
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            fetchUserStats(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      
      if (session?.user) {
        fetchUserStats(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserStats = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('level, xp, streak')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user stats:', error);
        return;
      }

      if (data) {
        setUserLevel(data.level || 1);
        setUserXp(data.xp || 0);
        setStreak(data.streak || 0);
      }
    } catch (error) {
      console.error('Error in fetchUserStats:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const addXp = async (amount: number) => {
    if (!user) return;
    
    try {
      const newXp = userXp + amount;
      const xpToNextLevel = userLevel * 500;
      
      if (newXp >= xpToNextLevel) {
        // Level up
        const newLevel = userLevel + 1;
        setUserLevel(newLevel);
        setUserXp(newXp - xpToNextLevel);
        
        // Update in database
        await supabase
          .from('user_stats')
          .update({
            level: newLevel,
            xp: newXp - xpToNextLevel,
          })
          .eq('user_id', user.id);
          
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${newLevel}!`,
        });
      } else {
        setUserXp(newXp);
        // Update in database
        await supabase
          .from('user_stats')
          .update({ xp: newXp })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const updateStreak = async (value: number) => {
    if (!user) return;
    
    try {
      setStreak(value);
      await supabase
        .from('user_stats')
        .update({ streak: value })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const value = {
    isLoggedIn,
    user,
    session,
    login,
    logout,
    userLevel,
    userXp,
    addXp,
    streak,
    updateStreak,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
