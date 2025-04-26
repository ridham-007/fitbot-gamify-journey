
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Mail, FileText, Shield, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  const helpCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics of using FitBot",
      icon: HelpCircle,
      items: ["Account setup", "Choosing your plan", "First workout"]
    },
    {
      title: "FAQ",
      description: "Common questions answered",
      icon: MessageCircle,
      link: "/faq",
      items: ["Subscription FAQs", "Training FAQs", "Technical FAQs"]
    },
    {
      title: "Contact Support",
      description: "Get in touch with our team",
      icon: Mail,
      link: "/contact",
      items: ["Email support", "Response times", "Priority support"]
    },
    {
      title: "Legal",
      description: "Important documents and policies",
      icon: FileText,
      items: ["Terms of Service", "Privacy Policy", "Data handling"]
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers and get support for all your FitBot questions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <category.icon className="h-6 w-6 text-fitPurple-500" />
                  <CardTitle>{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="text-gray-600 dark:text-gray-400">• {item}</li>
                  ))}
                </ul>
                {category.link && (
                  <Link 
                    to={category.link}
                    className="inline-block mt-4 text-fitPurple-600 hover:text-fitPurple-700 dark:text-fitPurple-400 dark:hover:text-fitPurple-300"
                  >
                    Learn more →
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpCenter;
