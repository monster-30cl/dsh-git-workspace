---
description: "Git commit review, working-tree actions, and branch switching for DeepSeek Harness and compatible desktop hosts."
kind: "package-bundle"
---

# dsh-git-workspace

[简体中文](README.md) | English

## Summary

This plugin adds one Review page to the right Sidebar for commit history, file diffs, pending pushes, and working-tree changes. A branch entry in the Session header switches local or remote branches and opens the full branch page. The Host executes Git through the dsh Workspace and subprocess services; browser code does not run commands. Activation reads repository state but does not modify the Workspace automatically.

## Table of Contents

- [Install](#install)
- [Use the plugin](#use-the-plugin)
- [Safety boundary](#safety-boundary)
- [Compatibility](#compatibility)
- [Develop and package](#develop-and-package)
- [License](#license)

-----

<a id="install"></a>
## Install

### Install from a GitHub checkout

Node.js 22.19 or later is required.

```powershell
git clone https://github.com/monster-30cl/dsh-git-workspace.git
cd dsh-git-workspace
corepack enable
pnpm install
pnpm run check
pnpm pack
```

After the build, open **Desktop Plugins…** from the application menu, enter the absolute path of the generated `monster-30cl-dsh-git-workspace-0.1.0.tgz`, and install it. Electron exclusively owns Desktop's reserved profile, so `dsh plugin --profile desktop` cannot modify it.

Enable the Git Workspace plugin and restart Desktop after installation. The host must register the Session's Workspace. The UI can open for an ordinary directory, but Git operations report that the directory is not a worktree.

### Install from a Release

Each `v*` tag produces a `.tgz` Release asset. Download it, enter its absolute path, such as `C:\path\to\monster-30cl-dsh-git-workspace-0.1.0.tgz`, in the **Desktop Plugins…** window, and install it.

-----

<a id="use-the-plugin"></a>
## Use the plugin

### Commit history and filters

- Select Review on the right Sidebar start page to see commit history and working-tree changes together.
- The search box filters commit messages, and the author dropdown filters commit authors. Combine either with a date range, or clear each filter independently.
- Select Date to expand the date fields. A start date alone means “on or after that day”; an end date alone means “on or before that day”; both dates define an inclusive range. Filtering uses Git's commit time.
- The calendar follows the interface theme and supports month navigation, Today, and clearing an individual date. It appears in the top layer and adjusts its position near window edges. Click outside or press Esc to dismiss the calendar.
- The × button beside the date fields clears both selected dates and keeps the fields expanded. If both dates are already empty, it does not reload the history.
- Select a commit to inspect its file list, complete before-and-after contents, and patch. Use Ctrl+wheel to zoom comparison text; the additional modifier selected in settings (Alt by default) also works. Both code panes synchronize horizontal and vertical scrolling by default; the header’s sync-scrolling button enables or disables both directions together.

### Working-tree changes and commit messages

- The Code changes region supports commit, commit and push, pull, push, stash, and rollback. File checkboxes determine the selected operation's scope.
- The untracked-files list is collapsed by default and shows its file count. Untracked files cannot be selected for a commit. Select the + action (Add to version control) on a file to stage it and move it to Changes, where it becomes eligible for commit. Select all, batch operations, and AI messages use only selected files in Changes.
- Rolling back a newly added, uncommitted file removes it from the index and preserves its contents, returning it to the untracked list. Existing files are still restored to the last commit.
- Enter a message when committing, committing and pushing, or stashing. When a message from the previous successful operation is available, use the fill button to reuse it.
- In the commit or commit-and-push message dialog, select the sparkle icon beside the title to generate a message for the selected changes. Its tooltip reads “AI 生成提交备注” (AI-generated commit message). A loading icon appears during generation; the result fills the input and remains editable before you confirm the commit.
- Generation uses the host's configured default model to write a Chinese message from the selected file list and diffs. Generating a message does not commit, push, or change the Git index.
- Closing the dialog, changing file selections, or editing the message cancels the old request to prevent it from overwriting newer input. Failures show a reason; retry or enter a message manually.

### Branch operations

- Select the branch name in the Session header to switch branches; the final menu row opens the full branch page.
- The full branch page selects a Workspace, refreshes branches, creates a branch, and checks out remote branches.

-----

<a id="safety-boundary"></a>
## Safety boundary

Commit, push, pull, stash, restore, and branch switching modify the shared Workspace. The plugin requests confirmation before switching branches. Rolling back uncommitted files and dropping a stash can permanently remove data; inspect the selected files first. The Host accepts only registered Workspace ids and confines paths to the selected Workspace.

Only selecting the AI generation icon sends the selected file list and diffs to the provider behind the default model. Review the generated message before confirming the commit.

-----

<a id="compatibility"></a>
## Compatibility

The current build targets the client services and icon exports in DeepSeek Harness Desktop `0.2.1-rc.3` and has also been accepted in JoyinCode's compatible Harness environment. AI generation requires the host LLM service and a configured default model. If unavailable, the dialog reports the reason and still allows manual messages. `pnpm run check` checks panel registration, AI interface wiring, and Remote type identifiers; it does not replace startup verification in the actual host or a real model call. This repository does not provide a client UI in a command-line-only headless profile.

<a id="develop-and-package"></a>
## Develop and package

```powershell
corepack enable
pnpm install
pnpm run build
pnpm run verify
pnpm run pack:release
```

`packages/controller` provides the Workspace-scoped Git Remote. `packages/panel` provides the Review page, branch menu, and settings registration. `source/git-workspace-controller` builds the Host controller. The calendar and AI commit-message components in `source/git-review/client` are compiled into the client bundle. `vendor/git-review` stores the remaining dsh client build input consumed by the assembler and must stay in sync with its corresponding `source` files. The build reads repository-local files only and does not depend on a maintainer's Harness checkout.

-----

<a id="license"></a>
## License

This project uses the [MIT License](LICENSE). It contains MIT-licensed code from DeepSeek Harness and retains the original copyright notice. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for third-party components.

## Model Experience

This bundle provides the desktop Git UI and Host operations. It registers no tools with the session model and does not automatically start a conversation. Selecting the AI icon makes a separate model request using the selected diffs to generate a Chinese commit message; that request does not edit code or create a Git commit.

## Known Limitations and Deferred Work

The plugin depends on the host's Workspace, subprocess, Remote, and right-Sidebar client services. A desktop host upgrade can require a compatibility update and a new release.

AI messages support up to 60 files per request. Long diffs are truncated; binary files contribute file information rather than binary contents. Requests have a 90-second timeout. Generated messages may omit details, so check them against the actual changes. Output, cost, and availability depend on the configured model provider.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Maintainer context</summary>

None.

</details>
