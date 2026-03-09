---
sidebar_position: 5
---

# Lightning to Smart Chain

Swap Bitcoin Lightning Network to Starknet or EVM tokens using the auto-settlement protocol.

:::tip Runnable Examples
- [btcln-to-smartchain/swapBasic.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btcln-to-smartchain/swapBasic.ts)
- [btcln-to-smartchain/swapBasicLNURL.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btcln-to-smartchain/swapBasicLNURL.ts)
- [btcln-to-smartchain/swapAdvancedStarknet.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btcln-to-smartchain/swapAdvancedStarknet.ts)
:::

:::info Looking for Solana?
Solana uses a different (legacy) swap protocol. See [Lightning to Solana](./solana/lightning-to-solana).
:::

## Executing the Swap

Create a [quote](./creating-quotes), then execute with a Lightning wallet:

```typescript
import {FromBTCLNAutoSwapState, SwapAmountType} from "@atomiqlabs/sdk";

// Create a quote
const swap = await swapper.swap(
  Tokens.BITCOIN.BTCLN,          // From Lightning
  Tokens.STARKNET.STRK,          // To destination token
  3000n,                         // Amount in sats
  SwapAmountType.EXACT_IN,
  undefined,                     // Source (not used for LN)
  starknetSigner.getAddress(),   // Destination address
  {
    gasAmount: 0n                // Optional: request gas drop
  }
);

// The quote includes a Lightning invoice to pay
console.log("Pay this invoice:", swap.getAddress());

// Execute - pass a wallet that can pay invoices
const settled = await swap.execute(
  {
    payInvoice: async (bolt11) => {
      // Pay the invoice using WebLN, NWC, or your wallet
      console.log("Paying invoice:", bolt11);
      return "";  // Return payment preimage or empty string
    }
  },
  {
    onSourceTransactionReceived: (paymentHash) => {
      console.log(`Payment received: ${paymentHash}`);
    },
    onSwapSettled: (txId) => {
      console.log(`Swap settled: ${txId}`);
    }
  }
);

if (!settled) {
  await swap.claim(starknetSigner);
}
```

## Manual Payment (External Wallet)

If you don't have programmatic wallet access:

```typescript
// Display invoice for user to pay manually
console.log("Please pay:", swap.getAddress());

// Wait for payment to be received
const paymentReceived = await swap.waitForPayment();
if (!paymentReceived) {
  console.log("Payment not received in time");
  return;
}

// Wait for automatic settlement
const settled = await swap.waitTillClaimed(60);
if (!settled) {
  await swap.claim(starknetSigner);
}
```

## Gas Drop

Request native tokens for transaction fees:

```typescript
const swap = await swapper.swap(
  Tokens.BITCOIN.BTCLN,
  Tokens.STARKNET.STRK,
  10000n,
  SwapAmountType.EXACT_IN,
  undefined,
  starknetSigner.getAddress(),
  {
    gasAmount: 1_000_000_000_000_000_000n // 1 STRK for gas
  }
);

console.log("Will receive:", swap.getOutput().toString(), "STRK");
console.log("Plus gas drop:", swap.getGasDropOutput().toString(), "STRK");
```

## WebLN Integration

For browser wallets with WebLN support:

```typescript
const settled = await swap.execute(
  {
    payInvoice: async (bolt11) => {
      if (typeof window !== 'undefined' && window.webln) {
        await window.webln.enable();
        const result = await window.webln.sendPayment(bolt11);
        return result.preimage;
      }
      throw new Error("WebLN not available");
    }
  },
  { /* callbacks */ }
);
```

## Nostr Wallet Connect (NWC)

```typescript
import {NWC} from "@getalby/sdk";

const nwc = new NWC({ nostrWalletConnectUrl: "nostr+walletconnect://..." });
await nwc.enable();

const settled = await swap.execute(
  {
    payInvoice: async (bolt11) => {
      const result = await nwc.payInvoice(bolt11);
      return result.preimage;
    }
  },
  { /* callbacks */ }
);
```

## Swap States

| State | Value | Description |
|-------|-------|-------------|
| `FAILED` | -4 | Claiming failed, LN payment will refund |
| `QUOTE_EXPIRED` | -3 | Quote expired |
| `QUOTE_SOFT_EXPIRED` | -2 | Quote probably expired |
| `EXPIRED` | -1 | Invoice expired |
| `PR_CREATED` | 0 | Waiting for LN payment |
| `PR_PAID` | 1 | Payment received, not yet settled |
| `CLAIM_COMMITED` | 2 | LP offered HTLC |
| `CLAIM_CLAIMED` | 3 | Swap complete |

## API Reference

- [FromBTCLNAutoSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNAutoSwap) - Starknet/EVM swap class
- [SwapAmountType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapAmountType) - Amount type enum
