import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const EDGE_FN_URL = `${supabaseUrl}/functions/v1/game-action`;

export async function callGameAction<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<{ data: T | null; error: string | null }> {
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
