
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: "What is FitBot?",
      answer: "FitBot is an AI-powered fitness platform that combines personalized workout planning with gamification elements to make your fitness journey more engaging and effective."
    },
    {
      question: "How does the subscription work?",
      answer: "We offer different subscription tiers (Basic, Pro, and Elite) with varying features. You can start with our Basic plan for free and upgrade anytime to access premium features."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to your current tier's features until the end of your billing period."
    },
    {
      question: "How does the AI trainer work?",
      answer: "Our AI trainer analyzes your fitness goals, experience level, and preferences to create personalized workout plans. It adapts based on your progress and provides real-time feedback."
    },
    {
      question: "What happens to my data?",
      answer: "We take data privacy seriously. Your personal information and workout data are securely stored and never shared with third parties without your consent. You can read more in our Privacy Policy."
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </MainLayout>
  );
};

export default FAQ;
