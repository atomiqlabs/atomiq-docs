---
sidebar_position: 4
---

# Smart Chain to BTC

Swap smart chain tokens (STRK, EVM tokens) to Bitcoin L1 (on-chain).

:::tip Runnable Examples
- [smartchain-to-btc/swapBasic.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btc/swapBasic.ts)
- [smartchain-to-btc/swapAdvancedStarknet.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btc/swapAdvancedStarknet.ts)
:::

:::info Looking for Solana?
See [Solana to BTC](./solana/solana-to-btc).
:::

## Executing the Swap

Create a [quote](./creating-quotes), then execute with your smart chain signer:

```typescript
import {ToBTCSwapState, SwapAmountType} from "@atomiqlabs/sdk";

// Create a quote
const swap = await swapper.swap(
  Tokens.STARKNET.STRK,           // From source token
  Tokens.BITCOIN.BTC,             // To BTC
  "0.00003",                      // Amount (3000 sats to receive)
  SwapAmountType.EXACT_OUT,
  starknetSigner.getAddress(),    // Source address
  "bc1q..."                       // Bitcoin destination address
);

// Execute the swap
const swapSuccessful = await swap.execute(
  starknetSigner, // Or evmSigner
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
  await swap.refund(starknetSigner);
  console.log("Refunded!");
} else {
  console.log("Success! BTC txId:", swap.getOutputTxId());
}
```

### EVM Example

```typescript
import {EVMSigner} from "@atomiqlabs/chain-evm";

const swap = await swapper.swap(
  Tokens.CITREA.CBTC, Tokens.BITCOIN.BTC,
  "0.0001", SwapAmountType.EXACT_OUT,
  evmSigner.getAddress(), "bc1q..."
);

const success = await swap.execute(evmSigner, { /* callbacks */ });
if (!success) await swap.refund(evmSigner);
```

## Refunding Failed Swaps

If the LP fails to send the Bitcoin payment, you can refund your tokens:

```typescript
if (swap.isRefundable()) {
  await swap.refund(starknetSigner);
}

// Or get refundable swaps on startup
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
