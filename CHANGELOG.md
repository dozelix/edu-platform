# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-03-30

### Added
- **TypeScript Migration**: Converted all codebase components, features, models, and IPC handlers to TypeScript (`.tsx` / `.ts`) with strict type safety.
- **pnpm Package Manager**: Migrated from npm to `pnpm` (`pnpm-lock.yaml`, `pnpm-workspace.yaml`) for enhanced security and robust supply-chain control.
- **Semantic HTML & UI Symmetry**: Replaced generic nested `div` elements across all UI views (`App`, `Sidebar`, `Topbar`, `Catalog`, `Lesson`, `MyLearning`, `InstructorDashboard`, `LoginRegister`, `ErrorBoundary`) with semantic HTML5 elements (`<header>`, `<main>`, `<aside>`, `<section>`, `<article>`, `<nav>`, `<hgroup>`, `<footer>`), ensuring visual and structural div symmetry.
- **Documentation Updates**: Updated `README.md` and `docs/SETUP.md` with instructions for pnpm, TypeScript, and modern execution workflows.

### Changed
- Workspace package configurations and build scripts (`dev`, `build`, `test`, `lint`) adjusted for pnpm and TypeScript.
- Electron main process execution updated with `tsx` and compiled production bundles.
