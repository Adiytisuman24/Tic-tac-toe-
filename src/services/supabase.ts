import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only initialize if we have credentials to avoid Internal Supabase Error crashes
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as unknown as ReturnType<typeof createClient>;

export const EDGE_FN_URL = `${supabaseUrl}/functions/v1/game-action`;

export async function callGameAction<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<{ data: T | null; error: string | null }> {
  if (!supabaseUrl) {
    return { data: null, error: 'Supabase URL not configured' };
  }
  try {
    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ action, ...payload }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return { data: null, error: json.error || 'Unknown error' };
    }
    return { data: json as T, error: null };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}
