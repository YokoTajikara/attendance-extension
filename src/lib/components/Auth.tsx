import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './ui/Button';

export function Auth({ isPopup = true }: { isPopup?: boolean }) {
	const [loading, setLoading] = useState(false);

	async function handleGoogleLogin() {
		if (isPopup) {
			window.open(
				chrome.runtime.getURL('login.html'),
				'GoogleLogin',
				'width=400,height=600'
			);
			return;
		}
		try {
			setLoading(true);

			console.log('[認証] スタート');

			// Chrome拡張機能のリダイレクトURLを取得
			const redirectUrl = chrome.identity.getRedirectURL();
			console.log('[認証] リダイレクトURL:', redirectUrl);

			// scopeにopenidを追加
			const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
				`client_id=986403064183-vchad99v07ql6sgvs0u7md45iini9l3a.apps.googleusercontent.com` +
				`&response_type=id_token token` + // id_tokenを追加
				`&redirect_uri=${encodeURIComponent(redirectUrl)}` +
				`&scope=${encodeURIComponent('openid email profile')}`; // openidを追加

			console.log('[認証] 認証URL:', authUrl);

			chrome.identity.launchWebAuthFlow({
				url: authUrl,
				interactive: true
			}, async (callbackUrl) => {
				console.log('[認証] コールバックURL:', callbackUrl);

				if (chrome.runtime.lastError || !callbackUrl) {
					console.error('[認証] 認証エラー:', chrome.runtime.lastError);
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
				console.log('[認証] id_token:', idToken);

				if (idToken) {
					console.log('[認証] supabase.auth.signInWithIdToken 実行');
					const { error } = await supabase.auth.signInWithIdToken({
						provider: 'google',
						token: idToken,
					});

					if (error) {
						console.error('[認証] supabase認証エラー:', error);
						throw error;
					}
					console.log('[認証] supabase認証成功');
					// ログインウィンドウの場合は閉じる
					if (!isPopup) {
						// ポップアップにログイン完了を通知
						chrome.runtime.sendMessage({ type: 'LOGIN_SUCCESS' });
						window.close();
					}
				}

				setLoading(false);
			});

		} catch (error) {
			console.error('[認証] 例外発生:', error);
			alert('Google ログインでエラーが発生しました。');
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
			<h1 className="text-2xl font-bold">出勤管理アプリ</h1>
			<p className="text-sm text-center text-gray-600">
				続行するには Google アカウントでログインしてください<br />
				ログインウィンドウが開いたら、ログインを完了してください<br />
				ログイン後、再度アイコンをクリックすると勤怠管理ポップアップが表示されます
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