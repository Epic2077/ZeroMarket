import { createBrowserClient } from "@supabase/ssr";

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      throw new Error(
        "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!"
      );
    }
    
    supabaseClient = createBrowserClient(url, key);
  }
  return supabaseClient;
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(target, prop) {
    return Reflect.get(getSupabaseClient(), prop);
  },
});
