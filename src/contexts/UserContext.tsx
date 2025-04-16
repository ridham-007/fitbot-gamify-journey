
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

type UserContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  userLevel: number;
  userXp: number;
  addXp: (amount: number) => void;
  streak: number;
  updateStreak: (value: number) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userXp, setUserXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user stats when user changes
  useEffect(() => {
    if (user) {
      supabase
        .from('user_stats')
        .select('level, xp, streak')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setUserLevel(data.level);
            setUserXp(data.xp);
            setStreak(data.streak);
          }
        });
    }
  }, [user]);

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
    setIsLoggedIn(false);
    setUser(null);
  };

  const addXp = async (amount: number) => {
    if (!user) return;
    
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
    } else {
      setUserXp(newXp);
      // Update in database
      await supabase
        .from('user_stats')
        .update({ xp: newXp })
        .eq('user_id', user.id);
    }
  };

  const updateStreak = async (value: number) => {
    if (!user) return;
    setStreak(value);
    await supabase
      .from('user_stats')
      .update({ streak: value })
      .eq('user_id', user.id);
  };

  const value = {
    isLoggedIn,
    user,
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
