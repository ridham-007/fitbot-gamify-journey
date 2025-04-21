
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch all active products and their prices from Stripe
    const products = await stripe.products.list({ active: true });
    const prices = await stripe.prices.list({ active: true });

    // Create a map of product IDs to their prices
    const productPrices = new Map();
    prices.data.forEach(price => {
      if (price.type === 'recurring') {
        productPrices.set(price.product, price);
      }
    });

    // Prepare products data for insertion
    const productsData = products.data
      .filter(product => productPrices.has(product.id))
      .map(product => {
        const price = productPrices.get(product.id);
        return {
          name: product.name,
          description: product.description,
          stripe_product_id: product.id,
          stripe_price_id: price.id,
          price_amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval || 'month',
          is_active: product.active
        };
      });

    // Upsert products into Supabase
    const { error } = await supabaseClient
      .from('stripe_products')
      .upsert(productsData, { 
        onConflict: 'stripe_product_id',
        ignoreDuplicates: false 
      });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, products: productsData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Sync products error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
