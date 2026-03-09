---
sidebar_position: 4
---

# Solana to Lightning

This guide covers swapping Solana tokens to Bitcoin Lightning Network.

:::tip Runnable Examples
See complete working examples:
- [smartchain-to-btcln/swapAdvancedSolana.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btcln/swapAdvancedSolana.ts)
:::

## Overview

Solana to Lightning swaps use the same ToBTCLN protocol as other chains. You provide a Lightning invoice to pay, and the SDK handles locking tokens and waiting for the payment.

## Basic Swap with Invoice

```typescript
import {ToBTCSwapState, SwapAmountType} from "@atomiqlabs/sdk";

const lightningInvoice = "lnbc10u1p...";
if (!swapper.Utils.isValidLightningInvoice(lightningInvoice)) {
  throw new Error("Invalid Lightning invoice");
}

const swap = await swapper.swap(
  Tokens.SOLANA.SOL,              // From SOL
  Tokens.BITCOIN.BTCLN,           // To Lightning
  undefined,                      // Amount comes from invoice!
  SwapAmountType.EXACT_OUT,       // Invoice has fixed amount
  solanaSigner.getAddress(),      // Source address
  lightningInvoice                // Lightning invoice to pay
);

// Quote information
console.log("Input:", swap.getInputWithoutFee().toString());
console.log("Fees:", swap.getFee().amountInSrcToken.toString());
console.log("Total input:", swap.getInput().toString());
console.log("Output (sats):", swap.getOutput().toString());
```

## Executing the Swap

```typescript
swap.events.on("swapState", (swap) => {
  console.log("State:", ToBTCSwapState[swap.getState()]);
});

const swapSuccessful = await swap.execute(
  solanaSigner,
  {
    onSourceTransactionSent: (txId) => {
      console.log(`Source tx sent: ${txId}`);
    },
    onSourceTransactionConfirmed: (txId) => {
      console.log(`Source tx confirmed: ${txId}`);
    },
    onSwapSettled: (paymentHash) => {
      console.log(`Lightning payment sent: ${paymentHash}`);
    }
  }
);

if (!swapSuccessful) {
  console.log("Payment failed, refunding...");
  await swap.refund(solanaSigner);
} else {
  console.log("Payment preimage:", swap.getSecret());
}
```

## LNURL-pay

LNURL-pay allows reusable payment addresses with variable amounts:

```typescript
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTCLN,
  1_000_000_000n,               // Spend 1 SOL
  SwapAmountType.EXACT_IN,      // Calculate output
  solanaSigner.getAddress(),
  "user@walletofsatoshi.com"
);

console.log("Will send:", swap.getOutput().toString(), "sats");
```

## EXACT_IN Swaps

For exact input amount swaps, use a handler that generates invoices on demand:

```typescript
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTCLN,
  1_000_000_000n,                 // 1 SOL input
  SwapAmountType.EXACT_IN,       // Exact input
  solanaSigner.getAddress(),
  {
    getInvoice: async (amountSats, abortSignal?) => {
      const invoice = await myLnWallet.createInvoice(amountSats);
      return invoice;
    },
    minMsats: 1_000_000n,        // Optional: 1000 sats minimum
    maxMsats: 1_000_000_000n     // Optional: 1M sats maximum
  }
);
```

## Refunding Failed Swaps

```typescript
if (!swapSuccessful) {
  if (swap.isRefundable()) {
    await swap.refund(solanaSigner);
    console.log("Refunded!");
  }
}

// Or check for refundable swaps on startup
const refundable = await swapper.getRefundableSwaps(
  "SOLANA",
  solanaSigner.getAddress()
);

for (const swap of refundable) {
  await swap.refund(solanaSigner);
}
```

## Swap States

| State | Value | Description |
|-------|-------|-------------|
| `REFUNDED` | -3 | Swap failed and was refunded |
| `QUOTE_EXPIRED` | -2 | Quote expired |
| `QUOTE_SOFT_EXPIRED` | -1 | Quote probably expired |
| `CREATED` | 0 | Quote created |
| `COMMITED` | 1 | Init transaction sent |
| `SOFT_CLAIMED` | 2 | Payment preimage revealed |
| `CLAIMED` | 3 | Swap complete |
| `REFUNDABLE` | 4 | Payment failed, can refund |

## API Reference

- [ToBTCLNSwap](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCLNSwap) - Swap class
- [SwapAmountType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapAmountType) - Amount type enum
- [ToBTCSwapState](/sdk-reference/api/atomiq-sdk/src/enumerations/ToBTCSwapState) - Swap states (shared with ToBTC)
