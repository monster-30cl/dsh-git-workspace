import { stripVTControlCharacters } from "node:util";
import z from "@deepseek-ai/schemastery";
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/index.js
/** Workspace-scoped Git branch discovery and checkout over Typert Remote. */
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** Workspace-scoped Git branch controller. */
let GitWorkspaceController = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _list_decorators;
	let _checkout_decorators;
	let _checkoutRemote_decorators;
	let _create_decorators;
	let _delete_decorators;
	let _log_decorators;
	let _commitFiles_decorators;
	let _commitDiff_decorators;
	let _workingDiff_decorators;
	let _pendingPush_decorators;
	let _status_decorators;
	let _stash_decorators;
	let _commit_decorators;
	let _push_decorators;
	let _pull_decorators;
	let _stashCreate_decorators;
	let _rollback_decorators;
	let _stashFiles_decorators;
	let _stashPop_decorators;
	let _stashDrop_decorators;
	return class GitWorkspaceController extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_list_decorators = [Remote("list")];
			_checkout_decorators = [Remote("checkout")];
			_checkoutRemote_decorators = [Remote("checkoutRemote")];
			_create_decorators = [Remote("create")];
			_delete_decorators = [Remote("delete")];
			_log_decorators = [Remote("log")];
			_commitFiles_decorators = [Remote("commitFiles")];
			_commitDiff_decorators = [Remote("commitDiff")];
			_workingDiff_decorators = [Remote("workingDiff")];
			_pendingPush_decorators = [Remote("pendingPush")];
			_status_decorators = [Remote("status")];
			_stash_decorators = [Remote("stash")];
			_commit_decorators = [Remote("commit")];
			_push_decorators = [Remote("push")];
			_pull_decorators = [Remote("pull")];
			_stashCreate_decorators = [Remote("stashCreate")];
			_rollback_decorators = [Remote("rollback")];
			_stashFiles_decorators = [Remote("stashFiles")];
			_stashPop_decorators = [Remote("stashPop")];
			_stashDrop_decorators = [Remote("stashDrop")];
			__esDecorate(this, null, _list_decorators, {
				kind: "method",
				name: "list",
				static: false,
				private: false,
				access: {
					has: (obj) => "list" in obj,
					get: (obj) => obj.list
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _checkout_decorators, {
				kind: "method",
				name: "checkout",
				static: false,
				private: false,
				access: {
					has: (obj) => "checkout" in obj,
					get: (obj) => obj.checkout
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _checkoutRemote_decorators, {
				kind: "method",
				name: "checkoutRemote",
				static: false,
				private: false,
				access: {
					has: (obj) => "checkoutRemote" in obj,
					get: (obj) => obj.checkoutRemote
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _create_decorators, {
				kind: "method",
				name: "create",
				static: false,
				private: false,
				access: {
					has: (obj) => "create" in obj,
					get: (obj) => obj.create
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _delete_decorators, {
				kind: "method",
				name: "delete",
				static: false,
				private: false,
				access: {
					has: (obj) => "delete" in obj,
					get: (obj) => obj.delete
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _log_decorators, {
				kind: "method",
				name: "log",
				static: false,
				private: false,
				access: {
					has: (obj) => "log" in obj,
					get: (obj) => obj.log
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _commitFiles_decorators, {
				kind: "method",
				name: "commitFiles",
				static: false,
				private: false,
				access: {
					has: (obj) => "commitFiles" in obj,
					get: (obj) => obj.commitFiles
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _commitDiff_decorators, {
				kind: "method",
				name: "commitDiff",
				static: false,
				private: false,
				access: {
					has: (obj) => "commitDiff" in obj,
					get: (obj) => obj.commitDiff
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _workingDiff_decorators, {
				kind: "method",
				name: "workingDiff",
				static: false,
				private: false,
				access: {
					has: (obj) => "workingDiff" in obj,
					get: (obj) => obj.workingDiff
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _pendingPush_decorators, {
				kind: "method",
				name: "pendingPush",
				static: false,
				private: false,
				access: {
					has: (obj) => "pendingPush" in obj,
					get: (obj) => obj.pendingPush
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _status_decorators, {
				kind: "method",
				name: "status",
				static: false,
				private: false,
				access: {
					has: (obj) => "status" in obj,
					get: (obj) => obj.status
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _stash_decorators, {
				kind: "method",
				name: "stash",
				static: false,
				private: false,
				access: {
					has: (obj) => "stash" in obj,
					get: (obj) => obj.stash
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _commit_decorators, {
				kind: "method",
				name: "commit",
				static: false,
				private: false,
				access: {
					has: (obj) => "commit" in obj,
					get: (obj) => obj.commit
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _push_decorators, {
				kind: "method",
				name: "push",
				static: false,
				private: false,
				access: {
					has: (obj) => "push" in obj,
					get: (obj) => obj.push
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _pull_decorators, {
				kind: "method",
				name: "pull",
				static: false,
				private: false,
				access: {
					has: (obj) => "pull" in obj,
					get: (obj) => obj.pull
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _stashCreate_decorators, {
				kind: "method",
				name: "stashCreate",
				static: false,
				private: false,
				access: {
					has: (obj) => "stashCreate" in obj,
					get: (obj) => obj.stashCreate
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _rollback_decorators, {
				kind: "method",
				name: "rollback",
				static: false,
				private: false,
				access: {
					has: (obj) => "rollback" in obj,
					get: (obj) => obj.rollback
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _stashFiles_decorators, {
				kind: "method",
				name: "stashFiles",
				static: false,
				private: false,
				access: {
					has: (obj) => "stashFiles" in obj,
					get: (obj) => obj.stashFiles
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _stashPop_decorators, {
				kind: "method",
				name: "stashPop",
				static: false,
				private: false,
				access: {
					has: (obj) => "stashPop" in obj,
					get: (obj) => obj.stashPop
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _stashDrop_decorators, {
				kind: "method",
				name: "stashDrop",
				static: false,
				private: false,
				access: {
					has: (obj) => "stashDrop" in obj,
					get: (obj) => obj.stashDrop
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		config = __runInitializers(this, _instanceExtraInitializers);
		static inject = ["workspaceRegistry", "subprocess"];
		static Config = z.object({
			maxOutputBytes: z.number().step(1).min(4096).max(4 * 1024 * 1024).default(256 * 1024),
			maxCommitFileBytes: z.number().step(1).min(4096).max(64 * 1024 * 1024).default(8 * 1024 * 1024),
			terminationGraceMs: z.number().step(1).min(1).max(3e4).default(1e3),
			maxLogCommits: z.number().step(1).min(10).max(500).default(200)
		});
		/** @param ctx - Host context carrying Workspace and subprocess services. */
		constructor(ctx, config) {
			super(ctx, "gitWorkspaceController", { namespace: "gitWorkspace" });
			this.config = config;
		}
		/**
		* Read local, remote-tracking, and checked-out branches for one Workspace.
		* @param request - target Workspace.
		* @param signal - carrier cancellation.
		* @returns repository absence or the complete branch lists.
		*/
		async list(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const inside = await this.git(workspace, ["rev-parse", "--is-inside-work-tree"], signal, "list");
			if (inside.exitCode !== 0 || inside.stdout.trim() !== "true") return { repository: false };
			const result = await this.git(workspace, [
				"for-each-ref",
				"--format=%(refname)%00%(refname:short)%00%(HEAD)%00%(symref)",
				"refs/heads",
				"refs/remotes"
			], signal, "list");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "list", result);
			const rows = result.stdout.split(/\r?\n/u).filter(Boolean).map((line) => {
				const [ref = "", branch = "", marker = "", symref = ""] = line.split("\0");
				return {
					ref,
					branch,
					current: marker.trim() === "*",
					symbolic: symref !== ""
				};
			}).filter((row) => row.branch !== "");
			const current = rows.find((row) => row.current)?.branch;
			return {
				repository: true,
				localBranches: rows.filter((row) => row.ref.startsWith("refs/heads/")).map((row) => row.branch),
				remoteBranches: rows.filter((row) => row.ref.startsWith("refs/remotes/") && !row.symbolic).map((row) => row.branch),
				...current === void 0 ? {} : { current },
				detached: current === void 0
			};
		}
		/**
		* Check out one existing local branch in the Workspace directory.
		* @param request - target Workspace and exact branch name.
		* @param signal - carrier cancellation.
		* @returns refreshed local branch state.
		*/
		async checkout(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const result = await this.git(workspace, [
				"switch",
				"--",
				request.branch
			], signal, "checkout");
			if (result.exitCode !== 0 && wouldOverwriteLocalChanges(result.stderr)) throw new RemoteError("git/worktree-dirty", "Local changes would be overwritten by the branch switch.", {
				workspaceId: workspace.id,
				operation: "checkout",
				branch: request.branch
			});
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "checkout", result);
			return await this.list(request, signal);
		}
		/** Create a tracking local branch from one remote-tracking branch and check it out.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Checked-out branch and the refreshed local and remote branch lists.
		*/
		async checkoutRemote(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const result = await this.git(workspace, [
				"switch",
				"--track",
				request.branch
			], signal, "checkout-remote");
			if (result.exitCode !== 0 && wouldOverwriteLocalChanges(result.stderr)) throw new RemoteError("git/worktree-dirty", "Local changes would be overwritten by the branch switch.", {
				workspaceId: workspace.id,
				operation: "checkout-remote",
				branch: request.branch
			});
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "checkout-remote", result);
			return await this.list(request, signal);
		}
		/**
		* Create and check out one local branch in the Workspace directory.
		* @param request - target Workspace and proposed branch name.
		* @param signal - carrier cancellation.
		* @returns refreshed local branch state.
		*/
		async create(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const result = await this.git(workspace, [
				"switch",
				"-c",
				request.branch
			], signal, "create");
			if (result.exitCode !== 0 && wouldOverwriteLocalChanges(result.stderr)) throw new RemoteError("git/worktree-dirty", "Local changes would be overwritten by the branch switch.", {
				workspaceId: workspace.id,
				operation: "create",
				branch: request.branch
			});
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "create", result);
			return await this.list(request, signal);
		}
		/** Safely delete one merged local branch; Git refuses the current or unmerged branch.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Branch lists after deleting the requested local branch.
		*/
		async delete(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const result = await this.git(workspace, [
				"branch",
				"-d",
				"--",
				request.branch
			], signal, "delete");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "delete", result);
			return await this.list(request, signal);
		}
		/**
		* Read one bounded page of commit history for one Workspace.
		* @param request - target Workspace, page bounds, and optional subject and author filters.
		* @param signal - carrier cancellation.
		* @returns repository absence or the page with the checked-out branch.
		*/
		async log(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const inside = await this.git(workspace, ["rev-parse", "--is-inside-work-tree"], signal, "log");
			if (inside.exitCode !== 0 || inside.stdout.trim() !== "true") return { repository: false };
			const branch = await this.git(workspace, ["branch", "--show-current"], signal, "log");
			if (branch.exitCode !== 0 || branch.truncated) this.failed(workspace, "log", branch);
			const skip = Math.max(0, Math.trunc(request.skip ?? 0));
			const limit = Math.min(Math.max(1, Math.trunc(request.limit ?? 50)), this.config.maxLogCommits);
			const args = [
				"log",
				"--pretty=format:%H%x1f%h%x1f%an%x1f%ae%x1f%aI%x1f%s%x1e",
				"-n",
				String(limit + 1)
			];
			if (skip > 0) args.push("--skip", String(skip));
			const search = request.search?.trim() ?? "";
			const author = request.author?.trim() ?? "";
			// Both pattern options are case-insensitive and literal: the reader types
			// a message fragment or picks a name, never a regular expression.
			if (search !== "" || author !== "") args.push("-i", "-F");
			if (search !== "") args.push(`--grep=${search}`);
			if (author !== "") args.push(`--author=${author}`);
			// Git compares these bounds with the commit's own timestamp, while the
			// reader picks whole calendar days: a lower bound starts that day and an
			// upper bound ends it, so both bounds include the days they name.
			const since = calendarDate(request.since);
			const until = calendarDate(request.until);
			if (since !== void 0) args.push(`--since=${since}T00:00:00`);
			if (until !== void 0) args.push(`--until=${until}T23:59:59`);
			const result = await this.git(workspace, args, signal, "log");
			if (result.exitCode !== 0 && !hasNoCommitsYet(result.stderr)) this.failed(workspace, "log", result);
			if (result.truncated) this.failed(workspace, "log", result);
			const rows = result.exitCode === 0 ? result.stdout.split("").filter((row) => row !== "").map(parseCommitRow) : [];
			const current = branch.stdout.trim();
			// The dropdown's options travel with the first page so opening the history
			// costs one read, not two; a later page leaves the list with the window.
			const authors = skip === 0 ? await this.authors(workspace, signal) : void 0;
			return {
				repository: true,
				commits: rows.slice(0, limit),
				more: rows.length > limit,
				...current === "" ? {} : { branch: current },
				...authors === void 0 ? {} : { authors }
			};
		}
		/** Read the changed files in one commit returned by {@link log}.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Changed files and change kinds for the selected commit.
		*/
		async commitFiles(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const commit = selectedCommit(request.commit, workspace.id, "commit-files");
			const result = await this.git(workspace, [
				"show",
				"--format=",
				"--name-status",
				"-z",
				commit
			], signal, "commit-files");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "commit-files", result);
			return {
				repository: true,
				files: parseCommitFiles(result.stdout)
			};
		}
		/** Read one file's complete before/after contents and patch from one commit returned by {@link log}.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Bounded before and after contents of one committed file.
		*/
		async commitDiff(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const commit = selectedCommit(request.commit, workspace.id, "commit-diff");
			const [path = ""] = selectedPathspecs([request.path], workspace.id, "commit-diff");
			if (request.previousPath !== void 0) selectedPathspecs([request.previousPath], workspace.id, "commit-diff");
			const previousPath = request.previousPath ?? request.path;
			const result = await this.git(workspace, [
				"show",
				"--format=",
				"--no-ext-diff",
				"--no-color",
				"--unified=3",
				commit,
				"--",
				path
			], signal, "commit-diff");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "commit-diff", result);
			if (/(?:^|\n)(?:Binary files .* differ|GIT binary patch)(?:\n|$)/u.test(result.stdout)) return {
				repository: true,
				binary: true,
				before: "",
				after: "",
				patch: result.stdout
			};
			const [before, after] = await Promise.all([this.git(workspace, ["show", `${commit}^:${previousPath}`], signal, "commit-diff", this.config.maxCommitFileBytes), this.git(workspace, ["show", `${commit}:${request.path}`], signal, "commit-diff", this.config.maxCommitFileBytes)]);
			if (before.truncated) this.failed(workspace, "commit-diff", before);
			if (after.truncated) this.failed(workspace, "commit-diff", after);
			return {
				repository: true,
				binary: false,
				before: before.exitCode === 0 ? before.stdout : "",
				after: after.exitCode === 0 ? after.stdout : "",
				patch: result.stdout
			};
		}
		/** Read one working-tree file as the same complete comparison used by commit review.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Bounded before and after contents of one working-tree file.
		*/
		async workingDiff(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const [path = ""] = selectedPaths([request.path], workspace.id, "working-diff");
			const previousPath = request.previousPath === void 0 ? void 0 : selectedPaths([request.previousPath], workspace.id, "working-diff")[0];
			const args = request.untracked ? [
				"diff",
				"--no-index",
				"--no-ext-diff",
				"--no-color",
				"--unified=2147483647",
				"--",
				"/dev/null",
				path
			] : [
				"diff",
				"--no-ext-diff",
				"--no-color",
				"--unified=2147483647",
				"HEAD",
				"--",
				...previousPath === void 0 ? [] : [previousPath],
				path
			];
			const result = await this.git(workspace, args, signal, "working-diff", this.config.maxCommitFileBytes * 2);
			if (!(request.untracked && result.exitCode === 1) && result.exitCode !== 0 || result.truncated) this.failed(workspace, "working-diff", result);
			if (/(?:^|\n)(?:Binary files .* differ|GIT binary patch)(?:\n|$)/u.test(result.stdout)) return {
				repository: true,
				binary: true,
				before: "",
				after: "",
				patch: result.stdout
			};
			const contents = completeTextFromPatch(result.stdout);
			if (contents !== void 0) return {
				repository: true,
				binary: false,
				...contents,
				patch: result.stdout
			};
			if (!request.untracked) {
				const baseline = await this.git(workspace, ["show", `HEAD:${previousPath ?? path}`], signal, "working-diff", this.config.maxCommitFileBytes);
				if (baseline.truncated) this.failed(workspace, "working-diff", baseline);
				if (baseline.exitCode === 0) return {
					repository: true,
					binary: false,
					before: baseline.stdout,
					after: baseline.stdout,
					patch: result.stdout
				};
			}
			return {
				repository: true,
				binary: false,
				before: "",
				after: "",
				patch: result.stdout
			};
		}
		/** Read bounded commits on the current branch that its upstream does not contain.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Current upstream and commits awaiting push.
		*/
		async pendingPush(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const inside = await this.git(workspace, ["rev-parse", "--is-inside-work-tree"], signal, "pending-push");
			if (inside.exitCode !== 0 || inside.stdout.trim() !== "true") return { repository: false };
			const upstream = await this.git(workspace, [
				"rev-parse",
				"--abbrev-ref",
				"--symbolic-full-name",
				"@{upstream}"
			], signal, "pending-push");
			if (upstream.exitCode !== 0 && hasNoUpstream(upstream.stderr)) return {
				repository: true,
				upstream: false,
				commits: [],
				more: false
			};
			if (upstream.exitCode !== 0 || upstream.truncated) this.failed(workspace, "pending-push", upstream);
			const limit = this.config.maxLogCommits;
			const result = await this.git(workspace, [
				"log",
				"--pretty=format:%H%x1f%h%x1f%an%x1f%ae%x1f%aI%x1f%s%x1e",
				"-n",
				String(limit + 1),
				"@{upstream}..HEAD"
			], signal, "pending-push");
			if (result.exitCode !== 0 && !hasNoCommitsYet(result.stderr)) this.failed(workspace, "pending-push", result);
			if (result.truncated) this.failed(workspace, "pending-push", result);
			const rows = result.exitCode === 0 ? result.stdout.split("").filter((row) => row !== "").map(parseCommitRow) : [];
			return {
				repository: true,
				upstream: true,
				commits: rows.slice(0, limit),
				more: rows.length > limit
			};
		}
		/**
		* Read the uncommitted working-tree state for one Workspace.
		* @param request - target Workspace.
		* @param signal - carrier cancellation.
		* @returns repository absence or every changed and untracked file.
		*/
		async status(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const inside = await this.git(workspace, ["rev-parse", "--is-inside-work-tree"], signal, "status");
			if (inside.exitCode !== 0 || inside.stdout.trim() !== "true") return { repository: false };
			const result = await this.git(workspace, [
				"status",
				"--porcelain=v1",
				"-z",
				"--untracked-files=all"
			], signal, "status");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "status", result);
			return {
				repository: true,
				files: parseStatusRecords(result.stdout)
			};
		}
		/**
		* List the stash entries for one Workspace, newest first.
		* @param request - target Workspace.
		* @param signal - carrier cancellation.
		* @returns repository absence or the complete stash list.
		*/
		async stash(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const inside = await this.git(workspace, ["rev-parse", "--is-inside-work-tree"], signal, "stash");
			if (inside.exitCode !== 0 || inside.stdout.trim() !== "true") return { repository: false };
			const result = await this.git(workspace, [
				"stash",
				"list",
				"--pretty=format:%gd%x1f%cI%x1f%gs%x1e"
			], signal, "stash");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "stash", result);
			return {
				repository: true,
				entries: parseStashRows(result.stdout)
			};
		}
		/** Commit selected tracked and untracked Workspace changes, then optionally push.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Repository status after committing the selected paths and optionally pushing.
		*/
		async commit(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const message = request.message.trim();
			if (message === "" || message.includes("\0")) throw new RemoteError("git/operation-failed", "Commit message must not be empty.", {
				workspaceId: workspace.id,
				operation: "commit"
			});
			const paths = selectedPathspecs(request.paths, workspace.id, "commit");
			const add = await this.git(workspace, [
				"add",
				"-A",
				"--",
				...paths
			], signal, "add");
			if (add.exitCode !== 0 || add.truncated) this.failed(workspace, "add", add);
			const commit = await this.git(workspace, [
				"commit",
				"--only",
				"-m",
				message,
				"--",
				...paths
			], signal, "commit");
			if (commit.exitCode !== 0 || commit.truncated) this.failed(workspace, "commit", commit);
			if (request.push === true) {
				const push = await this.git(workspace, ["push"], signal, "push");
				if (push.exitCode !== 0 || push.truncated) this.failed(workspace, "push", push);
			}
			return { repository: true };
		}
		/** Push the current branch to its configured upstream.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Repository status after pushing the current branch.
		*/
		async push(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const result = await this.git(workspace, ["push"], signal, "push");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "push", result);
			return { repository: true };
		}
		/** Pull the configured upstream into the current branch with a merge when histories diverge.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Repository status after merging updates from the configured upstream.
		*/
		async pull(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const result = await this.git(workspace, [
				"pull",
				"--no-rebase",
				"--no-edit"
			], signal, "pull");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "pull", result);
			return { repository: true };
		}
		/** Stash selected tracked and untracked Workspace changes under a caller-supplied message.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Repository status after storing the selected changes.
		*/
		async stashCreate(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const message = request.message.trim();
			if (message === "" || message.includes("\0")) throw new RemoteError("git/operation-failed", "Stash message must not be empty.", {
				workspaceId: workspace.id,
				operation: "stash-create"
			});
			const paths = selectedPathspecs(request.paths, workspace.id, "stash-create");
			const result = await this.git(workspace, [
				"stash",
				"push",
				"--include-untracked",
				"-m",
				message,
				"--",
				...paths
			], signal, "stash-create");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "stash-create", result);
			return { repository: true };
		}
		/** Permanently discard selected tracked changes and untracked files.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Repository status after restoring the selected paths.
		*/
		async rollback(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const tracked = optionalPathspecs(request.trackedPaths, workspace.id, "rollback");
			const untracked = optionalPathspecs(request.untrackedPaths, workspace.id, "rollback");
			if (tracked.length + untracked.length === 0) throw new RemoteError("git/operation-failed", "At least one valid Workspace-relative path is required.", {
				workspaceId: workspace.id,
				operation: "rollback"
			});
			if (tracked.length > 0) {
				const restore = await this.git(workspace, [
					"restore",
					"--source=HEAD",
					"--staged",
					"--worktree",
					"--",
					...tracked
				], signal, "rollback");
				if (restore.exitCode !== 0 || restore.truncated) this.failed(workspace, "rollback", restore);
			}
			if (untracked.length > 0) {
				const clean = await this.git(workspace, [
					"clean",
					"-f",
					"--",
					...untracked
				], signal, "rollback");
				if (clean.exitCode !== 0 || clean.truncated) this.failed(workspace, "rollback", clean);
			}
			return { repository: true };
		}
		/** Read the files stored in one stash selector returned by {@link stash}.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns File paths and change kinds recorded by the selected stash.
		*/
		async stashFiles(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const selector = stashSelector(request.selector, workspace.id, "stash-files");
			const result = await this.git(workspace, [
				"stash",
				"show",
				"--name-status",
				"-z",
				"--include-untracked",
				"--format=",
				selector
			], signal, "stash-files");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "stash-files", result);
			return {
				repository: true,
				files: parseStashFiles(result.stdout)
			};
		}
		/** Restore one stash's index and working-tree state, removing it on success.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Repository status after applying and removing the selected stash.
		*/
		async stashPop(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const selector = stashSelector(request.selector, workspace.id, "stash-pop");
			const result = await this.git(workspace, [
				"stash",
				"pop",
				"--index",
				selector
			], signal, "stash-pop");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "stash-pop", result);
			return { repository: true };
		}
		/** Permanently remove one stash without restoring its files.
		* @param request - Workspace identity and Git operation arguments.
		* @param signal - Cancellation for the Git subprocess and its output collection.
		* @returns Repository status after removing the selected stash.
		*/
		async stashDrop(request, signal) {
			const workspace = this.workspace(request.workspaceId);
			const selector = stashSelector(request.selector, workspace.id, "stash-drop");
			const result = await this.git(workspace, [
				"stash",
				"drop",
				selector
			], signal, "stash-drop");
			if (result.exitCode !== 0 || result.truncated) this.failed(workspace, "stash-drop", result);
			return { repository: true };
		}
		workspace(workspaceId) {
			const workspace = this.ctx.workspaceRegistry.get(workspaceId);
			if (workspace !== void 0) return workspace;
			throw new RemoteError("workspace/not-found", `workspace "${workspaceId}" not found`, { workspaceId });
		}
		async git(workspace, args, signal, operation, maxOutputBytes = this.config.maxOutputBytes) {
			let executable;
			try {
				executable = await this.ctx.subprocess.resolveExecutable("git", void 0, signal);
			} catch (error) {
				throw new RemoteError("git/unavailable", `Git is unavailable for Workspace "${workspace.id}": ${error instanceof Error ? error.message : String(error)}`, { workspaceId: workspace.id }, { cause: error });
			}
			let handle;
			try {
				handle = this.ctx.subprocess.spawn({
					argv: [executable, ...args],
					cwd: workspace.path,
					stdio: {
						stdin: "ignore",
						stdout: { maxBytes: maxOutputBytes },
						stderr: { maxBytes: this.config.maxOutputBytes }
					},
					graceMs: this.config.terminationGraceMs,
					signal
				});
				const outcome = await handle.done;
				const stdout = handle.collected.stdout?.readFrom(0);
				const stderr = handle.collected.stderr?.readFrom(0);
				return {
					exitCode: outcome.exitCode,
					stdout: stdout?.text ?? "",
					stderr: stderr?.text ?? "",
					truncated: stdout?.lossy === true || stderr?.lossy === true
				};
			} catch (error) {
				throw new RemoteError("git/operation-failed", `Git ${operation} failed for Workspace "${workspace.id}": ${error instanceof Error ? error.message : String(error)}`, {
					workspaceId: workspace.id,
					operation
				}, { cause: error });
			}
		}
		failed(workspace, operation, result) {
			throw new RemoteError("git/operation-failed", result.truncated ? "Git output exceeded the configured limit." : stripVTControlCharacters(result.stderr).trim() || `Git exited with code ${String(result.exitCode)}.`, {
				workspaceId: workspace.id,
				operation
			});
		}
		/**
		* List the distinct author names among the checked-out branch's recent commits.
		*
		* The names feed the client's author dropdown. A refused or clipped scan leaves
		* the list absent rather than failing the page that carries it: the history the
		* reader asked for is complete either way, and the dropdown simply stays bare.
		* @param workspace - the Workspace whose history is listed.
		* @param signal - carrier cancellation.
		* @returns the sorted names, or undefined when Git could not list them.
		*/
		async authors(workspace, signal) {
			const result = await this.git(workspace, [
				"log",
				"-n",
				String(AUTHOR_SCAN_COMMITS),
				"--pretty=format:%an"
			], signal, "log");
			if (result.exitCode !== 0 || result.truncated) return void 0;
			const names = new Set();
			for (const line of result.stdout.split(/\r?\n/u)) {
				const name = line.trim();
				if (name !== "") names.add(name);
			}
			return [...names].sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
		}
	};
})();
/** Recent commits scanned to build the author dropdown's options. */
const AUTHOR_SCAN_COMMITS = 500;
function wouldOverwriteLocalChanges(stderr) {
	return /local changes[\s\S]*would be overwritten by (?:checkout|switch)/iu.test(stderr);
}
/**
* Read one `YYYY-MM-DD` calendar date, or undefined when the text names none.
*
* The value reaches a Git argument, so only a complete, real calendar date is
* accepted: anything else leaves that bound unset instead of failing the read.
* @param value - the date the Client sent, if any.
* @returns the date as Git spells it, or undefined.
*/
function calendarDate(value) {
	const candidate = value?.trim() ?? "";
	if (!/^\d{4}-\d{2}-\d{2}$/u.test(candidate)) return void 0;
	const [year = 0, month = 0, day = 0] = candidate.split("-").map(Number);
	const parsed = new Date(Date.UTC(year, month - 1, day));
	const real = parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
	return real ? candidate : void 0;
}
/** An empty repository is a complete history, not a failed read. */
function hasNoCommitsYet(stderr) {
	return /does not have any commits yet|bad revision 'HEAD'/iu.test(stderr);
}
function hasNoUpstream(stderr) {
	return /no upstream configured|no upstream branch|does not point to a branch/iu.test(stderr);
}
/** Recover both complete text sides from a maximum-context unified patch. */
function completeTextFromPatch(patch) {
	const before = [];
	const after = [];
	let inHunk = false;
	let foundHunk = false;
	const lines = patch.split(/\r?\n/u);
	if (lines.at(-1) === "") lines.pop();
	for (const line of lines) {
		if (line.startsWith("diff --git ")) {
			inHunk = false;
			continue;
		}
		if (line.startsWith("@@ ")) {
			inHunk = true;
			foundHunk = true;
			continue;
		}
		if (!inHunk || line.startsWith("\\ No newline at end of file")) continue;
		if (line.startsWith("-")) before.push(line.slice(1));
		else if (line.startsWith("+")) after.push(line.slice(1));
		else {
			const text = line.startsWith(" ") ? line.slice(1) : line;
			/** Copy a workflow with a fresh identity.
			* @param request - Workspace identity and Git operation arguments.
			* @param signal - Cancellation for the Git subprocess and its output collection.
			* @returns Repository status after pushing the current branch.
			*/
			before.push(text);
			/** Copy a workflow with a fresh identity.
			* @param request - Workspace identity and Git operation arguments.
			* @param signal - Cancellation for the Git subprocess and its output collection.
			* @returns Repository status after pushing the current branch.
			*/
			after.push(text);
		}
	}
	if (!foundHunk) return void 0;
	return {
		before: before.join("\n"),
		after: after.join("\n")
	};
}
/**
* Decode one `log` record: `hash`, short hash, author name, author email, strict
* ISO author date, then the subject (the last field, so it may contain anything
* else, including the field separator's own text).
*/
function parseCommitRow(row) {
	const [hash = "", shortHash = "", authorName = "", authorEmail = "", date = "", ...subject] = row.replace(/^[\r\n]+/u, "").split("");
	return {
		hash,
		shortHash,
		authorName,
		authorEmail,
		date,
		subject: subject.join("")
	};
}
/**
* Decode `status --porcelain=v1 -z` records: `XY path`, where a rename or copy
* record is followed by its original path as the next record. An unchanged side
* (Git's space) is reported as `.`.
* @param stdout - Git output in the delimiter format consumed by this parser.
* @returns Working-tree paths with staged and unstaged change kinds.
*/
function parseStatusRecords(stdout) {
	const records = stdout.split("\0").filter((record) => record !== "");
	const files = [];
	for (let index = 0; index < records.length; index += 1) {
		const record = records[index] ?? "";
		const indexStatus = statusLetter(record.slice(0, 1));
		const worktreeStatus = statusLetter(record.slice(1, 2));
		const renamed = indexStatus === "R" || indexStatus === "C";
		if (renamed) index += 1;
		files.push({
			path: record.slice(3),
			indexStatus,
			worktreeStatus,
			untracked: indexStatus === "?" && worktreeStatus === "?",
			...renamed ? { renamedFrom: records[index] ?? "" } : {}
		});
	}
	return files;
}
/** One porcelain status letter; the space that means "unchanged here" reads as `.`. */
function statusLetter(letter) {
	return letter === " " ? "." : letter;
}
/**
* Decode one `stash list` record: reflog selector, strict ISO entry date, then
* the subject (the last field, so it may contain anything else, including the
* field separator's own text).
* @param stdout - Git output in the delimiter format consumed by this parser.
* @returns Stash selectors, dates, and complete subjects.
*/
function parseStashRows(stdout) {
	return stdout.split("").filter((row) => row !== "").map((row) => {
		const [selector = "", date = "", ...subject] = row.split("");
		return {
			selector,
			date,
			subject: subject.join("")
		};
	});
}
/** Decode `stash show --name-status -z` records, including rename path pairs.
* @param stdout - Git output in the delimiter format consumed by this parser.
* @returns Stashed file paths with change kinds and rename sources.
*/
function parseStashFiles(stdout) {
	const records = stdout.split("\0").filter((record) => record !== "");
	const files = [];
	for (let index = 0; index < records.length;) {
		const status = records[index++] ?? "";
		const renamed = status.startsWith("R") || status.startsWith("C");
		const firstPath = records[index++] ?? "";
		const path = renamed ? records[index++] ?? "" : firstPath;
		files.push({
			status: status.slice(0, 1),
			path,
			...renamed ? { renamedFrom: firstPath } : {}
		});
	}
	return files;
}
/** Decode the NUL-delimited name-status output of one commit.
* @param stdout - Git output in the delimiter format consumed by this parser.
* @returns Committed file paths with change kinds and rename sources.
*/
function parseCommitFiles(stdout) {
	return parseStashFiles(stdout);
}
function selectedCommit(commit, workspaceId, operation) {
	if (/^[0-9a-f]{7,64}$/iu.test(commit)) return commit;
	throw new RemoteError("git/operation-failed", "The commit identifier is invalid.", {
		workspaceId,
		operation
	});
}
function stashSelector(selector, workspaceId, operation) {
	if (/^stash@\{\d+\}$/u.test(selector)) return selector;
	throw new RemoteError("git/operation-failed", "The stash selector is invalid.", {
		workspaceId,
		operation
	});
}
function selectedPathspecs(paths, workspaceId, operation) {
	return selectedPaths(paths, workspaceId, operation).map((path) => `:(literal)${path}`);
}
function selectedPaths(paths, workspaceId, operation) {
	const unique = [...new Set(paths)];
	if (!(unique.length === 0 || unique.some((path) => path === "" || path.includes("\0") || /^[\\/]|^[A-Za-z]:[\\/]/u.test(path) || path.split(/[\\/]/u).includes("..")))) return unique;
	throw new RemoteError("git/operation-failed", "At least one valid Workspace-relative path is required.", {
		workspaceId,
		operation
	});
}
function optionalPathspecs(paths, workspaceId, operation) {
	if (paths.length === 0) return [];
	return selectedPathspecs(paths, workspaceId, operation);
}
//#endregion
export { GitWorkspaceController, GitWorkspaceController as default, parseCommitFiles, parseStashFiles, parseStashRows, parseStatusRecords };
