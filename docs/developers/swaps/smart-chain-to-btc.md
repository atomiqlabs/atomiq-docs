---
sidebar_position: 3
---

# Smart Chain to BTC

This guide covers swapping smart chain tokens (SOL, STRK, EVM tokens) to Bitcoin L1 (on-chain).

:::tip Runnable Examples
See complete working examples:
- [smartchain-to-btc/swapBasic.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btc/swapBasic.ts)
- [smartchain-to-btc/swapAdvancedSolana.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btc/swapAdvancedSolana.ts)
- [smartchain-to-btc/swapAdvancedStarknet.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btc/swapAdvancedStarknet.ts)
:::

## Overview

Smart chain to BTC swaps use the same protocol across all chains (Solana, Starknet, EVM). You lock tokens on the smart chain, and the LP sends Bitcoin to your address.

## Getting a Quote

```typescript
import {ToBTCSwapState, SwapAmountType, FeeType} from "@atomiqlabs/sdk";

const swap = await swapper.swap(
  Tokens.SOLANA.SOL,              // From source token
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

// Pricing information
const priceInfo = swap.getPriceInfo();
console.log("Swap price:", priceInfo.swapPrice);
console.log("Market price:", priceInfo.marketPrice);
console.log("Difference:", priceInfo.difference);

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
  solanaSigner,  // Or starknetSigner, evmSigner
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

## Examples for Each Chain

### Solana

```typescript
import {SolanaSigner} from "@atomiqlabs/chain-solana";

const swap = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTC,
  "0.0001",
  SwapAmountType.EXACT_OUT,
  solanaSigner.getAddress(),
  "bc1q..."
);

const success = await swap.execute(solanaSigner, { /* callbacks */ });
if (!success) await swap.refund(solanaSigner);
```

### Starknet

```typescript
import {StarknetSigner} from "@atomiqlabs/chain-starknet";

const swap = await swapper.swap(
  Tokens.STARKNET.STRK,
  Tokens.BITCOIN.BTC,
  "0.0001",
  SwapAmountType.EXACT_OUT,
  starknetSigner.getAddress(),
  "bc1q..."
);

const success = await swap.execute(starknetSigner, { /* callbacks */ });
if (!success) await swap.refund(starknetSigner);
```

### EVM (Citrea)

```typescript
import {EVMSigner} from "@atomiqlabs/chain-evm";

const swap = await swapper.swap(
  Tokens.CITREA.CBTC,
  Tokens.BITCOIN.BTC,
  "0.0001",
  SwapAmountType.EXACT_OUT,
  evmSigner.getAddress(),
  "bc1q..."
);

const success = await swap.execute(evmSigner, { /* callbacks */ });
if (!success) await swap.refund(evmSigner);
```

## EXACT_IN vs EXACT_OUT

You can specify either the input or output amount:

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
