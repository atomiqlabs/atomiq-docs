---
sidebar_position: 3
---

# Historical Swaps

The SDK persists all swaps locally, allowing you to retrieve them later by ID.

:::tip Runnable Example
See the complete working example: [utils/pastSwaps.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/utils/pastSwaps.ts)
:::

## Getting Swap ID

Every swap has a unique ID that can be used for later retrieval:

```typescript
const swap = await swapper.swap(/* ... */);

// Get the swap ID
const swapId = swap.getId();
console.log("Swap ID:", swapId);

// Store this ID for later (e.g., in your database, URL, etc.)
```

## Retrieving Swap by ID

### With Known Type

If you know the expected swap type:

```typescript
import {SwapType} from "@atomiqlabs/sdk";

// Retrieve with specific type - returns correctly typed swap or undefined
const typedSwap = await swapper.getTypedSwapById(
  swapId,
  "SOLANA",              // Chain ID
  SwapType.TO_BTC        // Expected swap type
);

if (typedSwap) {
  // typedSwap is properly typed as ToBTCSwap<SolanaChainType>
  console.log("Output address:", typedSwap.getOutputAddress());
}
```

### With Unknown Type

If you don't know the swap type:

```typescript
import {isSwapType, SwapType} from "@atomiqlabs/sdk";

// Get base swap
const swap = await swapper.getSwapById(swapId);

if (swap) {
  // Use type guards to narrow the type
  if (isSwapType(swap, SwapType.TO_BTC)) {
    // Now typed as ToBTCSwap
    console.log("This is a TO_BTC swap");
  } else if (isSwapType(swap, SwapType.FROM_BTCLN_AUTO)) {
    // Now typed as FromBTCLNAutoSwap
    console.log("This is a Lightning to smart chain swap");
  }
}
```

## Swap Type Guards

The SDK provides type guards for each swap type:

```typescript
import {
  isSwapType,
  SwapType,
  ToBTCSwap,
  ToBTCLNSwap,
  FromBTCSwap,
  SpvFromBTCSwap,
  FromBTCLNSwap,
  FromBTCLNAutoSwap
} from "@atomiqlabs/sdk";

const swap = await swapper.getSwapById(swapId);

if (isSwapType(swap, SwapType.TO_BTC)) {
  const toBtcSwap: ToBTCSwap = swap;
}

if (isSwapType(swap, SwapType.TO_BTCLN)) {
  const toBtcLnSwap: ToBTCLNSwap = swap;
}

if (isSwapType(swap, SwapType.FROM_BTC)) {
  const fromBtcSwap: FromBTCSwap = swap;
}

if (isSwapType(swap, SwapType.SPV_FROM_BTC)) {
  const spvFromBtcSwap: SpvFromBTCSwap = swap;
}

if (isSwapType(swap, SwapType.FROM_BTCLN)) {
  const fromBtcLnSwap: FromBTCLNSwap = swap;
}

if (isSwapType(swap, SwapType.FROM_BTCLN_AUTO)) {
  const fromBtcLnAutoSwap: FromBTCLNAutoSwap = swap;
}
```

## Common Use Cases

### Resume Interrupted Swap

```typescript
// On app restart, check for in-progress swaps
async function resumeSwaps() {
  // Retrieve stored swap IDs from your persistence layer
  const storedSwapIds = await myDatabase.getActiveSwapIds();

  for (const swapId of storedSwapIds) {
    const swap = await swapper.getSwapById(swapId);

    if (swap && swap.isInProgress()) {
      console.log("Resuming swap:", swapId);
      // Re-attach listeners and continue monitoring
      swap.events.on("swapState", handleStateChange);
    }
  }
}
```

### Display Swap History

```typescript
async function getSwapHistory(swapIds: string[]) {
  const swaps = [];

  for (const id of swapIds) {
    const swap = await swapper.getSwapById(id);
    if (swap) {
      swaps.push({
        id: swap.getId(),
        state: swap.getState(),
        input: swap.getInput().toString(),
        output: swap.getOutput().toString(),
        successful: swap.isSuccessful(),
        timestamp: swap.getCreatedAt?.() // If available
      });
    }
  }

  return swaps;
}
```

### Link Sharing

```typescript
// Generate shareable link
function getSwapLink(swap: ISwap): string {
  const swapId = swap.getId();
  return `https://myapp.com/swap/${swapId}`;
}

// Parse swap from URL
async function getSwapFromUrl(url: string) {
  const swapId = url.split("/swap/")[1];
  return await swapper.getSwapById(swapId);
}
```

## Storage Backends

### Browser (IndexedDB)

Swaps are stored in IndexedDB by default in browser environments:

```typescript
// Automatic - no configuration needed
const swapper = Factory.newSwapper({
  // ...chain config
});
```

### Node.js (SQLite)

For Node.js, use SQLite storage:

```typescript
import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";

const swapper = Factory.newSwapper({
  // ...chain config
  swapStorage: chainId => new SqliteUnifiedStorage(`CHAIN_${chainId}.sqlite3`),
  chainStorageCtor: name => new SqliteStorageManager(`STORE_${name}.sqlite3`),
});
```

## API Reference

- [getSwapById](/sdk-reference/sdk/classes/Swapper#getswapbyid) - Get swap by ID (base type)
- [getTypedSwapById](/sdk-reference/sdk/classes/Swapper#gettypedswapbyid) - Get swap by ID with type
- [isSwapType](/sdk-reference/sdk/functions/isSwapType) - Type guard for swap types
