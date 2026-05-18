import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

<<<<<<< HEAD
console.log('URL:', supabaseUrl); // Vérifie dans la console

=======
>>>>>>> de44fd0cdbd633a6c9062fdc912a07733cb8395d
export const supabase = createClient(supabaseUrl, supabaseAnonKey);