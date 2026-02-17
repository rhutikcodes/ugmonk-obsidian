export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'delegated';

export type SubtaskStatus = 'not_started' | 'in_progress' | 'completed';

export type ColumnType = 'today' | 'next' | 'someday';

export type Priority = 0 | 1 | 2 | 3;

export interface Subtask {
	id: string;
	text: string;
	status: SubtaskStatus;
	priority: Priority | null;
	effort: string;
	delegatedTo: string;
}

export interface Task {
	id: string;
	text: string;
	description: string;
	status: TaskStatus;
	column: ColumnType;
	progress: number;       // 0-100, increments of 25
	priority: Priority | null;
	dueDate: string;        // ISO date string YYYY-MM-DD, or ''
	effort: string;          // time effort e.g. '15m', '1h', '1.5h', or ''
	subtasks: Subtask[];     // nested subtasks
	tags: string[];          // custom category/tags
	delegatedTo: string;    // @person
	notes: string;
}

export interface BoardState {
	today: Task[];
	next: Task[];
	someday: Task[];
}

export interface AnalogSettings {
	filePath: string;
	dailyReset: boolean;
	lastResetDate: string;
	progressIncrement: number;
	showCompleted: boolean;
	customTags: string[];    // user-defined tag library
}
