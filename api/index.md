---
title: SDK API Reference
sidebar_position: 0
---

# SDK API Reference

TypeScript API documentation for the Atomiq SDK - trustless cross-chain swaps between Bitcoin and smart chains.

---

## Quick Start

```typescript
import { SwapperFactory } from "@atomiqlabs/sdk";
import { SolanaInitializer } from "@atomiqlabs/chain-solana";

// 1. Create factory with chain support
const factory = new SwapperFactory([SolanaInitializer]);

// 2. Initialize swapper
const swapper = await factory.newSwapperInitialized({
  bitcoinNetwork: BitcoinNetwork.MAINNET,
  chains: {
    SOLANA: { rpcUrl: "https://api.mainnet-beta.solana.com" }
  }
});

// 3. Access tokens
const usdc = factory.Tokens.SOLANA.USDC;
const btc = factory.Tokens.BITCOIN.BTC;
```

---

## Core

The main entry point for the SDK.

| Class | Description |
|-------|-------------|
| [SwapperFactory](/api/sdk/classes/SwapperFactory) | Factory for creating typed Swapper instances with multi-chain support |

---

## Configuration

Types for configuring the SwapperFactory.

| Type | Description |
|------|-------------|
| [TypedSwapperOptions](/api/sdk/type-aliases/TypedSwapperOptions) | Configuration options for creating a swapper |
| [TypedSwapper](/api/sdk/type-aliases/TypedSwapper) | A typed Swapper instance for specific chains |
| [TypedTokens](/api/sdk/type-aliases/TypedTokens) | Token definitions for all configured chains |

---

## Storage

Persist swap data across sessions.

| Class | Environment | Description |
|-------|-------------|-------------|
| [LocalStorageManager](/api/sdk/classes/LocalStorageManager) | Browser | Uses browser's localStorage API |
| FileSystemStorageManager | Node.js | Creates JSON files on disk (import from `@atomiqlabs/sdk/fs-storage`) |

---

## Utilities

Helper functions for common operations.

| Function | Description |
|----------|-------------|
| [toHumanReadableString](/api/sdk/functions/toHumanReadableString) | Convert token amount to display string (e.g., 1500000n → "1.5") |
| [fromHumanReadableString](/api/sdk/functions/fromHumanReadableString) | Convert display string to token amount (e.g., "1.5" → 1500000n) |
| [timeoutSignal](/api/sdk/functions/timeoutSignal) | Create an AbortSignal with automatic timeout |

---

## Full Reference

For the complete auto-generated API documentation, see the [SDK Package](/api/sdk).
