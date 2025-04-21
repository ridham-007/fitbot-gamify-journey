
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

const ChatMessage = ({ 
  content, 
  type, 
  timestamp, 
  isTyping,
  onToggleFullscreen,
  isFullscreen 
}: ChatMessageProps) => {
  const messageVariants = {
    initial: { 
      opacity: 0,
      y: type === 'user' ? 20 : -20,
      scale: 0.95
    },
    animate: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: { 
      opacity: 0,
      y: type === 'user' ? -20 : 20,
      transition: { duration: 0.2 }
    }
  };

  const bubbleClasses = cn(
    "relative group max-w-[80%] p-4 shadow-lg transition-all duration-200",
    type === 'user' 
      ? 'bg-gradient-to-r from-fitPurple-600 to-fitPurple-700 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm ml-12 hover:shadow-fitPurple-400/20'
      : 'bg-gradient-to-r from-white to-gray-50 dark:from-fitDark-800 dark:to-fitDark-700 rounded-t-2xl rounded-br-2xl rounded-bl-sm mr-12 hover:shadow-xl dark:shadow-fitDark-900/30',
    isFullscreen && 'max-w-3xl'
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={messageVariants}
      className={cn(
        "flex w-full items-end",
        type === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <Card className={bubbleClasses}>
        {type === 'ai' && (
          <div className="absolute -left-2 -top-2">
            <motion.div 
              className="w-6 h-6 rounded-full bg-fitPurple-500 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-white text-xs">AI</span>
            </motion.div>
          </div>
        )}
        
        <div className="relative">
          {type === 'ai' ? (
            <ReactMarkdown 
              className={cn(
                "prose prose-sm max-w-none",
                "dark:prose-invert",
                "[&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2",
                "[&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1",
                "[&>p]:mb-2 last:[&>p]:mb-0",
                "[&>blockquote]:border-l-4 [&>blockquote]:border-fitPurple-300 [&>blockquote]:pl-4 [&>blockquote]:italic",
                "[&>code]:bg-fitPurple-100 [&>code]:text-fitPurple-700 [&>code]:px-1 [&>code]:rounded",
                "dark:[&>code]:bg-fitDark-700 dark:[&>code]:text-fitPurple-300"
              )}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}

          {isTyping && (
            <div className="mt-2 flex space-x-1">
              <motion.div 
                className="w-2 h-2 rounded-full bg-fitPurple-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              />
              <motion.div 
                className="w-2 h-2 rounded-full bg-fitPurple-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              />
              <motion.div 
                className="w-2 h-2 rounded-full bg-fitPurple-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-fitDark-600">
          <span className={cn(
            "text-xs",
            type === 'user' ? 'text-fitPurple-200' : 'text-gray-500 dark:text-gray-400'
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ChatMessage;
