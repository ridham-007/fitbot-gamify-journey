
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Send, Mic, Dumbbell, Info, User, Plus, ArrowRight, 
  Check, Heart, Clock, Play, Activity, Weight, BicepsFlexed,
  BarChart, Video, Minimize2, Maximize2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ExerciseVideo from '@/components/trainer/ExerciseVideo';
import WorkoutChart from '@/components/trainer/WorkoutChart';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ChatMessage from '@/components/trainer/ChatMessage';

type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
};

type Category = 'weightloss' | 'muscle-gain' | 'general-fitness' | 'flexibility';

type CategoryInfo = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const categories: Record<Category, CategoryInfo> = {
  'weightloss': {
    id: 'weightloss',
    title: 'Weight Loss',
    description: 'Personalized plans for healthy and sustainable weight loss',
    icon: <Weight className="h-5 w-5" />,
  },
  'muscle-gain': {
    id: 'muscle-gain',
    title: 'Muscle Gain',
    description: 'Build strength and muscle with expert guidance',
    icon: <BicepsFlexed className="h-5 w-5" />,
  },
  'general-fitness': {
    id: 'general-fitness',
    title: 'General Fitness',
    description: 'Improve overall health and fitness level',
    icon: <Activity className="h-5 w-5" />,
  },
  'flexibility': {
    id: 'flexibility',
    title: 'Flexibility',
    description: 'Enhance mobility and reduce muscle tension',
    icon: <Heart className="h-5 w-5" />,
  },
};

const defaultSuggestions = Object.values(categories).map(cat => ({
  id: cat.id,
  text: `Start ${cat.title} Journey`,
  icon: cat.icon,
  category: cat.id
}));

const Trainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [exerciseVideos, setExerciseVideos] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUserId(session.user.id);
      
      if (messages.length === 0) {
        setMessages([{
          id: '1',
          type: 'ai',
          content: "Hi! I'm your AI fitness coach. Let's start by choosing a fitness category that matches your goals. What would you like to focus on?",
          timestamp: new Date(),
        }]);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategorySelect = async (category: Category) => {
    setCurrentCategory(category);
    setSessionId(crypto.randomUUID());
    
    const welcomeMessage = {
      id: Date.now().toString(),
      type: 'ai' as const,
      content: `Great choice! Let's focus on ${categories[category].title}. I'll ask you a few questions to provide better guidance.`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, welcomeMessage]);
    await handleSend('', category, true);
  };

  const handleSend = async (userText: string = input, category: Category | null = currentCategory, isNewSession: boolean = false) => {
    if ((!userText.trim() && !isNewSession) || !userId) return;
    
    if (userText.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: userText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
    }
    
    setInput('');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai-chat', {
        body: { 
          message: userText || "Let's begin", 
          userId,
          category,
          isNewSession,
          sessionId
        }
      });
      
      if (error) throw error;
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.reply,
        timestamp: new Date(),
      };
      
      simulateTyping(aiMessage, () => {
        setIsLoading(false);
        if (data.suggestedVideos) {
          setExerciseVideos(data.suggestedVideos);
        }
      });
      
    } catch (error) {
      console.error('Error in chat process:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI trainer.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const simulateTyping = (message: Message, callback: () => void) => {
    const typingMessage: Message = {
      ...message,
      content: '',
      isTyping: true,
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    let i = 0;
    const fullContent = message.content;
    const typingSpeed = 10;
    const minDisplayTime = 800;
    
    const startTime = Date.now();
    
    const typeChar = () => {
      if (i < fullContent.length) {
        setMessages(prev => {
          const updatedMessages = [...prev];
          const lastMessageIndex = updatedMessages.length - 1;
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            content: fullContent.substring(0, i + 1),
            isTyping: true,
          };
          return updatedMessages;
        });
        i++;
        setTimeout(typeChar, typingSpeed);
      } else {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
        
        setTimeout(() => {
          setMessages(prev => {
            const updatedMessages = [...prev];
            const lastMessageIndex = updatedMessages.length - 1;
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              isTyping: false,
            };
            return updatedMessages;
          });
          callback();
        }, remainingTime);
      }
    };
    
    typeChar();
  };

  const handleVoiceInput = () => {
    toast({
      title: "Voice Input",
      description: "Voice input feature is coming soon! 🎤",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <MainLayout isLoggedIn={true}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="bg-fitPurple-600 text-white py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 animate-pulse-scale">
                <Dumbbell className="h-5 w-5 text-fitPurple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Fitness Trainer</h1>
                <p className="text-sm text-fitPurple-100">Your personal coach for {currentCategory ? categories[currentCategory].title.toLowerCase() : 'fitness goals'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-fitPurple-500"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        
        <div className={cn(
          "flex-grow bg-gray-50 dark:bg-fitDark-900 overflow-hidden",
          "flex",
          isFullscreen ? "flex-col" : "flex-col lg:flex-row"
        )}>
          <div className={cn(
            "flex-grow overflow-hidden flex flex-col",
            isFullscreen ? "w-full" : "lg:w-2/3"
          )}>
            <div className="flex-grow overflow-auto px-4">
              <div className="max-w-4xl mx-auto py-4 space-y-4">
                {!currentCategory && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {Object.entries(categories).map(([key, category]) => (
                      <motion.div
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="cursor-pointer hover:shadow-lg transition-all"
                          onClick={() => handleCategorySelect(key as Category)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-fitPurple-100 dark:bg-fitPurple-900 flex items-center justify-center">
                                {category.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold">{category.title}</h3>
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <AnimatePresence>
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      content={message.content}
                      type={message.type}
                      timestamp={message.timestamp}
                      isTyping={message.isTyping}
                      onToggleFullscreen={toggleFullscreen}
                      isFullscreen={isFullscreen}
                    />
                  ))}
                </AnimatePresence>
                {isLoading && !messages[messages.length - 1]?.isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] px-4 py-3 rounded-lg bg-white dark:bg-fitDark-800 shadow border border-gray-100 dark:border-fitDark-700 rounded-bl-none animate-pulse">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-fitPurple-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-fitPurple-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-fitPurple-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="bg-white dark:bg-fitDark-800 border-t border-gray-200 dark:border-fitDark-700 p-4">
              <div className="max-w-4xl mx-auto">
                {currentCategory && (
                  <div className="flex items-end space-x-2">
                    <div className="flex-grow">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask your AI fitness trainer anything..."
                        className="min-h-[60px] resize-none focus:border-fitPurple-400 focus:ring-fitPurple-400"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleVoiceInput}
                      className="rounded-full h-10 w-10 transition-all hover:bg-fitPurple-50 hover:text-fitPurple-600 hover:border-fitPurple-300"
                    >
                      <Mic className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </Button>
                    <Button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading || !userId}
                      className="rounded-full h-10 w-10 p-0 bg-fitPurple-600 hover:bg-fitPurple-700 transition-all active:scale-95"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isFullscreen && (
            <div className="lg:w-1/3 border-l border-gray-200 dark:border-fitDark-700 bg-white dark:bg-fitDark-800 overflow-auto">
              <div className="p-4 space-y-6">                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Recommended Videos
                  </h3>
                  {exerciseVideos.map((video: any) => (
                    <ExerciseVideo
                      key={video.id}
                      name={video.name}
                      description={video.description}
                      videoUrl={video.video_url}
                      category={video.category}
                      difficulty={video.difficulty}
                      muscleGroup={video.muscle_group}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Trainer;
