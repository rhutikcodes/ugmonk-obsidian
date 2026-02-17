import { App, PluginSettingTab, Setting } from 'obsidian';
import type AnalogPlugin from './main';

export class AnalogSettingTab extends PluginSettingTab {
	plugin: AnalogPlugin;

	constructor(app: App, plugin: AnalogPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Analog Board Settings' });

		new Setting(containerEl)
			.setName('Board file path')
			.setDesc('Path to the markdown file that stores your board data')
			.addText((text) =>
				text
					.setPlaceholder('Analog/board.md')
					.setValue(this.plugin.settings.filePath)
					.onChange(async (value) => {
						this.plugin.settings.filePath = value || 'Analog/board.md';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Daily reset')
			.setDesc('Automatically move incomplete Today tasks to Next at the start of each day')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.dailyReset).onChange(async (value) => {
					this.plugin.settings.dailyReset = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Progress increment')
			.setDesc('How much to increase progress when clicking the progress bar (percentage)')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						'10': '10%',
						'20': '20%',
						'25': '25%',
						'33': '33%',
						'50': '50%',
					})
					.setValue(String(this.plugin.settings.progressIncrement))
					.onChange(async (value) => {
						this.plugin.settings.progressIncrement = parseInt(value, 10);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Show completed tasks')
			.setDesc('Display completed tasks on the board')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showCompleted).onChange(async (value) => {
					this.plugin.settings.showCompleted = value;
					await this.plugin.saveSettings();
				})
			);

		// --- Tags / Categories Section ---
		containerEl.createEl('h2', { text: 'Categories / Tags' });

		// Show existing tags
		const tagsContainer = containerEl.createDiv({ cls: 'analog-settings-tags' });
		this.renderTagsList(tagsContainer);

		// Add new tag
		new Setting(containerEl)
			.setName('Add category')
			.setDesc('Create a new custom category/tag for your tasks')
			.addText((text) => {
				text.setPlaceholder('e.g. work, personal, health...');
				text.inputEl.addEventListener('keydown', async (e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						const val = text.getValue().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
						if (val && !this.plugin.settings.customTags.includes(val)) {
							this.plugin.settings.customTags.push(val);
							await this.plugin.saveSettings();
							text.setValue('');
							this.renderTagsList(tagsContainer);
						}
					}
				});
			})
			.addButton((btn) =>
				btn.setButtonText('Add').onClick(async () => {
					const input = containerEl.querySelector('.analog-settings-tags + .setting-item input') as HTMLInputElement;
					if (!input) return;
					const val = input.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
					if (val && !this.plugin.settings.customTags.includes(val)) {
						this.plugin.settings.customTags.push(val);
						await this.plugin.saveSettings();
						input.value = '';
						this.renderTagsList(tagsContainer);
					}
				})
			);
	}

	private renderTagsList(container: HTMLElement): void {
		container.empty();

		if (this.plugin.settings.customTags.length === 0) {
			container.createEl('p', {
				text: 'No custom categories yet. Add one below.',
				cls: 'setting-item-description',
			});
			return;
		}

		const list = container.createDiv({ cls: 'analog-tags-list' });
		for (const tag of this.plugin.settings.customTags) {
			const row = list.createDiv({ cls: 'analog-tag-row' });
			row.createSpan({ text: `#${tag}`, cls: 'analog-tag-label' });
			const removeBtn = row.createEl('button', { text: '×', cls: 'analog-tag-remove' });
			removeBtn.addEventListener('click', async () => {
				this.plugin.settings.customTags = this.plugin.settings.customTags.filter((t) => t !== tag);
				await this.plugin.saveSettings();
				this.renderTagsList(container);
			});
		}
	}
}
