---
sidebar_position: 2
---

# Solana to BTC

This guide covers swapping Solana tokens to Bitcoin L1 (on-chain).

:::tip Runnable Examples
See complete working examples:
- [smartchain-to-btc/swapAdvancedSolana.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btc/swapAdvancedSolana.ts)
:::

## Overview

Solana to BTC swaps use the same ToBTC protocol as other chains. You lock tokens on Solana, and the LP sends Bitcoin to your address.

## Getting a Quote

```typescript
import {ToBTCSwapState, SwapAmountType, FeeType} from "@atomiqlabs/sdk";

const swap = await swapper.swap(
  Tokens.SOLANA.SOL,              // From SOL
  Tokens.BITCOIN.BTC,             // To BTC
  "0.00003",                      // Amount (3000 sats to receive)
  SwapAmountType.EXACT_OUT,       // Specify output amount
  solanaSigner.getAddress(),      // Source address
  "bc1q..."                       // Bitcoin destination address
);

// Quote information
console.log("Input (excluding fees):", swap.getInputWithoutFee().toString());
console.log("Fees:", swap.getFee().amountInSrcToken.toString());
console.log("Total input:", swap.getInput().toString());
console.log("Output:", swap.getOutput().toString());
console.log("Quote expires:", new Date(swap.getQuoteExpiry()));

// Estimated network fee
console.log("Est. network fee:", await swap.getSmartChainNetworkFee());

// Bitcoin fee rate being used
console.log("BTC fee rate:", swap.getBitcoinFeeRate(), "sats/vB");

// Fee breakdown
for (const fee of swap.getFeeBreakdown()) {
  console.log(`${FeeType[fee.type]}: ${fee.fee.amountInSrcToken}`);
}
```

## Executing the Swap

```typescript
// Listen for state changes (optional)
swap.events.on("swapState", (swap) => {
  console.log("State:", ToBTCSwapState[swap.getState()]);
});

// Execute the swap
const swapSuccessful = await swap.execute(
  solanaSigner,
  {
    onSourceTransactionSent: (txId) => {
      console.log(`Source tx sent: ${txId}`);
    },
    onSourceTransactionConfirmed: (txId) => {
      console.log(`Source tx confirmed: ${txId}`);
    },
    onSwapSettled: (btcTxId) => {
      console.log(`Bitcoin tx sent: ${btcTxId}`);
    }
  }
);

// Handle failure
if (!swapSuccessful) {
  console.log("Swap failed, refunding...");
  await swap.refund(solanaSigner);
  console.log("Refunded!");
} else {
  console.log("Success! BTC txId:", swap.getOutputTxId());
}
```

## EXACT_IN vs EXACT_OUT

### EXACT_OUT (Specify BTC amount to receive)

```typescript
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTC,
  "0.0001",                    // Receive exactly 0.0001 BTC (10,000 sats)
  SwapAmountType.EXACT_OUT,
  solanaSigner.getAddress(),
  "bc1q..."
);
```

### EXACT_IN (Specify token amount to spend)

```typescript
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTC,
  "1.5",                       // Spend exactly 1.5 SOL
  SwapAmountType.EXACT_IN,
  solanaSigner.getAddress(),
  "bc1q..."
);
```

## Refunding Failed Swaps

If the LP fails to send the Bitcoin payment, you can refund your tokens:

```typescript
// Check if refundable
if (swap.isRefundable()) {
  await swap.refund(solanaSigner);
}

// Or get refundable swaps on startup
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
| `QUOTE_EXPIRED` | -2 | Quote expired before execution |
| `QUOTE_SOFT_EXPIRED` | -1 | Quote probably expired (may succeed if tx in flight) |
| `CREATED` | 0 | Quote created, waiting for execution |
| `COMMITED` | 1 | Init transaction sent |
| `SOFT_CLAIMED` | 2 | LP processing (BTC tx sent but unconfirmed) |
| `CLAIMED` | 3 | Swap complete, BTC sent |
| `REFUNDABLE` | 4 | LP failed, can refund |

## API Reference

- [ToBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCSwap) - Swap class for Smart Chain to BTC
- [SwapAmountType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapAmountType) - Amount type enum
- [ToBTCSwapState](/sdk-reference/api/atomiq-sdk/src/enumerations/ToBTCSwapState) - Swap states
