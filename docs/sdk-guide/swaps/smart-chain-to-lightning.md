---
sidebar_position: 5
---

# Smart Chain to Lightning

This guide covers swapping smart chain tokens to Bitcoin Lightning Network.

:::tip Runnable Examples
See complete working examples:
- [smartchain-to-btcln/swapBasic.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btcln/swapBasic.ts)
- [smartchain-to-btcln/swapBasicLNURL.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btcln/swapBasicLNURL.ts)
- [smartchain-to-btcln/swapAdvancedSolana.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btcln/swapAdvancedSolana.ts)
:::

## Overview

Smart chain to Lightning swaps use the same protocol across all chains. You provide a Lightning invoice to pay, and the SDK handles locking tokens and waiting for the payment.

## Basic Swap with Invoice

### Getting a Quote

```typescript
import {ToBTCSwapState, SwapAmountType, FeeType} from "@atomiqlabs/sdk";

// Validate the invoice first
const lightningInvoice = "lnbc10u1p...";
if (!swapper.Utils.isValidLightningInvoice(lightningInvoice)) {
  throw new Error("Invalid Lightning invoice");
}

const swap = await swapper.swap(
  Tokens.STARKNET.STRK,           // From source token
  Tokens.BITCOIN.BTCLN,           // To Lightning
  undefined,                      // Amount comes from invoice!
  SwapAmountType.EXACT_OUT,       // Invoice has fixed amount
  starknetSigner.getAddress(),    // Source address
  lightningInvoice                // Lightning invoice to pay
);

// Quote information
console.log("Input:", swap.getInputWithoutFee().toString());
console.log("Fees:", swap.getFee().amountInSrcToken.toString());
console.log("Total input:", swap.getInput().toString());
console.log("Output (sats):", swap.getOutput().toString());
console.log("Est. network fee:", await swap.getSmartChainNetworkFee());

// Lightning-specific info
console.log("Non-custodial wallet?", swap.isPayingToNonCustodialWallet());
console.log("Likely to fail?", swap.willLikelyFail());
```

:::warning Non-Custodial Wallets
If `isPayingToNonCustodialWallet()` returns true, the recipient's wallet must be online to receive the payment.
:::

### Executing the Swap

```typescript
// Listen for state changes
swap.events.on("swapState", (swap) => {
  console.log("State:", ToBTCSwapState[swap.getState()]);
});

const swapSuccessful = await swap.execute(
  starknetSigner,
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
  await swap.refund(starknetSigner);
} else {
  // Get payment proof
  console.log("Payment preimage:", swap.getSecret());
}
```

## LNURL-pay Swaps

LNURL-pay allows reusable payment addresses with variable amounts.

### With LNURL-pay Link

```typescript
const lnurlPay = "lnurl1dp68gurn8ghj7...";
// Or lightning address: "user@wallet.example.com"

if (!swapper.Utils.isValidLNURL(lnurlPay)) {
  throw new Error("Invalid LNURL");
}

const swap = await swapper.swap(
  Tokens.STARKNET.STRK,
  Tokens.BITCOIN.BTCLN,
  3000n,                         // Now we can specify amount!
  SwapAmountType.EXACT_OUT,      // Or EXACT_IN
  starknetSigner.getAddress(),
  lnurlPay,
  {
    comment: "Payment for coffee"  // Optional comment
  }
);
```

### Handle Success Action

LNURL-pay can include a success action to display:

```typescript
const swapSuccessful = await swap.execute(starknetSigner, { /* callbacks */ });

if (swapSuccessful && swap.hasSuccessAction()) {
  const action = swap.getSuccessAction();
  console.log("Description:", action.description);
  console.log("Text:", action.text);        // May be null
  console.log("URL:", action.url);          // May be null
}
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
      // Generate invoice for the calculated output amount
      const invoice = await myLnWallet.createInvoice(amountSats);
      return invoice;
    },
    minMsats: 1_000_000n,        // Optional: 1000 sats minimum
    maxMsats: 1_000_000_000n     // Optional: 1M sats maximum
  }
);
```

:::info How EXACT_IN Works
1. SDK sends a quote request with a dummy invoice
2. LP returns the output amount based on your input
3. SDK calls `getInvoice()` with the calculated sats amount
4. SDK finalizes the quote with the real invoice
:::

## Refunding Failed Swaps

If the Lightning payment fails (route not found, recipient offline, etc.):

```typescript
if (!swapSuccessful) {
  // Wait for refund to become available
  if (swap.isRefundable()) {
    await swap.refund(starknetSigner);
    console.log("Refunded!");
  }
}

// Or check for refundable swaps on startup
const refundable = await swapper.getRefundableSwaps(
  "STARKNET",
  starknetSigner.getAddress()
);

for (const swap of refundable) {
  await swap.refund(starknetSigner);
}
```

## Examples for Each Chain

### Solana

```typescript
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTCLN,
  undefined,
  SwapAmountType.EXACT_OUT,
  solanaSigner.getAddress(),
  lightningInvoice
);

const success = await swap.execute(solanaSigner, { /* callbacks */ });
if (!success) await swap.refund(solanaSigner);
```

### Starknet

```typescript
const swap = await swapper.swap(
  Tokens.STARKNET.STRK,
  Tokens.BITCOIN.BTCLN,
  undefined,
  SwapAmountType.EXACT_OUT,
  starknetSigner.getAddress(),
  lightningInvoice
);

const success = await swap.execute(starknetSigner, { /* callbacks */ });
if (!success) await swap.refund(starknetSigner);
```

### EVM

```typescript
const swap = await swapper.swap(
  Tokens.CITREA.CBTC,
  Tokens.BITCOIN.BTCLN,
  undefined,
  SwapAmountType.EXACT_OUT,
  evmSigner.getAddress(),
  lightningInvoice
);

const success = await swap.execute(evmSigner, { /* callbacks */ });
if (!success) await swap.refund(evmSigner);
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

- [ToBTCLNSwap](/sdk-reference/sdk/classes/ToBTCLNSwap) - Swap class
- [SwapAmountType](/sdk-reference/sdk/enumerations/SwapAmountType) - Amount type enum
- [ToBTCSwapState](/sdk-reference/sdk/enumerations/ToBTCSwapState) - Swap states (shared with ToBTC)
