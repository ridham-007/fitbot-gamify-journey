
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Create a Supabase client using the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse the incoming request body
    const { userId } = await req.json();

    // Fetch user details
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(userId);
    if (userError || !userData.user) throw new Error("User not found");

    const user = userData.user;

    // Find Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    // If no customer found, return not subscribed
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        subscribed: false, 
        subscriptionTier: null,
        subscriptionEnd: null 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;

    // Fetch active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    // If no active subscription, return not subscribed
    if (subscriptions.data.length === 0) {
      return new Response(JSON.stringify({ 
        subscribed: false, 
        subscriptionTier: null,
        subscriptionEnd: null 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Determine subscription tier
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    let subscriptionTier;

    switch(priceId) {
      case 'price_basic':
        subscriptionTier = 'Basic';
        break;
      case 'price_pro':
        subscriptionTier = 'Pro';
        break;
      case 'price_elite':
        subscriptionTier = 'Elite';
        break;
      default:
        subscriptionTier = 'Unknown';
    }

    // Update subscribers table
    await supabaseClient.from('subscribers').upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      subscribed: true,
      subscription_tier: subscriptionTier,
      subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });

    return new Response(JSON.stringify({ 
      subscribed: true, 
      subscriptionTier,
      subscriptionEnd: new Date(subscription.current_period_end * 1000).toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
