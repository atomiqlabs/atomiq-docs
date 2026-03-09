---
sidebar_position: 3
---

# Lightning to Solana

This guide covers swapping Bitcoin Lightning Network to Solana tokens using the legacy FromBTCLN protocol.

:::info Legacy Protocol
Solana uses the legacy protocol requiring an HTLC commitment on the destination chain. For Starknet/EVM swaps which use the newer auto-settlement protocol, see [Lightning to Smart Chain](../lightning-to-smart-chain).
:::

## Getting a Quote

```typescript
import {FromBTCLNSwapState, SwapAmountType} from "@atomiqlabs/sdk";

const swap = await swapper.swap(
  Tokens.BITCOIN.BTCLN,
  Tokens.SOLANA.SOL,
  10000n,                       // 10,000 sats
  SwapAmountType.EXACT_IN,
  undefined,
  solanaSigner.getAddress()
);

// Additional info for Solana
console.log("Security deposit:", swap.getSecurityDeposit().toString());
console.log("Invoice:", swap.getAddress());
```

## Executing the Swap

```typescript
await swap.execute(
  solanaSigner,
  {
    payInvoice: async (bolt11) => {
      // Pay invoice
      return "";
    }
  },
  {
    onSourceTransactionReceived: (paymentHash) => {
      console.log(`Payment received: ${paymentHash}`);
    },
    onDestinationCommitSent: (txId) => {
      console.log(`HTLC opened: ${txId}`);
    },
    onDestinationClaimSent: (txId) => {
      console.log(`Claim sent: ${txId}`);
    },
    onSwapSettled: (txId) => {
      console.log(`Swap settled: ${txId}`);
    }
  }
);
```

## LNURL-withdraw

LNURL-withdraw lets you pull funds from a service that holds your Bitcoin:

```typescript
const lnurlWithdraw = "lnurl1dp68gurn8ghj7...";

const swap = await swapper.swap(
  Tokens.BITCOIN.BTCLN,
  Tokens.SOLANA.SOL,
  10000n,
  SwapAmountType.EXACT_IN,
  lnurlWithdraw,
  solanaSigner.getAddress()
);

await swap.execute(
  solanaSigner,
  undefined,  // No Lightning wallet needed
  {
    onSourceTransactionReceived: (hash) => console.log("Withdrawal requested"),
    onDestinationCommitSent: (txId) => console.log("HTLC opened"),
    onSwapSettled: (txId) => console.log("Complete")
  }
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
| `PR_PAID` | 1 | Payment received |
| `CLAIM_COMMITED` | 2 | HTLC initiated |
| `CLAIM_CLAIMED` | 3 | Swap complete |

## API Reference

- [FromBTCLNSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNSwap) - Solana swap class
- [SwapAmountType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapAmountType) - Amount type enum
