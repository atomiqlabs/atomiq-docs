---
sidebar_position: 5
---

# Swap Types

The SDK provides methods to inspect swap types and their features for any token pair.

:::tip Runnable Example
See the complete working example: [utils/swapTypes.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/utils/swapTypes.ts)
:::

## Getting Swap Type

```typescript
import {SwapType} from "@atomiqlabs/sdk";

// Get swap type for a token pair
const swapType = swapper.getSwapType(Tokens.BITCOIN.BTC, Tokens.SOLANA.SOL);
console.log("Swap type:", SwapType[swapType]);
```

## Swap Type Enum

| Type | Description | Direction |
|------|-------------|-----------|
| `FROM_BTC` | Legacy BTC L1 to Solana | BTC -> Solana |
| `SPV_FROM_BTC` | SPV BTC L1 to Starknet/EVM | BTC -> Starknet/EVM |
| `TO_BTC` | Smart chain to BTC L1 | Smart Chain -> BTC |
| `FROM_BTCLN` | Legacy Lightning to Solana | LN -> Solana |
| `FROM_BTCLN_AUTO` | Auto Lightning to Starknet/EVM | LN -> Starknet/EVM |
| `TO_BTCLN` | Smart chain to Lightning | Smart Chain -> LN |

## Swap Type Info

Get detailed information about a swap type's features:

```typescript
const swapType = swapper.getSwapType(Tokens.BITCOIN.BTC, Tokens.STARKNET.STRK);
const info = swapper.SwapTypeInfo[swapType];

console.log("Swap type:", SwapType[swapType]);
console.log("Features:", info);
```

### Feature Properties

```typescript
interface SwapTypeInfo {
  // Whether this swap type requires confirmation wait
  requiresConfirmations: boolean;

  // Whether automatic settlement is available
  hasAutoSettlement: boolean;

  // Whether gas drop is supported
  supportsGasDrop: boolean;

  // Typical confirmation time in blocks
  confirmationBlocks: number;
}
```

## Examples by Token Pair

```typescript
// BTC -> SOL (Legacy protocol)
const btcToSol = swapper.getSwapType(Tokens.BITCOIN.BTC, Tokens.SOLANA.SOL);
console.log(SwapType[btcToSol]); // "FROM_BTC"

// BTC -> STRK (SPV protocol)
const btcToStrk = swapper.getSwapType(Tokens.BITCOIN.BTC, Tokens.STARKNET.STRK);
console.log(SwapType[btcToStrk]); // "SPV_FROM_BTC"

// Lightning -> SOL (Legacy)
const lnToSol = swapper.getSwapType(Tokens.BITCOIN.BTCLN, Tokens.SOLANA.SOL);
console.log(SwapType[lnToSol]); // "FROM_BTCLN"

// Lightning -> STRK (Auto)
const lnToStrk = swapper.getSwapType(Tokens.BITCOIN.BTCLN, Tokens.STARKNET.STRK);
console.log(SwapType[lnToStrk]); // "FROM_BTCLN_AUTO"

// SOL -> BTC
const solToBtc = swapper.getSwapType(Tokens.SOLANA.SOL, Tokens.BITCOIN.BTC);
console.log(SwapType[solToBtc]); // "TO_BTC"

// STRK -> Lightning
const strkToLn = swapper.getSwapType(Tokens.STARKNET.STRK, Tokens.BITCOIN.BTCLN);
console.log(SwapType[strkToLn]); // "TO_BTCLN"
```

## Using Swap Type in UI

```typescript
function getSwapDescription(from: Token, to: Token): string {
  const swapType = swapper.getSwapType(from, to);

  switch (swapType) {
    case SwapType.FROM_BTC:
      return "Bitcoin on-chain to Solana (requires address commitment)";
    case SwapType.SPV_FROM_BTC:
      return "Bitcoin on-chain to " + to.chain + " (simple flow)";
    case SwapType.TO_BTC:
      return "To Bitcoin on-chain (LP sends BTC after lock)";
    case SwapType.FROM_BTCLN:
      return "Lightning to Solana (requires HTLC claim)";
    case SwapType.FROM_BTCLN_AUTO:
      return "Lightning to " + to.chain + " (auto-settled)";
    case SwapType.TO_BTCLN:
      return "To Lightning (instant settlement)";
    default:
      return "Unknown swap type";
  }
}

function getEstimatedTime(from: Token, to: Token): string {
  const swapType = swapper.getSwapType(from, to);

  switch (swapType) {
    case SwapType.FROM_BTC:
    case SwapType.SPV_FROM_BTC:
      return "~10-60 minutes (Bitcoin confirmations)";
    case SwapType.TO_BTC:
      return "~10-60 minutes (Bitcoin confirmations)";
    case SwapType.FROM_BTCLN:
    case SwapType.FROM_BTCLN_AUTO:
    case SwapType.TO_BTCLN:
      return "~seconds (Lightning instant)";
    default:
      return "Unknown";
  }
}
```

## Checking Swap Feasibility

```typescript
function isSwapSupported(from: Token, to: Token): boolean {
  try {
    const swapType = swapper.getSwapType(from, to);
    return swapType !== undefined;
  } catch {
    return false;
  }
}

// Check all combinations
const fromTokens = swapper.getSupportedTokens(true);
const toTokens = swapper.getSupportedTokens(false);

for (const from of fromTokens) {
  for (const to of toTokens) {
    if (isSwapSupported(from, to)) {
      const swapType = swapper.getSwapType(from, to);
      console.log(`${from.ticker} -> ${to.ticker}: ${SwapType[swapType]}`);
    }
  }
}
```

## API Reference

- [getSwapType](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getswaptype) - Get swap type for token pair
- [SwapType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType) - Swap type enum
