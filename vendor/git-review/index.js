import z from "@deepseek-ai/schemastery";
//#region lib/types/diff-zoom-settings.js
/** Code-comparison zoom preference stored in the Host user-settings document. */
/** Settings namespace owned by the Git review feature. */
const GIT_HISTORY_SETTINGS_NAMESPACE = "ui-sidebar-git-history";
/** Field carrying the modifier used with the mouse wheel. */
const DIFF_ZOOM_MODIFIER_FIELD = "diffZoomModifier";
/** Keyboard modifiers accepted by the code-comparison zoom gesture. */
const DIFF_ZOOM_MODIFIERS = [
	"alt",
	"control",
	"shift"
];
/** Default avoids the browser's Ctrl+wheel page-zoom gesture. */
const DEFAULT_DIFF_ZOOM_MODIFIER = "alt";
/** Durable Git review schema; also validates the browser scope envelope. */
const GitHistorySettingsSchema = z.object({ [DIFF_ZOOM_MODIFIER_FIELD]: z.union([...DIFF_ZOOM_MODIFIERS]).default("alt") });
//#endregion
//#region lib/types/index.js
/** Host registration for the browser Git review preferences. */
/** Register the durable Git review section when a settings provider exists. */
function apply(ctx) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(GIT_HISTORY_SETTINGS_NAMESPACE, GitHistorySettingsSchema);
	});
}
//#endregion
export { DEFAULT_DIFF_ZOOM_MODIFIER, DIFF_ZOOM_MODIFIERS, DIFF_ZOOM_MODIFIER_FIELD, GIT_HISTORY_SETTINGS_NAMESPACE, apply };
