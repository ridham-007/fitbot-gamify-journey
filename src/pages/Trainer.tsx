
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { Send, Mic, Dumbbell, Info, User, Plus, ArrowRight } from 'lucide-react';

type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

type Suggestion = {
  id: string;
  text: string;
  icon?: React.ReactNode;
};

// Mock AI responses
const mockResponses: Record<string, string> = {
  default: "I'm your AI fitness coach! What kind of workout are you looking for today?",
  workouts: "Based on your goals and fitness level, I recommend a 30-minute HIIT session. Would you like me to create a specific routine for you?",
  routine: "Here's a customized routine for you:\n\n1. Warm-up (5 mins)\n- Jumping jacks: 30 seconds\n- High knees: 30 seconds\n- Arm circles: 30 seconds\n\n2. Main workout (20 mins)\n- Bodyweight squats: 15 reps\n- Push-ups: 10 reps\n- Mountain climbers: 30 seconds\n- Rest: 30 seconds\n- Repeat 4 times\n\n3. Cool down (5 mins)\n- Stretching\n\nWould you like to start this workout now?",
  goals: "Setting clear fitness goals is important! What are you aiming for? Weight loss, muscle gain, improved endurance, or general fitness?",
  progress: "I can see you've been consistent with your workouts! You've completed 8 sessions in the last 2 weeks, earning 450 XP. Keep it up!",
  diet: "A balanced diet is crucial for fitness success. Based on your goals, I recommend focusing on lean proteins, complex carbs, and plenty of vegetables.",
};

const Trainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi there! I'm Coach FitBot, your AI fitness trainer. How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  const suggestions: Suggestion[] = [
    { id: '1', text: "Create a workout for me", icon: <Dumbbell className="h-4 w-4" /> },
    { id: '2', text: "I want to improve my cardio", icon: <User className="h-4 w-4" /> },
    { id: '3', text: "What should I eat before workout?", icon: <Info className="h-4 w-4" /> },
    { id: '4', text: "Track my fitness progress", icon: <ArrowRight className="h-4 w-4" /> },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      // Mock API call to get AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let responseContent = mockResponses.default;
      
      // Simple keyword matching for demo purposes
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('workout') || lowerInput.includes('exercise')) {
        responseContent = mockResponses.workouts;
      } else if (lowerInput.includes('routine') || lowerInput.includes('plan')) {
        responseContent = mockResponses.routine;
      } else if (lowerInput.includes('goal') || lowerInput.includes('aim')) {
        responseContent = mockResponses.goals;
      } else if (lowerInput.includes('progress') || lowerInput.includes('tracking')) {
        responseContent = mockResponses.progress;
      } else if (lowerInput.includes('diet') || lowerInput.includes('eat') || lowerInput.includes('food')) {
        responseContent = mockResponses.diet;
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responseContent,
        timestamp: new Date(),
      };
      
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
  };

  const handleVoiceInput = () => {
    toast({
      title: "Voice Input",
      description: "Voice input feature would be implemented here.",
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
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <Dumbbell className="h-5 w-5 text-fitPurple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Fitness Trainer</h1>
              <p className="text-sm text-fitPurple-100">Ask anything about workouts, nutrition, or your fitness journey</p>
            </div>
          </div>
        </div>
        
        <div className="flex-grow bg-gray-50 dark:bg-fitDark-900 overflow-hidden flex flex-col">
          <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-grow overflow-auto">
            <div className="py-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-fitPurple-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-fitDark-800 shadow border border-gray-100 dark:border-fitDark-700 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-fitPurple-200' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] px-4 py-3 rounded-lg bg-white dark:bg-fitDark-800 shadow border border-gray-100 dark:border-fitDark-700 rounded-bl-none">
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
          
          <div className="bg-white dark:bg-fitDark-800 border-t border-gray-200 dark:border-fitDark-700 py-4">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center whitespace-nowrap px-3 py-1.5 text-sm bg-gray-100 dark:bg-fitDark-700 hover:bg-gray-200 dark:hover:bg-fitDark-600 rounded-full text-gray-700 dark:text-gray-300"
                  >
                    {suggestion.icon && <span className="mr-1.5">{suggestion.icon}</span>}
                    {suggestion.text}
                  </button>
                ))}
                <button
                  className="flex items-center whitespace-nowrap px-3 py-1.5 text-sm bg-gray-100 dark:bg-fitDark-700 hover:bg-gray-200 dark:hover:bg-fitDark-600 rounded-full text-gray-700 dark:text-gray-300"
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
                    placeholder="Ask your AI fitness trainer..."
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceInput}
                  className="rounded-full h-10 w-10"
                >
                  <Mic className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="rounded-full h-10 w-10 p-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Trainer;
