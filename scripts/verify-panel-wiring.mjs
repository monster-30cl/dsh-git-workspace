/**
 * Load the built panel bundle against a stub client context and report which
 * slots it contributes. Verification harness only; not shipped.
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { readFileSync } from 'node:fs'

const panelPath = process.argv[2]
const require = createRequire(new URL('../package.json', import.meta.url))

let registration
globalThis.window = { __ModuleLoader__: { load: (value) => { registration = value } } }

await import(pathToFileURL(panelPath).href)
if (registration === undefined) throw new Error('bundle did not register a factory')

const stub = (exportNames) => Object.fromEntries(exportNames.map((name) => [name, () => null]))
const reactStub = new Proxy({}, {
  get: (_target, key) => {
    if (key === 'memo') return (component) => component
    if (key === 'forwardRef') return () => function Forwarded() { return null }
    if (key === 'createContext') return (value) => ({ Provider: () => null, Consumer: () => null, _currentValue: value })
    if (key === 'createElement') return () => null
    if (key === 'useState') return (initial) => [initial, () => {}]
    if (key === 'useReducer') return (reducer, initial) => [initial, () => {}]
    if (key === 'useCallback') return (fn) => fn
    if (key === 'useRef') return (initial) => ({ current: initial })
    if (key === 'useMemo') return (fn) => (typeof fn === 'function' ? fn() : undefined)
    if (key === 'useSyncExternalStore') return (_subscribe, getSnapshot) => getSnapshot()
    if (key === 'useEffect' || key === 'useLayoutEffect' || key === 'useInsertionEffect' || key === 'useDebugValue') return () => {}
    if (key === 'Fragment') return Symbol('Fragment')
    if (key === 'Children') return { map: () => [], toArray: () => [] }
    if (key === '__esModule') return undefined
    return () => null
  },
})

const panelRequire = (specifier) => {
  if (specifier === 'react') return reactStub
  if (specifier === 'react/jsx-runtime') {
    return { jsx: () => null, jsxs: () => null, Fragment: Symbol('Fragment') }
  }
  if (specifier === '@deepseek-ai/dsh-client-ui-primitives') {
    return stub(['Button', 'Menu', 'IconBranchOutlineRegular', 'IconChevronDownOutlineRegular'])
  }
  return makeDeepStub()
}

/** A callable/constructible stub whose every property is another stub. */
function makeDeepStub() {
  const fn = function stub() { return null }
  return new Proxy(fn, {
    get: (target, key) => {
      if (key === 'then') return undefined
      if (key === Symbol.toPrimitive) return () => '[stub]'
      return makeDeepStub()
    },
    apply: () => null,
    construct: () => ({}),
  })
}

const exports = registration.factory(panelRequire)
if (typeof exports.apply !== 'function') throw new Error('bundle has no apply export')

const slots = []
const tabTypes = []
const openedTabs = []
const effects = []
const injectedServices = []

const gitRemote = {
  list: async () => ({ ok: true, value: { repository: true, current: 'main', detached: false, localBranches: ['main'], remoteBranches: [] } }),
  checkout: async () => ({ ok: true, value: { repository: true, current: 'dev', detached: false, localBranches: ['main', 'dev'], remoteBranches: [] } }),
  checkoutRemote: async () => ({ ok: true, value: { repository: true, current: 'dev', detached: false, localBranches: ['dev'], remoteBranches: [] } }),
  create: async () => ({ ok: true, value: { repository: true, current: 'feat', detached: false, localBranches: ['feat'], remoteBranches: [] } }),
}

/** The review half's own registrations, collected from the embedded factory. */
const reviewTabs = []
const reviewSlots = []

const reviewCtx = {
  effect: (factory) => { factory() },
  locale: { bind: () => (key) => key, register: () => {} },
  slots: {
    inject: (name, thunk) => { thunk() },
    register: (entry, component) => { reviewSlots.push({ entry, component }); return () => {} },
  },
  sidebarRightTabs: { register: (definition) => { reviewTabs.push(definition); return () => {} } },
  sidebarRight: { openTab: () => {}, tabsIn: () => [] },
  remote: {
    gitWorkspace: {
      log: async () => ({ ok: true, value: { repository: true, commits: [], more: false } }),
      commitFiles: async () => ({ ok: true, value: { files: [] } }),
      commitDiff: async () => ({ ok: true, value: { diff: '', before: '', after: '' } }),
      status: async () => ({ ok: true, value: { repository: true, files: [] } }),
      stashList: async () => ({ ok: true, value: { repository: true, entries: [] } }),
      pendingPush: async () => ({ ok: true, value: { repository: true, commits: [], upstream: false, more: false } }),
    },
  },
  configForms: {
    get: () => ({
      subscribe: () => () => {},
      getSnapshot: () => ({ value: {} }),
      set: async () => {},
    }),
  },
}

