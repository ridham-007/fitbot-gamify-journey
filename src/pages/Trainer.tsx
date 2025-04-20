
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
  BarChart, Video
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ExerciseVideo from '@/components/trainer/ExerciseVideo';
import WorkoutChart from '@/components/trainer/WorkoutChart';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
};

type Suggestion = {
  id: string;
  text: string;
  icon?: React.ReactNode;
  category: 'workout' | 'diet' | 'goals' | 'health';
};

// Sample suggestions to get the user started
const defaultSuggestions: Suggestion[] = [
  { id: '1', text: "Create a personalized workout", icon: <Dumbbell className="h-4 w-4" />, category: 'workout' },
  { id: '2', text: "Help me improve my fitness", icon: <Activity className="h-4 w-4" />, category: 'goals' },
  { id: '3', text: "Nutrition advice for gains", icon: <Heart className="h-4 w-4" />, category: 'diet' },
  { id: '4', text: "Track my fitness progress", icon: <ArrowRight className="h-4 w-4" />, category: 'goals' },
];

const Trainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentSuggestions, setCurrentSuggestions] = useState<Suggestion[]>(defaultSuggestions);
  const [messages, setMessages] = useState<Message[]>([]);
  const [exerciseVideos, setExerciseVideos] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUserId(session.user.id);
      
      // After confirming auth, fetch initial data
      fetchChatHistory();
      fetchExerciseVideos();
      fetchWorkoutData();
      
      // Add initial greeting if no messages
      if (messages.length === 0) {
        setMessages([{
          id: '1',
          type: 'ai',
          content: "Hi! I'm your AI fitness coach. I can help with workout plans, nutrition advice, and fitness tracking. What would you like help with today?",
          timestamp: new Date(),
        }]);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const fetchChatHistory = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('ai_trainer_chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      setMessages(data.map(msg => ({
        id: msg.id,
        type: msg.is_user ? 'user' : 'ai',
        content: msg.message,
        timestamp: new Date(msg.created_at)
      })));
    }
  };

  const fetchExerciseVideos = async () => {
    const { data, error } = await supabase
      .from('exercise_videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && data) {
      setExerciseVideos(data);
    }
  };

  const fetchWorkoutData = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('user_workout_progress')
      .select('*')
      .eq('user_id', userId)
      .order('workout_date', { ascending: true })
      .limit(7);

    if (!error && data) {
      setWorkoutData(data.map(workout => ({
        date: new Date(workout.workout_date).toLocaleDateString('en-US', { weekday: 'short' }),
        duration: workout.duration,
        calories: workout.calories || 0
      })));
    } else if (error) {
      console.error('Error fetching workout data:', error);
      // Use sample data if no data exists yet
      setWorkoutData([
        { date: 'Mon', duration: 45, calories: 320 },
        { date: 'Tue', duration: 30, calories: 250 },
        { date: 'Wed', duration: 0, calories: 0 },
        { date: 'Thu', duration: 60, calories: 450 },
        { date: 'Fri', duration: 25, calories: 200 },
        { date: 'Sat', duration: 90, calories: 650 },
        { date: 'Sun', duration: 20, calories: 180 }
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    const typingSpeed = 10; // Adjust speed as needed
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

  const processUserMessage = async (userText: string) => {
    try {
      // Call Supabase Edge Function to process the message with AI
      const { data, error } = await supabase.functions.invoke('fitness-ai-chat', {
        body: { message: userText, userId }
      });
      
      if (error) throw error;
      
      return data.reply;
    } catch (error) {
      console.error('Error processing message:', error);
      return "I'm having trouble connecting to my fitness database right now. Can you try again in a moment? 🏋️‍♂️";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !userId) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Store user message in Supabase
      await supabase.from('ai_trainer_chats').insert({
        message: input,
        is_user: true,
        user_id: userId
      });
      
      // Process message with AI
      const aiResponse = await processUserMessage(input);
      
      // Generate new relevant suggestions based on the context
      const newSuggestions = generateRelevantSuggestions(input, aiResponse);
      if (newSuggestions.length > 0) {
        setCurrentSuggestions([
          ...newSuggestions,
          ...defaultSuggestions.slice(0, 2)
        ]);
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      // Simulate typing effect
      simulateTyping(aiMessage, () => {
        setIsLoading(false);
      });
      
      // Store AI response in Supabase
      await supabase.from('ai_trainer_chats').insert({
        message: aiResponse,
        is_user: false,
        user_id: userId
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

  // Generate contextually relevant suggestions based on the conversation
  const generateRelevantSuggestions = (userInput: string, aiResponse: string): Suggestion[] => {
    const lowerInput = userInput.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    const suggestions: Suggestion[] = [];
    
    // Workout related suggestions
    if (lowerInput.includes('workout') || lowerInput.includes('exercise') || lowerResponse.includes('workout plan')) {
      suggestions.push({ 
        id: 'w1', 
        text: "Show me upper body exercises", 
        icon: <BicepsFlexed className="h-4 w-4" />, 
        category: 'workout' 
      });
      suggestions.push({ 
        id: 'w2', 
        text: "I need a cardio routine", 
        icon: <Activity className="h-4 w-4" />, 
        category: 'workout' 
      });
    }
    
    // Nutrition related suggestions
    if (lowerInput.includes('diet') || lowerInput.includes('food') || lowerInput.includes('eat') || lowerResponse.includes('nutrition')) {
      suggestions.push({ 
        id: 'd1', 
        text: "Protein-rich meal ideas", 
        icon: <Heart className="h-4 w-4" />, 
        category: 'diet' 
      });
      suggestions.push({ 
        id: 'd2', 
        text: "Post-workout nutrition", 
        icon: <Info className="h-4 w-4" />, 
        category: 'diet' 
      });
    }
    
    // Goal related suggestions
    if (lowerInput.includes('goal') || lowerInput.includes('target') || lowerResponse.includes('goal')) {
      suggestions.push({ 
        id: 'g1', 
        text: "Set a weight loss goal", 
        icon: <Weight className="h-4 w-4" />, 
        category: 'goals' 
      });
      suggestions.push({ 
        id: 'g2', 
        text: "Track my progress", 
        icon: <BarChart className="h-4 w-4" />, 
        category: 'goals' 
      });
    }
    
    return suggestions;
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.text);
    setTimeout(() => {
      document.getElementById('send-button')?.click();
    }, 100);
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

  return (
    <MainLayout isLoggedIn={true}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="bg-fitPurple-600 text-white py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 animate-pulse-scale">
              <Dumbbell className="h-5 w-5 text-fitPurple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Fitness Trainer</h1>
              <p className="text-sm text-fitPurple-100">Your personal coach for workouts, nutrition, and fitness tracking</p>
            </div>
          </div>
        </div>
        
        <div className="flex-grow bg-gray-50 dark:bg-fitDark-900 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-grow lg:w-2/3 overflow-hidden flex flex-col">
            <div className="flex-grow overflow-auto px-4">
              <div className="max-w-4xl mx-auto py-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-fitPurple-600 text-white rounded-br-none animate-slide-up'
                            : 'bg-white dark:bg-fitDark-800 shadow border border-gray-100 dark:border-fitDark-700 rounded-bl-none animate-scale-in'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.isTyping && (
                          <div className="mt-2 flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-fitPurple-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-fitPurple-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-fitPurple-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                          </div>
                        )}
                        <div
                          className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-fitPurple-200' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
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
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {currentSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center whitespace-nowrap px-3 py-1.5 text-sm bg-gray-100 dark:bg-fitDark-700 hover:bg-gray-200 dark:hover:bg-fitDark-600 rounded-full text-gray-700 dark:text-gray-300 transition-all hover:scale-105 active:scale-95"
                    >
                      {suggestion.icon && <span className="mr-1.5">{suggestion.icon}</span>}
                      {suggestion.text}
                    </button>
                  ))}
                  <button
                    className="flex items-center whitespace-nowrap px-3 py-1.5 text-sm bg-gray-100 dark:bg-fitDark-700 hover:bg-gray-200 dark:hover:bg-fitDark-600 rounded-full text-gray-700 dark:text-gray-300 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    More suggestions
                  </button>
                </div>
                
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
                    id="send-button"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || !userId}
                    className="rounded-full h-10 w-10 p-0 bg-fitPurple-600 hover:bg-fitPurple-700 transition-all active:scale-95"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 border-l border-gray-200 dark:border-fitDark-700 bg-white dark:bg-fitDark-800 overflow-auto">
            <div className="p-4 space-y-6">
              <WorkoutChart
                data={workoutData}
                title="Weekly Workout Progress"
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Exercise Videos
                </h3>
                {exerciseVideos.map((video) => (
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
        </div>
      </div>
    </MainLayout>
  );
};

export default Trainer;
