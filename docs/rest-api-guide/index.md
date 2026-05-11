---
sidebar_position: 1
---

# REST API Guide

The **Atomiq REST API** is a dockerized HTTP interface for the Atomiq cross-chain DEX. It lets you offer trustless swaps between **Bitcoin / Lightning** and smart chains (**Starknet, Solana, Botanix, Citrea, Alpen, Goat**) without bundling the full Atomiq SDK into every mobile, extension, or web client.

This guide is written for integrators, but it's just as useful if you simply want to run the API as part of your own infrastructure and expose swaps to your users.

The API is **non-custodial**: it never holds user keys. All signing happens in the client wallet — the API builds unsigned transactions and submits signed ones.

:::tip
- Looking for exact request / response shapes? → **[REST API Reference](/rest-api-reference/overview)**
- Want to use Atomiq in-process from TypeScript instead of over HTTP? → **[SDK Guide](/sdk-guide/)**
- Need to self-host the service? → **[Run REST API Locally](/rest-api-guide/run-locally/)**
- **Machine-readable OpenAPI 3.1 spec:** [`/openapi.json`](/openapi.json) — for code generators, AI agents, and tooling.
:::

## What this guide covers

| Section | What you'll learn |
|---|---|
| **[Concepts](/rest-api-guide/concepts)** | Shared vocabulary: token IDs, amount encoding, the quote → execute model, error shape. |
| **[Quoting Swaps](/rest-api-guide/quoting)** | How to populate a swap form — supported tokens, compatible counter-tokens, min/max limits. |
| **[Creating & Executing a Swap](/rest-api-guide/creating-and-executing)** | The core lifecycle: create, poll, sign, submit. Action types. Execution steps. |
| **[Bitcoin & Lightning Specifics](/rest-api-guide/bitcoin-and-lightning)** | PSBT signing, BOLT11 invoices, LNURL-pay / LNURL-withdraw, preimage reveal. |
| **[Managing Swaps](/rest-api-guide/managing-swaps)** | Listing history, the "needs your attention" badge, resuming after restart, refunds. |
| **[Utilities](/rest-api-guide/utilities)** | Normalizing paste-field input, estimating spendable balance for a "Max" button. |
| **[Run REST API Locally](/rest-api-guide/run-locally/)** | Run `atomiq-api-docker` yourself with Docker Compose, plus full config reference. |

## Conventions used throughout

- **Base URL** — every example uses `http://localhost:3000` for the self-hosted container. Replace with your public API base URL when pointing at the hosted service.
- **`GET` vs `POST`** — `GET` endpoints read parameters from the query string, `POST` endpoints from a JSON body.
- **Big numbers** — TypeScript `bigint` fields are encoded as decimal strings (e.g. `"150000"`), because JSON cannot safely represent arbitrary-precision integers. See [Concepts → Amounts](/rest-api-guide/concepts#amounts-and-bigint-as-string).
- **Error shape** — every error response is JSON: `{ "error": "<message>" }` for 4xx, with `retryAfter` added for 429. See [Concepts → Errors](/rest-api-guide/concepts#error-shape).
- **Polling** — swap progress is observed by repeatedly calling `getSwapStatus`. There is no streaming / webhook channel in the current version.
