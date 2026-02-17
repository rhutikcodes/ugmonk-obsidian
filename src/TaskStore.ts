import { App, TFile, normalizePath } from 'obsidian';
import { Task, BoardState, ColumnType, AnalogSettings } from './types';
import { parseTaskLine, parseSubtaskLine, serializeTaskWithDescription, formatDate } from './utils';

type Listener = () => void;

export class TaskStore {
	private state: BoardState = { today: [], next: [], someday: [] };
	private listeners: Set<Listener> = new Set();
	private app: App;
	private settings: AnalogSettings;
	private filePath: string;
	private saving = false;

	constructor(app: App, settings: AnalogSettings, filePath: string) {
		this.app = app;
		this.settings = settings;
		this.filePath = filePath;
	}

	getFilePath(): string {
		return this.filePath;
	}

	getState(): BoardState {
		return this.state;
	}

	subscribe(listener: Listener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notify(): void {
		this.listeners.forEach((fn) => fn());
	}

	updateSettings(settings: AnalogSettings): void {
		this.settings = settings;
	}

	async load(): Promise<void> {
		const path = normalizePath(this.filePath);
		const file = this.app.vault.getAbstractFileByPath(path);

		if (file instanceof TFile) {
			const content = await this.app.vault.read(file);
			this.state = this.parseMarkdown(content);
		} else {
			this.state = { today: [], next: [], someday: [] };
		}

		this.notify();
	}

	async save(): Promise<void> {
		if (this.saving) return;
		this.saving = true;

		try {
			const path = normalizePath(this.filePath);
			const content = this.serializeMarkdown();

			// Ensure folder exists
			const folder = path.substring(0, path.lastIndexOf('/'));
			if (folder) {
				const existingFolder = this.app.vault.getAbstractFileByPath(folder);
				if (!existingFolder) {
					await this.app.vault.createFolder(folder);
				}
			}

			const file = this.app.vault.getAbstractFileByPath(path);
			if (file instanceof TFile) {
				await this.app.vault.modify(file, content);
			} else {
				await this.app.vault.create(path, content);
			}
		} finally {
			this.saving = false;
		}
	}

	isSaving(): boolean {
		return this.saving;
	}

	parseMarkdown(content: string): BoardState {
		const board: BoardState = { today: [], next: [], someday: [] };
		let currentColumn: ColumnType | null = null;
		let lastTask: Task | null = null;

		const lines = content.split('\n');
		for (const line of lines) {
			const trimmed = line.trim();

			if (trimmed === '## Today') {
				currentColumn = 'today';
				lastTask = null;
				continue;
			} else if (trimmed === '## Next') {
				currentColumn = 'next';
				lastTask = null;
				continue;
			} else if (trimmed === '## Someday') {
				currentColumn = 'someday';
				lastTask = null;
				continue;
			}

			// Indented lines under a task: subtasks or description
			if (lastTask && line.startsWith('  ')) {
				if (trimmed.startsWith('- [')) {
					// Subtask line
					const subtask = parseSubtaskLine(trimmed);
					if (subtask) {
						lastTask.subtasks.push(subtask);
					}
				} else {
					// Description line
					if (lastTask.description) {
						lastTask.description += '\n' + trimmed;
					} else {
						lastTask.description = trimmed;
					}
				}
				continue;
			}

			if (currentColumn && trimmed.startsWith('- [')) {
				const task = parseTaskLine(trimmed, currentColumn);
				if (task) {
					board[currentColumn].push(task);
					lastTask = task;
				}
			} else {
				lastTask = null;
			}
		}

		return board;
	}

	serializeMarkdown(): string {
		const lines: string[] = [];
		lines.push('---');
		lines.push('type: analog-board');
		lines.push(`date: ${formatDate(new Date())}`);
		lines.push('---');
		lines.push('');

		const columns: ColumnType[] = ['today', 'next', 'someday'];
		const labels = { today: 'Today', next: 'Next', someday: 'Someday' };

		for (const col of columns) {
			lines.push(`## ${labels[col]}`);
			for (const task of this.state[col]) {
				lines.push(...serializeTaskWithDescription(task));
			}
			lines.push('');
		}

		return lines.join('\n');
	}

	// --- Mutations ---

	addTask(task: Task): void {
		this.state[task.column].push(task);
		this.notify();
		this.save();
	}

	deleteTask(taskId: string): void {
		for (const col of ['today', 'next', 'someday'] as ColumnType[]) {
			this.state[col] = this.state[col].filter((t) => t.id !== taskId);
		}
		this.notify();
		this.save();
	}

	updateTask(taskId: string, updates: Partial<Task>): void {
		for (const col of ['today', 'next', 'someday'] as ColumnType[]) {
			const task = this.state[col].find((t) => t.id === taskId);
			if (task) {
				Object.assign(task, updates);
				break;
			}
		}
		this.notify();
		this.save();
	}

	moveTask(taskId: string, toColumn: ColumnType, toIndex?: number): void {
		let movedTask: Task | null = null;

		for (const col of ['today', 'next', 'someday'] as ColumnType[]) {
			const idx = this.state[col].findIndex((t) => t.id === taskId);
			if (idx !== -1) {
				movedTask = this.state[col].splice(idx, 1)[0];
				break;
			}
		}

		if (movedTask) {
			movedTask.column = toColumn;
			if (toIndex !== undefined && toIndex >= 0) {
				this.state[toColumn].splice(toIndex, 0, movedTask);
			} else {
				this.state[toColumn].push(movedTask);
			}
			this.notify();
			this.save();
		}
	}

	findTask(taskId: string): Task | undefined {
		for (const col of ['today', 'next', 'someday'] as ColumnType[]) {
			const task = this.state[col].find((t) => t.id === taskId);
			if (task) return task;
		}
		return undefined;
	}

	performDailyReset(): void {
		const today = formatDate(new Date());
		if (this.settings.lastResetDate === today) return;

		// Move incomplete today tasks to next
		const incomplete = this.state.today.filter(
			(t) => t.status !== 'completed'
		);
		const completed = this.state.today.filter(
			(t) => t.status === 'completed'
		);

		for (const task of incomplete) {
			task.column = 'next';
		}

		this.state.today = completed;
		this.state.next = [...incomplete, ...this.state.next];

		this.settings.lastResetDate = today;
		this.notify();
		this.save();
	}
}
