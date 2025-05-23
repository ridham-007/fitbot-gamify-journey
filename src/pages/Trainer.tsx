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
  BarChart, Video, Minimize2, Maximize2, MessageSquare, History, List
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ExerciseVideo from '@/components/trainer/ExerciseVideo';
import WorkoutChart from '@/components/trainer/WorkoutChart';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ChatMessage from '@/components/trainer/ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';

type Session = {
  session_id: string;
  created_at: string;
};

type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  category?: string;
  sessionId?: string;
};

type Category = 'weightloss' | 'muscle-gain' | 'general-fitness' | 'flexibility';

type CategoryInfo = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

type Video = {
  id: string;
  name: string;
  description: string;
  video_url: string;
  category: string;
  difficulty: string;
  muscle_group: string;
  thumbnail_url?: string;
};

const categories: Record<Category, CategoryInfo> = {
  'weightloss': {
    id: 'weightloss',
    title: 'Weight Loss',
    description: 'Personalized plans for healthy and sustainable weight loss',
    icon: <Weight className="h-5 w-5" />,
    color: 'from-rose-400 to-red-500'
  },
  'muscle-gain': {
    id: 'muscle-gain',
    title: 'Muscle Gain',
    description: 'Build strength and muscle with expert guidance',
    icon: <BicepsFlexed className="h-5 w-5" />,
    color: 'from-blue-400 to-indigo-500'
  },
  'general-fitness': {
    id: 'general-fitness',
    title: 'General Fitness',
    description: 'Improve overall health and fitness level',
    icon: <Activity className="h-5 w-5" />,
    color: 'from-green-400 to-emerald-500'
  },
  'flexibility': {
    id: 'flexibility',
    title: 'Flexibility',
    description: 'Enhance mobility and reduce muscle tension',
    icon: <Heart className="h-5 w-5" />,
    color: 'from-amber-400 to-orange-500'
  },
};

const Trainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [exerciseVideos, setExerciseVideos] = useState<Video[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<'history' | 'videos'>('videos');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [previousSessions, setPreviousSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (messagesEndRef.current) {
      scrollToBottom();
    }
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

      try {
        await fetchPreviousSessions(session.user.id);
      } catch (error) {
        console.error("Error fetching previous sessions:", error);
      }
    };
    
    checkAuth();
  }, [navigate, messages.length]);

  const fetchPreviousSessions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_trainer_chats')
        .select('session_id, created_at')
        .eq('user_id', userId)
        .eq('is_user', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const uniqueSessions = [...new Map(data.map(item => 
          [item.session_id, { 
            session_id: item.session_id, 
            created_at: item.created_at 
          }]
        )).values()] as Session[];
        
        setPreviousSessions(uniqueSessions);
      }
    } catch (error) {
      console.error("Error fetching previous sessions:", error);
    }
  };

  const fetchVideoRecommendations = async (sessionId: string) => {
    try {
      const { data: videoData, error } = await supabase
        .from('chat_video_recommendations')
        .select(`
          video_id,
          exercise_videos (
            id, name, description, video_url, category, difficulty, muscle_group, thumbnail_url
          )
        `)
        .eq('chat_session_id', sessionId);
        
      if (error) throw error;
      
      if (videoData && videoData.length > 0) {
        const videos = videoData
          .filter(item => item.exercise_videos)
          .map(item => item.exercise_videos) as Video[];
          
        console.log("Retrieved video recommendations:", videos);
        setExerciseVideos(videos.length > 0 ? videos : []);
      } else {
        console.log("No video recommendations found for session:", sessionId);
        setExerciseVideos([]);
      }
    } catch (error) {
      console.error("Error fetching video recommendations:", error);
      setExerciseVideos([]);
    }
  };

  const loadPreviousSession = async (sessionId: string) => {
    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from('ai_trainer_chats')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (chatsError) throw chatsError;

      if (chatsData && chatsData.length > 0) {
        const sessionCategory = chatsData[0].category as Category | null;
        const firstUserMessage = chatsData.find(msg => msg.is_user)?.message || 'New Chat';
        setCurrentCategory(sessionCategory);
        setSessionId(sessionId);

        const sessionMessages: Message[] = chatsData.map(msg => ({
          id: msg.id || String(Date.now()),
          type: msg.is_user ? 'user' : 'ai',
          content: msg.message || '',
          timestamp: new Date(msg.created_at),
          category: msg.category || undefined,
          sessionId: sessionId
        }));

        setMessages(sessionMessages);
        await fetchVideoRecommendations(sessionId);
        setShowSidebar(false);
      }
    } catch (error) {
      console.error("Error loading previous session:", error);
      toast({
        title: "Error",
        description: "Failed to load previous conversation",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategorySelect = async (category: Category) => {
    setCurrentCategory(category);
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    
    const welcomeMessage = {
      id: Date.now().toString(),
      type: 'ai' as const,
      content: `Great choice! Let's focus on ${categories[category].title}. I'll ask you a few questions to provide better guidance.`,
      timestamp: new Date(),
      sessionId: newSessionId
    };
    
    setMessages(prev => [...prev, welcomeMessage]);
    try {
      await handleSend('', category, true);
    } catch (error) {
      console.error("Error sending initial message:", error);
      toast({
        title: "Connection Error",
        description: "Failed to start conversation with AI trainer.",
        variant: "destructive",
      });
    }
  };

  const handleSend = async (userText: string = input, category: Category | null = currentCategory, isNewSession: boolean = false) => {
    if ((!userText.trim() && !isNewSession) || !userId) return;
    
    if (userText.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: userText,
        timestamp: new Date(),
        sessionId: sessionId || undefined
      };
      setMessages(prev => [...prev, userMessage]);
    }
    
    setInput('');
    setIsLoading(true);
    
    let aiResponse: any = null;
    
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
      
      if (!data) throw new Error("No data returned from AI trainer");
      
      aiResponse = data;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.reply || "Sorry, I couldn't generate a response. Please try again.",
        timestamp: new Date(),
        sessionId: sessionId || undefined
      };
      
      simulateTyping(aiMessage, () => {
        setIsLoading(false);
        if (data.suggestedVideos && Array.isArray(data.suggestedVideos) && data.suggestedVideos.length > 0) {
          console.log("Setting exercise videos:", data.suggestedVideos);
          setExerciseVideos(data.suggestedVideos);
        }
        if (data.previousSessions && Array.isArray(data.previousSessions)) {
          setPreviousSessions(data.previousSessions);
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

    if (isNewSession && sessionId) {
      const welcomeMessage = {
        id: Date.now().toString(),
        type: 'ai' as const,
        content: "Hi! I'm your AI fitness coach. Let's start by choosing a fitness category that matches your goals. What would you like to focus on?",
        timestamp: new Date(),
      };
      
      await supabase.from('ai_trainer_chats').insert([
        { 
          user_id: userId, 
          message: welcomeMessage.content, 
          is_user: false, 
          category: category, 
          session_id: sessionId 
        }
      ]);
    }

    const { error: chatError } = await supabase
      .from('ai_trainer_chats')
      .insert([
        { user_id: userId, message: userText, is_user: true, category, session_id: sessionId },
        { user_id: userId, message: aiResponse?.reply, is_user: false, category, session_id: sessionId }
      ]);
      
    if (chatError) {
      console.error("Error saving chat messages:", chatError);
    }
    
    const { data: previousSessions, error: sessionsError } = await supabase
      .from('ai_trainer_chats')
      .select('session_id, created_at')
      .eq('user_id', userId)
      .eq('is_user', true)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (sessionsError) {
      console.error("Error fetching previous sessions:", sessionsError);
    }
    
    const uniqueSessions = previousSessions ? 
      [...new Map(previousSessions.map(item => [item.session_id, item])).values()]
      : [];
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
          if (lastMessageIndex >= 0) {
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              content: fullContent.substring(0, i + 1),
              isTyping: true,
            };
          }
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
            if (lastMessageIndex >= 0) {
              updatedMessages[lastMessageIndex] = {
                ...updatedMessages[lastMessageIndex],
                isTyping: false,
              };
            }
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

  const toggleSidebar = (content?: 'history' | 'videos') => {
    if (content && content === sidebarContent && showSidebar) {
      setShowSidebar(false);
    } else {
      if (content) setSidebarContent(content);
      setShowSidebar(!showSidebar);
    }
  };

  const startNewChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI fitness coach. Let's start by choosing a fitness category that matches your goals. What would you like to focus on?",
      timestamp: new Date(),
    }]);
    setCurrentCategory(null);
    setSessionId(null);
    setExerciseVideos([]);
  };

  return (
    <MainLayout isLoggedIn={true}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="bg-gradient-to-r from-fitPurple-600 to-fitPurple-700 text-white py-4 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 shadow-inner shadow-fitPurple-800/20">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut"
                  }}
                >
                  <Dumbbell className="h-6 w-6 text-fitPurple-600" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Fitness Trainer</h1>
                <p className="text-sm text-fitPurple-100">
                  {currentCategory && categories[currentCategory] 
                    ? `Focus: ${categories[currentCategory].title}` 
                    : 'Your personal coach for fitness goals'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSidebar('history')}
                className={cn(
                  "text-white hover:bg-fitPurple-500",
                  sidebarContent === 'history' && showSidebar && "bg-fitPurple-500"
                )}
              >
                <History className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">History</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSidebar('videos')}
                className={cn(
                  "text-white hover:bg-fitPurple-500",
                  sidebarContent === 'videos' && showSidebar && "bg-fitPurple-500"
                )}
              >
                <Video className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Videos</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={startNewChat}
                className="bg-white text-fitPurple-700 hover:bg-gray-100"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>New Chat</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-grow bg-gray-50 dark:bg-fitDark-900 overflow-hidden flex">
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            showSidebar ? "w-3/4" : "w-full"
          )}>
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-grow px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {!currentCategory && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-center">Choose a Fitness Category</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {Object.entries(categories).map(([key, category]) => (
                          <motion.div
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card 
                              className="cursor-pointer hover:shadow-lg transition-all overflow-hidden"
                              onClick={() => handleCategorySelect(key as Category)}
                            >
                              <div className={`h-1 w-full bg-gradient-to-r ${category.color}`}></div>
                              <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} text-white flex items-center justify-center shadow-md`}>
                                    {category.icon}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg">{category.title}</h3>
                                    <p className="text-sm text-muted-foreground">{category.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {messages.map((message) => {
                      const getAvatarUrl = async () => {
                        if (message.type === 'user') {
                          const { data } = await supabase.auth.getUser();
                          return data.user?.user_metadata?.avatar_url;
                        }
                        return undefined;
                      };
                      
                      return (
                        <ChatMessage
                          key={message.id}
                          content={message.content}
                          type={message.type}
                          timestamp={message.timestamp}
                          isTyping={message.isTyping}
                          onToggleFullscreen={() => {}}
                          isFullscreen={false}
                          userAvatarUrl={message.type === 'user' ? undefined : undefined}
                        />
                      );
                    })}
                  </AnimatePresence>
                  
                  {isLoading && !messages[messages.length - 1]?.isTyping && (
                    <div className="flex justify-start">
                      <div className="flex space-x-2 items-center px-4 py-3 rounded-lg bg-white dark:bg-fitDark-800 shadow border border-gray-100 dark:border-fitDark-700 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-fitPurple-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-fitPurple-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-fitPurple-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="bg-white dark:bg-fitDark-800 border-t border-gray-200 dark:border-fitDark-700 p-4">
                <div className="max-w-3xl mx-auto">
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
          </div>

          <div 
            className={cn(
              "bg-white dark:bg-fitDark-800 border-l border-gray-200 dark:border-fitDark-700 transition-all duration-300 ease-in-out overflow-hidden",
              showSidebar ? "w-1/4" : "w-0"
            )}
          >
            {showSidebar && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-fitDark-700 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center">
                    {sidebarContent === 'videos' ? (
                      <>
                        <Video className="h-4 w-4 mr-2 text-fitPurple-500" />
                        Recommended Videos
                      </>
                    ) : (
                      <>
                        <History className="h-4 w-4 mr-2 text-fitPurple-500" />
                        Chat History
                      </>
                    )}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(false)}
                    className="h-8 w-8 p-0"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="flex-grow">
                  <div className="p-4">
                    {sidebarContent === 'videos' ? (
                      <div className="space-y-4">
                        {exerciseVideos && exerciseVideos.length > 0 ? (
                          exerciseVideos.map((video) => (
                            <ExerciseVideo
                              key={video.id}
                              name={video.name}
                              description={video.description}
                              videoUrl={video.video_url}
                              category={video.category}
                              difficulty={video.difficulty}
                              muscleGroup={video.muscle_group}
                            />
                          ))
                        ) : (
                          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Video recommendations will appear as you chat with the AI trainer.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startNewChat}
                          className="w-full flex items-center justify-start hover:bg-fitPurple-50 dark:hover:bg-fitPurple-900/10"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Start New Conversation
                        </Button>
                        
                        {previousSessions && previousSessions.length > 0 ? (
                          previousSessions.map((session) => {
                            const firstMessage = messages.find(
                              msg => msg.type === 'user' && msg.sessionId === session.session_id
                            )?.content || 'New Chat';
                            
                            return (
                              <Button
                                key={session.session_id}
                                variant="ghost"
                                size="sm"
                                onClick={() => loadPreviousSession(session.session_id)}
                                className="w-full group flex flex-col items-start justify-start p-3 hover:bg-fitPurple-50 dark:hover:bg-fitPurple-900/10 rounded-lg transition-all"
                              >
                                <div className="flex items-center w-full mb-1">
                                  <MessageSquare className="h-4 w-4 mr-2 text-fitPurple-500" />
                                  <span className="text-sm font-medium truncate">
                                    {firstMessage.length > 30 
                                      ? `${firstMessage.substring(0, 30)}...` 
                                      : firstMessage}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                                  <span>
                                    {session.created_at && new Date(session.created_at).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Chat →
                                  </span>
                                </div>
                              </Button>
                            );
                          })
                        ) : (
                          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No previous conversations found.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Trainer;
