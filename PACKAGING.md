# Packaging and provenance

The repository commits the runtime files that Desktop installs. `packages/controller/lib` comes from the dsh Git Workspace controller build. `vendor/git-review` comes from the dsh Git review package build. `scripts/build.mjs` combines that review client with the repository-owned branch panel and writes `packages/panel/lib`.

The `source` directory preserves the matching controller and review source snapshot for audit. The standalone build does not compile those TypeScript sources because the dsh Typert and client bundlers are repository-level generators. Update the source snapshot and compiled inputs together from one verified dsh revision, then run `pnpm run check` and commit every changed runtime file.

`pnpm run pack:release` runs the build and wiring verification before creating the tarball. The root package bundles the two local runtime packages so an installed tarball does not retain `file:` dependencies on the source checkout.
