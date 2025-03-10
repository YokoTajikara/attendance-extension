import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar } from './ui/Calendar';
import { Button } from './ui/Button';
import { supabase } from '../../lib/supabase';

type AttendanceRecord = {
	id: string;
	date: string;
	is_attendance: boolean;
};

export function AttendanceManager() {
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [loading, setLoading] = useState(false);
	const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
	const [user, setUser] = useState<any>(null);

	// ユーザー情報の取得
	useEffect(() => {
		const getUser = async () => {
			const { data } = await supabase.auth.getUser();
			setUser(data.user);
		};
		getUser();

		// 認証状態の変更を監視
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				if (event === 'SIGNED_IN') {
					setUser(session?.user ?? null);
				} else if (event === 'SIGNED_OUT') {
					setUser(null);
				}
			}
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	// 出勤記録の取得
	useEffect(() => {
		if (!user) return;

		const fetchAttendanceRecords = async () => {
			const { data, error } = await supabase
				.from('attendance_records')
				.select('id, date, is_attendance')
				.eq('user_id', user.id);

			if (error) {
				console.error('Error fetching attendance records:', error);
				return;
			}

			setAttendanceRecords(data || []);
		};

		fetchAttendanceRecords();
	}, [user]);

	// 日付に出勤記録があるかチェック
	const hasAttendanceRecord = (day: Date) => {
		const formattedDate = format(day, 'yyyy-MM-dd');
		return attendanceRecords.some(record => record.date === formattedDate && record.is_attendance);
	};

	// 出勤記録の登録
	const handleAttendance = async () => {
		if (!date || !user) return;

		setLoading(true);

		try {
			const formattedDate = format(date, 'yyyy-MM-dd');

			// 既存の記録があるか確認
			const existingRecord = attendanceRecords.find(
				record => record.date === formattedDate
			);

			if (existingRecord) {
				// 既存の記録を更新
				const { error } = await supabase
					.from('attendance_records')
					.update({ is_attendance: true })
					.eq('id', existingRecord.id);

				if (error) throw error;
			} else {
				// 新規記録を作成
				const { error } = await supabase
					.from('attendance_records')
					.insert([
						{
							user_id: user.id,
							date: formattedDate,
							is_attendance: true
						}
					]);

				if (error) throw error;
			}

			// 出勤記録を更新
			const { data, error } = await supabase
				.from('attendance_records')
				.select('id, date, is_attendance')
				.eq('user_id', user.id);

			if (error) throw error;

			setAttendanceRecords(data || []);
			alert('出勤記録を登録しました！');

		} catch (error) {
			console.error('Error recording attendance:', error);
			alert('出勤記録の登録中にエラーが発生しました。');
		} finally {
			setLoading(false);
		}
	};

	// ログアウト
	const handleLogout = async () => {
		await supabase.auth.signOut();
	};

	return (
		<div className="flex flex-col p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">出勤管理</h1>
				<Button variant="outline" size="sm" onClick={handleLogout}>
					ログアウト
				</Button>
			</div>

			<div className="border rounded-md">
				<Calendar
					mode="single"
					selected={date}
					onSelect={setDate}
					modifiers={{
						attended: (day) => hasAttendanceRecord(day),
					}}
				/>
			</div>

			<div className="flex flex-col items-center space-y-2">
				<p className="text-center">
					{date ? (
						<>選択日: <span className="font-semibold">{format(date, 'yyyy年MM月dd日 (eee)', { locale: ja })}</span></>
					) : (
						'日付を選択してください'
					)}
				</p>

				<Button
					onClick={handleAttendance}
					disabled={!date || loading}
					variant="success"
					className="w-full"
				>
					{loading ? '登録中...' : '出勤登録'}
				</Button>
			</div>
		</div>
	);
}