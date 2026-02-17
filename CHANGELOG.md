# Changelog

All notable changes to Analog Kanban will be documented in this file.

## 1.0.0 (2026-02-17)

Initial release.

### Features

- Three-column Kanban board with Today, Next, and Someday columns.
- Task status cycling through Not Started, In Progress, Completed, and Delegated states.
- Drag-and-drop support for moving tasks between columns and reordering within a column.
- Inline task editing with support for descriptions and notes.
- Subtasks with three-state status tracking, priority, effort, and delegation fields.
- Due dates with relative display (e.g., "in 3 days", "overdue by 1 day").
- Time effort tracking with preset durations and custom input.
- Priority levels (P0 through P3) with color coding.
- Custom tags with automatically assigned colors.
- Task delegation with @person mentions.
- Progress bar displayed on in-progress tasks.
- Multi-board support configured via markdown frontmatter.
- Daily reset option to move incomplete tasks forward.
- Dark mode support matching the active Obsidian theme.
- Markdown-backed persistence -- all task data is stored in standard markdown files.
- External edit sync via file watcher to detect changes made outside Obsidian.
- Command palette integration for common board actions.
