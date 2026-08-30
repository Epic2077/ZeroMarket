import { createBrowserClient } from "@supabase/ssr";

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

function createMockQueryBuilder() {
  const mock = {
    select: () => mock,
    insert: () => mock,
    update: () => mock,
    delete: () => mock,
    eq: () => mock,
    neq: () => mock,
    gt: () => mock,
    gte: () => mock,
    lt: () => mock,
    lte: () => mock,
    like: () => mock,
    ilike: () => mock,
    in: () => mock,
    is: () => mock,
    order: () => mock,
    limit: () => mock,
    range: () => mock,
    single: async () => ({ data: null, error: { message: "Supabase not configured" } }),
    maybeSingle: async () => ({ data: null, error: { message: "Supabase not configured" } }),
    then: (resolve: any) => resolve({ data: [], error: { message: "Supabase not configured" } }),
  };
  return mock;
}

function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Return a fully functional mock client that returns empty data instead of crashing
    const mockQueryBuilder = createMockQueryBuilder();
    return {
      from: () => mockQueryBuilder,
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
      },
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          remove: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
      rpc: async () => ({ data: null, error: { message: "Supabase not configured" } }),
    } as any;
  }

  supabaseInstance = createBrowserClient(url, anonKey);
  return supabaseInstance;
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    return (client as any)[prop];
  },
});
