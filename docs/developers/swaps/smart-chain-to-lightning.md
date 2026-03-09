---
sidebar_position: 6
---

# Smart Chain to Lightning

Swap smart chain tokens to Bitcoin Lightning Network.

:::tip Runnable Examples
- [smartchain-to-btcln/swapBasic.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btcln/swapBasic.ts)
- [smartchain-to-btcln/swapBasicLNURL.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btcln/swapBasicLNURL.ts)
:::

:::info Looking for Solana?
See [Solana to Lightning](./solana/solana-to-lightning).
:::

## Executing the Swap

Create a [quote](./creating-quotes) with a Lightning invoice, then execute:

```typescript
import {ToBTCSwapState, SwapAmountType} from "@atomiqlabs/sdk";

const lightningInvoice = "lnbc10u1p...";
if (!swapper.Utils.isValidLightningInvoice(lightningInvoice)) {
  throw new Error("Invalid Lightning invoice");
}

// Create a quote
const swap = await swapper.swap(
  Tokens.STARKNET.STRK,           // From source token
  Tokens.BITCOIN.BTCLN,           // To Lightning
  undefined,                      // Amount comes from invoice
  SwapAmountType.EXACT_OUT,       // Invoice has fixed amount
  starknetSigner.getAddress(),    // Source address
  lightningInvoice                // Lightning invoice to pay
);

// Execute the swap
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
  console.log("Payment preimage:", swap.getSecret());
}
```

:::warning Non-Custodial Wallets
If `swap.isPayingToNonCustodialWallet()` returns true, the recipient's wallet must be online to receive the payment.
:::

### EVM Example

```typescript
const swap = await swapper.swap(
  Tokens.CITREA.CBTC, Tokens.BITCOIN.BTCLN,
  undefined, SwapAmountType.EXACT_OUT,
  evmSigner.getAddress(), lightningInvoice
);

const success = await swap.execute(evmSigner, { /* callbacks */ });
if (!success) await swap.refund(evmSigner);
```

## LNURL-pay Swaps

LNURL-pay allows reusable payment addresses with variable amounts:

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
  SwapAmountType.EXACT_OUT,
  starknetSigner.getAddress(),
  lnurlPay,                      // LNURL-pay or Lightning address
  {
    comment: "Payment for coffee"  // Optional comment
  }
);

const swapSuccessful = await swap.execute(starknetSigner, { /* callbacks */ });

// Handle success action
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
  Tokens.STARKNET.STRK,
  Tokens.BITCOIN.BTCLN,
  "100",                          // 100 STRK input
  SwapAmountType.EXACT_IN,
  starknetSigner.getAddress(),
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
if (swap.isRefundable()) {
  await swap.refund(starknetSigner);
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
