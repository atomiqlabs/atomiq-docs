---
sidebar_position: 1
---

# REST API Guide

The **Atomiq REST API** is an HTTP interface for the Atomiq cross-chain DEX, covering trustless swaps between **Bitcoin / Lightning** and smart chains (**Starknet, Solana, Botanix, Citrea, Alpen, Goat**).

You can either self-host the REST API on your own infrastructure using Docker (refer to **[Run REST API Locally](/rest-api-guide/run-locally/)**), or use the public API provided by Atomiq:

- Mainnet: `https://mainnet.swaps-api.atomiq.exchange/`
- Testnet4: `https://testnet4.swaps-api.atomiq.exchange/`

:::warning
By using the REST API you fully trust the backend to correctly validate swap data and serve properly constructed transactions to the clients. A compromised backend might drain your user's funds.

Prefer the **[Atomiq SDK](/sdk-guide/)**, which verifies everything locally and doesn't rely on trusted external APIs. Use the REST API only when you cannot use the SDK: non-JS runtimes or environments without local persistence.
:::

The API is **non-custodial**: it never holds user keys. All signing happens in the client wallet — the API builds unsigned transactions and submits signed ones.

:::tip
- Looking for exact request / response shapes? → **[REST API Reference](/rest-api-reference/atomiq-rest-api)**
- **Machine-readable OpenAPI 3.1 spec:** [`/rest-api-reference/openapi.json`](/rest-api-reference/openapi.json) — for code generators, AI agents, and tooling.
:::

## Conventions used throughout

[//]: # (TODO: Review this, we now use the public API urls throughout the docs, error shape might not actually contain the `retryAfter` - it surely doesn't in the public API &#40;azure based&#41; and the polling part is very specific)

- **Base URL** — every example uses `http://localhost:3000` for the self-hosted container. Replace with your public API base URL when pointing at the hosted service.
- **`GET` vs `POST`** — `GET` endpoints read parameters from the query string, `POST` endpoints from a JSON body.
- **Big numbers** — TypeScript `bigint` fields are encoded as decimal strings (e.g. `"150000"`), because JSON cannot safely represent arbitrary-precision integers. See [Concepts → Amounts](/rest-api-guide/concepts#amounts-and-bigint-as-string).
- **Error shape** — every error response is JSON: `{ "error": "<message>" }` for 4xx, with `retryAfter` added for 429. See [Concepts → Errors](/rest-api-guide/concepts#error-shape).
- **Polling** — swap progress is observed by repeatedly calling `getSwapStatus`. There is no streaming / webhook channel in the current version.

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