import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '../supabase';

type MonthlyTimeStatsProps = {
	date: Date;
};

export function MonthlyTimeStats({ date }: MonthlyTimeStatsProps) {
	const [totalHours, setTotalHours] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchMonthlyStats = async () => {
			setLoading(true);
			try {
				const { data: user } = await supabase.auth.getUser();
				if (!user.user) return;

				const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
				const endDate = format(endOfMonth(date), 'yyyy-MM-dd');

				const { data } = await supabase
					.from('time_entries')
					.select('hours')
					.eq('user_id', user.user.id)
					.gte('date', startDate)
					.lte('date', endDate);

				const total = (data || []).reduce((sum, entry) => sum + entry.hours, 0);
				setTotalHours(total);
			} catch (error) {
				console.error('Error fetching monthly stats:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchMonthlyStats();
	}, [date]);

	return (
		<div className="text-sm text-gray-600">
			{loading ? (
				'集計中...'
			) : (
				<span>今月の合計: {totalHours}h</span>
			)}
		</div>
	);
} 