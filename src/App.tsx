import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './lib/components/Auth';
import { AttendanceManager } from './lib/components/AttendanceManager';

function App() {
	const [session, setSession] = useState<any>(null);

	useEffect(() => {
		// 現在のセッションを取得
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		// 認証状態の変更を監視
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, []);

	return (
		<div className="w-full h-full max-w-md mx-auto overflow-hidden bg-white" style={{ width: '400px', height: '400px' }}>
			{!session ? <Auth /> : <AttendanceManager />}
		</div>
	);
}

export default App;