---
sidebar_position: 2
---

# Solana to BTC

Swap Solana tokens to Bitcoin L1 (on-chain).

:::tip Runnable Examples
- [smartchain-to-btc/swapAdvancedSolana.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btc/swapAdvancedSolana.ts)
:::

## Executing the Swap

Create a [quote](../creating-quotes), then execute with your Solana signer:

```typescript
import {ToBTCSwapState, SwapAmountType} from "@atomiqlabs/sdk";

// Create a quote
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,              // From SOL
  Tokens.BITCOIN.BTC,             // To BTC
  "0.00003",                      // Amount (3000 sats to receive)
  SwapAmountType.EXACT_OUT,
  solanaSigner.getAddress(),      // Source address
  "bc1q..."                       // Bitcoin destination address
);

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

if (!swapSuccessful) {
  console.log("Swap failed, refunding...");
  await swap.refund(solanaSigner);
} else {
  console.log("Success! BTC txId:", swap.getOutputTxId());
}
```

## Refunding Failed Swaps

```typescript
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
