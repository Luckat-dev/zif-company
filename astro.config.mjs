import { defineConfig } from 'astro/config';
<<<<<<< HEAD
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    define: {
      'process.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL),
      'process.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY),
    }
  }
=======
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify({
    imageService: false  // ← Ajoute cette ligne
  }),
>>>>>>> de44fd0cdbd633a6c9062fdc912a07733cb8395d
});