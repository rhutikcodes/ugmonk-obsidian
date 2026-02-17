import { Plugin, WorkspaceLeaf, TFile, normalizePath, Modal, Setting } from 'obsidian';
import { AnalogSettings, ColumnType } from './types';
import { VIEW_TYPE_ANALOG, DEFAULT_SETTINGS } from './constants';
import { TaskStore } from './TaskStore';
import { AnalogView } from './AnalogView';
import { AnalogSettingTab } from './SettingsTab';
import { createTask, formatDate } from './utils';

export default class AnalogPlugin extends Plugin {
	settings: AnalogSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Register the view - each view manages its own store
		this.registerView(VIEW_TYPE_ANALOG, (leaf) => new AnalogView(leaf, this.settings));

		// Ribbon icon opens the default board
		this.addRibbonIcon('layout-dashboard', 'Open Analog Board', () => {
			this.activateView(this.settings.filePath);
		});

		// Commands
		this.addCommand({
			id: 'open-analog-board',
			name: 'Open board',
			callback: () => this.activateView(this.settings.filePath),
		});

		this.addCommand({
			id: 'create-new-board',
			name: 'Create new board',
			callback: () => this.createNewBoard(),
		});

		this.addCommand({
			id: 'add-task-today',
			name: 'Add task to Today',
			callback: () => this.addTaskViaPrompt('today'),
		});

		this.addCommand({
			id: 'add-task-next',
			name: 'Add task to Next',
			callback: () => this.addTaskViaPrompt('next'),
		});

		this.addCommand({
			id: 'add-task-someday',
			name: 'Add task to Someday',
			callback: () => this.addTaskViaPrompt('someday'),
		});

		// Settings tab
		this.addSettingTab(new AnalogSettingTab(this.app, this));

		// Auto-open board view when a file with type: analog-board frontmatter is clicked
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				if (!leaf) return;
				const viewState = leaf.getViewState();
				if (viewState.type === 'markdown') {
					const filePath = viewState.state?.file as string | undefined;
					if (filePath) {
						this.tryConvertToAnalog(leaf, filePath);
					}
				}
			})
		);

		// Daily reset check on the default board
		if (this.settings.dailyReset) {
			this.app.workspace.onLayoutReady(() => {
				// Daily reset only applies to the default board
				const store = new TaskStore(this.app, this.settings, this.settings.filePath);
				store.load().then(() => {
					store.performDailyReset();
				});
			});
		}
	}

	async onunload(): Promise<void> {
		// Views are automatically detached by Obsidian
	}

	/** Try to convert a markdown leaf to an analog board view */
	private async tryConvertToAnalog(leaf: WorkspaceLeaf, filePath: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(normalizePath(filePath));
		if (!(file instanceof TFile)) return;

		// Check if this is an analog board (cache first, then file content fallback)
		let isBoard = false;
		const cache = this.app.metadataCache.getFileCache(file);
		if (cache?.frontmatter?.type === 'analog-board') {
			isBoard = true;
		} else {
			const content = await this.app.vault.cachedRead(file);
			if (/^---\s*\n[\s\S]*?type:\s*analog-board[\s\S]*?\n---/m.test(content)) {
				isBoard = true;
			}
		}

		if (!isBoard) return;

		// Check if there's already an analog view open for this file
		const normalizedPath = normalizePath(filePath);
		const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_ANALOG);
		for (const existing of existingLeaves) {
			const state = existing.getViewState();
			if (state.state?.file === normalizedPath || state.state?.file === filePath) {
				// Found an existing view — reveal it and close the duplicate markdown leaf
				this.app.workspace.revealLeaf(existing);
				leaf.detach();
				return;
			}
		}

		// No existing view — convert this leaf in-place
		leaf.setViewState({
			type: VIEW_TYPE_ANALOG,
			active: true,
			state: { file: filePath },
		});
	}

	async activateView(filePath: string): Promise<void> {
		const { workspace } = this.app;
		const normalizedPath = normalizePath(filePath);

		// Check if there's already an analog view open for this file
		let existingLeaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_ANALOG);
		for (const leaf of leaves) {
			const state = leaf.getViewState();
			if (state.state?.file === normalizedPath || state.state?.file === filePath) {
				existingLeaf = leaf;
				break;
			}
		}

		if (existingLeaf) {
			workspace.revealLeaf(existingLeaf);
		} else {
			const leaf = workspace.getLeaf(false);
			await leaf.setViewState({
				type: VIEW_TYPE_ANALOG,
				active: true,
				state: { file: filePath },
			});
			workspace.revealLeaf(leaf);
		}
	}

	private async createNewBoard(): Promise<void> {
		const modal = new CreateBoardModal(this.app, async (filePath: string) => {
			// Ensure it ends with .md
			if (!filePath.endsWith('.md')) filePath += '.md';

			const normalized = normalizePath(filePath);

			// Ensure parent folder exists
			const folder = normalized.substring(0, normalized.lastIndexOf('/'));
			if (folder) {
				const existingFolder = this.app.vault.getAbstractFileByPath(folder);
				if (!existingFolder) {
					await this.app.vault.createFolder(folder);
				}
			}

			// Create the file with analog-board frontmatter
			const content = [
				'---',
				'type: analog-board',
				`date: ${formatDate(new Date())}`,
				'---',
				'',
				'## Today',
				'',
				'## Next',
				'',
				'## Someday',
				'',
			].join('\n');

			const existing = this.app.vault.getAbstractFileByPath(normalized);
			if (!existing) {
				await this.app.vault.create(normalized, content);
			}

			// Open the new board
			this.activateView(normalized);
		});
		modal.open();
	}

	private async addTaskViaPrompt(column: ColumnType): Promise<void> {
		// Find the active analog view's store, or fall back to default board
		let store = this.getActiveStore();

		if (!store) {
			// Load the default board's store
			store = new TaskStore(this.app, this.settings, this.settings.filePath);
			await store.load();
		}

		const finalStore = store;

		const modal = new AddTaskModal(this.app, column, (text: string) => {
			const task = createTask(text, column);
			finalStore.addTask(task);
		});
		modal.open();
	}

	/** Get the TaskStore from the currently active analog view, if any */
	private getActiveStore(): any {
		const leaf = this.app.workspace.activeLeaf;
		if (leaf?.view instanceof AnalogView) {
			return leaf.view.getStore();
		}
		// Try to find any open analog view
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_ANALOG);
		if (leaves.length > 0) {
			const view = leaves[0].view;
			if (view instanceof AnalogView) {
				return view.getStore();
			}
		}
		return null;
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);

		// Update existing views with new settings
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_ANALOG);
		for (const leaf of leaves) {
			const view = leaf.view;
			if (view instanceof AnalogView) {
				view.updateSettings(this.settings);
			}
		}
	}
}

