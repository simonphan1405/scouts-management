const { createBrowserClient } = require('@supabase/ssr');
require('dotenv').config({ path: '.env' });
const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('scouts').select('*', { count: 'exact', head: true }).then(console.log).catch(console.error);
