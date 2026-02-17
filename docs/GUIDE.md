# Analog Kanban - User Guide

A three-column Kanban board for Obsidian, inspired by the [Ugmonk Analog](https://ugmonk.com/pages/analog) productivity system. Track tasks across **Today**, **Next**, and **Someday** columns with visual status indicators, priorities, due dates, subtasks, and more -- all stored as plain markdown in your vault.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Analog Philosophy](#the-analog-philosophy)
3. [Adding Tasks](#adding-tasks)
4. [Task Status](#task-status)
5. [Moving Tasks](#moving-tasks)
6. [Editing Tasks](#editing-tasks)
7. [Right-Click Context Menu](#right-click-context-menu)
8. [Priority Levels](#priority-levels)
9. [Due Dates](#due-dates)
10. [Time Effort](#time-effort)
11. [Tags](#tags)
12. [Task Descriptions](#task-descriptions)
13. [Task Notes](#task-notes)
14. [Subtasks](#subtasks)
15. [Delegation](#delegation)
16. [Progress Bar](#progress-bar)
17. [Multi-Board Support](#multi-board-support)
18. [Daily Reset](#daily-reset)
19. [Markdown Format Reference](#markdown-format-reference)
20. [Settings](#settings)
21. [Keyboard Shortcuts](#keyboard-shortcuts)
22. [Tips and Tricks](#tips-and-tricks)

---

## Getting Started

1. **Enable the plugin** in Settings > Community Plugins and activate "Analog".
2. **Open the board** by clicking the dashboard icon in the left ribbon, or use the Command Palette and search for `Analog: Open board`.
3. A default board file is created at `Analog/board.md` in your vault (configurable in settings).
4. The board opens with three columns: **Today**, **Next**, and **Someday**.

That is all you need to begin. Add your first task by typing in the input field at the bottom of any column and pressing Enter.

---

## The Analog Philosophy

The Analog method is built on a simple idea: constrain your daily focus to a short list of commitments. The three columns map to three levels of time horizon:

| Column | Purpose | Guidance |
|--------|---------|----------|
| **Today** | Tasks you commit to finishing today. | Keep this focused. 5-7 tasks maximum is recommended. |
| **Next** | Tasks coming up soon -- your short-term backlog. | Review this column each morning when planning your day. |
| **Someday** | Ideas, wishes, and tasks with no immediate timeline. | Use this as a capture inbox so nothing gets lost. |

The power of the system comes from the daily act of choosing what moves into Today. Everything else stays out of sight and out of mind until you are ready for it.

---

## Adding Tasks

There are two ways to add a task:

### From the board

Type in the input field at the bottom of any column and press **Enter** (or click the **+** button). The task is created with "Not Started" status and appears at the bottom of that column.

### From the Command Palette

Open the Command Palette (`Ctrl/Cmd + P`) and use one of these commands:

- `Analog: Add task to Today`
- `Analog: Add task to Next`
- `Analog: Add task to Someday`

A modal dialog appears where you can type the task text and press Enter or click "Add". This works even when the board is not currently open -- the task is saved to the active board (or the default board if none is open).

---

## Task Status

Every task has one of four statuses, represented by circle icons on the left side of the task card. Click the circle to cycle through the statuses in order:

| Icon | Status | Description |
|------|--------|-------------|
| Empty circle | **Not Started** | Default state for new tasks. |
| Half-filled circle | **In Progress** | Work has begun. A progress bar appears on the card. |
| Filled circle | **Completed** | Task is done. |
| Circle with arrow | **Delegated** | Task has been handed off to someone else. |

Clicking the status icon advances to the next state in the cycle: Not Started > In Progress > Completed > Delegated > Not Started.

---

## Moving Tasks

### Drag and drop

Grab a task card and drag it to a different column. You can also drag to reorder tasks within the same column. A drop indicator line shows where the task will land.

### Context menu

Right-click a task and select **Move to Today**, **Move to Next**, or **Move to Someday** (only columns other than the current one are shown).

---

## Editing Tasks

**Double-click** the task text to enter inline editing mode. The text becomes an input field.

- Press **Enter** to save your changes.
- Press **Escape** to cancel and revert to the original text.

You can also right-click and select **Edit Title** to start editing.

---

## Right-Click Context Menu

Right-clicking a task card opens a comprehensive context menu with the following options:

| Menu Item | Action |
|-----------|--------|
| Edit Title | Start inline editing of the task name |
| Add/Edit Description | Open a text area for multi-line task details |
| Add/Edit Notes | Open or focus the notes section |
| Add Subtask | Create or focus the subtask input |
| Set Due Date | Open a date picker to assign a due date |
| Remove Due Date | Clear the due date (shown only if a date is set) |
| 5 min - 4 hrs | Set a time effort estimate from preset values |
| Custom effort... | Enter a custom effort value (e.g., `1.5h`, `90m`) |
| Remove Effort | Clear the effort estimate (shown only if effort is set) |
| Tags | Toggle existing tags on/off; create new tags |
| P0 - Critical | Set priority to P0 |
| P1 - High | Set priority to P1 |
| P2 - Medium | Set priority to P2 |
| P3 - Low | Set priority to P3 |
| No Priority | Remove the priority level |
| Move to Today/Next/Someday | Move the task to another column |
| Delegate... | Assign the task to a person |
| Remove Delegation | Clear delegation (shown only if delegated) |
| Delete | Permanently remove the task |

---

## Priority Levels

Four priority levels let you visually distinguish urgency:

| Priority | Label | Color | Use Case |
|----------|-------|-------|----------|
| **P0** | Critical | Red left border + red badge | Urgent, do-or-die tasks |
| **P1** | High | Orange left border + orange badge | Important, do soon |
| **P2** | Medium | Blue left border + blue badge | Normal priority work |
| **P3** | Low | Gray left border + gray badge | Nice to have |

Set priority via the right-click context menu. The priority is displayed as:

- A **colored left border** on the task card.
- A small **badge** (e.g., "P1") in the top-right area of the task.

Select "No Priority" to remove the priority level entirely.

---

## Due Dates

### Setting a due date

Right-click a task and select **Set Due Date**. A native date picker appears on the task card. Select a date and it is saved immediately. Click **Clear** or press **Escape** to dismiss the picker without changes.

### Due date display

The due date badge shows a **relative time** label for quick scanning:

| Condition | Display Example |
|-----------|----------------|
| Due today | `Today` |
| Due tomorrow | `Tomorrow` |
| Due yesterday | `Yesterday` |
| Overdue by multiple days | `3d overdue` |
| Due within 7 days | `In 3d` |
| Due beyond 7 days | `Feb 20` |

- **Overdue** dates are highlighted in red.
- **Today's** dates are visually emphasized.

### Removing a due date

Right-click and select **Remove Due Date**, or open the date picker and click **Clear**.

---

## Time Effort

Effort estimates help you plan how much time your day requires. Right-click a task to set an estimate.

### Preset options

| Preset | Display |
|--------|---------|
| `5m` | 5 min |
| `10m` | 10 min |
| `15m` | 15 min |
| `20m` | 20 min |
| `25m` | 25 min |
| `30m` | 30 min |
| `45m` | 45 min |
| `1h` | 1 hr |
| `2h` | 2 hrs |
| `3h` | 3 hrs |
| `4h` | 4 hrs |

### Custom effort

Select **Custom effort...** from the context menu to enter any value. Valid formats include `45m`, `2h`, `1.5h`. The input validates against the pattern before saving.

### Display

Effort appears as a **clock icon badge** on the task card. Selecting an already-active effort value toggles it off. You can also use **Remove Effort** from the context menu to clear it.

---

## Tags

Tags let you categorize tasks across projects or contexts.

### Adding tags

1. **Right-click** a task and select an existing tag from the list to toggle it on.
2. Select **New tag...** to create a tag. Tags are automatically normalized to lowercase, hyphenated format (e.g., "Work Projects" becomes `work-projects`).
3. New tags are saved to your tag library in settings for reuse across all boards.

### Removing tags

Click a tag chip directly on the task card to remove it from that task.

### Tag colors

Tags are assigned a **deterministic color** based on their name -- the same tag always gets the same color. The palette includes violet, cyan, emerald, amber, red, blue, fuchsia, lime, orange, and teal.

### Managing your tag library

Go to Settings > Community Plugins > Analog Kanban. Under "Categories / Tags" you can add new tags or remove existing ones from your library.

---

## Task Descriptions

Descriptions provide space for multi-line details about a task -- instructions, acceptance criteria, links, or any context you need.

### Adding a description

Right-click a task and select **Add Description** (or **Edit Description** if one exists). A text area appears below the task title.

### Editing

Click the description text on the task card to re-open the editor. Changes are saved when the text area loses focus.

### Storage

Descriptions are stored as indented text lines below the task in the markdown file:

```
- [ ] Task name
  Description text goes here
  It can span multiple lines
```

---

## Task Notes

Notes provide a secondary text field for additional context, separate from the description.

### Adding notes

Right-click and select **Add Notes** (or **Edit Notes**). A text area appears at the bottom of the task card.

### Toggling visibility

If a task has notes, a message icon appears on the card. Click it to expand or collapse the notes section.

### Storage

Notes are stored inline in the markdown using the `{notes: text}` syntax at the end of the task line.

---

## Subtasks

Break down complex tasks into smaller steps without cluttering the board.

### Adding subtasks

- Right-click a task and select **Add Subtask**, which focuses the subtask input field.
- Or type directly in the `+ subtask...` input at the bottom of the subtask list and press **Enter**.

### Subtask features

Each subtask has its own set of capabilities:

| Feature | How to Use |
|---------|------------|
| **Status** | Click the circle icon to cycle: Not Started > In Progress > Completed (3 states, no "Delegated" state for subtasks). |
| **Priority** | Right-click the subtask to set P0-P3 or remove priority. |
| **Effort estimate** | Right-click the subtask to choose a preset or custom effort. |
| **Delegation** | Right-click > Delegate... to assign to @person. This is metadata only and does not change the subtask status. |
| **Edit text** | Double-click the subtask text. Press Enter to save, Escape to cancel. |
| **Delete** | Click the x button that appears on hover. |

### Progress indicator

A summary bar at the top of the subtask section shows the completion ratio (e.g., `2/5`) with a visual fill bar.

---

## Delegation

### Delegating a task

Right-click and select **Delegate...**. An input field appears where you type the person's name (with or without the `@` prefix -- it is added automatically).

When you delegate a task:
- The task status changes to **Delegated** (circle with arrow icon).
- A delegation badge showing `@person` appears on the card.

### Delegating a subtask

Right-click a subtask and select **Delegate...**. For subtasks, delegation is **metadata only** -- it does not change the subtask's status cycle.

### Removing delegation

Right-click and select **Remove Delegation**. For tasks, this resets the status back to **Not Started** and clears the delegate name.

---

## Progress Bar

The progress bar appears on tasks with **In Progress** status.

- **Click the bar** to increment progress by the configured amount (default: 25%).
- The percentage label updates with each click (e.g., 0% > 25% > 50% > 75% > 100%).
- Progress caps at 100%.
- The increment amount is configurable in Settings (options: 10%, 20%, 25%, 33%, 50%).

When a task transitions to In Progress, its progress resets to 0%.

---

## Multi-Board Support

You are not limited to a single board. Any `.md` file in your vault with the following YAML frontmatter is treated as an Analog board:

```yaml
---
type: analog-board
---
```

### Creating a new board

1. Open the Command Palette and run `Analog: Create new board`.
2. Enter a file path (e.g., `Boards/work.md`).
3. The plugin creates the file with the required frontmatter and opens it.

### Opening a board

Click any board file in the Obsidian sidebar. The plugin detects the `type: analog-board` frontmatter and automatically opens it in the Analog board view instead of the normal markdown editor.

### Board independence

Each board has its own independent state. Tasks, columns, and data are stored entirely within that board's markdown file.

---

## Daily Reset

An optional feature that helps maintain a fresh daily focus.

### How it works

When enabled, at the start of each new day (when Obsidian opens or the layout loads):

1. **Incomplete** tasks in the Today column (Not Started, In Progress, or Delegated) are moved to the **top** of the Next column.
2. **Completed** tasks remain in Today.
3. This gives you a clean Today column to fill with fresh commitments each morning.

### Enabling daily reset

Go to Settings > Community Plugins > Analog Kanban and toggle **Daily reset** on.

Daily reset runs against the **default board** (the one specified in the "Board file path" setting). The plugin tracks the last reset date to ensure it only runs once per day.

---

## Markdown Format Reference

The board is stored as a standard markdown file. You can edit it directly in any text editor, and the board view syncs automatically when changes are detected.

### Full example

```
---
type: analog-board
date: 2026-02-17
---

## Today
- [ ] Task name {p1} @due(2026-02-20) ~1h #tag-name
  Description text here
  - [ ] Subtask one {p2} ~15m
  - [/] Subtask two (delegated to @person)
  - [x] Subtask three
- [/] In progress task (50%)
- [x] Completed task
- [>] Delegated task (delegated to @sarah)

## Next
- [ ] Future task

## Someday
- [ ] Someday task
```

### Status markers

| Marker | Status |
|--------|--------|
| `[ ]` | Not Started |
| `[/]` | In Progress |
| `[x]` | Completed |
| `[>]` | Delegated |

### Inline metadata syntax

All metadata is appended to the task line after the task text:

| Syntax | Meaning | Example |
|--------|---------|---------|
| `{p0}` to `{p3}` | Priority level | `{p1}` = High priority |
| `@due(YYYY-MM-DD)` | Due date | `@due(2026-02-20)` |
| `~30m`, `~1h`, `~1.5h` | Effort estimate | `~45m` = 45 minutes |
| `(50%)` | Progress percentage (In Progress tasks only) | `(75%)` |
| `#tag-name` | Tag | `#work` `#personal` |
| `(delegated to @person)` | Delegation | `(delegated to @sarah)` |
| `{notes: text}` | Inline notes | `{notes: Check with team first}` |

### Subtask format

Subtasks are indented two spaces under their parent task:

```
- [ ] Parent task
  - [ ] Subtask text {p2} ~15m
  - [/] Another subtask (delegated to @alice)
  - [x] Completed subtask
```

Subtask markers: `[ ]` (Not Started), `[/]` (In Progress), `[x]` (Completed). Subtasks do not support the `[>]` (Delegated) marker -- delegation is expressed with the `(delegated to @person)` syntax instead.

### Description format

Descriptions are indented two spaces under the task line, appearing as plain text (not as list items):

```
- [ ] Task name
  This is the description.
  It can span multiple lines.
  - [ ] This is a subtask (list item under the task)
```

---

## Settings

Access settings via **Settings > Community Plugins > Analog Kanban**.

| Setting | Description | Default |
|---------|-------------|---------|
| **Board file path** | Path to the markdown file that stores your default board data. | `Analog/board.md` |
| **Daily reset** | Automatically move incomplete Today tasks to the top of Next at the start of each day. | Off |
| **Progress increment** | How much to increase progress when clicking the progress bar. Options: 10%, 20%, 25%, 33%, 50%. | 25% |
| **Show completed tasks** | Toggle visibility of completed tasks on the board. | On |
| **Categories / Tags** | Manage your tag library. Add new tags by typing a name and pressing Enter or clicking "Add". Remove tags with the x button. Tags are normalized to lowercase, hyphenated format. | Empty |

---

## Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| **Enter** | Add task input | Submit new task to the column |
| **Enter** | Inline edit / subtask edit | Save changes |
| **Enter** | Date picker, effort input, delegate input, new tag input | Confirm and save |
| **Escape** | Inline edit / subtask edit | Cancel edit, revert to original text |
| **Escape** | Date picker, effort input | Dismiss without saving |
| **Double-click** | Task text | Start inline editing |
| **Double-click** | Subtask text | Start inline editing of the subtask |
| **Click** | Status circle (task) | Cycle through 4 statuses |
| **Click** | Status circle (subtask) | Cycle through 3 statuses |
| **Click** | Tag chip on task card | Remove that tag from the task |
| **Click** | Progress bar | Increment progress |
| **Click** | Notes icon | Toggle notes section |

---

## Tips and Tricks

- **Keep Today focused.** The Analog method recommends no more than approximately 7 tasks in Today. If your list grows beyond that, move lower-priority items to Next.

- **Use Someday as a capture inbox.** When an idea strikes, throw it into Someday immediately. Process it later during a weekly review.

- **Use tags to categorize across projects.** Examples: `#work`, `#personal`, `#health`, `#project-x`. Tags carry consistent colors so they are easy to scan.

- **Edit the markdown file directly for bulk changes.** Open the `.md` file in Obsidian's source mode or any text editor. The board syncs automatically when changes are saved.

- **Create multiple boards for different areas of life.** Use the "Create new board" command to set up separate boards for work, personal projects, a specific project, or anything else. Each board is an independent file.

- **Use subtasks to break down complex work.** Instead of cluttering a column with many small tasks, add subtasks to a single parent task. The progress indicator gives you a quick read on how far along you are.

- **Set effort estimates to plan your day.** Add effort values to your Today tasks and mentally total them up. This prevents overcommitting and helps you make realistic daily plans.

- **Leverage the daily reset.** Enable it in settings to automatically sweep unfinished Today tasks into Next each morning. This forces a deliberate daily planning ritual.

- **Use priorities sparingly.** If everything is P0, nothing is. Reserve Critical for true emergencies and use the priority levels to create meaningful visual distinctions.

- **Delegate and track.** Use the delegation feature to mark tasks you have handed off. The Delegated status and `@person` badge make it easy to see what is waiting on someone else.
