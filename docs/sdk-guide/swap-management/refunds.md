---
sidebar_position: 4
---

# Refunds

When a swap fails, you can refund your tokens back to your wallet.

:::tip Runnable Example
See the complete working example: [utils/pastSwaps.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/utils/pastSwaps.ts)
:::

## When Can You Refund?

Refunds are available for **Smart Chain to Bitcoin** swaps (`ToBTC`, `ToBTCLN`) when:

1. **LP Timeout** - The LP didn't send the Bitcoin payment within the timelock period
2. **Cooperative Refund** - The LP tried but failed (e.g., Lightning route not found) and provided a signed refund message

## Checking Refund Status

```typescript
// Check if swap is refundable
if (swap.isRefundable()) {
  console.log("Can refund now!");
  await swap.refund(signer);
}

// More detailed state check
import {ToBTCSwapState} from "@atomiqlabs/sdk";

if (swap.getState() === ToBTCSwapState.REFUNDABLE) {
  await swap.refund(signer);
}
```

## Refunding a Failed Swap

```typescript
const swapSuccessful = await swap.execute(solanaSigner, { /* callbacks */ });

if (!swapSuccessful) {
  console.log("Swap failed, attempting refund...");

  // Check if refundable
  if (swap.isRefundable()) {
    await swap.refund(solanaSigner);
    console.log("Refund successful!");
  } else {
    console.log("Swap still in progress or already refunded");
  }
}
```

## Checking for Refundable Swaps on Startup

It's good practice to check for refundable swaps when your app starts:

```typescript
async function checkAndRefund() {
  // Check Solana swaps
  const refundableSolana = await swapper.getRefundableSwaps(
    "SOLANA",
    solanaSigner.getAddress()
  );

  for (const swap of refundableSolana) {
    console.log("Found refundable swap:", swap.getId());
    await swap.refund(solanaSigner);
    console.log("Refunded!");
  }

  // Check Starknet swaps
  const refundableStarknet = await swapper.getRefundableSwaps(
    "STARKNET",
    starknetSigner.getAddress()
  );

  for (const swap of refundableStarknet) {
    await swap.refund(starknetSigner);
  }

  // Check EVM swaps
  const refundableEVM = await swapper.getRefundableSwaps(
    "CITREA",
    evmSigner.getAddress()
  );

  for (const swap of refundableEVM) {
    await swap.refund(evmSigner);
  }
}

// Call on app startup
await swapper.init();
await checkAndRefund();
```

## Periodic Refund Check

For long-running applications:

```typescript
// Check every 5 minutes
setInterval(async () => {
  try {
    await checkAndRefund();
  } catch (error) {
    console.error("Refund check failed:", error);
  }
}, 5 * 60 * 1000);
```

## Manual Refund Transactions

If you need to handle transactions manually:

```typescript
if (swap.isRefundable()) {
  // Get refund transactions
  const txs = await swap.txsRefund();

  // Sign and send externally
  for (const tx of txs) {
    // Handle based on chain
    // ...see Manual Transactions page
  }

  // Wait for SDK to register the refund
  await swap.waitTillRefunded();
}
```

## Refund Timing

### Cooperative Refund (Immediate)

When the LP provides a signed refund message:

```typescript
// LP tried to pay but failed
// Refund is immediately available
if (swap.isRefundable()) {
  await swap.refund(signer); // Works immediately
}
```

### Timelock Refund (After Expiry)

When the LP doesn't respond at all:

```typescript
// Must wait for timelock to expire
// Timelock is typically 24-48 hours for BTC, shorter for Lightning

// Check periodically
const checkRefund = setInterval(async () => {
  if (swap.isRefundable()) {
    await swap.refund(signer);
    clearInterval(checkRefund);
  }
}, 60000); // Check every minute
```

## Error Handling

```typescript
try {
  await swap.refund(signer);
} catch (error) {
  if (error.message.includes("not refundable")) {
    console.log("Swap is not in refundable state");
  } else if (error.message.includes("timelock")) {
    console.log("Timelock hasn't expired yet");
  } else {
    console.error("Refund failed:", error);
  }
}
```

## API Reference

- [refund](/sdk-reference/sdk/classes/ToBTCSwap#refund) - Execute refund
- [txsRefund](/sdk-reference/sdk/classes/ToBTCSwap#txsrefund) - Get refund transactions
- [isRefundable](/sdk-reference/sdk/classes/ToBTCSwap#isrefundable) - Check refund status
- [getRefundableSwaps](/sdk-reference/sdk/classes/Swapper#getrefundableswaps) - Get all refundable swaps
