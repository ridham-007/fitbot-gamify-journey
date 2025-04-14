
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserContextType = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  userLevel: number;
  userXp: number;
  addXp: (amount: number) => void;
  streak: number;
  updateStreak: (value: number) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userXp, setUserXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    // Check if user is already logged in
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
    
    // Load user stats from localStorage if they exist
    const savedLevel = localStorage.getItem('userLevel');
    const savedXp = localStorage.getItem('userXp');
    const savedStreak = localStorage.getItem('streak');
    
    if (savedLevel) setUserLevel(parseInt(savedLevel));
    if (savedXp) setUserXp(parseInt(savedXp));
    if (savedStreak) setStreak(parseInt(savedStreak));
  }, []);

  // Save user stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userLevel', userLevel.toString());
    localStorage.setItem('userXp', userXp.toString());
    localStorage.setItem('streak', streak.toString());
  }, [userLevel, userXp, streak]);

  const login = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  // Function to add XP and level up if necessary
  const addXp = (amount: number) => {
    const xpToNextLevel = userLevel * 500; // Simple formula: level * 500 XP needed for next level
    const newXp = userXp + amount;
    
    if (newXp >= xpToNextLevel) {
      // Level up
      setUserLevel(prev => prev + 1);
      setUserXp(newXp - xpToNextLevel);
    } else {
      setUserXp(newXp);
    }
  };

  const updateStreak = (value: number) => {
    setStreak(value);
  };

  const value = {
    isLoggedIn,
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
