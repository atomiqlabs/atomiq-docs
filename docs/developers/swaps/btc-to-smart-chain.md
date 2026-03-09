---
sidebar_position: 3
---

# BTC to Smart Chain

Swap Bitcoin L1 (on-chain) to Starknet or EVM tokens using the SPV-based protocol.

:::tip Runnable Examples
- [btc-to-smartchain/swapBasic.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btc-to-smartchain/swapBasic.ts)
- [btc-to-smartchain/swapAdvancedStarknet.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btc-to-smartchain/swapAdvancedStarknet.ts)
- [btc-to-smartchain/swapAdvancedEVM.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btc-to-smartchain/swapAdvancedEVM.ts)
:::

:::info Looking for Solana?
Solana uses a different (legacy) swap protocol. See [BTC to Solana](./solana/btc-to-solana).
:::

## Executing the Swap

Create a [quote](./creating-quotes), then execute with a Bitcoin wallet:

```typescript
import {SpvFromBTCSwapState, SwapAmountType} from "@atomiqlabs/sdk";

// Create a quote
const swap = await swapper.swap(
  Tokens.BITCOIN.BTC,           // From BTC
  Tokens.STARKNET.STRK,         // To destination token
  "0.00003",                    // Amount (3000 sats)
  SwapAmountType.EXACT_IN,
  undefined,                    // Source address (not used for BTC swaps)
  starknetSigner.getAddress(),  // Destination address
  {
    gasAmount: 0n               // Optional: request gas drop on destination
  }
);

// Execute with Bitcoin wallet
const settled = await swap.execute(
  {
    address: bitcoinWallet.address,
    publicKey: Buffer.from(bitcoinWallet.pubkey).toString("hex"),
    signPsbt: (psbt, signInputs) => {
      // Sign the PSBT - can return hex or base64
      return bitcoinWallet.signPsbt(psbt.psbt, signInputs);
    }
  },
  {
    onSourceTransactionSent: (txId) => {
      console.log(`Bitcoin tx sent: ${txId}`);
    },
    onSourceTransactionConfirmationStatus: (txId, confirmations, target, etaMs) => {
      console.log(`Confirmations: ${confirmations}/${target}, ETA: ${etaMs/1000}s`);
    },
    onSourceTransactionConfirmed: (txId) => {
      console.log(`Bitcoin tx confirmed: ${txId}`);
    },
    onSwapSettled: (txId) => {
      console.log(`Swap settled: ${txId}`);
    }
  }
);

// Manual claim if automatic settlement fails
if (!settled) {
  // Auto-settlement failed, claiming manually
  await swap.claim(starknetSigner);
}
```

## Gas Drop

Request native tokens on the destination chain to cover transaction fees:

```typescript
const swap = await swapper.swap(
  Tokens.BITCOIN.BTC,
  Tokens.STARKNET.STRK,
  "0.0001",
  SwapAmountType.EXACT_IN,
  undefined,
  starknetSigner.getAddress(),
  {
    gasAmount: 1_000_000_000_000_000_000n // Request 1 STRK for gas
  }
);

console.log("Gas drop:", swap.getGasDropOutput().toString());
```

## Sending from External Wallet

If you don't have programmatic access to the Bitcoin wallet:

```typescript
// Get the address/deeplink for external wallet
const btcAddress = swap.getAddress();
const deepLink = swap.getHyperlink();

// IMPORTANT: Send the EXACT amount!
console.log(`Send exactly ${swap.getInput()} to ${btcAddress}`);

// Wait for the Bitcoin transaction
await swap.waitForBitcoinTransaction((txId, confirmations, target, etaMs) => {
  console.log(`Waiting: ${confirmations}/${target} confirmations`);
});

// Then wait for settlement or claim manually
const settled = await swap.waitTillClaimed(60);
if (!settled) {
  await swap.claim(destinationSigner);
}
```

## Swap States

| State | Value | Description |
|-------|-------|-------------|
| `CLOSED` | -5 | Catastrophic failure (should never happen) |
| `FAILED` | -4 | Bitcoin tx was double-spent |
| `DECLINED` | -3 | LP declined to process the swap |
| `QUOTE_EXPIRED` | -2 | Quote expired before execution |
| `QUOTE_SOFT_EXPIRED` | -1 | Quote probably expired (may succeed if tx in flight) |
| `CREATED` | 0 | Waiting for Bitcoin tx signature |
| `SIGNED` | 1 | Bitcoin tx signed |
| `POSTED` | 2 | Posted to LP |
| `BROADCASTED` | 3 | LP broadcast Bitcoin tx |
| `FRONTED` | 4 | Funds fronted early to user |
| `BTC_TX_CONFIRMED` | 5 | Bitcoin tx confirmed |
| `CLAIM_CLAIMED` | 6 | Swap complete, funds claimed |

## API Reference

- [SpvFromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/SpvFromBTCSwap) - Starknet/EVM swap class
- [SwapAmountType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapAmountType) - Amount type enum
