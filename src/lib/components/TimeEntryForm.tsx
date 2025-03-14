import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Project, TimeEntry } from '../types';
import { supabase } from '../supabase';
import { Button } from './ui/Button';

type TimeEntryFormProps = {
	date: Date;
	onSave: () => void;
};

export function TimeEntryForm({ date, onSave }: TimeEntryFormProps) {
	const [projects, setProjects] = useState<Project[]>([]);
	const [entries, setEntries] = useState<TimeEntry[]>([]);
	const [loading, setLoading] = useState(false);
	const [totalHours, setTotalHours] = useState(0);

	useEffect(() => {
		const fetchProjects = async () => {
			const { data } = await supabase
				.from('projects')
				.select('*')
				.order('code');
			setProjects(data || []);
		};
		fetchProjects();
	}, []);

	useEffect(() => {
		const fetchEntries = async () => {
			const { data: user } = await supabase.auth.getUser();
			if (!user.user) return;

			const { data } = await supabase
				.from('time_entries')
				.select('*, project:projects(*)')
				.eq('user_id', user.user.id)
				.eq('date', format(date, 'yyyy-MM-dd'));

			setEntries(data || []);
		};
		fetchEntries();
	}, [date]);

	useEffect(() => {
		const total = entries.reduce((sum, entry) => sum + entry.hours, 0);
		setTotalHours(total);
	}, [entries]);

	const handleAddEntry = () => {
		if (projects.length === 0) return;
		setEntries([
			...entries,
			{
				id: crypto.randomUUID(),
				user_id: '',
				project_id: projects[0].id,
				date: format(date, 'yyyy-MM-dd'),
				hours: 1,
				project: projects[0]
			}
		]);
	};

	const handleUpdateEntry = (index: number, field: keyof TimeEntry, value: any) => {
		const newEntries = [...entries];
		newEntries[index] = {
			...newEntries[index],
			[field]: value,
			project: field === 'project_id'
				? projects.find(p => p.id === value)
				: newEntries[index].project
		};
		setEntries(newEntries);
	};

	const handleRemoveEntry = (index: number) => {
		setEntries(entries.filter((_, i) => i !== index));
	};

	const handleRemoveAll = async () => {
		setLoading(true);
		try {
			const { data: user } = await supabase.auth.getUser();
			if (!user.user) return;

			await supabase
				.from('time_entries')
				.delete()
				.eq('user_id', user.user.id)
				.eq('date', format(date, 'yyyy-MM-dd'));

			setEntries([]);
			onSave();
			alert('工数を削除しました！');
		} catch (error) {
			console.error('Error deleting time entries:', error);
			alert('削除中にエラーが発生しました。');
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setLoading(true);
		try {
			const { data: user } = await supabase.auth.getUser();
			if (!user.user) return;

			await supabase
				.from('time_entries')
				.delete()
				.eq('user_id', user.user.id)
				.eq('date', format(date, 'yyyy-MM-dd'));

			if (entries.length > 0) {
				const { error } = await supabase
					.from('time_entries')
					.insert(
						entries.map(entry => ({
							project_id: entry.project_id,
							user_id: user.user.id,
							date: entry.date,
							hours: entry.hours
						}))
					);

				if (error) throw error;
			}

			onSave();
			alert('工数を保存しました！');
		} catch (error) {
			console.error('Error saving time entries:', error);
			alert('保存中にエラーが発生しました。');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-sm">
				<span>合計時間: {totalHours}h</span>
				<div className="flex items-center space-x-2">
					{entries.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleRemoveAll}
							disabled={loading}
							className="px-2 py-1 text-red-500 hover:text-red-700"
						>
							全て削除
						</Button>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={handleAddEntry}
						className="px-2 py-1"
					>
						＋ 追加
					</Button>
				</div>
			</div>

			<div className="space-y-2">
				{entries.map((entry, index) => (
					<div key={entry.id} className="flex items-center space-x-2">
						<select
							value={entry.project_id}
							onChange={(e) => handleUpdateEntry(index, 'project_id', e.target.value)}
							className="flex-1 px-2 py-1 text-sm border rounded"
						>
							{projects.map(project => (
								<option key={project.id} value={project.id}>
									{project.code}: {project.name}
								</option>
							))}
						</select>

						<select
							value={entry.hours}
							onChange={(e) => handleUpdateEntry(index, 'hours', parseFloat(e.target.value))}
							className="w-20 px-2 py-1 text-sm border rounded"
						>
							{Array.from({ length: 17 }, (_, i) => i * 0.5).map(hours => (
								<option key={hours} value={hours}>
									{hours}h
								</option>
							))}
						</select>

						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleRemoveEntry(index)}
							className="px-2 py-1 text-red-500 hover:text-red-700"
						>
							×
						</Button>
					</div>
				))}
			</div>

			{entries.length > 0 && (
				<Button
					onClick={handleSave}
					disabled={loading}
					className="w-full mt-4"
				>
					{loading ? '保存中...' : '保存'}
				</Button>
			)}
		</div>
	);
} 