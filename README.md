---
description: "为 DeepSeek Harness 与兼容桌面宿主提供 Git 提交审查、工作区更改操作和分支切换界面。"
kind: "package-bundle"
---

# dsh-git-workspace

简体中文 | [English](README_EN.md)

## 概要

这个插件在右侧栏提供统一的“审查”页面，用于查看提交历史、文件差异、待推送提交和工作区更改。会话头部的分支入口可以切换本地或远程分支，并可打开完整分支页面。Host 通过 dsh 的 Workspace 与 subprocess 服务执行 Git，浏览器代码不直接运行命令。插件启动时只读取仓库状态，不会自动修改工作区。

## 目录

- [安装](#安装)
- [使用](#使用)
- [安全边界](#安全边界)
- [兼容性](#兼容性)
- [开发与打包](#开发与打包)
- [许可证](#许可证)

-----

<a id="安装"></a>
## 安装

### 从 GitHub 源码安装

需要 Node.js 22.19 或更高版本。

```powershell
git clone https://github.com/monster-30cl/dsh-git-workspace.git
cd dsh-git-workspace
corepack enable
pnpm install
pnpm run check
pnpm pack
```

构建完成后，在桌面端菜单中打开“桌面插件…”，把生成的 `monster-30cl-dsh-git-workspace-0.1.0.tgz` 绝对路径填入安装框并执行安装。Desktop 的保留 profile 由 Electron 独占，不能通过 `dsh plugin --profile desktop` 修改。

安装完成后启用“Git 工作区”插件并重启桌面端。宿主必须已经注册会话对应的 Workspace；普通目录可以打开界面，但 Git 操作会显示该目录不是工作树。

### 从 Release 安装

每个 `v*` 标签会生成一个 `.tgz` Release 附件。下载附件后，在桌面端“桌面插件…”窗口中输入 tarball 的绝对路径，例如 `C:\path\to\monster-30cl-dsh-git-workspace-0.1.0.tgz`，然后执行安装。

-----

<a id="使用"></a>
## 使用

- 在右侧栏开始页点击“审查”，同时查看提交历史和工作区更改。
- 点击提交可以查看文件列表，以及所选文件的前后内容和补丁。
- “代码提交”区域支持提交、提交并推送、拉取、推送、搁置和回滚。
- 点击会话头部的分支名称可以切换分支；菜单末尾可以打开完整分支页面。
- 完整分支页面支持选择 Workspace、刷新分支、新建分支和检出远程分支。

<a id="安全边界"></a>
## 安全边界

提交、推送、拉取、搁置、恢复和分支切换会修改共享 Workspace。插件在执行分支切换前请求确认。回滚未提交文件和删除搁置可能永久丢失数据，请先检查选中的文件。Host 只接受已注册的 Workspace id，并将路径限制在对应 Workspace 内。

-----

<a id="兼容性"></a>
## 兼容性

当前构建面向 DeepSeek Harness Desktop `0.2.1-rc.3` 的客户端服务和图标命名，并已在 JoyinCode 的兼容 Harness 环境中验收。宿主升级后如果右侧栏 seat、设置服务或图标导出发生变化，`pnpm run check` 会拒绝生成不匹配的面板包。这个仓库不保证命令行纯 headless profile 能显示客户端界面。

<a id="开发与打包"></a>
## 开发与打包

```powershell
corepack enable
pnpm install
pnpm run build
pnpm run verify
pnpm run pack:release
```

`packages/controller` 提供 Workspace 范围内的 Git Remote；`packages/panel` 提供右侧审查页、分支菜单和设置注册。`vendor/git-review` 保存组合脚本使用的 dsh 客户端构建输入，`source` 保存对应的可审查源码快照。构建脚本只读取仓库内文件，不依赖维护者机器上的 Harness 路径。

-----

<a id="许可证"></a>
## 许可证

本项目采用 [MIT License](LICENSE)。它包含来自 DeepSeek Harness 的 MIT 许可代码；随包保留原始版权声明。第三方组件清单见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## Model Experience

该 bundle 不向模型注册工具、提示词或上下文。它只提供桌面端 Git 界面与 Host 操作。

## Known Limitations and Deferred Work

插件依赖宿主提供的 Workspace、subprocess、Remote 和右侧栏客户端服务。不同桌面宿主升级这些服务时，可能需要更新兼容适配并重新发布。

<a id="dev-note"></a>
### Dev Note

<details>
<summary>维护说明</summary>

None.

</details>
