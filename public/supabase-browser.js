(function () {
  const config = window.__SUPABASE_CONFIG__ || {};
  const url = config.url;
  const anonKey = config.anonKey;

  if (!window.supabase?.createClient) {
    console.error("Supabase library failed to load.");
    return;
  }

  if (!url || !anonKey) {
    console.error("Supabase public environment variables are not configured.");
    return;
  }

  window.supabaseClient = window.supabase.createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
})();
