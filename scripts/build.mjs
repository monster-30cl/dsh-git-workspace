/** Assemble the public desktop panel from committed, repository-local inputs. */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = new URL('../', import.meta.url)
const review = await readFile(new URL('vendor/git-review/client.js', root), 'utf8')
const factoryStart = review.indexOf('factory:') + 'factory:'.length
const factoryEnd = review.lastIndexOf('\n});')
if (factoryStart < 9 || factoryEnd < factoryStart) throw new Error('Git review bundle factory is missing')
let factory = review.slice(factoryStart, factoryEnd).trim().replace(/,$/u, '')

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
