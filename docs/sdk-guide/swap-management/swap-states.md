---
sidebar_position: 2
---

# Swap States

Understanding swap states is essential for tracking swap progress and handling edge cases.

## Getting Current State

```typescript
// Get current state
const state = swap.getState();

// Listen for state changes
swap.events.on("swapState", (swap) => {
  console.log("New state:", swap.getState());
});
```

## State Types by Swap Direction

### ToBTC / ToBTCLN States (Smart Chain to Bitcoin)

Used for swaps from smart chains to Bitcoin L1 or Lightning.

```typescript
import {ToBTCSwapState} from "@atomiqlabs/sdk";
```

| State | Value | Description |
|-------|-------|-------------|
| `REFUNDED` | -3 | Swap failed and was successfully refunded |
| `QUOTE_EXPIRED` | -2 | Quote expired before execution |
| `QUOTE_SOFT_EXPIRED` | -1 | Quote probably expired (may succeed if tx in flight) |
| `CREATED` | 0 | Quote created, waiting for execution |
| `COMMITED` | 1 | Init transaction sent on smart chain |
| `SOFT_CLAIMED` | 2 | LP processing (BTC tx sent but unconfirmed / LN preimage revealed) |
| `CLAIMED` | 3 | Swap complete, BTC sent |
| `REFUNDABLE` | 4 | LP failed, user can refund |

```typescript
// State flow example
swap.events.on("swapState", (swap) => {
  const state = swap.getState();
  switch (state) {
    case ToBTCSwapState.CREATED:
      console.log("Ready to execute");
      break;
    case ToBTCSwapState.COMMITED:
      console.log("Tokens locked, waiting for LP");
      break;
    case ToBTCSwapState.SOFT_CLAIMED:
      console.log("LP is processing payment");
      break;
    case ToBTCSwapState.CLAIMED:
      console.log("Success! BTC sent");
      break;
    case ToBTCSwapState.REFUNDABLE:
      console.log("LP failed, can refund");
      break;
  }
});
```

### FromBTC States (BTC L1 to Solana - Legacy)

Used for Bitcoin L1 to Solana swaps.

```typescript
import {FromBTCSwapState} from "@atomiqlabs/sdk";
```

| State | Value | Description |
|-------|-------|-------------|
| `EXPIRED` | -3 | Bitcoin swap address expired |
| `QUOTE_EXPIRED` | -2 | Quote expired before execution |
| `QUOTE_SOFT_EXPIRED` | -1 | Quote probably expired |
| `PR_CREATED` | 0 | Waiting for swap address to be opened |
| `CLAIM_COMMITED` | 1 | Swap address opened on Solana |
| `BTC_TX_CONFIRMED` | 2 | Bitcoin transaction confirmed |
| `CLAIM_CLAIMED` | 3 | Swap complete, tokens claimed |

### SpvFromBTC States (BTC L1 to Starknet/EVM)

Used for Bitcoin L1 to Starknet or EVM swaps.

```typescript
import {SpvFromBTCSwapState} from "@atomiqlabs/sdk";
```

| State | Value | Description |
|-------|-------|-------------|
| `CLOSED` | -5 | Catastrophic failure (should never happen) |
| `FAILED` | -4 | Bitcoin tx was double-spent |
| `DECLINED` | -3 | LP declined to process the swap |
| `QUOTE_EXPIRED` | -2 | Quote expired before execution |
| `QUOTE_SOFT_EXPIRED` | -1 | Quote probably expired (may succeed) |
| `CREATED` | 0 | Waiting for Bitcoin tx signature |
| `SIGNED` | 1 | Bitcoin tx signed by user |
| `POSTED` | 2 | Signed tx posted to LP |
| `BROADCASTED` | 3 | LP broadcast Bitcoin tx to network |
| `FRONTED` | 4 | LP fronted tokens early |
| `BTC_TX_CONFIRMED` | 5 | Bitcoin tx confirmed |
| `CLAIM_CLAIMED` | 6 | Swap complete |

