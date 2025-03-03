import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './ui/Button';

export function Auth() {
	const [loading, setLoading] = useState(false);

	async function handleGoogleLogin() {
		try {
			setLoading(true);

			// Chrome拡張機能のリダイレクトURLを取得
			const redirectUrl = chrome.identity.getRedirectURL();
			console.log('Redirect URL:', redirectUrl);

			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: redirectUrl,
				}
			});

			if (error) throw error;

			// OAuth URL取得後、Chrome拡張機能向けの認証処理
			if (data?.url) {
				chrome.identity.launchWebAuthFlow({
					url: data.url,
					interactive: true
				}, async (callbackUrl) => {
					if (chrome.runtime.lastError || !callbackUrl) {
						console.error('Authentication error:', chrome.runtime.lastError);
						alert('認証中にエラーが発生しました。');
						setLoading(false);
						return;
					}

					// URLからハッシュフラグメントまたはクエリパラメータを抽出
					const params = new URLSearchParams(
						callbackUrl.includes('#')
							? callbackUrl.split('#')[1]
							: callbackUrl.split('?')[1]
					);

					// アクセストークンを処理
					if (params.has('access_token')) {
						const accessToken = params.get('access_token');
						const refreshToken = params.get('refresh_token');

						// セッション設定
						const { error } = await supabase.auth.setSession({
							access_token: accessToken!,
							refresh_token: refreshToken!
						});

						if (error) throw error;
					}

					setLoading(false);
				});
			}
		} catch (error) {
			console.error('Error logging in with Google:', error);
			alert('Google ログインでエラーが発生しました。');
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
			<h1 className="text-2xl font-bold">出勤管理アプリ</h1>
			<p className="text-sm text-center text-gray-600">
				続行するには Google アカウントでログインしてください
			</p>
			<Button
				onClick={handleGoogleLogin}
				disabled={loading}
				className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
			>
				{loading ? 'ログイン中...' : 'Google でログイン'}
			</Button>
		</div>
	);
}