export type Project = {
	id: string;
	name: string;
	code: string;
};

export type TimeEntry = {
	id: string;
	user_id: string;
	project_id: string;
	date: string;
	hours: number;
	project?: Project;
};

export type WorkType = 'home' | 'office' | 'outside' | null; 