### FromBTCLN States (Lightning to Solana - Legacy)

Used for Lightning to Solana swaps.

```typescript
import {FromBTCLNSwapState} from "@atomiqlabs/sdk";
```

| State | Value | Description |
|-------|-------|-------------|
| `FAILED` | -4 | Claiming failed, LN payment will refund automatically |
| `QUOTE_EXPIRED` | -3 | Quote expired |
| `QUOTE_SOFT_EXPIRED` | -2 | Quote probably expired |
| `EXPIRED` | -1 | Lightning invoice expired |
| `PR_CREATED` | 0 | Waiting for LN payment |
| `PR_PAID` | 1 | Payment received but not yet settled |
| `CLAIM_COMMITED` | 2 | HTLC claim initiated |
| `CLAIM_CLAIMED` | 3 | Swap complete |

### FromBTCLNAuto States (Lightning to Starknet/EVM)

Used for Lightning to Starknet or EVM swaps.

```typescript
import {FromBTCLNAutoSwapState} from "@atomiqlabs/sdk";
```

| State | Value | Description |
|-------|-------|-------------|
| `FAILED` | -4 | Claiming failed, LN payment will refund |
| `QUOTE_EXPIRED` | -3 | Quote expired |
| `QUOTE_SOFT_EXPIRED` | -2 | Quote probably expired |
| `EXPIRED` | -1 | Invoice expired |
| `PR_CREATED` | 0 | Waiting for LN payment |
| `PR_PAID` | 1 | Payment received |
| `CLAIM_COMMITED` | 2 | LP offered HTLC to user |
| `CLAIM_CLAIMED` | 3 | Swap complete |

## State Checking Methods

```typescript
// Success states
if (swap.isSuccessful()) {
  console.log("Swap completed successfully");
}

// Failure states
if (swap.isFailed()) {
  console.log("Swap failed");
}

// Can be refunded
if (swap.isRefundable()) {
  console.log("Can refund now");
  await swap.refund(signer);
}

// Quote expired before starting
if (swap.isQuoteExpired()) {
  console.log("Quote expired, create a new swap");
}

// Check if still in progress
if (swap.isInProgress()) {
  console.log("Swap is still processing");
}
```

## State Transition Diagram

```
ToBTC/ToBTCLN Flow:
CREATED → COMMITED → SOFT_CLAIMED → CLAIMED (success)
                  ↘ REFUNDABLE → REFUNDED (failure)

FromBTC (Solana) Flow:
PR_CREATED → CLAIM_COMMITED → BTC_TX_CONFIRMED → CLAIM_CLAIMED (success)
          ↘ EXPIRED (failure)

SpvFromBTC (Starknet/EVM) Flow:
CREATED → SIGNED → POSTED → BROADCASTED → FRONTED → BTC_TX_CONFIRMED → CLAIM_CLAIMED
                         ↘ DECLINED/FAILED (failure)

FromBTCLN Flow:
PR_CREATED → PR_PAID → CLAIM_COMMITED → CLAIM_CLAIMED (success)
          ↘ EXPIRED/FAILED (failure)
```

## API Reference

- [ToBTCSwapState](/sdk-reference/api/atomiq-sdk/src/enumerations/ToBTCSwapState)
- [FromBTCSwapState](/sdk-reference/api/atomiq-sdk/src/enumerations/FromBTCSwapState)
- [SpvFromBTCSwapState](/sdk-reference/api/atomiq-sdk/src/enumerations/SpvFromBTCSwapState)
- [FromBTCLNSwapState](/sdk-reference/api/atomiq-sdk/src/enumerations/FromBTCLNSwapState)
- [FromBTCLNAutoSwapState](/sdk-reference/api/atomiq-sdk/src/enumerations/FromBTCLNAutoSwapState)
