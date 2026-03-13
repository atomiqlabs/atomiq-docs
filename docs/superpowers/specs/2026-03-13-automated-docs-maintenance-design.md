# Automated Documentation Maintenance System

**Date:** 2026-03-13
**Status:** Design approved, pending implementation

## Problem

When code changes land in source repos (atomiq-sdk, chain libs), the hand-written developer documentation in atomiq-docs can become stale. Currently the only process is "remember to update docs," which doesn't scale.

## Solution

A GitHub Actions-based system that automatically detects code changes in source repos and creates draft PRs on atomiq-docs with proposed documentation updates, using the Claude API for diff analysis and doc rewriting.

## Architecture

```
Source Repo (e.g. atomiq-sdk)            atomiq-docs repo
┌──────────────────────────┐            ┌──────────────────┐
│ push to main (src/)      │            │                  │
│         │                │            │                  │
│  ┌──────▼──────────┐     │   clone    │                  │
│  │ caller workflow │     │            │                  │
│  │ (~10 lines)     │─────┼───────────►│  reads docs/     │
│  │                 │     │            │                  │
│  │triggers reusable│     │  Claude    │                  │
│  │ workflow in     │     │  API       │                  │
│  │ atomiq-docs     │─────┼──────────► │                  │
│  │                 │     │            │                  │
│  │             ────┼─────┼──────────► │  PR with changes │
│  └─────────────────┘     │            │                  │
└──────────────────────────┘            └──────────────────┘
```

### Components

1. **Reusable workflow** (`atomiq-docs/.github/workflows/docs-check-reusable.yml`) — contains all logic: diff collection, Claude API call, PR creation
2. **Caller workflow** — lightweight ~10 line workflow in each source repo that triggers the reusable workflow

### Secrets Required (GitHub org-level)

- `ANTHROPIC_API_KEY` — for Claude API calls
- `DOCS_REPO_PAT` — GitHub PAT with write access to atomiq-docs (branches + PRs)

### Repository Visibility Requirement

The reusable workflow pattern (`uses: atomiqlabs/atomiq-docs/...@main`) requires that `atomiq-docs` is either a public repo or that cross-repo workflow access is enabled within the GitHub org. If `atomiq-docs` is private, use the `repository_dispatch` pattern as a fallback (source repo sends an event, atomiq-docs listens for it).

## Trigger Conditions

- **Event:** Push to `main` branch
- **Path filter:** `src/**` by default (ignores test-only, config-only changes). Caller workflows can broaden per-repo (e.g., `['src/**', 'index.ts', 'types/**']`) if public API surface exists outside `src/`.
- **Skip mechanism:** Commit message contains `[no-docs]`
- **Concurrency:** One run at a time per source repo, using `concurrency: docs-update-${{ inputs.repo-name }}`

## Reusable Workflow Steps

### Step 1: Collect the diff

Get the code diff for the push event:
- For single commits: `git diff HEAD~1..HEAD -- src/`
- For multi-commit pushes: diff against the `before` SHA from the push event
- Include commit messages for intent/context

### Step 2: Clone atomiq-docs

Shallow clone of atomiq-docs repo. Read doc files from the subdirectory specified by the `doc-paths` input (e.g., `docs/developers/` for SDK changes). The `sdk-reference/` directory is always ignored since it auto-regenerates from TypeDoc. Internal files (`docs/superpowers/`) are also excluded.

### Step 3: Call Claude API

Send a structured prompt containing:
- The git diff
- Commit messages
- Doc files from the relevant subdirectory as tagged blocks (filtered by `doc-paths` input)
- The source repo name for context

Only the doc subtree relevant to the source repo is included. This keeps the payload focused and within reasonable token limits.

**Error handling:** Retry up to 2 times with exponential backoff on transient failures (429, 500). Validate the response is valid JSON with the expected schema before proceeding. On persistent failure, create a GitHub issue on atomiq-docs noting the failed check rather than silently failing.

### Step 4: Parse response

Claude returns structured JSON. If `needs_update` is false, exit cleanly (no PR, no noise).

### Step 5: Create PR on atomiq-docs

