import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface StripePricing {
  name: string;
  description: string | null;
  price_amount: number;
  stripe_price_id: string;
}

const formatPrice = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
};

const tierFeatures = {
  Basic: [
    "Basic workout tracking",
    "AI workout suggestions",
    "Progress tracking",
    "Public leaderboard access",
    "Basic achievements"
  ],
  Pro: [
    "Everything in Basic",
    "Advanced AI training plans",
    "Custom workout creation",
    "Premium achievements",
    "Priority support",
    "Exclusive challenges",
    "Progress analytics"
  ],
  Elite: [
    "Everything in Pro",
    "1-on-1 AI coaching",
    "Personalized nutrition plans",
    "VIP challenges",
    "Advanced analytics",
    "Team management",
    "White-label option",
    "24/7 priority support"
  ]
};

const PricingTier = ({ 
  name, 
  price, 
  description, 
  features, 
  isPopular,
  isSubscribed,
  priceId 
}: { 
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isSubscribed?: boolean;
  priceId?: string;
}) => {
  const handleCheckout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: JSON.stringify({ 
          tier: name, 
          userId: user?.id 
        })
      });

      if (error) throw error;
      
      window.location.href = data.url;
    } catch (error) {
      toast.error('Failed to start checkout', { description: error.message });
    }
  };

  const handleSubscribe = async () => {
    if (name === 'Basic') {
      window.location.href = '/signup';
      return;
    }
    
    await handleCheckout();
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
          onClick={handleSubscribe}
          disabled={isSubscribed}
        >
          {isSubscribed ? 'Current Plan' : name === 'Basic' ? 'Sign Up Free' : 'Get Started'}
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
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const { data: products } = useQuery({
    queryKey: ['stripe-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_products')
        .select('*')
        .order('price_amount', { ascending: true });
      
      if (error) throw error;
      return data as StripePricing[];
    }
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setSubscriptionStatus({ subscribed: false });
          return;
        }

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
        setSubscriptionStatus({ subscribed: false });
      }
    };

    if (isLoggedIn) {
      checkSubscription();
    }
  }, [isLoggedIn]);

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
          {products?.map((product, index) => (
            <PricingTier 
              key={product.stripe_price_id}
              name={product.name}
              price={formatPrice(product.price_amount)}
              description={product.description || ''}
              features={tierFeatures[product.name as keyof typeof tierFeatures] || []}
              isPopular={index === 1}
              isSubscribed={isLoggedIn && subscriptionStatus.subscriptionTier === product.name}
              priceId={product.stripe_price_id}
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
