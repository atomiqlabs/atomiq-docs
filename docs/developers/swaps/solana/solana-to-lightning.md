---
sidebar_position: 4
---

# Solana to Lightning

Swap Solana tokens to Bitcoin Lightning Network.

:::tip Runnable Examples
- [smartchain-to-btcln/swapAdvancedSolana.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btcln/swapAdvancedSolana.ts)
:::

## Executing the Swap

Create a [quote](../creating-quotes) with a Lightning invoice, then execute:

```typescript
import {ToBTCSwapState, SwapAmountType} from "@atomiqlabs/sdk";

const lightningInvoice = "lnbc10u1p...";

// Create a quote
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,              // From SOL
  Tokens.BITCOIN.BTCLN,           // To Lightning
  undefined,                      // Amount comes from invoice
  SwapAmountType.EXACT_OUT,
  solanaSigner.getAddress(),      // Source address
  lightningInvoice                // Lightning invoice to pay
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
  SwapAmountType.EXACT_IN,
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
  SwapAmountType.EXACT_IN,
  solanaSigner.getAddress(),
  {
    getInvoice: async (amountSats, abortSignal?) => {
      const invoice = await myLnWallet.createInvoice(amountSats);
      return invoice;
    },
    minMsats: 1_000_000n,
    maxMsats: 1_000_000_000n
  }
);
```

## Refunding Failed Swaps

```typescript
if (swap.isRefundable()) {
  await swap.refund(solanaSigner);
}

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
