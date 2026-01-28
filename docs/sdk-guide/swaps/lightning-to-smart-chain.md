---
sidebar_position: 4
---

# Lightning to Smart Chain

This guide covers swapping Bitcoin Lightning Network to smart chain tokens.

:::tip Runnable Examples
See complete working examples:
- [btcln-to-smartchain/swapBasic.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btcln-to-smartchain/swapBasic.ts)
- [btcln-to-smartchain/swapBasicLNURL.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btcln-to-smartchain/swapBasicLNURL.ts)
- [btcln-to-smartchain/swapAdvancedStarknet.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btcln-to-smartchain/swapAdvancedStarknet.ts)
:::

## Protocol Differences

:::info
**Solana** uses the legacy protocol requiring an HTLC commitment on the destination chain.

**Starknet/EVM** uses the newer auto-settlement protocol where the LP automatically settles the swap after receiving payment.
:::

## Lightning to Starknet/EVM (Recommended)

### Getting a Quote

```typescript
import {FromBTCLNAutoSwapState, SwapAmountType, FeeType} from "@atomiqlabs/sdk";

const swap = await swapper.swap(
  Tokens.BITCOIN.BTCLN,          // From Lightning
  Tokens.STARKNET.STRK,          // To destination token
  3000n,                         // Amount in sats
  SwapAmountType.EXACT_IN,       // Specify input amount
  undefined,                     // Source (not used for LN)
  starknetSigner.getAddress(),   // Destination address
  {
    gasAmount: 0n                // Optional: request gas drop
  }
);

// Get the Lightning invoice to pay
const invoice = swap.getAddress();
const qrCodeData = swap.getHyperlink();

console.log("Pay this invoice:", invoice);
console.log("QR code data:", qrCodeData);

// Quote information
console.log("Input:", swap.getInputWithoutFee().toString());
console.log("Fees:", swap.getFee().amountInSrcToken.toString());
console.log("Output:", swap.getOutput().toString());
console.log("Gas drop:", swap.getGasDropOutput().toString());
console.log("Quote expires:", new Date(swap.getQuoteExpiry()));
```

### Executing with Lightning Wallet

```typescript
// Listen for state changes
swap.events.on("swapState", (swap) => {
  console.log("State:", FromBTCLNAutoSwapState[swap.getState()]);
});

// Execute - pass a wallet that can pay invoices
const automaticSettlementSuccess = await swap.execute(
  {
    payInvoice: async (bolt11) => {
      // Pay the invoice using WebLN, NWC, or your wallet
      console.log("Paying invoice:", bolt11);
      // Return payment preimage or empty string
      return "";
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

// Manual claim if needed
if (!automaticSettlementSuccess) {
  await swap.claim(starknetSigner);
}
```

### Manual Payment (External Wallet)

If you don't have programmatic wallet access:

```typescript
// Display invoice for user to pay manually
const invoice = swap.getAddress();
console.log("Please pay:", invoice);

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

## Lightning to Solana (Legacy Protocol)

### Getting a Quote

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

### Executing the Swap

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
const automaticSettlementSuccess = await swap.execute(
  {
    payInvoice: async (bolt11) => {
      // Use WebLN
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

const automaticSettlementSuccess = await swap.execute(
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

### FromBTCLNAuto States (Starknet/EVM)

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

### FromBTCLN States (Solana)

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

- [FromBTCLNAutoSwap](/sdk-reference/sdk/classes/FromBTCLNAutoSwap) - Starknet/EVM swap class
- [FromBTCLNSwap](/sdk-reference/sdk/classes/FromBTCLNSwap) - Solana swap class
- [SwapAmountType](/sdk-reference/sdk/enumerations/SwapAmountType) - Amount type enum
