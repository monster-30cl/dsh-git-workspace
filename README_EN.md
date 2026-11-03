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

- Select Review on the right Sidebar start page to see commit history and working-tree changes together.
- The search box above the history filters commit messages; the author dropdown beside it filters by commit author. Both filters combine, and each can be cleared on its own.
- The header's Date control expands a date range: a start date alone means "on or after that day", an end date alone means "on or before that day", and both bounds mean "between those days". Both bounds include the day they name, filter on Git's commit time, and combine with the other filters.
- Select a commit to inspect its file list, complete before-and-after contents, and patch.
- The Code changes region can commit, commit and push, pull, push, stash, and roll back selected files.
- Select the branch name in the Session header to switch branches; the final menu row opens the full branch page.
- The full branch page selects a Workspace, refreshes branches, creates a branch, and checks out remote branches.

<a id="safety-boundary"></a>
In the commit or commit-and-push message dialog, click “AI 生成提交备注” to generate a Chinese commit message from the selected file diffs using the host’s configured default model. The result remains editable. Closing the dialog, editing the message, or changing the selection cancels the request. Each request supports up to 60 files and truncates long diffs. Generation does not create a commit.

## Safety boundary

Commit, push, pull, stash, restore, and branch switching modify the shared Workspace. The plugin requests confirmation before switching branches. Rolling back uncommitted files and dropping a stash can permanently remove data; inspect the selected files first. The Host accepts only registered Workspace ids and confines paths to the selected Workspace.

-----

<a id="compatibility"></a>
## Compatibility

The current build targets the client services and icon exports in DeepSeek Harness Desktop `0.2.1-rc.3` and has also been accepted in JoyinCode's compatible Harness environment. If a host upgrade changes the right-Sidebar seat, settings service, or icon exports, `pnpm run check` rejects the incompatible panel build. This repository does not provide a client UI in a command-line-only headless profile.

<a id="develop-and-package"></a>
## Develop and package

```powershell
corepack enable
pnpm install
pnpm run build
pnpm run verify
pnpm run pack:release
```

`packages/controller` provides the Workspace-scoped Git Remote. `packages/panel` provides the Review page, branch menu, and settings registration. `vendor/git-review` stores the dsh client build input consumed by the assembler, while `source` stores the corresponding auditable source snapshot. The build reads repository-local files only and does not depend on a maintainer's Harness checkout.

-----

<a id="license"></a>
## License

This project uses the [MIT License](LICENSE). It contains MIT-licensed code from DeepSeek Harness and retains the original copyright notice. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for third-party components.

## Model Experience

This bundle registers no model tools, prompts, or context. It provides only the desktop Git UI and Host operations.

## Known Limitations and Deferred Work

The plugin depends on the host's Workspace, subprocess, Remote, and right-Sidebar client services. A desktop host upgrade can require a compatibility update and a new release.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Maintainer context</summary>

None.

</details>
