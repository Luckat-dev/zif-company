import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl); // Vérifie dans la console

export const supabase = createClient(supabaseUrl, supabaseAnonKey);