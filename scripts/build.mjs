/** Assemble the public desktop panel from committed, repository-local inputs. */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = new URL('../', import.meta.url)
const upstreamControllerPackage = '@deepseek-ai/dsh-api-git-workspace-controller'
const standaloneControllerPackage = '@monster-30cl/dsh-git-workspace-controller'

for (const file of ['packages/controller/lib/typert.host.js', 'packages/controller/lib/typert.remote-client.js']) {
  const url = new URL(file, root)
  const source = await readFile(url, 'utf8')
  if (!source.includes(upstreamControllerPackage)) {
    if (!source.includes(standaloneControllerPackage)) {
      throw new Error(`${file} does not declare the expected Git Workspace controller package`)
    }
    continue
  }
  await writeFile(url, source.replaceAll(upstreamControllerPackage, standaloneControllerPackage))
}

const controller = await build({
  entryPoints: [fileURLToPath(new URL('source/git-workspace-controller/index.ts', root))],
  bundle: true, write: false, format: 'esm', platform: 'node', target: 'node22', packages: 'external',
})
await writeFile(new URL('packages/controller/lib/index.js', root), controller.outputFiles[0].text)

const review = await readFile(new URL('vendor/git-review/client.js', root), 'utf8')
const factoryStart = review.indexOf('factory:') + 'factory:'.length
const factoryEnd = review.lastIndexOf('\n});')
if (factoryStart < 9 || factoryEnd < factoryStart) throw new Error('Git review bundle factory is missing')
let factory = review.slice(factoryStart, factoryEnd).trim().replace(/,$/u, '')

// Compile the themed calendar from its reviewable source for the vendor factory.
const calendar = await build({
  entryPoints: [fileURLToPath(new URL('source/git-review/client/HistoryDatePicker.tsx', root))],
  bundle: true, write: false, format: 'cjs', platform: 'browser', target: 'es2022',
  external: ['react'], loader: { '.css': 'text' },
})
const calendarBinding = '\nconst HistoryDatePicker = ((require) => { const module = { exports: {} }; const exports = module.exports;\n'
  + calendar.outputFiles[0].text + '\nreturn module.exports.HistoryDatePicker; })(require);\n'
if (!factory.startsWith('(require) => {')) throw new Error('Git review calendar adapter needs updating')
factory = factory.replace('(require) => {', '(require) => {' + calendarBinding)

const messageUi = await build({
  entryPoints: [fileURLToPath(new URL('source/git-review/client/CommitMessageDialog.tsx', root))],
  bundle: true, write: false, format: 'cjs', platform: 'browser', target: 'es2022', external: ['react', '@deepseek-ai/dsh-client-ui-primitives'],
})
factory = factory.replace('(require) => {', '(require) => {\nconst CommitMessageDialog = ((require) => { const module = { exports: {} }; const exports = module.exports;\n' + messageUi.outputFiles[0].text + '\nreturn module.exports.CommitMessageDialog; })(require);\n')

// Desktop 0.2.1-rc.3 exposes entry configuration through ConfigForms.
const settingsBinding = 'ctx.settingsScope.bind({ namespace: GIT_HISTORY_SETTINGS_NAMESPACE })'
if (factory.split(settingsBinding).length !== 2 || factory.split('"settingsScope"').length !== 2) {
  throw new Error('Git review settings adapter needs updating for this source build')
}
factory = factory.replace('"settingsScope"', '"configForms"')
  .replace(settingsBinding, 'ctx.configForms.get(GIT_HISTORY_SETTINGS_NAMESPACE)')

// Desktop exports icon weights independently of their rendered size.
for (const icon of ['Branch', 'ChevronDown', 'ChevronRight', 'Close', 'Fullscreen', 'Refresh', 'Search']) {
  factory = factory.replaceAll(`Icon${icon}Outline${icon.startsWith('Chevron') ? 14 : 16}`, `Icon${icon}OutlineRegular`)
}
if (!factory.includes('GitReviewPage') || factory.includes('sidebar.right.panel.changes')) {
  throw new Error('Git review page adapter needs updating: the merged review page is missing')
}

const result = await build({
  entryPoints: [fileURLToPath(new URL('packages/panel/src/client/index.js', root))],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  external: ['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives'],
  alias: {
    '@deepseek-ai/dsh-typert-protocol/remote-info': fileURLToPath(new URL('packages/controller/lib/remote-info-runtime.js', root)),
  },
  // The wrapper below supplies `require`, `module`, and `exports`, so this
  // CommonJS output does not carry the module body's own strict directive; the
  // panel has always shipped as strict code, and the bundled sources are ESM.
  banner: { js: '"use strict";' },
})
await writeFile(
  new URL('packages/panel/lib/client.js', root),
  `window.__ModuleLoader__.load({id:"@monster-30cl/dsh-git-workspace-panel",factory:(require)=>{\nconst GitReview=(${factory})(require);\nvar module={exports:{}};var exports=module.exports;\n${result.outputFiles[0].text}\nreturn module.exports;}});\n`,
)

const host = await build({
  entryPoints: [fileURLToPath(new URL('vendor/git-review/index.js', root))],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  target: 'node22',
})
await writeFile(new URL('packages/panel/lib/git-review-host.js', root), host.outputFiles[0].text)