class CreateBoardModal extends Modal {
	private onSubmit: (filePath: string) => void;

	constructor(app: any, onSubmit: (filePath: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.createEl('h3', { text: 'Create New Analog Board' });

		let inputValue = '';

		new Setting(contentEl)
			.setName('File path')
			.setDesc('Path for the new board file (e.g. Boards/work.md)')
			.addText((text) => {
				text.setPlaceholder('Boards/my-board.md');
				text.inputEl.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						inputValue = text.getValue();
						this.close();
						if (inputValue.trim()) this.onSubmit(inputValue.trim());
					}
				});
				text.onChange((val) => { inputValue = val; });
				setTimeout(() => text.inputEl.focus(), 10);
			});

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText('Create').setCta().onClick(() => {
					this.close();
					if (inputValue.trim()) this.onSubmit(inputValue.trim());
				})
			);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}

class AddTaskModal extends Modal {
	private column: ColumnType;
	private onSubmit: (text: string) => void;

	constructor(app: any, column: ColumnType, onSubmit: (text: string) => void) {
		super(app);
		this.column = column;
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		const label = this.column.charAt(0).toUpperCase() + this.column.slice(1);
		contentEl.createEl('h3', { text: `Add task to ${label}` });

		let inputValue = '';

		new Setting(contentEl)
			.setName('Task')
			.addText((text) => {
				text.setPlaceholder('Enter task...');
				text.inputEl.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						inputValue = text.getValue();
						this.close();
					}
				});
				text.onChange((val) => { inputValue = val; });
				setTimeout(() => text.inputEl.focus(), 10);
			});

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText('Add').setCta().onClick(() => {
					const input = contentEl.querySelector('input');
					if (input) inputValue = input.value;
					this.close();
				})
			);
	}

	onClose(): void {
		const input = this.contentEl.querySelector('input') as HTMLInputElement;
		const text = input?.value?.trim() || '';
		this.contentEl.empty();
		if (text) this.onSubmit(text);
	}
}
