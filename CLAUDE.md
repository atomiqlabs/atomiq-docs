# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the documentation site for Atomiq, a trustless cross-chain DEX. Built with Docusaurus 3.9.2 and TypeDoc, it serves two main purposes:
1. **User Documentation** - Technical guides about Bitcoin light clients, submarine swaps, liquidity provider setup, and security
2. **SDK Reference** - Auto-generated TypeScript API documentation from the atomiq-sdk repository (atomiq-sdk-lib has been merged into atomiq-sdk)

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start local development server (hot reload enabled)
npm start

# Build static site
npm run build

# Serve built site locally
npm run serve

# Clear Docusaurus cache
npm run clear
```


### TypeDoc Documentation Generation
```bash
# Regenerate SDK reference documentation
# This happens automatically during build, but can be done manually:
npm run build
```

The TypeDoc plugin automatically generates SDK docs from:
- `repos/atomiq-sdk/src/` - Main SDK (includes former atomiq-sdk-lib)
- Chain and storage repos are also included as entry points.
Note that we are currently adding other repositories to the docs as well.

## Architecture

### Repository Structure

```
atomiq-docs/
├── docs/                          # User documentation (MDX)
│   ├── introduction.md
│   ├── security.md
│   ├── bitcoin-light-client/      # Bitcoin light client concepts
│   ├── submarine-swaps/           # Submarine swap protocols
│   ├── lps/                       # LP node setup guides
│   └── sdk-guide/                 # SDK usage tutorials
├── repos/                         # Local symlinks to sibling SDK source repos
│   ├── atomiq-sdk/                # Main SDK (@atomiqlabs/sdk, includes former sdk-lib)
│   └── ...                        # Chain, storage, and utility repos
├── sdk/                           # Generated TypeDoc output (gitignored)
├── src/                           # React components and CSS
├── static/                        # Static assets (images, favicon)
├── docusaurus.config.js           # Main Docusaurus config
├── sidebars.js                    # User docs sidebar
├── sdk-sidebars.js                # SDK reference sidebar (with path fixing)
└── typedoc.tsconfig.json          # TypeDoc-specific TypeScript config
```

### Docusaurus Architecture

**Dual Documentation Setup:**
1. **Primary docs instance** (`docs/`) - User-facing documentation at root path `/`
2. **SDK reference instance** (`sdk/`) - Auto-generated API docs at `/sdk-reference`

**Key Configuration Points:**

- **TypeDoc Plugin** (`docusaurus-plugin-typedoc`):
  - Entry points: `repos/atomiq-sdk/src/index.ts` and chain/storage repos
  - Output: `sdk/` directory
  - Flattened navigation structure (categories, no class/function grouping)
  - Hides internal/private members

- **Sidebar Generation**:
  - User docs: Static sidebar in `sidebars.js`
  - SDK reference: Dynamic sidebar from TypeDoc in `sdk-sidebars.js` with path transformation

- **Path Resolution**:
  - `typedoc.tsconfig.json` defines path mappings for `@atomiqlabs/sdk` and other packages
  - `sdk-sidebars.js` fixes TypeDoc-generated paths by removing `../sdk/` prefixes

### Git Submodules

The `repos/` directory contains Git submodules pointing to SDK repositories:
- These are read-only sources for TypeDoc generation
- Changes should be made in their respective repositories
- After SDK updates, submodules need to be updated here and docs regenerated

## Important Notes

### SDK Source Synchronization

When SDK repositories are updated:
1. Update the submodule: `cd repos/atomiq-sdk && git pull origin main`
2. Commit the submodule pointer update
3. Rebuild docs to regenerate SDK reference

### TypeDoc Configuration

The TypeDoc setup is customized to:
- Flatten hierarchy (no "Classes", "Functions" grouping)
- Hide breadcrumbs for cleaner navigation
- Use table format for parameters and type declarations
- Categorize by `@category` JSDoc tags instead of by kind

### Node Version

Requires Node.js >= 20.0 (specified in package.json engines)
