import { ItemView, WorkspaceLeaf, Menu, setIcon, TFile, normalizePath } from 'obsidian';
import { VIEW_TYPE_ANALOG, COLUMN_LABELS, PRIORITY_LABELS, PRIORITY_DESCRIPTIONS } from './constants';
import { Task, Subtask, ColumnType, TaskStatus, SubtaskStatus, Priority, AnalogSettings } from './types';
import { TaskStore } from './TaskStore';
import { createTask, createSubtask, nextStatus, nextSubtaskStatus, tagColor, formatDueDisplay, formatEffortDisplay, isOverdue, isDueToday } from './utils';

export class AnalogView extends ItemView {
	private store: TaskStore | null = null;
	private settings: AnalogSettings;
	private boardFilePath: string = '';
	private unsubscribe: (() => void) | null = null;
	private draggedTaskId: string | null = null;

	constructor(leaf: WorkspaceLeaf, settings: AnalogSettings) {
		super(leaf);
		this.settings = settings;
	}

	getViewType(): string { return VIEW_TYPE_ANALOG; }

	getDisplayText(): string {
		if (this.boardFilePath) {
			const name = this.boardFilePath.split('/').pop()?.replace(/\.md$/, '') || 'Board';
			return `Analog: ${name}`;
		}
		return 'Analog Board';
	}

	getIcon(): string { return 'layout-dashboard'; }

	getState(): Record<string, unknown> { return { file: this.boardFilePath }; }

	async setState(state: Record<string, unknown>, result: Record<string, unknown>): Promise<void> {
		if (typeof state.file === 'string' && state.file) {
			this.boardFilePath = state.file;
			await this.initStore();
		}
		await super.setState(state, result);
	}

	private async initStore(): Promise<void> {
		if (this.unsubscribe) { this.unsubscribe(); this.unsubscribe = null; }
		if (!this.boardFilePath) return;

		this.store = new TaskStore(this.app, this.settings, this.boardFilePath);
		await this.store.load();
		this.unsubscribe = this.store.subscribe(() => this.render());

		this.registerEvent(this.app.vault.on('modify', (f) => {
			if (f instanceof TFile && f.path === normalizePath(this.boardFilePath) && this.store && !this.store.isSaving()) {
				this.store.load();
			}
		}));

		this.render();
		this.leaf.updateHeader();
	}

	async onOpen(): Promise<void> {
		if (this.boardFilePath && !this.store) await this.initStore();
		else if (this.store) this.render();
	}

	async onClose(): Promise<void> {
		if (this.unsubscribe) { this.unsubscribe(); this.unsubscribe = null; }
	}

	getStore(): TaskStore | null { return this.store; }

	updateSettings(settings: AnalogSettings): void {
		this.settings = settings;
		if (this.store) this.store.updateSettings(settings);
	}

	// ==================== RENDER ====================

	private render(): void {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass('analog-board-container');
		if (!this.store) { container.createDiv({ cls: 'analog-board', text: 'No board file loaded.' }); return; }

		const board = container.createDiv({ cls: 'analog-board' });
		const state = this.store.getState();
		for (const col of ['today', 'next', 'someday'] as ColumnType[]) {
			this.renderColumn(board, col, state[col]);
		}
	}

