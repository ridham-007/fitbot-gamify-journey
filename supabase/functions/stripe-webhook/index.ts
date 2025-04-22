
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    logStep("Received event", { type: event.type });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get customer's email and metadata
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer || customer.deleted) {
          throw new Error("Customer not found or deleted");
        }

        const email = customer.email;
        if (!email) {
          throw new Error("Customer email not found");
        }

        // Get user_id from customer metadata or lookup by email
        let userId = customer.metadata?.userId;
        
        if (!userId) {
          // Try to find user_id by email
          const { data: userData } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();
          
          userId = userData?.id;
        }

        // Determine subscription status and tier
        const isActive = subscription.status === 'active';
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        
        let subscriptionTier;
        if (amount <= 999) {
          subscriptionTier = "Basic";
        } else if (amount <= 1999) {
          subscriptionTier = "Pro";
        } else {
          subscriptionTier = "Elite";
        }

        // Update subscribers table
        await supabaseClient.from("subscribers").upsert({
          email: email,
          user_id: userId,
          stripe_customer_id: customerId,
          subscribed: isActive,
          subscription_tier: isActive ? subscriptionTier : null,
          subscription_end: isActive ? new Date(subscription.current_period_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

        logStep("Updated subscription", { 
          email,
          userId,
          subscriptionTier,
          isActive,
          event: event.type 
        });
        break;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    logStep("Error processing webhook", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
