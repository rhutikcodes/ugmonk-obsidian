# Analog Kanban

**A digital replication of the Ugmonk Analog productivity system for Obsidian.**

Bring the clarity of physical index cards into your Obsidian vault. Analog Kanban renders any markdown file as a three-column Kanban board -- Today, Next, Someday -- with visual task signals, drag-and-drop organization, and full markdown persistence.

No frameworks. No external dependencies. Just your notes, rendered as a board.

![Analog Kanban Screenshot](https://via.placeholder.com/960x540?text=Analog+Kanban+Screenshot)
<!-- Replace with an actual screenshot of the plugin in action -->

---

## Table of Contents

- [Philosophy](#philosophy)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Markdown Format Reference](#markdown-format-reference)
- [Settings](#settings)
- [Project Structure](#project-structure)
- [Building from Source](#building-from-source)
- [Contributing](#contributing)
- [License](#license)

---

## Philosophy

The [Ugmonk Analog](https://ugmonk.com/pages/analog) system is a physical productivity method built around a simple premise: constrain your focus to what matters *today*, keep a short list of what comes *next*, and let everything else live in *someday*.

It uses index cards with hand-drawn status markers -- empty circles, half-filled circles, completed circles, and delegation arrows -- to give you a tactile, intentional relationship with your tasks.

Analog Kanban brings that same philosophy into Obsidian:

- **Three columns, not ten.** Today, Next, Someday. That is the entire system.
- **Visual status signals.** Cycle through Not Started, In Progress, Completed, and Delegated with a single click -- just like marking up a physical card.
- **Markdown-first.** Every board is a plain `.md` file in your vault. Edit it in the board view or in the text editor. The file is the source of truth.
- **No lock-in.** Your tasks are readable markdown. If you stop using this plugin, your data is still there, fully intact and human-readable.

The goal is not to be a full-featured project management tool. It is to be a focused, minimal task board that respects the Analog workflow.

---

## Features

### Three-Column Kanban Board

Tasks are organized across three columns that mirror the Analog card system:

| Column | Purpose |
|--------|---------|
| **Today** | Tasks you are committed to finishing today |
| **Next** | Tasks queued up for the near future |
| **Someday** | Ideas, backlog items, and longer-term tasks |

### Task Status Cycling

Click the circle icon on any task to cycle through four states:

| Icon | Status | Marker |
|------|--------|--------|
| Empty circle | Not Started | `[ ]` |
| Half-filled circle | In Progress | `[/]` |
| Filled circle | Completed | `[x]` |
| Arrow circle | Delegated | `[>]` |

### Progress Tracking

In-progress tasks display a clickable progress bar. Each click increments by a configurable step (default: 25%). Progress is stored inline as `(50%)` in the markdown.

### Drag and Drop

Move tasks between columns and reorder within columns using native HTML5 drag-and-drop. No external libraries required.

### Inline Editing

- **Add tasks** via the inline input at the bottom of each column.
- **Edit task text** by double-clicking on any task title.

### Context Menu

Right-click any task to access:

- Edit title
- Add or edit description
- Add notes
- Add subtask
- Set due date
- Set effort estimate
- Set priority level
- Add tags
- Delegate to a person
- Move to another column
- Delete task

### Priority Levels

Four priority tiers, displayed as a colored left border and badge on each task card:

| Priority | Label | Color |
|----------|-------|-------|
| `{p0}` | Critical | Red |
| `{p1}` | High | Orange |
| `{p2}` | Medium | Blue |
| `{p3}` | Low | Gray |

### Due Dates

Set due dates through a date picker. Dates render as relative labels:

- **Today**, **Tomorrow**, **In 5d**, **Feb 15**
- Overdue tasks display as **3d overdue**

### Time Effort Estimates

Assign effort to any task from preset options:

`5m` | `10m` | `15m` | `20m` | `25m` | `30m` | `45m` | `1h` | `2h` | `3h` | `4h` | Custom

Stored in markdown as `~30m`, `~1h`, or `~1.5h`.

### Tags

Add custom tags to any task. Tags receive auto-generated colors and are stored as `#tag-name` in the markdown. Click a tag to remove it. Define a reusable tag library in the plugin settings.

### Delegation

Mark a task as delegated to a specific person with `@person` syntax. The task status changes to the Delegated state (arrow circle). Remove delegation through the context menu.

### Subtasks

Any task can have nested subtasks with their own:

- Three-state status cycling (Not Started / In Progress / Completed)
- Priority level
- Effort estimate
- Delegation

Add subtasks via the context menu or inline input. Double-click to edit. Subtasks appear as indented items in the markdown.

### Task Notes and Descriptions

- **Descriptions**: Multi-line text displayed beneath the task title. Click to edit.
- **Notes**: Expandable section per task for longer-form context.

### Daily Reset

Optional automatic behavior: when a new day begins, incomplete tasks in the Today column are moved back to Next. Enable this in settings to start each day with a clean slate.

### Multi-Board Support

Any `.md` file in your vault with `type: analog-board` in its YAML frontmatter becomes a board. Create as many boards as you need:

- Duplicate an existing board file
- Use the **"Create new board"** command from the command palette

### External Edit Sync

Edit the underlying markdown file directly in Obsidian's text editor (or any external tool), and the board view updates live through a file watcher.

### Dark Mode

Full integration with Obsidian's light and dark themes. The board adapts automatically.

### Command Palette

Available commands:

| Command | Action |
|---------|--------|
| Open board | Open the default Analog board |
| Add task to Today | Create a new task in the Today column |
| Add task to Next | Create a new task in the Next column |
| Add task to Someday | Create a new task in the Someday column |
| Create new board | Create a new Analog board file |

---

## Installation

### Manual Installation

1. Download the latest release files: `main.js`, `manifest.json`, and `styles.css`.
2. In your Obsidian vault, create the plugin folder:
   ```
   <your-vault>/.obsidian/plugins/analog-kanban/
   ```
3. Copy the three downloaded files into that folder.
4. Open Obsidian and navigate to **Settings > Community Plugins**.
5. Enable **Analog**.

### From Source

See [Building from Source](#building-from-source) below.

---

## Usage

### Creating a Board

**Option A -- Command palette:**
Open the command palette (`Ctrl/Cmd + P`) and run **Analog: Create new board**. This generates a new markdown file with the correct frontmatter.

**Option B -- Manual:**
Create any `.md` file and add this frontmatter:

```yaml
---
type: analog-board
date: 2026-02-17
---
```

Add column headers (`## Today`, `## Next`, `## Someday`) and the file will render as a board.

### Working with Tasks

| Action | How |
|--------|-----|
| Add a task | Type in the input field at the bottom of any column and press `Enter` |
| Edit a task title | Double-click the task text |
| Cycle task status | Click the circle icon to the left of the task |
| Increment progress | Click the progress bar on an in-progress task |
| Move a task | Drag and drop between columns or within a column |
| Access all options | Right-click a task to open the context menu |
| Add a subtask | Right-click a task and select "Add subtask" |
| Edit a subtask | Double-click the subtask text |
| Delete a task | Right-click and select "Delete" |

### Editing the Markdown Directly

Because every board is a standard markdown file, you can switch to Obsidian's source editor at any time to make bulk edits, reorganize tasks, or add metadata by hand. The board view will pick up your changes automatically.

---

## Markdown Format Reference

A board file is a standard markdown document with YAML frontmatter and three second-level headings.

### Full Example

```markdown
---
type: analog-board
date: 2026-02-15
---

## Today
- [ ] Write project proposal
- [/] Review pull requests (50%) #work
  This is a description line
  - [ ] Check frontend changes
  - [x] Check backend changes
- [x] Team standup meeting
- [>] Update docs (delegated to @sarah)

## Next
- [ ] Prepare quarterly report {p1} @due(2026-02-20) ~2h

## Someday
- [ ] Learn Rust {p3}
```

### Status Markers

| Marker | Status |
|--------|--------|
| `- [ ]` | Not Started |
| `- [/]` | In Progress |
| `- [x]` | Completed |
| `- [>]` | Delegated |

### Inline Metadata

All metadata is stored inline within the task line:

| Syntax | Meaning | Example |
|--------|---------|---------|
| `{p0}` to `{p3}` | Priority level | `{p1}` |
| `@due(YYYY-MM-DD)` | Due date | `@due(2026-02-20)` |
| `~<duration>` | Effort estimate | `~30m`, `~1h`, `~1.5h` |
| `(delegated to @person)` | Delegation | `(delegated to @sarah)` |
| `#tag-name` | Tag | `#work`, `#urgent` |
| `(N%)` | Progress percentage | `(50%)` |
| `{notes: text}` | Task notes | `{notes: Follow up Friday}` |

### Subtasks

Subtasks are indented list items directly below a parent task:

```markdown
- [/] Parent task (50%)
  - [ ] Subtask one {p2} ~15m
  - [x] Subtask two
  - [/] Subtask three (delegated to @alex)
```

Subtasks support status markers (`[ ]`, `[/]`, `[x]`), priority, effort, and delegation.

### Descriptions

A non-list line indented beneath a task is treated as its description:

```markdown
- [ ] Design new landing page
  Mockups are in Figma. Focus on mobile-first layout.
```

---

## Settings

Access plugin settings via **Settings > Community Plugins > Analog**.

| Setting | Description | Default |
|---------|-------------|---------|
| Default board path | File path to the board opened by the "Open board" command | -- |
| Daily reset | Automatically move incomplete Today tasks to Next at the start of each day | Off |
| Progress increment | Percentage step for progress bar clicks | 25% |
| Show completed tasks | Toggle visibility of completed tasks on the board | On |
| Tag library | Define a set of reusable tags available across all boards | -- |

---

## Project Structure

```
analog-kanban/
  manifest.json            Plugin metadata (name, version, description)
  package.json             Dependencies and build scripts
  tsconfig.json            TypeScript compiler configuration
  esbuild.config.mjs       esbuild bundler configuration
  styles.css               Ugmonk-inspired visual styling
  src/
    types.ts               Type definitions for tasks, columns, settings
    constants.ts           View type ID, defaults, status markers
    utils.ts               Parsing, serialization, date and effort helpers
    TaskStore.ts           Data layer: markdown parsing, serialization, state management
    AnalogView.ts          Board UI: columns, cards, drag-drop, inline editing
    SettingsTab.ts         Plugin settings panel
    main.ts                Plugin entry point and registration
```

### Architecture Notes

- **No frameworks.** The UI is built with vanilla DOM manipulation using Obsidian's `createDiv`, `createEl`, and `setIcon` utilities.
- **Pub/sub state management.** `TaskStore` holds the board state and notifies subscribers on change. The view performs a full re-render on each state update.
- **Single-file persistence.** Each board is one markdown file. `TaskStore` handles parsing markdown into state and serializing state back to markdown.
- **HTML5 Drag and Drop.** Native browser DnD API with no external drag libraries.
- **File watcher.** External edits to the markdown file trigger a re-parse and re-render.

---

## Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm

### Steps

```bash
# Clone the repository
git clone https://github.com/your-username/analog-kanban.git
cd analog-kanban

# Install dependencies
npm install

# Build for production (outputs main.js)
npm run build

# Or start development mode with file watching
npm run dev
```

### Installing the Build

After building, copy (or symlink) the following files into your vault's plugin directory:

```bash
cp main.js manifest.json styles.css <your-vault>/.obsidian/plugins/analog-kanban/
```

Then enable the plugin in Obsidian's settings.

For active development, you can symlink the entire project directory:

```bash
ln -s /path/to/analog-kanban <your-vault>/.obsidian/plugins/analog-kanban
```

---

## Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Make your changes and test them in an Obsidian vault.
4. Submit a pull request with a clear description of the change.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

**Analog Kanban** is not affiliated with or endorsed by Ugmonk. The Analog system is a product of [Ugmonk](https://ugmonk.com/pages/analog).
