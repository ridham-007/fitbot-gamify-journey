
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const PricingTier = ({ 
  name, 
  price, 
  description, 
  features, 
  isPopular,
  isSubscribed 
}: { 
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isSubscribed?: boolean;
}) => {
  const handleCheckout = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error('Please log in to subscribe');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: JSON.stringify({ 
          tier: name, 
          userId: user.id 
        })
      });

      if (error) throw error;
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      toast.error('Failed to start checkout', { description: error.message });
    }
  };

  return (
    <Card className={`flex flex-col ${isPopular ? 'border-2 border-fitPurple-500 shadow-lg scale-105' : ''}`}>
      <CardHeader>
        {isPopular && (
          <div className="px-3 py-1 text-sm text-white bg-fitPurple-500 rounded-full w-fit mb-4">
            Most Popular
          </div>
        )}
        <h3 className="text-2xl font-bold">{name}</h3>
        <div className="flex items-baseline mt-2">
          <span className="text-4xl font-bold">{price}</span>
          <span className="ml-1 text-gray-600 dark:text-gray-400">/month</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-fitPurple-500 mr-2 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={isPopular ? "default" : "outline"}
          onClick={handleCheckout}
          disabled={isSubscribed}
        >
          {isSubscribed ? 'Current Plan' : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Pricing = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscriptionTier?: string | null;
  }>({ subscribed: false });

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { data, error } = await supabase.functions.invoke('check-subscription', {
          body: JSON.stringify({ userId: user.id })
        });

        if (error) throw error;

        setSubscriptionStatus({
          subscribed: data.subscribed,
          subscriptionTier: data.subscriptionTier
        });
      } catch (error) {
        console.error('Failed to check subscription', error);
      }
    };

    checkSubscription();
  }, []);

  const tiers = [
    {
      name: "Basic",
      price: "$0",
      description: "Perfect for getting started with fitness tracking",
      features: [
        "Basic workout tracking",
        "AI workout suggestions",
        "Progress tracking",
        "Public leaderboard access",
        "Basic achievements"
      ]
    },
    {
      name: "Pro",
      price: "$9.99",
      description: "Unlock advanced features for serious fitness enthusiasts",
      features: [
        "Everything in Basic",
        "Advanced AI training plans",
        "Custom workout creation",
        "Premium achievements",
        "Priority support",
        "Exclusive challenges",
        "Progress analytics"
      ],
      isPopular: true
    },
    {
      name: "Elite",
      price: "$19.99",
      description: "The ultimate fitness experience for professionals",
      features: [
        "Everything in Pro",
        "1-on-1 AI coaching",
        "Personalized nutrition plans",
        "VIP challenges",
        "Advanced analytics",
        "Team management",
        "White-label option",
        "24/7 priority support"
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the perfect plan for your fitness journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <PricingTier 
              key={tier.name} 
              {...tier} 
              isSubscribed={subscriptionStatus.subscriptionTier === tier.name}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Satisfaction Guaranteed</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Try FitBot risk-free with our 30-day money-back guarantee. If you're not completely satisfied, we'll refund your subscription, no questions asked.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Pricing;