- Check for existing open PR from this repo: `gh pr list --head docs-update/<repo-name> --state open`
- If found, force-push updated changes to the existing branch
- If not, create new branch: `docs-update/<source-repo>-<short-sha>`
- Apply file replacements from Claude's response
- Push and create PR via GitHub CLI
- PR body includes Claude's explanation of what changed and why

## Prompt Design

### System Prompt

```
You are a documentation maintenance assistant for Atomiq, a trustless
cross-chain DEX. You review code changes and update user-facing
documentation to keep it accurate.

Rules:
- Only modify docs that are actually affected by the code changes
- Preserve the existing writing style and markdown formatting
- Preserve all import statements, JSX components, and MDX-specific
  syntax exactly as-is. Only modify prose text and code examples.
- Focus on accuracy: method names, parameter types, usage patterns,
  code examples
- Do NOT rewrite docs for style — only fix what the code change broke
- If a code change is purely internal (no public API impact), say
  "no docs update needed"
- Atomiq prioritizes backwards compatibility — if something is
  deprecated but still works, note the deprecation rather than
  removing the old usage
```

### Response Format

```json
{
  "needs_update": true,
  "summary": "Brief description of what changed and why docs need updating",
  "changes": [
    {
      "file": "docs/developers/quick-start-browser.md",
      "reason": "createSwap() now takes an options object instead of positional args",
      "replacements": [
        {
          "old": "const swap = await sdk.createSwap(amount, address)",
          "new": "const swap = await sdk.createSwap({ amount, address })"
        }
      ]
    }
  ]
}
```

The replacement-based format (rather than full file content) reduces output tokens, minimizes risk of corrupting MDX/JSX syntax, and produces cleaner PR diffs.

## Caller Workflow Template

This goes in each source repo at `.github/workflows/docs-check.yml`:

```yaml
name: Check docs
on:
  push:
    branches: [main]
    paths: [src/**]

jobs:
  docs-check:
    if: "!contains(github.event.head_commit.message, '[no-docs]')"
    uses: atomiqlabs/atomiq-docs/.github/workflows/docs-check-reusable.yml@main
    secrets:
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      DOCS_REPO_PAT: ${{ secrets.DOCS_REPO_PAT }}
    with:
      repo-name: ${{ github.event.repository.name }}
      doc-paths: docs/developers/
```

The `doc-paths` input controls which doc subtree is sent to Claude, keeping the payload focused.

## Edge Cases

### Multiple rapid pushes
Uses `concurrency: docs-update-${{ inputs.repo-name }}` to serialize runs per source repo. If an open PR already exists from the same source repo, the action updates it (force-push to existing branch) instead of creating a new one. Detection via `gh pr list --head docs-update/<repo-name> --state open`.

### Claude says no update needed
Action exits cleanly with success status. No PR created, no noise.

### Large diffs
If the diff exceeds ~50KB, fall back to:
- Commit messages
- List of changed files
- Public API signature changes (exported function/class/type signatures)
Rather than raw line-by-line diff.

### PR merge conflicts
If two source repos update the same doc file concurrently, the second PR will have merge conflicts. This is expected and resolved manually during review, same as any normal PR.

### API failures
Transient Claude API failures are retried (2 retries, exponential backoff). Persistent failures create a GitHub issue on atomiq-docs with the error details so the check isn't silently lost.

## Rollout Plan

1. **Phase 1:** atomiq-sdk (highest doc surface area, most impactful)
2. **Phase 2:** atomiq-chain-starknet, atomiq-chain-solana, atomiq-chain-evm, atomiq-base
3. **Phase 3:** Other repos as needed

## Scope Boundaries

### In scope
- Hand-written docs in `docs/` directory (MD and MDX files)
- Developer guides, quick starts, swap type docs, advanced usage

### Out of scope
- SDK reference (`sdk-reference/`) — auto-generated by TypeDoc, stays in sync automatically
- Protocol-level docs (Bitcoin light client, submarine swaps) — these change rarely and are driven by protocol design, not code
- LP setup guides — operational docs, not API-driven
- Internal spec files (`docs/superpowers/`)

## Cost Estimate

- Claude API call per push to main with src/ changes
- Typical payload: ~30-80KB of filtered docs + ~10KB diff, ~5KB output (replacement format)
- At Sonnet pricing: roughly $0.10-0.50 per run
- Expected frequency: a few times per week across all repos
- Monthly cost: ~$5-20