	private renderColumn(board: HTMLElement, column: ColumnType, tasks: Task[]): void {
		const colEl = board.createDiv({ cls: `analog-column analog-column-${column}` });
		const header = colEl.createDiv({ cls: 'analog-column-header' });
		header.createEl('h3', { text: COLUMN_LABELS[column] });
		header.createSpan({ cls: 'analog-task-count', text: `${tasks.length}` });

		const list = colEl.createDiv({ cls: 'analog-task-list' });

		// Drag and drop
		list.addEventListener('dragover', (e) => {
			e.preventDefault();
			if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
			list.addClass('analog-drop-active');
			const afterEl = this.getDragAfterElement(list, e.clientY);
			list.querySelector('.analog-drop-indicator')?.remove();
			const dropLine = createDiv({ cls: 'analog-drop-indicator' });
			if (afterEl) list.insertBefore(dropLine, afterEl); else list.appendChild(dropLine);
		});
		list.addEventListener('dragleave', (e) => {
			if (!list.contains(e.relatedTarget as Node)) {
				list.removeClass('analog-drop-active');
				list.querySelector('.analog-drop-indicator')?.remove();
			}
		});
		list.addEventListener('drop', (e) => {
			e.preventDefault();
			list.removeClass('analog-drop-active');
			list.querySelector('.analog-drop-indicator')?.remove();
			if (!this.draggedTaskId) return;
			const afterEl = this.getDragAfterElement(list, e.clientY);
			const insertIndex = afterEl
				? this.store!.getState()[column].findIndex((t) => t.id === afterEl.getAttribute('data-task-id'))
				: this.store!.getState()[column].length;
			this.store!.moveTask(this.draggedTaskId, column, insertIndex);
			this.draggedTaskId = null;
		});

		const visibleTasks = this.settings.showCompleted ? tasks : tasks.filter((t) => t.status !== 'completed');
		for (const task of visibleTasks) this.renderTask(list, task);
		this.renderAddInput(colEl, column);
	}

	// ==================== TASK CARD ====================

