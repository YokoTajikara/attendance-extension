import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar } from './ui/Calendar';
import { Button } from './ui/Button';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { MonthlyTimeStats } from './MonthlyTimeStats';
import { TimeEntryForm } from './TimeEntryForm';

type WorkType = 'home' | 'office' | 'outside' | null;

type AttendanceRecord = {
	id: string;
	date: string;
	is_attendance: boolean;
	work_type: WorkType;
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
				.select('id, date, is_attendance, work_type')
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

	// 出勤記録の登録・解除
	const handleAttendance = async (workType: WorkType = null) => {
		if (!date || !user) return;

		setLoading(true);

		try {
			const formattedDate = format(date, 'yyyy-MM-dd');
			const isAttended = hasAttendanceRecord(date);

			// 既存の記録があるか確認
			const existingRecord = attendanceRecords.find(
				record => record.date === formattedDate
			);

			if (existingRecord) {
				// 既存の記録を更新
				const { error } = await supabase
					.from('attendance_records')
					.update({
						is_attendance: !isAttended,
						work_type: !isAttended ? workType : null
					})
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
							is_attendance: true,
							work_type: workType
						}
					]);

				if (error) throw error;
			}

			// 出勤記録を更新
			const { data, error } = await supabase
				.from('attendance_records')
				.select('id, date, is_attendance, work_type')
				.eq('user_id', user.id);

			if (error) throw error;

			setAttendanceRecords(data || []);

			if (isAttended) {
				alert('出勤記録を解除しました！');
			} else {
				const workTypeText = {
					home: '在宅勤務',
					office: '出社',
					outside: '外出'
				}[workType!];
				alert(`${workTypeText}として登録しました！`);
			}

		} catch (error) {
			console.error('Error recording attendance:', error);
			alert('処理中にエラーが発生しました。');
		} finally {
			setLoading(false);
		}
	};

	// 現在の勤務形態を取得
	const getCurrentWorkType = (): WorkType => {
		if (!date) return null;
		const formattedDate = format(date, 'yyyy-MM-dd');
		const record = attendanceRecords.find(record => record.date === formattedDate);
		return record?.work_type ?? null;
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

			<div className="border rounded-md calendar-container">
				<Calendar
					mode="single"
					selected={date}
					onSelect={(newDate) => setDate(newDate || date)}
					getWorkType={(day) => {
						const formattedDate = format(day, 'yyyy-MM-dd');
						const record = attendanceRecords.find(
							record => record.date === formattedDate && record.is_attendance
						);
						return record?.work_type ?? null;
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

				<div className="w-full grid grid-cols-4 gap-2">
					<Button
						onClick={() => handleAttendance('home')}
						disabled={loading}
						className={cn(
							"text-sm py-1",
							hasAttendanceRecord(date!) && getCurrentWorkType() === 'home'
								? "button-work-home"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						)}
					>
						{loading ? '...' : '在宅'}
					</Button>
					<Button
						onClick={() => handleAttendance('office')}
						disabled={loading}
						className={cn(
							"text-sm py-1",
							hasAttendanceRecord(date!) && getCurrentWorkType() === 'office'
								? "button-work-office"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						)}
					>
						{loading ? '...' : '出社'}
					</Button>
					<Button
						onClick={() => handleAttendance('outside')}
						disabled={loading}
						className={cn(
							"text-sm py-1",
							hasAttendanceRecord(date!) && getCurrentWorkType() === 'outside'
								? "button-work-outside"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						)}
					>
						{loading ? '...' : '外出'}
					</Button>
					{hasAttendanceRecord(date!) && (
						<Button
							onClick={() => handleAttendance()}
							disabled={loading}
							className="text-sm py-1 button-attendance-cancel"
						>
							{loading ? '...' : '解除'}
						</Button>
					)}
				</div>

				{date && (
					<div className="w-full border-t pt-4 mt-4">
						<MonthlyTimeStats date={date} />
						<TimeEntryForm
							date={date}
							onSave={() => {
								// 工数保存後の処理（必要に応じて）
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}