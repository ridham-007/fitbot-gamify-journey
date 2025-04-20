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

const aiResponses: Record<string, {content: string, followUp?: Suggestion[]}> = {
  default: {
    content: "Hi! I'm your AI fitness coach. I can help with workout plans, nutrition advice, and fitness tracking. What would you like help with today?",
    followUp: [
      { id: 's1', text: "Create a workout plan", icon: <Dumbbell className="h-4 w-4" />, category: 'workout' },
      { id: 's2', text: "Nutrition advice", icon: <User className="h-4 w-4" />, category: 'diet' },
    ]
  },
  workouts: {
    content: "Based on your fitness level and goals, I recommend a balanced program with strength training and cardio. Here's a personalized 4-week plan:\n\n**Week 1-2: Foundation**\n- Monday: Upper body (3 sets, 10-12 reps)\n- Tuesday: 20 min cardio (moderate intensity)\n- Wednesday: Rest\n- Thursday: Lower body (3 sets, 10-12 reps)\n- Friday: 20 min cardio (moderate intensity)\n- Weekend: Active recovery (walking, yoga)\n\n**Week 3-4: Progression**\n- Increase weights by 5-10%\n- Extend cardio to 25-30 minutes\n\nWould you like me to detail specific exercises for any of these days?",
    followUp: [
      { id: 'w1', text: "Show upper body exercises", icon: <BicepsFlexed className="h-4 w-4" />, category: 'workout' },
      { id: 'w2', text: "Show lower body exercises", icon: <Weight className="h-4 w-4" />, category: 'workout' },
      { id: 'w3', text: "Cardio recommendations", icon: <Activity className="h-4 w-4" />, category: 'workout' },
    ]
  },
  "upper body": {
    content: "Here's your upper body workout:\n\n1. **Push-ups**: 3 sets of 10-15 reps\n2. **Dumbbell bench press**: 3 sets of 10-12 reps\n3. **Bent-over rows**: 3 sets of 10-12 reps\n4. **Overhead press**: 3 sets of 10-12 reps\n5. **Bicep curls**: 3 sets of 12-15 reps\n6. **Tricep dips**: 3 sets of 12-15 reps\n\nRest 60-90 seconds between sets. Ensure proper form throughout. Would you like form tips for any specific exercise?",
    followUp: [
      { id: 'ub1', text: "How to do proper push-ups", icon: <Info className="h-4 w-4" />, category: 'workout' },
      { id: 'ub2', text: "Alternatives with no equipment", icon: <Dumbbell className="h-4 w-4" />, category: 'workout' },
    ]
  },
  "lower body": {
    content: "Here's your lower body workout:\n\n1. **Squats**: 3 sets of 12-15 reps\n2. **Lunges**: 3 sets of 10-12 reps per leg\n3. **Romanian deadlifts**: 3 sets of 10-12 reps\n4. **Calf raises**: 3 sets of 15-20 reps\n5. **Glute bridges**: 3 sets of 15 reps\n6. **Wall sits**: 3 sets of 30-45 seconds\n\nRest 60-90 seconds between sets. Focus on form over weight. Would you like me to explain any of these exercises in detail?",
    followUp: [
      { id: 'lb1', text: "Proper squat technique", icon: <Info className="h-4 w-4" />, category: 'workout' },
      { id: 'lb2', text: "Modify for knee pain", icon: <Heart className="h-4 w-4" />, category: 'health' },
    ]
  },
  cardio: {
    content: "For effective cardio training, here are my recommendations:\n\n**Moderate Intensity Options (20-30 mins)**:\n- Brisk walking (3-4 mph)\n- Cycling (moderate pace)\n- Elliptical trainer\n- Swimming\n\n**High Intensity Options (15-20 mins)**:\n- Interval sprints (30 sec sprint, 90 sec walk)\n- Jump rope intervals\n- Stair climbing\n- HIIT circuit (30 sec work, 30 sec rest)\n\nStart with moderate intensity 2-3 times per week, then gradually add 1-2 high intensity sessions as your fitness improves.",
    followUp: [
      { id: 'c1', text: "HIIT workout example", icon: <Activity className="h-4 w-4" />, category: 'workout' },
      { id: 'c2', text: "Best cardio for fat loss", icon: <Weight className="h-4 w-4" />, category: 'workout' },
    ]
  },
  routine: {
    content: "Here's a customized full-body routine for you:\n\n**Warm-up (5 mins):**\n- Jumping jacks: 30 seconds\n- Arm circles: 30 seconds\n- Bodyweight squats: 30 seconds\n- High knees: 30 seconds\n- Torso twists: 30 seconds\n\n**Main workout (25 mins):**\n- Push-ups: 12 reps\n- Bodyweight squats: 15 reps\n- Plank: 30 seconds\n- Lunges: 10 reps each leg\n- Mountain climbers: 30 seconds\n_Rest 60 seconds and repeat 3 times_\n\n**Cool down (5 mins):**\n- Light stretching\n\nWould you like to start a timer for this workout?",
    followUp: [
      { id: 'r1', text: "Start workout timer", icon: <Play className="h-4 w-4" />, category: 'workout' },
      { id: 'r2', text: "Modify for beginner", icon: <Info className="h-4 w-4" />, category: 'workout' },
    ]
  },
  goals: {
    content: "Setting specific fitness goals is key to success! What are you aiming for?\n\n**Common fitness goals:**\n- Weight loss (fat reduction)\n- Muscle gain (hypertrophy)\n- Strength improvement\n- Endurance building\n- General fitness and health\n- Athletic performance\n\nLet me know your primary goal, and I can help create a tailored plan with measurable milestones.",
    followUp: [
      { id: 'g1', text: "Weight loss plan", icon: <Weight className="h-4 w-4" />, category: 'goals' },
      { id: 'g2', text: "Muscle building plan", icon: <BicepsFlexed className="h-4 w-4" />, category: 'goals' },
      { id: 'g3', text: "Improve endurance", icon: <Activity className="h-4 w-4" />, category: 'goals' },
    ]
  },
  progress: {
    content: "You're making great progress! Here's your fitness summary:\n\n- **Workouts completed:** 8 in the last 14 days\n- **Current streak:** 3 days\n- **Total XP earned:** 450\n- **Most consistent workout:** Upper body training\n- **Area to improve:** Cardio sessions (only 2 completed)\n\nKeep up the consistency! Adding one more cardio session per week could help balance your program and improve overall fitness outcomes.",
    followUp: [
      { id: 'p1', text: "View detailed stats", icon: <BarChart className="h-4 w-4" />, category: 'goals' },
      { id: 'p2', text: "Improve cardio routine", icon: <Heart className="h-4 w-4" />, category: 'workout' },
    ]
  },
  diet: {
    content: "Nutrition is crucial for fitness success. Here's a balanced approach based on your goals:\n\n**Daily Macronutrient Targets:**\n- Protein: 1.6-2.0g per kg of bodyweight\n- Carbohydrates: 3-5g per kg (higher on training days)\n- Fats: 0.8-1.0g per kg\n\n**Key Principles:**\n- Eat whole, minimally processed foods 80% of the time\n- Include protein with every meal\n- Stay hydrated (aim for 3L water daily)\n- Time larger carb portions around workouts\n- Consume colorful vegetables with most meals\n\nWould you like sample meal ideas or a full meal plan?",
    followUp: [
      { id: 'd1', text: "Pre-workout meal ideas", icon: <Clock className="h-4 w-4" />, category: 'diet' },
      { id: 'd2', text: "Post-workout nutrition", icon: <Dumbbell className="h-4 w-4" />, category: 'diet' },
      { id: 'd3', text: "Full day meal plan", icon: <Info className="h-4 w-4" />, category: 'diet' },
    ]
  }
};

const Trainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<Suggestion[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: aiResponses.default.content,
      timestamp: new Date(),
    },
  ]);
  const [exerciseVideos, setExerciseVideos] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);

  const defaultSuggestions: Suggestion[] = [
    { id: '1', text: "Create a personalized workout", icon: <Dumbbell className="h-4 w-4" />, category: 'workout' },
    { id: '2', text: "Help me improve my fitness", icon: <Activity className="h-4 w-4" />, category: 'goals' },
    { id: '3', text: "Nutrition advice for gains", icon: <Heart className="h-4 w-4" />, category: 'diet' },
    { id: '4', text: "Track my fitness progress", icon: <ArrowRight className="h-4 w-4" />, category: 'goals' },
  ];

  useEffect(() => {
    setCurrentSuggestions([
      ...defaultSuggestions,
      ...(aiResponses.default.followUp || [])
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchChatHistory();
    fetchExerciseVideos();
    fetchWorkoutData();
  }, []);

  const fetchChatHistory = async () => {
    const { data, error } = await supabase
      .from('ai_trainer_chats')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
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
      .order('created_at', { ascending: true });

    if (!error && data) {
      setExerciseVideos(data);
    }
  };

  const fetchWorkoutData = async () => {
    const { data, error } = await supabase
      .from('user_workout_progress')
      .select('*')
      .order('workout_date', { ascending: true })
      .limit(7);

    if (!error && data) {
      setWorkoutData(data.map(workout => ({
        date: new Date(workout.workout_date).toLocaleDateString('en-US', { weekday: 'short' }),
        duration: workout.duration,
        calories: workout.calories || 0
      })));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findAIResponse = (input: string): { content: string, followUp?: Suggestion[] } => {
    const lowerInput = input.toLowerCase();
    
    for (const [key, response] of Object.entries(aiResponses)) {
      if (lowerInput.includes(key.toLowerCase())) {
        return response;
      }
    }
    
    if (lowerInput.includes('workout') || lowerInput.includes('exercise') || lowerInput.includes('train')) {
      return aiResponses.workouts;
    } else if (lowerInput.includes('upper body') || lowerInput.includes('arms') || lowerInput.includes('chest') || lowerInput.includes('shoulders')) {
      return aiResponses["upper body"];
    } else if (lowerInput.includes('lower body') || lowerInput.includes('legs') || lowerInput.includes('squats')) {
      return aiResponses["lower body"];
    } else if (lowerInput.includes('cardio') || lowerInput.includes('running') || lowerInput.includes('hiit')) {
      return aiResponses.cardio;
    } else if (lowerInput.includes('routine') || lowerInput.includes('plan') || lowerInput.includes('schedule')) {
      return aiResponses.routine;
    } else if (lowerInput.includes('goal') || lowerInput.includes('aim') || lowerInput.includes('target')) {
      return aiResponses.goals;
    } else if (lowerInput.includes('progress') || lowerInput.includes('tracking') || lowerInput.includes('improve')) {
      return aiResponses.progress;
    } else if (lowerInput.includes('diet') || lowerInput.includes('eat') || lowerInput.includes('food') || lowerInput.includes('nutrition')) {
      return aiResponses.diet;
    }
    
    return aiResponses.default;
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

  const handleSend = async () => {
    if (!input.trim()) return;
    
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
      await supabase.from('ai_trainer_chats').insert({
        message: input,
        is_user: true
      });

      const responseData = findAIResponse(input);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responseData.content,
        timestamp: new Date(),
      };
      
      if (responseData.followUp && responseData.followUp.length > 0) {
        setCurrentSuggestions([
          ...responseData.followUp,
          ...defaultSuggestions.slice(0, 2)
        ]);
      } else {
        setCurrentSuggestions(defaultSuggestions);
      }
      
      simulateTyping(aiMessage, () => {
        setIsLoading(false);
      });
      
      await supabase.from('ai_trainer_chats').insert({
        message: aiMessage.content,
        is_user: false
      });
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI trainer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      description: "Voice input feature is coming soon!",
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
                    disabled={!input.trim() || isLoading}
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
