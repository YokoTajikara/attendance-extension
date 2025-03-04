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
			console.log('リダイレクトURL:', redirectUrl);

			// scopeにopenidを追加
			const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
				`client_id=986403064183-vchad99v07ql6sgvs0u7md45iini9l3a.apps.googleusercontent.com` +
				`&response_type=id_token token` + // id_tokenを追加
				`&redirect_uri=${encodeURIComponent(redirectUrl)}` +
				`&scope=${encodeURIComponent('openid email profile')}`; // openidを追加

			console.log('認証URL:', authUrl);

			chrome.identity.launchWebAuthFlow({
				url: authUrl,
				interactive: true
			}, async (callbackUrl) => {
				console.log('コールバック結果:', callbackUrl);

				if (chrome.runtime.lastError || !callbackUrl) {
					console.error('認証エラー:', chrome.runtime.lastError);
					alert('認証中にエラーが発生しました。');
					setLoading(false);
					return;
				}

				const params = new URLSearchParams(
					callbackUrl.includes('#')
						? callbackUrl.split('#')[1]
						: callbackUrl.split('?')[1]
				);

				// id_tokenを取得
				const idToken = params.get('id_token');

				if (idToken) {
					const { error } = await supabase.auth.signInWithIdToken({
						provider: 'google',
						token: idToken,
					});

					if (error) throw error;
				}

				setLoading(false);
			});

		} catch (error) {
			console.error('認証エラー:', error);
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