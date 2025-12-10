import { createClient } from '@supabase/supabase-js';

console.log("[SUPABASE] Initializing Supabase client...");

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[SUPABASE] URL:", supabaseUrl ? "✓ configured" : "✗ missing");
console.log("[SUPABASE] Key:", supabaseAnonKey ? "✓ configured" : "✗ missing");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[SUPABASE] Missing environment variables!");
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("[SUPABASE] Client created successfully");

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  credits: number;
  plan_tier: 'free' | 'starter' | 'pro';
  created_at: string;
};

export type CreditHistory = {
  id: string;
  user_id: string;
  amount: number;
  action: string;
  description: string;
  created_at: string;
};

export type AnalysisResult = {
  url: string;
  urlHash: string;
  title: string | null;
  price: number | null;
  guarantee: number | null;
  installments: number | null;
  platform: string | null;
  confidence: number;
  conversionScore: number;
  riskScore: number;
  overallScore: number;
  factors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
};
