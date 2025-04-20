
import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ProfileStats from './ProfileStats';
import { motion } from 'framer-motion';
import { Star, Award, Sparkles, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const UserProfile = () => {
  const { user, userLevel, userXp, streak } = useUser();
  const [animated, setAnimated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : '';

  const staggerChildren = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: { 
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" 
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={staggerChildren}
      className="bg-gradient-to-br from-fitPurple-500 to-fitPurple-700 dark:from-fitDark-900 dark:to-fitDark-800 rounded-xl shadow-lg overflow-hidden mb-8"
    >
      <div className="h-40 bg-[url('/placeholder.svg')] bg-cover bg-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-fitPurple-600/50 to-fitPurple-800/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-fitPurple-300/20"
          />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 2, delay: 0.3, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -left-20 bottom-0 w-60 h-60 rounded-full bg-fitPurple-200/20"
          />
        </div>
      </div>
      
      <div className="px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 relative z-10">
          <motion.div 
            variants={fadeIn}
            className="flex flex-col sm:flex-row sm:items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Avatar className="w-28 h-28 border-4 border-white dark:border-fitDark-800 shadow-xl">
                {user?.email && (
                  <AvatarFallback className="bg-gradient-to-br from-fitPurple-100 to-fitPurple-300 dark:from-fitPurple-800 dark:to-fitPurple-600 text-fitPurple-600 dark:text-fitPurple-100 text-3xl">
                    {user.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </motion.div>
            
            <div className="mt-4 sm:mt-0 sm:ml-6">
              <motion.div variants={fadeIn} className="flex items-center gap-3">
                <motion.h1
                  className="text-2xl md:text-3xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {user?.email?.split('@')[0]}
                </motion.h1>
                
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white backdrop-blur-sm px-3 py-1 text-sm">
                    <Sparkles className="w-4 h-4 mr-1" /> Level {userLevel}
                  </Badge>
                </motion.div>
              </motion.div>
              
              <motion.div
                variants={fadeIn}
                className="flex flex-wrap gap-2 mt-2"
              >
                <Badge className="bg-white/20 text-white backdrop-blur-sm">
                  <Star className="w-3 h-3 mr-1 text-yellow-300" /> {streak} Day Streak
                </Badge>
                
                <Badge className="bg-white/20 text-white backdrop-blur-sm">
                  <Award className="w-3 h-3 mr-1 text-cyan-300" /> Joined {joinDate}
                </Badge>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        variants={fadeIn}
        className="px-4 sm:px-6 pb-6"
      >
        <ProfileStats 
          userLevel={userLevel}
          userXp={userXp}
          streak={streak}
          workoutsCompleted={20}
        />
        
        <motion.div 
          animate={pulseAnimation}
          className="mt-6"
        >
          <Button 
            onClick={() => navigate('/challenges')}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            <Trophy className="mr-2 h-5 w-5 text-yellow-300" />
            View My Challenges
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;
