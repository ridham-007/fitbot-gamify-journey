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
  features: Array<{
    text: string;
    status: string;
  }>;
}

const formatPrice = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
};

const tierPriceRanks = {
  'Basic': 0,
  'Pro': 1,
  'Elite': 2
};

const PricingTier = ({ 
  name, 
  price, 
  description, 
  features, 
  isPopular,
  isSubscribed,
  currentTier,
  priceId 
}: { 
  name: string;
  price: string;
  description: string;
  features: Array<{ text: string; status: string; }>;
  isPopular?: boolean;
  isSubscribed?: boolean;
  currentTier?: string | null;
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

  const getButtonText = () => {
    if (isSubscribed) return 'Current Plan';
    if (name === 'Basic') return 'Sign Up Free';
    if (!currentTier) return 'Get Started';
    
    const currentRank = tierPriceRanks[currentTier as keyof typeof tierPriceRanks] || 0;
    const newRank = tierPriceRanks[name as keyof typeof tierPriceRanks] || 0;
    
    return newRank > currentRank ? 'Upgrade' : 'Downgrade';
  };

  const handleSubscribe = async () => {
    if (name === 'Basic') {
      window.location.href = '/signup';
      return;
    }
    
    await handleCheckout();
  };

  return (
    <Card className={`flex flex-col ${isPopular ? 'border-2 border-fitPurple-500 shadow-lg scale-105' : ''} ${isSubscribed ? 'ring-2 ring-green-500' : ''}`}>
      <CardHeader>
        {isPopular && (
          <div className="px-3 py-1 text-sm text-white bg-fitPurple-500 rounded-full w-fit mb-4">
            Most Popular
          </div>
        )}
        {isSubscribed && (
          <div className="px-3 py-1 text-sm text-white bg-green-500 rounded-full w-fit mb-4">
            Current Plan
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
              <span className="text-sm">{feature.text}</span>
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
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Pricing = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  const { data: subscriptionStatus = { subscribed: false } } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { subscribed: false };

      const { data: subscriber, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return { subscribed: false };
      }

      return {
        subscribed: subscriber?.subscribed || false,
        subscriptionTier: subscriber?.subscription_tier,
        subscriptionEnd: subscriber?.subscription_end
      };
    },
    enabled: isLoggedIn
  });

  const { data: products } = useQuery({
    queryKey: ['stripe-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_products')
        .select('*')
        .order('price_amount', { ascending: true });
      
      if (error) throw error;
      return data as StripePricing[];
    },
    enabled: isLoggedIn
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    
    checkAuthStatus();
  }, []);

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
              features={product.features || []}
              isPopular={index === 1}
              isSubscribed={isLoggedIn && subscriptionStatus.subscriptionTier === product.name}
              currentTier={subscriptionStatus.subscriptionTier}
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
