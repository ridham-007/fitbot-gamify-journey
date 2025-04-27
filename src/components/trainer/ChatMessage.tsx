
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Clock, Dumbbell, User, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
    "relative group max-w-[85%] p-4 shadow-lg transition-all duration-200",
    type === 'user' 
      ? 'bg-gradient-to-r from-fitPurple-600 to-fitPurple-700 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm ml-auto hover:shadow-fitPurple-400/20'
      : 'bg-gradient-to-r from-white to-gray-50 dark:from-fitDark-800 dark:to-fitDark-700 rounded-t-2xl rounded-br-2xl rounded-bl-sm mr-auto hover:shadow-xl dark:shadow-fitDark-900/30',
    isFullscreen && 'max-w-3xl'
  );

  const maxContentHeight = 500;
  const contentTooLong = content.length > 500;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={messageVariants}
      className={cn(
        "flex w-full mb-4",
        type === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {type === 'ai' && (
        <div className="w-10 h-10 mr-2 flex-shrink-0">
          <motion.div 
            className="w-10 h-10 rounded-full bg-gradient-to-br from-fitPurple-400 to-fitPurple-600 flex items-center justify-center shadow-md"
            animate={{ 
              boxShadow: ['0 0 0px rgba(139, 92, 246, 0.3)', '0 0 10px rgba(139, 92, 246, 0.7)', '0 0 0px rgba(139, 92, 246, 0.3)'] 
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Dumbbell className="h-5 w-5 text-white" />
          </motion.div>
        </div>
      )}

      <div className="flex flex-col max-w-[85%]">
        <Card className={bubbleClasses}>
          <div className="relative">
            {contentTooLong ? (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="content" className="border-none">
                  <AccordionTrigger className="py-0 text-xs text-fitPurple-500 dark:text-fitPurple-300 hover:no-underline">
                    Show full response
                  </AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className={`pr-4 ${type === 'ai' ? 'max-h-[500px]' : ''}`}>
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
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div>
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
              </div>
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
            <div className="flex items-center">
              <Clock className={cn(
                "h-3 w-3 mr-1",
                type === 'user' ? 'text-fitPurple-200' : 'text-gray-400 dark:text-gray-500'
              )} />
              <span className={cn(
                "text-xs",
                type === 'user' ? 'text-fitPurple-200' : 'text-gray-500 dark:text-gray-400'
              )}>
                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {onToggleFullscreen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {type === 'user' && (
        <div className="w-10 h-10 ml-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fitGreen-400 to-fitGreen-600 flex items-center justify-center shadow-md">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
