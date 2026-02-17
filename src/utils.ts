import { Task, Subtask, TaskStatus, SubtaskStatus, ColumnType, Priority } from './types';
import { MARKER_TO_STATUS, STATUS_MARKERS, TAG_COLORS } from './constants';

let idCounter = 0;

export function generateId(): string {
	return `task-${Date.now()}-${idCounter++}`;
}

export function formatDate(date: Date): string {
	return date.toISOString().split('T')[0];
}

export function tagColor(tag: string): string {
	let hash = 0;
	for (let i = 0; i < tag.length; i++) {
		hash = ((hash << 5) - hash + tag.charCodeAt(i)) | 0;
	}
	return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function isOverdue(dueDate: string): boolean {
	if (!dueDate) return false;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const due = new Date(dueDate + 'T00:00:00');
	return due < today;
}

export function isDueToday(dueDate: string): boolean {
	if (!dueDate) return false;
	return dueDate === formatDate(new Date());
}

export function formatDueDisplay(dueDate: string): string {
	if (!dueDate) return '';
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const due = new Date(dueDate + 'T00:00:00');
	const diffMs = due.getTime() - today.getTime();
	const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Tomorrow';
	if (diffDays === -1) return 'Yesterday';
	if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
	if (diffDays <= 7) return `In ${diffDays}d`;

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${months[due.getMonth()]} ${due.getDate()}`;
}

export function formatEffortDisplay(effort: string): string {
	if (!effort) return '';
	const hm = effort.match(/^(\d+(?:\.\d+)?)h(\d+m)?$/);
	if (hm) {
		const hours = parseFloat(hm[1]);
		const mins = hm[2] ? parseInt(hm[2], 10) : 0;
		if (hours === 1 && !mins) return '1 hr';
		if (mins) return `${Math.floor(hours)}h ${mins}m`;
		if (hours % 1 !== 0) return `${hours} hrs`;
		return `${hours} hrs`;
	}
	const m = effort.match(/^(\d+)m$/);
	if (m) return `${m[1]} min`;
	return effort;
}

// --- Inline metadata extraction helpers ---

function extractPriority(raw: string): { priority: Priority | null; rest: string } {
	const m = raw.match(/\{p([0-3])\}/);
	if (m) return { priority: parseInt(m[1], 10) as Priority, rest: raw.replace(m[0], '').trim() };
	return { priority: null, rest: raw };
}

function extractEffort(raw: string): { effort: string; rest: string } {
	const m = raw.match(/~(\d+(?:\.\d+)?(?:h|m|h\d+m))/);
	if (m) return { effort: m[1], rest: raw.replace(m[0], '').trim() };
	return { effort: '', rest: raw };
}

function extractDelegation(raw: string): { delegatedTo: string; rest: string } {
	const m = raw.match(/\(delegated to (@\w+)\)/);
	if (m) return { delegatedTo: m[1], rest: raw.replace(m[0], '').trim() };
	return { delegatedTo: '', rest: raw };
}

// --- Task parsing ---

export function parseTaskLine(line: string, column: ColumnType): Task | null {
	const match = line.match(/^- \[(.)\] (.+)$/);
	if (!match) return null;

	const marker = `[${match[1]}]`;
	const status = MARKER_TO_STATUS[marker];
	if (!status) return null;

	let rawText = match[2];
	let progress = 0;
	let notes = '';
	const tags: string[] = [];

	const p = extractPriority(rawText); rawText = p.rest;
	const d = rawText.match(/@due\((\d{4}-\d{2}-\d{2})\)/);
	let dueDate = '';
	if (d) { dueDate = d[1]; rawText = rawText.replace(d[0], '').trim(); }
	const ef = extractEffort(rawText); rawText = ef.rest;

	const notesMatch = rawText.match(/\{notes: (.+)\}$/);
	if (notesMatch) { notes = notesMatch[1]; rawText = rawText.replace(notesMatch[0], '').trim(); }

	const progressMatch = rawText.match(/\((\d+)%\)/);
	if (progressMatch) { progress = parseInt(progressMatch[1], 10); rawText = rawText.replace(progressMatch[0], '').trim(); }

	const del = extractDelegation(rawText); rawText = del.rest;

	const tagRegex = /#([\w-]+)/g;
	let tagMatch;
	while ((tagMatch = tagRegex.exec(rawText)) !== null) tags.push(tagMatch[1]);
	rawText = rawText.replace(/#[\w-]+/g, '').trim();

	return {
		id: generateId(), text: rawText, description: '', status, column,
		progress, priority: p.priority, dueDate, effort: ef.effort,
		subtasks: [], tags, delegatedTo: del.delegatedTo, notes,
	};
}

// --- Subtask parsing ---
// Format: - [ ] text {p1} ~30m (delegated to @person)

const SUBTASK_STATUS_MAP: Record<string, SubtaskStatus> = { ' ': 'not_started', '/': 'in_progress', 'x': 'completed' };
const SUBTASK_MARKERS: Record<SubtaskStatus, string> = { not_started: '[ ]', in_progress: '[/]', completed: '[x]' };

export function parseSubtaskLine(line: string): Subtask | null {
	const match = line.match(/^- \[([ /x])\] (.+)$/);
	if (!match) return null;

	const status = SUBTASK_STATUS_MAP[match[1]] || 'not_started';
	let rawText = match[2];

	const p = extractPriority(rawText); rawText = p.rest;
	const ef = extractEffort(rawText); rawText = ef.rest;
	const del = extractDelegation(rawText); rawText = del.rest;

	return {
		id: generateId(), text: rawText.trim(), status,
		priority: p.priority, effort: ef.effort, delegatedTo: del.delegatedTo,
	};
}

export function serializeSubtask(sub: Subtask): string {
	const marker = SUBTASK_MARKERS[sub.status];
	let line = `  - ${marker} ${sub.text}`;
	if (sub.priority !== null) line += ` {p${sub.priority}}`;
	if (sub.effort) line += ` ~${sub.effort}`;
	if (sub.delegatedTo) line += ` (delegated to ${sub.delegatedTo})`;
	return line;
}

// --- Task serialization ---

export function serializeTask(task: Task): string {
	const marker = STATUS_MARKERS[task.status];
	let line = `- ${marker} ${task.text}`;

	if (task.priority !== null) line += ` {p${task.priority}}`;
	if (task.dueDate) line += ` @due(${task.dueDate})`;
	if (task.effort) line += ` ~${task.effort}`;
	if (task.status === 'in_progress' && task.progress > 0) line += ` (${task.progress}%)`;
	if (task.status === 'delegated' && task.delegatedTo) line += ` (delegated to ${task.delegatedTo})`;
	if (task.tags.length > 0) line += ' ' + task.tags.map((t) => `#${t}`).join(' ');
	if (task.notes) line += ` {notes: ${task.notes}}`;

	return line;
}

export function serializeTaskWithDescription(task: Task): string[] {
	const lines: string[] = [serializeTask(task)];

	if (task.description) {
		for (const dl of task.description.split('\n')) lines.push(`  ${dl}`);
	}

	for (const sub of task.subtasks) lines.push(serializeSubtask(sub));

	return lines;
}

// --- Factories ---

export function createTask(text: string, column: ColumnType): Task {
	return {
		id: generateId(), text, description: '', status: 'not_started', column,
		progress: 0, priority: null, dueDate: '', effort: '',
		subtasks: [], tags: [], delegatedTo: '', notes: '',
	};
}

export function createSubtask(text: string): Subtask {
	return {
		id: generateId(), text, status: 'not_started',
		priority: null, effort: '', delegatedTo: '',
	};
}

export function nextStatus(current: TaskStatus): TaskStatus {
	const cycle: TaskStatus[] = ['not_started', 'in_progress', 'completed', 'delegated'];
	return cycle[(cycle.indexOf(current) + 1) % cycle.length];
}

export function nextSubtaskStatus(current: SubtaskStatus): SubtaskStatus {
	const cycle: SubtaskStatus[] = ['not_started', 'in_progress', 'completed'];
	return cycle[(cycle.indexOf(current) + 1) % cycle.length];
}
