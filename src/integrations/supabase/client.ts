// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://owppnnfcmalpomkerqku.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cHBubmZjbWFscG9ta2VycWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzE1ODQsImV4cCI6MjA2NTE0NzU4NH0.IQDK_hgr0s_3RA4-8mRpx6rMweSlK9bCtmD_2KXEpTQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);