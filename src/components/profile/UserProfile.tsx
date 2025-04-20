
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ProfileStats from './ProfileStats';

const UserProfile = () => {
  const { user, userLevel, userXp, streak } = useUser();
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : '';

  return (
    <div className="bg-gradient-to-br from-fitPurple-500 to-fitPurple-700 dark:from-fitDark-900 dark:to-fitDark-800 rounded-xl shadow-lg overflow-hidden mb-8 animate-fade-in">
      <div className="h-32 bg-[url('/placeholder.svg')] bg-cover bg-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-fitPurple-600/50 to-fitPurple-800/50 backdrop-blur-sm"></div>
      </div>
      <div className="px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center animate-slide-up">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-fitDark-800 shadow-xl transform hover:scale-105 transition-transform duration-300">
              <AvatarFallback className="bg-fitPurple-100 dark:bg-fitPurple-900 text-fitPurple-600 dark:text-fitPurple-400 text-2xl">
                {user?.email?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 sm:mt-0 sm:ml-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  {user?.email?.split('@')[0]}
                </h1>
                <Badge className="bg-white/20 text-white backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  Level {userLevel}
                </Badge>
              </div>
              <p className="text-fitPurple-100 mt-1 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                Joined on {joinDate}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 pb-6">
        <ProfileStats 
          userLevel={userLevel}
          userXp={userXp}
          streak={streak}
          workoutsCompleted={20}
        />
      </div>
    </div>
  );
};

export default UserProfile;