const ctx = {
  inject: (services, callback) => {
    injectedServices.push(...services)
    callback({ plugin: (plugin) => { plugin.apply(reviewCtx) } })
  },
  effect: (factory) => { effects.push(factory()) },
  get: (name) => (name === 'remote.gitWorkspace' ? gitRemote : undefined),
  logger: { warn: (error) => console.log('warn:', error && error.message) },
  remote: { $mount: async () => () => {} },
  sidebarRightTabs: { register: (definition) => { tabTypes.push(definition); return () => {} } },
  sidebarRight: { openTab: (kind) => { openedTabs.push(kind) } },
  slots: {
    inject: (name, thunk) => { thunk() },
    register: (entry, component) => { slots.push({ entry, component }); return () => {} },
  },
}

exports.apply(ctx)

const report = {
  inject: exports.inject,
  tabTypes: [...reviewTabs, ...tabTypes].map((definition) => `${definition.kind} <- ${definition.id}`),
  reviewTabTypes: reviewTabs.length,
  reviewSlots: reviewSlots.map(({ entry, component }) => ({
    name: entry.name,
    key: entry.key ?? null,
    component: component?.name ?? null,
  })),
  slots: slots.map(({ entry }) => ({
    name: entry.name,
    id: entry.id ?? null,
    key: entry.key ?? null,
    order: entry.order ?? null,
    hasComponent: typeof entry === 'object' && entry !== null,
  })),
  overlayRegistrations: slots.filter(({ entry }) => entry.name === 'shell.overlay').length,
}

const chip = slots.find(({ entry }) => entry.name === 'conversation.session.header.utilities')
if (chip === undefined) throw new Error('header chip registration missing')
const page = slots.find(({ entry }) => entry.name === 'sidebar.right.pane.tab')
if (page === undefined) throw new Error('branches page registration missing')
if (report.overlayRegistrations !== 0) throw new Error('overlay registration still present')
if (tabTypes.length !== 1 || tabTypes[0].kind !== 'gitBranches') throw new Error('branches tab type not registered')

// The review half must contribute exactly one page type and one body, and that
// body must be the merged review page rather than a separate changes tab.
if (reviewTabs.length !== 1 || reviewTabs[0].kind !== 'gitHistory') {
  throw new Error(`review half must register one gitHistory tab type, got ${JSON.stringify(reviewTabs.map((tab) => tab.kind))}`)
}
const reviewBody = reviewSlots.filter(({ entry }) => entry.name === 'sidebar.right.pane.tab')
if (reviewBody.length !== 1) throw new Error(`review half must register one page body, got ${reviewBody.length}`)
if (reviewBody[0].component?.name !== 'GitReviewPage') {
  throw new Error(`review body is ${reviewBody[0].component?.name}, expected the merged GitReviewPage`)
}
if (reviewSlots.some(({ entry }) => entry.name === 'sidebar.right.panel.changes')) {
  throw new Error('review half still registers the removed changes seat')
}
if (reviewTabs.some((tab) => tab.kind === 'gitChanges')) throw new Error('separate changes tab type is still registered')

const chipInjected = chip.entry.inject()
const pageInjected = page.entry.inject()
if (typeof chipInjected.git.list !== 'function') throw new Error('chip has no git operations')
if (typeof pageInjected.git.list !== 'function') throw new Error('page has no git operations')
chipInjected.openPanel()
if (openedTabs[0] !== 'gitBranches') throw new Error('chip does not open the branches page')

console.log(JSON.stringify({ ...report, chipInjected: Object.keys(chipInjected), pageInjected: Object.keys(pageInjected) }, null, 2))
console.log('PANEL CHECK OK')
