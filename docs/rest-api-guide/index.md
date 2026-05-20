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

- **Base URL** — examples use `https://mainnet.swaps-api.atomiq.exchange` (the hosted public API). Replace with `https://testnet4.swaps-api.atomiq.exchange` for testnet, or with `http://localhost:3000` when running the self-hosted container.
- **`GET` vs `POST`** — `GET` endpoints read parameters from the query string, `POST` endpoints from a JSON body.

The rest of this guide assumes you're familiar with the shared vocabulary described here.

### Token identifiers

Tokens are identified by a single string in the form `<network>-<ticker>`. Typical values:

| Token ID | Meaning |
|---|---|
| `BITCOIN-BTC` | On-chain Bitcoin |
| `LIGHTNING-BTC` | Bitcoin over the Lightning Network |
| `STARKNET-STRK`, `STARKNET-ETH`, `STARKNET-<erc20-address>` | Starknet native and ERC-20 tokens |
| `SOLANA-SOL`, `SOLANA-<spl-mint>` | Solana native and SPL tokens |
| `CITREA-CBTC`, `BOTANIX-BTC`, `ALPEN-BTC`, `GOAT-BTC` | Supported EVM chains |

You don't need to hard-code this list. Use [`GET /getSupportedTokens`](/rest-api-reference/get-supported-tokens) and [`GET /getSwapCounterTokens`](/rest-api-reference/get-swap-counter-tokens) to enumerate what the current LP network supports — see [Quoting Swaps](/rest-api-guide/quoting).

### Amounts and BigInt-as-string

Numerical integer values (like TypeScript's `bigint`) appear in this API as [**BigIntString**](/rest-api-reference/schemas/bigintstring) (e.g. `"150000"`, `"1500000000000000000"`), because JSON cannot safely encode arbitrary-precision integers as native numbers.

Every monetary amount returned by the API uses the [`ApiAmount`](/rest-api-reference/schemas/apiamount) shape:

```json
{
  "amount":    "0.00003",                   // decimal-formatted for display
  "rawAmount": "3000",                      // base units as a decimal string
  "decimals":  8,                           // token decimals
  "symbol":    "BTC",                       // ticker
  "chain":     "BITCOIN"                    // chain identifier
}
```

When sending amounts to the API, for example when creating a swap with [`POST /createSwap`](/rest-api-reference/create-swap), always pass the **raw base-unit string** — not a decimal, not a number. `"150000"` for 0.0015 BTC, not `0.0015`.

### Error shape

All errors are JSON. For `4xx` responses the body is `{ "error": "<message>" }`. Transient `5xx` errors should be retried with backoff.

Rate-limit (`429`) responses may include additional fields depending on how the API is deployed — the self-hosted container returns `retryAfter` in seconds inside the body, while hosted deployments typically expose `Retry-After` only as a standard HTTP header. Treat both as advisory and back off accordingly.

[//]: # (//TODO: Go over the table here and update based on what's currently in the pages)

## What this guide covers

| Section | What you'll learn |
|---|---|
| **[Creating & Executing a Swap](/rest-api-guide/creating-and-executing)** | The core lifecycle: create, poll, sign, submit. Action types. Execution steps. Terminal states. The simple path — start here if you just want to fire a swap. |
| **[Quoting Swaps](/rest-api-guide/quoting)** | The full pre-swap flow: list tokens, find compatible counter-tokens, estimate spendable balance, fetch limits, parse and validate the recipient address. |
| **[Listing Swaps](/rest-api-guide/listing-swaps)** | Listing history and the "needs your attention" badge; resuming swaps after restart; refunds. |
| **[Bitcoin & Lightning Specifics](/rest-api-guide/bitcoin-and-lightning)** | PSBT signing, BOLT11 invoices, LNURL-pay / LNURL-withdraw, preimage reveal, gas-drop. |
| **[Run REST API Locally](/rest-api-guide/run-locally/)** | Run `atomiq-api-docker` yourself with Docker Compose, plus full config reference. |