	private renderTask(container: HTMLElement, task: Task): void {
		const taskEl = container.createDiv({ cls: `analog-task analog-task-${task.status}` });
		taskEl.setAttribute('data-task-id', task.id);
		taskEl.draggable = true;
		if (task.priority !== null) taskEl.addClass(`analog-priority-${task.priority}`);

		// Drag events
		taskEl.addEventListener('dragstart', (e) => {
			this.draggedTaskId = task.id;
			taskEl.addClass('analog-dragging');
			if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', task.id); }
		});
		taskEl.addEventListener('dragend', () => {
			taskEl.removeClass('analog-dragging');
			this.draggedTaskId = null;
			document.querySelectorAll('.analog-drop-indicator').forEach((el) => el.remove());
			document.querySelectorAll('.analog-drop-active').forEach((el) => el.removeClass('analog-drop-active'));
		});

		// Status circle
		const statusBtn = taskEl.createDiv({ cls: 'analog-status-btn' });
		statusBtn.innerHTML = this.getStatusSVG(task.status);
		statusBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			const newStatus = nextStatus(task.status);
			const updates: Partial<Task> = { status: newStatus };
			if (newStatus === 'in_progress') updates.progress = 0;
			if (newStatus !== 'delegated') updates.delegatedTo = '';
			this.store!.updateTask(task.id, updates);
		});

		const content = taskEl.createDiv({ cls: 'analog-task-content' });

		// Top row: text + priority
		const topRow = content.createDiv({ cls: 'analog-task-top-row' });
		const textEl = topRow.createDiv({ cls: 'analog-task-text', text: task.text });
		if (task.priority !== null) {
			topRow.createSpan({
				cls: `analog-priority-badge analog-priority-badge-${task.priority}`,
				text: PRIORITY_LABELS[task.priority],
			}).setAttribute('aria-label', PRIORITY_DESCRIPTIONS[task.priority]);
		}

		// Meta row: due date + effort + delegation
		const hasMeta = task.dueDate || task.effort || task.delegatedTo;
		if (hasMeta) {
			const metaRow = content.createDiv({ cls: 'analog-task-meta' });
			if (task.dueDate) {
				const dueCls = isOverdue(task.dueDate) ? 'analog-due-badge analog-due-overdue'
					: isDueToday(task.dueDate) ? 'analog-due-badge analog-due-today' : 'analog-due-badge';
				const dueEl = metaRow.createSpan({ cls: dueCls });
				setIcon(dueEl.createSpan({ cls: 'analog-due-icon' }), 'calendar');
				dueEl.createSpan({ text: formatDueDisplay(task.dueDate) });
			}
			if (task.effort) {
				const effortEl = metaRow.createSpan({ cls: 'analog-effort-badge' });
				setIcon(effortEl.createSpan({ cls: 'analog-effort-icon' }), 'clock');
				effortEl.createSpan({ text: formatEffortDisplay(task.effort) });
			}
			if (task.delegatedTo) {
				metaRow.createSpan({ cls: 'analog-delegated-badge', text: task.delegatedTo });
			}
		}

		// Tags
		if (task.tags.length > 0) {
			const tagsRow = content.createDiv({ cls: 'analog-task-tags' });
			for (const tag of task.tags) {
				const chip = tagsRow.createSpan({ cls: 'analog-tag-chip', text: `#${tag}` });
				chip.style.setProperty('--tag-color', tagColor(tag));
				chip.addEventListener('click', (e) => { e.stopPropagation(); this.store!.updateTask(task.id, { tags: task.tags.filter((t) => t !== tag) }); });
			}
		}

		// Description
		if (task.description) {
			const descEl = content.createDiv({ cls: 'analog-task-description', text: task.description });
			descEl.addEventListener('click', (e) => { e.stopPropagation(); this.startDescriptionEdit(taskEl, task); });
		}

		// Subtasks
		if (task.subtasks.length > 0) this.renderSubtasks(content, task);

		// Progress bar
		if (task.status === 'in_progress') {
			const pc = content.createDiv({ cls: 'analog-progress-container' });
			const bar = pc.createDiv({ cls: 'analog-progress-bar' });
			bar.createDiv({ cls: 'analog-progress-fill' }).style.width = `${task.progress}%`;
			pc.createSpan({ cls: 'analog-progress-label', text: `${task.progress}%` });
			bar.addEventListener('click', (e) => { e.stopPropagation(); this.store!.updateTask(task.id, { progress: Math.min(100, task.progress + this.settings.progressIncrement) }); });
		}

		// Notes toggle
		if (task.notes) {
			const notesToggle = content.createDiv({ cls: 'analog-notes-toggle' });
			setIcon(notesToggle, 'message-square');
			notesToggle.addEventListener('click', (e) => {
				e.stopPropagation();
				const existing = taskEl.querySelector('.analog-notes-section');
				if (existing) existing.remove(); else this.renderNotesSection(taskEl, task);
			});
		}

		// Double-click to edit
		textEl.addEventListener('dblclick', (e) => { e.stopPropagation(); this.startInlineEdit(textEl, task); });

		// Context menu
		taskEl.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); this.showContextMenu(e, task); });
	}

	// ==================== SUBTASKS ====================

	private renderSubtasks(content: HTMLElement, task: Task): void {
		const section = content.createDiv({ cls: 'analog-subtasks' });

		// Summary bar
		const done = task.subtasks.filter((s) => s.status === 'completed').length;
		const total = task.subtasks.length;
		const summaryRow = section.createDiv({ cls: 'analog-subtasks-summary' });
		summaryRow.createSpan({ cls: 'analog-subtasks-count', text: `${done}/${total}` });
		const bar = summaryRow.createDiv({ cls: 'analog-subtasks-bar' });
		bar.createDiv({ cls: 'analog-subtasks-bar-fill' }).style.width = total > 0 ? `${(done / total) * 100}%` : '0%';

		// Individual subtasks
		for (const sub of task.subtasks) {
			const row = section.createDiv({ cls: `analog-subtask analog-subtask-${sub.status}` });

			// 3-state status circle (smaller)
			const statusBtn = row.createDiv({ cls: 'analog-subtask-status' });
			statusBtn.innerHTML = this.getSubtaskStatusSVG(sub.status);
			statusBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				const updated = task.subtasks.map((s) =>
					s.id === sub.id ? { ...s, status: nextSubtaskStatus(s.status) } : s
				);
				this.store!.updateTask(task.id, { subtasks: updated });
			});

			// Text
			const textEl = row.createSpan({ cls: 'analog-subtask-text', text: sub.text });

			// Inline badges (compact)
			const hasBadges = sub.priority !== null || sub.effort || sub.delegatedTo;
			if (hasBadges) {
				const badges = row.createSpan({ cls: 'analog-subtask-badges' });
				if (sub.priority !== null) {
					badges.createSpan({ cls: `analog-priority-badge analog-priority-badge-${sub.priority}`, text: PRIORITY_LABELS[sub.priority] });
				}
				if (sub.effort) {
					badges.createSpan({ cls: 'analog-subtask-effort', text: formatEffortDisplay(sub.effort) });
				}
				if (sub.delegatedTo) {
					badges.createSpan({ cls: 'analog-subtask-delegate', text: sub.delegatedTo });
				}
			}

			// Delete × (on hover)
			const delBtn = row.createSpan({ cls: 'analog-subtask-delete', text: '×' });
			delBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				this.store!.updateTask(task.id, { subtasks: task.subtasks.filter((s) => s.id !== sub.id) });
			});

			// Double-click to edit text
			textEl.addEventListener('dblclick', (e) => {
				e.stopPropagation();
				const input = createEl('input', { cls: 'analog-subtask-edit', attr: { type: 'text', value: sub.text } });
				textEl.empty(); textEl.appendChild(input); input.focus(); input.select();
				const finish = () => {
					const newText = input.value.trim();
					if (newText && newText !== sub.text) {
						this.store!.updateTask(task.id, { subtasks: task.subtasks.map((s) => s.id === sub.id ? { ...s, text: newText } : s) });
					} else { this.render(); }
				};
				input.addEventListener('blur', finish);
				input.addEventListener('keydown', (ev) => {
					if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
					if (ev.key === 'Escape') { input.value = sub.text; input.blur(); }
				});
			});

			// Context menu for subtask
			row.addEventListener('contextmenu', (e) => {
				e.preventDefault(); e.stopPropagation();
				this.showSubtaskContextMenu(e, task, sub);
			});
		}

		// Add subtask input
		const addRow = section.createDiv({ cls: 'analog-subtask-add-row' });
		const addInput = addRow.createEl('input', { cls: 'analog-subtask-add-input', attr: { type: 'text', placeholder: '+ subtask...' } });
		addInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				const text = addInput.value.trim();
				if (!text) return;
				this.store!.updateTask(task.id, { subtasks: [...task.subtasks, createSubtask(text)] });
			}
			if (e.key === 'Escape') addInput.blur();
		});
		addInput.addEventListener('click', (e) => e.stopPropagation());
	}

	// ==================== SUBTASK CONTEXT MENU ====================

	private showSubtaskContextMenu(e: MouseEvent, task: Task, sub: Subtask): void {
		const menu = new Menu();
		const updateSub = (updates: Partial<Subtask>) => {
			this.store!.updateTask(task.id, {
				subtasks: task.subtasks.map((s) => s.id === sub.id ? { ...s, ...updates } : s),
			});
		};

		// Priority
		const priorities: { p: Priority | null; label: string }[] = [
			{ p: 0, label: 'P0 - Critical' }, { p: 1, label: 'P1 - High' },
			{ p: 2, label: 'P2 - Medium' }, { p: 3, label: 'P3 - Low' },
			{ p: null, label: 'No Priority' },
		];
		for (const { p, label } of priorities) {
			menu.addItem((item) => item.setTitle(`${label}${sub.priority === p ? ' ✓' : ''}`).setIcon('signal').onClick(() => updateSub({ priority: p })));
		}

		menu.addSeparator();

		// Effort
		const effortOptions = ['5m', '10m', '15m', '20m', '25m', '30m', '45m', '1h', '2h', '3h', '4h'];
		for (const eff of effortOptions) {
			menu.addItem((item) => item.setTitle(`${sub.effort === eff ? '✓ ' : ''}${formatEffortDisplay(eff)}`).setIcon('clock')
				.onClick(() => updateSub({ effort: sub.effort === eff ? '' : eff })));
		}
		if (sub.effort) {
			menu.addItem((item) => item.setTitle('Remove Effort').setIcon('x').onClick(() => updateSub({ effort: '' })));
		}

		menu.addSeparator();

		// Delegate
		menu.addItem((item) => item.setTitle('Delegate...').setIcon('user').onClick(() => {
			const taskEl = this.containerEl.querySelector(`[data-task-id="${task.id}"]`);
			const subRow = taskEl?.querySelectorAll('.analog-subtask')[task.subtasks.indexOf(sub)];
			if (!subRow) return;
			const input = createEl('input', { cls: 'analog-delegate-input', attr: { type: 'text', placeholder: '@person', value: sub.delegatedTo.replace(/^@/, '') } });
			subRow.appendChild(input); input.focus();
			const finish = () => {
				const person = input.value.trim(); input.remove();
				if (person) updateSub({ delegatedTo: person.startsWith('@') ? person : `@${person}` });
			};
			input.addEventListener('blur', finish);
			input.addEventListener('keydown', (ev) => {
				if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
				if (ev.key === 'Escape') { input.value = ''; input.blur(); }
			});
		}));
		if (sub.delegatedTo) {
			menu.addItem((item) => item.setTitle('Remove Delegation').setIcon('x').onClick(() => updateSub({ delegatedTo: '' })));
		}

		menu.addSeparator();
		menu.addItem((item) => item.setTitle('Delete').setIcon('trash').onClick(() => {
			this.store!.updateTask(task.id, { subtasks: task.subtasks.filter((s) => s.id !== sub.id) });
		}));

		menu.showAtMouseEvent(e);
	}

	// ==================== EDITING HELPERS ====================

	private startDescriptionEdit(taskEl: HTMLElement, task: Task): void {
		taskEl.querySelector('.analog-task-description')?.remove();
		taskEl.querySelector('.analog-desc-edit-section')?.remove();
		const content = taskEl.querySelector('.analog-task-content') as HTMLElement;
		if (!content) return;
		const section = content.createDiv({ cls: 'analog-desc-edit-section' });
		const textarea = section.createEl('textarea', { cls: 'analog-desc-textarea' });
		textarea.value = task.description; textarea.placeholder = 'Describe how to do this task...'; textarea.rows = 3;
		textarea.addEventListener('blur', () => { this.store!.updateTask(task.id, { description: textarea.value.trim() }); });
		textarea.addEventListener('keydown', (e) => { if (e.key === 'Escape') textarea.blur(); });
		textarea.focus();
	}

	private renderNotesSection(taskEl: HTMLElement, task: Task): void {
		const section = taskEl.createDiv({ cls: 'analog-notes-section' });
		const textarea = section.createEl('textarea', { cls: 'analog-notes-textarea' });
		textarea.value = task.notes; textarea.placeholder = 'Add notes...'; textarea.rows = 3;
		textarea.addEventListener('blur', () => { this.store!.updateTask(task.id, { notes: textarea.value }); });
		textarea.addEventListener('keydown', (e) => { if (e.key === 'Escape') textarea.blur(); });
		textarea.focus();
	}

	private renderAddInput(column: HTMLElement, columnType: ColumnType): void {
		const inputRow = column.createDiv({ cls: 'analog-add-row' });
		const input = inputRow.createEl('input', { cls: 'analog-add-input', attr: { placeholder: `Add to ${COLUMN_LABELS[columnType]}...`, type: 'text' } });
		const addBtn = inputRow.createDiv({ cls: 'analog-add-btn' });
		setIcon(addBtn, 'plus');
		const submit = () => { const text = input.value.trim(); if (!text) return; this.store!.addTask(createTask(text, columnType)); input.value = ''; input.focus(); };
		input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
		addBtn.addEventListener('click', submit);
	}

	private startInlineEdit(textEl: HTMLElement, task: Task): void {
		const input = createEl('input', { cls: 'analog-inline-edit', attr: { type: 'text', value: task.text } });
		textEl.empty(); textEl.appendChild(input); input.focus(); input.select();
		const finish = () => {
			const newText = input.value.trim();
			if (newText && newText !== task.text) this.store!.updateTask(task.id, { text: newText });
			else this.render();
		};
		input.addEventListener('blur', finish);
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
			if (e.key === 'Escape') { input.value = task.text; input.blur(); }
		});
	}

	// ==================== TASK CONTEXT MENU ====================

	private showContextMenu(e: MouseEvent, task: Task): void {
		const menu = new Menu();

		menu.addItem((item) => item.setTitle('Edit Title').setIcon('pencil').onClick(() => {
			const taskEl = this.containerEl.querySelector(`[data-task-id="${task.id}"]`);
			const textEl = taskEl?.querySelector('.analog-task-text') as HTMLElement;
			if (textEl) this.startInlineEdit(textEl, task);
		}));

		menu.addItem((item) => item.setTitle(task.description ? 'Edit Description' : 'Add Description').setIcon('align-left').onClick(() => {
			const taskEl = this.containerEl.querySelector(`[data-task-id="${task.id}"]`) as HTMLElement;
			if (taskEl) this.startDescriptionEdit(taskEl, task);
		}));

		menu.addItem((item) => item.setTitle(task.notes ? 'Edit Notes' : 'Add Notes').setIcon('message-square').onClick(() => {
			const taskEl = this.containerEl.querySelector(`[data-task-id="${task.id}"]`);
			if (taskEl) { taskEl.querySelector('.analog-notes-section')?.remove(); this.renderNotesSection(taskEl as HTMLElement, task); }
		}));

		menu.addItem((item) => item.setTitle('Add Subtask').setIcon('list-plus').onClick(() => {
			const taskEl = this.containerEl.querySelector(`[data-task-id="${task.id}"]`) as HTMLElement;
			if (!taskEl) return;
			const existing = taskEl.querySelector('.analog-subtask-add-input') as HTMLInputElement;
			if (existing) { existing.focus(); return; }
			const contentEl = taskEl.querySelector('.analog-task-content') as HTMLElement;
			if (contentEl) { this.renderSubtasks(contentEl, task); const inp = taskEl.querySelector('.analog-subtask-add-input') as HTMLInputElement; if (inp) inp.focus(); }
		}));

		menu.addSeparator();

		// Due Date
		menu.addItem((item) => item.setTitle(task.dueDate ? `Due: ${task.dueDate}` : 'Set Due Date...').setIcon('calendar').onClick(() => {
			const taskEl = this.containerEl.querySelector(`[data-task-id="${task.id}"]`) as HTMLElement;
			if (!taskEl) return;
			const existingPicker = taskEl.querySelector('.analog-date-picker-row');
			if (existingPicker) { existingPicker.remove(); return; }
			const row = taskEl.createDiv({ cls: 'analog-date-picker-row' });
			const dateInput = row.createEl('input', { cls: 'analog-date-input', attr: { type: 'date', value: task.dueDate } });
			const clearBtn = row.createEl('button', { text: 'Clear', cls: 'analog-date-clear-btn' });
			dateInput.addEventListener('change', () => { this.store!.updateTask(task.id, { dueDate: dateInput.value }); row.remove(); });
			clearBtn.addEventListener('click', () => { this.store!.updateTask(task.id, { dueDate: '' }); row.remove(); });
			dateInput.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') row.remove(); });
			dateInput.focus(); dateInput.showPicker?.();
		}));
		if (task.dueDate) {
			menu.addItem((item) => item.setTitle('Remove Due Date').setIcon('x').onClick(() => this.store!.updateTask(task.id, { dueDate: '' })));
		}

		menu.addSeparator();

		// Effort
		const effortOptions = ['5m', '10m', '15m', '20m', '25m', '30m', '45m', '1h', '2h', '3h', '4h'];
		for (const eff of effortOptions) {
			menu.addItem((item) => item.setTitle(`${task.effort === eff ? '✓ ' : ''}${formatEffortDisplay(eff)}`).setIcon('clock')
				.onClick(() => this.store!.updateTask(task.id, { effort: task.effort === eff ? '' : eff })));
		}
		menu.addItem((item) => item.setTitle('Custom effort...').setIcon('clock').onClick(() => {
			const taskEl = this.containerEl.querySelector(`[data-task-id="${task.id}"]`) as HTMLElement;
			if (!taskEl) return;
			if (taskEl.querySelector('.analog-effort-input-row')) { taskEl.querySelector('.analog-effort-input-row')!.remove(); return; }
			const row = taskEl.createDiv({ cls: 'analog-effort-input-row' });
			const input = row.createEl('input', { cls: 'analog-effort-input', attr: { type: 'text', placeholder: 'e.g. 45m, 2h, 1.5h', value: task.effort } });
			const finish = () => {
				const val = input.value.trim().toLowerCase().replace(/\s+/g, ''); row.remove();
				if (val && /^\d+(?:\.\d+)?(?:h|m|h\d+m)$/.test(val)) this.store!.updateTask(task.id, { effort: val });
				else if (!val) this.store!.updateTask(task.id, { effort: '' });
			};
			input.addEventListener('blur', finish);
			input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); } if (ev.key === 'Escape') { input.value = task.effort; input.blur(); } });
			input.focus(); input.select();
		}));
		if (task.effort) {
			menu.addItem((item) => item.setTitle('Remove Effort').setIcon('x').onClick(() => this.store!.updateTask(task.id, { effort: '' })));
		}

		menu.addSeparator();

		// Tags
		const allTags = this.getAllTags();
		for (const tag of allTags) {
			const hasTag = task.tags.includes(tag);
			menu.addItem((item) => item.setTitle(`${hasTag ? '✓ ' : ''}#${tag}`).setIcon('tag')
				.onClick(() => this.store!.updateTask(task.id, { tags: hasTag ? task.tags.filter((t) => t !== tag) : [...task.tags, tag] })));
		}
		menu.addItem((item) => item.setTitle('New tag...').setIcon('plus').onClick(() => {
			const taskEl = this.containerEl.querySelector(`[data-task-id="${task.id}"]`) as HTMLElement;
			if (!taskEl) return;
			if (taskEl.querySelector('.analog-new-tag-row')) { taskEl.querySelector('.analog-new-tag-row')!.remove(); return; }
			const row = taskEl.createDiv({ cls: 'analog-new-tag-row' });
			const input = row.createEl('input', { cls: 'analog-new-tag-input', attr: { type: 'text', placeholder: '#new-tag' } });
			const finish = () => {
				const val = input.value.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
				row.remove();
				if (val) {
					if (!task.tags.includes(val)) this.store!.updateTask(task.id, { tags: [...task.tags, val] });
					if (!this.settings.customTags.includes(val)) { this.settings.customTags.push(val); this.saveTagToSettings(val); }
				}
			};
			input.addEventListener('blur', finish);
			input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); } if (ev.key === 'Escape') { input.value = ''; input.blur(); } });
			input.focus();
		}));

		menu.addSeparator();

		// Priority
		const priorities: { p: Priority | null; label: string }[] = [
			{ p: 0, label: 'P0 - Critical' }, { p: 1, label: 'P1 - High' },
			{ p: 2, label: 'P2 - Medium' }, { p: 3, label: 'P3 - Low' },
			{ p: null, label: 'No Priority' },
		];
		for (const { p, label } of priorities) {
			menu.addItem((item) => item.setTitle(`${label}${task.priority === p ? ' ✓' : ''}`).setIcon('signal').onClick(() => this.store!.updateTask(task.id, { priority: p })));
		}

		menu.addSeparator();

		// Move to column
		for (const col of (['today', 'next', 'someday'] as ColumnType[]).filter((c) => c !== task.column)) {
			menu.addItem((item) => item.setTitle(`Move to ${COLUMN_LABELS[col]}`).setIcon('arrow-right').onClick(() => this.store!.moveTask(task.id, col)));
		}

		menu.addSeparator();

		// Delegate
		menu.addItem((item) => item.setTitle('Delegate...').setIcon('user').onClick(() => {
			const taskEl = this.containerEl.querySelector(`[data-task-id="${task.id}"]`);
			if (!taskEl) return;
			const input = createEl('input', { cls: 'analog-delegate-input', attr: { type: 'text', placeholder: '@person', value: task.delegatedTo.replace(/^@/, '') } });
			taskEl.appendChild(input); input.focus();
			const finish = () => {
				const person = input.value.trim(); input.remove();
				if (person) {
					const delegatedTo = person.startsWith('@') ? person : `@${person}`;
					this.store!.updateTask(task.id, { status: 'delegated', delegatedTo });
				}
			};
			input.addEventListener('blur', finish);
			input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); } if (ev.key === 'Escape') { input.value = ''; input.blur(); } });
		}));
		if (task.delegatedTo) {
			menu.addItem((item) => item.setTitle('Remove Delegation').setIcon('user-x').onClick(() => {
				this.store!.updateTask(task.id, { delegatedTo: '', status: 'not_started' });
			}));
		}

		menu.addSeparator();

		menu.addItem((item) => item.setTitle('Delete').setIcon('trash').onClick(() => this.store!.deleteTask(task.id)));

		menu.showAtMouseEvent(e);
	}

	// ==================== HELPERS ====================

	private getAllTags(): string[] {
		const tagSet = new Set<string>(this.settings.customTags);
		const state = this.store!.getState();
		for (const col of ['today', 'next', 'someday'] as ColumnType[]) {
			for (const task of state[col]) for (const t of task.tags) tagSet.add(t);
		}
		return Array.from(tagSet).sort();
	}

	private async saveTagToSettings(_tag: string): Promise<void> {
		const plugin = (this.app as any).plugins?.plugins?.['analog-kanban'];
		if (plugin && typeof plugin.saveSettings === 'function') await plugin.saveSettings();
	}

	private getDragAfterElement(list: HTMLElement, y: number): HTMLElement | null {
		const elements = Array.from(list.querySelectorAll('.analog-task:not(.analog-dragging)')) as HTMLElement[];
		let closest: { offset: number; element: HTMLElement | null } = { offset: Number.POSITIVE_INFINITY, element: null };
		for (const el of elements) {
			const box = el.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			if (offset < 0 && offset > -closest.offset) closest = { offset: -offset, element: el };
		}
		return closest.element;
	}

	// ==================== SVG ICONS ====================

	private getStatusSVG(status: TaskStatus): string {
		const s = 18, cx = s / 2, cy = s / 2, r = 6;
		switch (status) {
			case 'not_started': return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
			case 'in_progress': return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M${cx},${cy - r} A${r},${r} 0 0,1 ${cx},${cy + r} Z" fill="currentColor"/></svg>`;
			case 'completed': return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="currentColor" stroke-width="1.5"/></svg>`;
			case 'delegated': return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M${cx - 2.5},${cy} L${cx + 2.5},${cy} M${cx + 1},${cy - 2} L${cx + 2.5},${cy} L${cx + 1},${cy + 2}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
		}
	}

	private getSubtaskStatusSVG(status: SubtaskStatus): string {
		const s = 14, cx = s / 2, cy = s / 2, r = 4.5;
		switch (status) {
			case 'not_started': return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
			case 'in_progress': return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M${cx},${cy - r} A${r},${r} 0 0,1 ${cx},${cy + r} Z" fill="currentColor"/></svg>`;
			case 'completed': return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="currentColor" stroke-width="1.2"/></svg>`;
		}
	}
}
