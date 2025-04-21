
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

const ChatMessage = ({ content, type, timestamp, isTyping }: ChatMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex w-full",
        type === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <Card className={cn(
        "max-w-[80%] p-4 shadow-lg transition-shadow hover:shadow-md",
        type === 'user' 
          ? 'bg-fitPurple-600 text-white rounded-br-none ml-12'
          : 'bg-white dark:bg-fitDark-800 rounded-bl-none mr-12'
      )}>
        {type === 'ai' ? (
          <ReactMarkdown 
            className={cn(
              "prose prose-sm max-w-none",
              "dark:prose-invert",
              "[&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2",
              "[&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1",
              "[&>p]:mb-2 last:[&>p]:mb-0",
              "[&>blockquote]:border-l-4 [&>blockquote]:border-fitPurple-300 [&>blockquote]:pl-4 [&>blockquote]:italic",
              "[&>code]:bg-fitPurple-100 [&>code]:text-fitPurple-700 [&>code]:px-1 [&>code]:rounded"
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
        
        <div className={cn(
          "text-xs mt-2",
          type === 'user' ? 'text-fitPurple-200' : 'text-gray-500 dark:text-gray-400'
        )}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </Card>
    </motion.div>
  );
};

export default ChatMessage;
