# Contributing to Analog Kanban

Welcome, and thank you for your interest in contributing to Analog Kanban! Whether you are reporting a bug, suggesting a feature, or submitting code, your help is appreciated.

---

## Reporting Bugs

If you encounter a bug, please open a GitHub Issue and include the following information:

- **Steps to reproduce** -- a clear, numbered list of actions that trigger the bug.
- **Expected behavior** -- what you expected to happen.
- **Actual behavior** -- what actually happened, including any error messages or unexpected output.
- **Obsidian version** -- found in Settings > About.
- **Plugin version** -- found in Settings > Community Plugins > Analog Kanban.
- **Operating system** -- Windows, macOS, or Linux (and version if relevant).

Screenshots or screen recordings are helpful when describing visual issues.

---

## Requesting Features

Feature requests are welcome. Please open a GitHub Issue with the title prefixed by `[Feature Request]` and describe:

- The problem or workflow gap you are trying to solve.
- Your proposed solution or idea.
- Any alternatives you have considered.

---

## Development Setup

Follow these steps to set up a local development environment:

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/<your-username>/analog-kanban.git
   cd analog-kanban
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start watch mode**

   ```bash
   npm run dev
   ```

   This will rebuild the plugin automatically whenever you save a source file.

4. **Link the plugin to a test vault**

   Symlink or copy the plugin folder into your test vault's plugin directory:

   ```bash
   ln -s /path/to/analog-kanban /path/to/test-vault/.obsidian/plugins/analog-kanban
   ```

   On Windows, you can use `mklink /D` or simply copy the folder.

5. **Enable the plugin**

   Open your test vault in Obsidian, go to Settings > Community Plugins, and enable "Analog Kanban". You may need to reload the plugin list first.

6. **Open DevTools for debugging**

   Press `Ctrl+Shift+I` (or `Cmd+Option+I` on macOS) inside Obsidian to open the developer tools. Use the Console tab to view logs and errors.

---

## Code Style Guidelines

- **TypeScript only** -- all source code must be written in TypeScript.
- **Vanilla DOM** -- do not use external UI frameworks such as React, Svelte, or Vue. Build the UI with plain DOM manipulation.
- **Use Obsidian API helpers** -- prefer `createDiv`, `createEl`, `setIcon`, and other built-in helpers provided by the Obsidian API rather than raw `document.createElement` calls.
- **Keep the bundle small** -- avoid adding external dependencies unless absolutely necessary. The plugin should remain lightweight.

---

## Project Structure

The source code lives in the `src/` directory with the following layout:

```
src/
  types.ts          -- Shared TypeScript interfaces and type definitions
  constants.ts      -- Static values, defaults, and configuration constants
  utils.ts          -- General-purpose utility functions
  TaskStore.ts      -- Central data store with pub/sub event system
  AnalogView.ts     -- Main Kanban board view and DOM rendering
  SettingsTab.ts    -- Plugin settings UI tab
  main.ts           -- Plugin entry point (onload, onunload, commands)
```

---

## Pull Request Process

1. **Fork** the repository and create a new branch from `main`:

   ```bash
   git checkout -b my-feature main
   ```

2. **Make your changes** on the new branch. Keep commits focused and well-described.

3. **Test manually** -- load the plugin in a test vault, verify your changes work as expected, and confirm that existing functionality is not broken.

4. **Submit a pull request** against `main` with a clear description of:
   - What the PR does.
   - Why the change is needed.
   - How you tested it.

Please keep pull requests small and focused on a single change when possible.

---

## Coding Conventions

- **No external UI frameworks** -- all rendering is done with vanilla DOM calls and Obsidian API helpers.
- **Full re-render pattern** -- when the data changes, the view clears its container and re-renders the entire board. This keeps the rendering logic simple and predictable.
- **Pub/sub via TaskStore** -- components subscribe to changes through the `TaskStore` event system rather than passing callbacks directly. When tasks are added, updated, or moved, `TaskStore` notifies all subscribers so they can re-render.

---

Thank you for contributing to Analog Kanban!
