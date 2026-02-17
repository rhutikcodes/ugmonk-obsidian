import { AnalogSettings, TaskStatus, Priority } from './types';

export const VIEW_TYPE_ANALOG = 'analog-kanban-view';

export const DEFAULT_SETTINGS: AnalogSettings = {
	filePath: 'Analog/board.md',
	dailyReset: false,
	lastResetDate: '',
	progressIncrement: 25,
	showCompleted: true,
	customTags: [],
};

export const STATUS_MARKERS: Record<TaskStatus, string> = {
	not_started: '[ ]',
	in_progress: '[/]',
	completed: '[x]',
	delegated: '[>]',
};

export const MARKER_TO_STATUS: Record<string, TaskStatus> = {
	'[ ]': 'not_started',
	'[/]': 'in_progress',
	'[x]': 'completed',
	'[>]': 'delegated',
};

export const STATUS_CYCLE: TaskStatus[] = [
	'not_started',
	'in_progress',
	'completed',
	'delegated',
];

export const COLUMN_LABELS = {
	today: 'Today',
	next: 'Next',
	someday: 'Someday',
} as const;

export const PRIORITY_LABELS: Record<Priority, string> = {
	0: 'P0',
	1: 'P1',
	2: 'P2',
	3: 'P3',
};

export const PRIORITY_DESCRIPTIONS: Record<Priority, string> = {
	0: 'Critical',
	1: 'High',
	2: 'Medium',
	3: 'Low',
};

// Deterministic colors for tags based on hash
export const TAG_COLORS = [
	'#7c3aed', // violet
	'#0891b2', // cyan
	'#059669', // emerald
	'#d97706', // amber
	'#dc2626', // red
	'#2563eb', // blue
	'#c026d3', // fuchsia
	'#65a30d', // lime
	'#ea580c', // orange
	'#0d9488', // teal
];
