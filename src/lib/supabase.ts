import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseの接続情報を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が設定されているか確認
if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Supabase URLまたはAnon Keyが環境変数に設定されていません。');
}

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey);