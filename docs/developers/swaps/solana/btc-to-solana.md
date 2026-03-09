---
sidebar_position: 1
---

# BTC to Solana

Swap Bitcoin L1 (on-chain) to Solana tokens using the legacy FromBTC protocol.

:::info Legacy Protocol
Solana uses the legacy swap protocol which requires opening a swap address on-chain before sending Bitcoin. For Starknet/EVM swaps, see [BTC to Smart Chain](../btc-to-smart-chain).
:::

## Executing the Swap

Create a [quote](../creating-quotes), then execute. The Solana protocol requires a signer for the commitment step:

```typescript
import {FromBTCSwapState, SwapAmountType} from "@atomiqlabs/sdk";

// Create a quote
const swap = await swapper.swap(
  Tokens.BITCOIN.BTC,
  Tokens.SOLANA.SOL,
  "0.0001",
  SwapAmountType.EXACT_IN,
  undefined,
  solanaSigner.getAddress()
);

// Execute - Solana signer needed for on-chain commitment
const settled = await swap.execute(
  solanaSigner,
  {
    address: bitcoinWallet.address,
    publicKey: Buffer.from(bitcoinWallet.pubkey).toString("hex"),
    signPsbt: (psbt, signInputs) => {
      return bitcoinWallet.signPsbt(psbt.psbt, signInputs);
    }
  },
  {
    onDestinationCommitSent: (txId) => {
      console.log(`Swap address opened: ${txId}`);
    },
    onSourceTransactionSent: (txId) => {
      console.log(`Bitcoin tx sent: ${txId}`);
    },
    onSourceTransactionConfirmationStatus: (txId, confirmations, target, etaMs) => {
      console.log(`Confirmations: ${confirmations}/${target}`);
    },
    onSourceTransactionConfirmed: (txId) => {
      console.log(`Bitcoin tx confirmed: ${txId}`);
    },
    onSwapSettled: (txId) => {
      console.log(`Swap settled: ${txId}`);
    }
  }
);

if (!settled) {
  await swap.claim(solanaSigner);
}
```

:::info Security Deposit
Solana swaps require a security deposit in SOL that you get back when the swap succeeds. Check it with `swap.getSecurityDeposit()`.
:::

## Sending from External Wallet

If you don't have programmatic access to the Bitcoin wallet:

```typescript
const btcAddress = swap.getAddress();
const deepLink = swap.getHyperlink();

// IMPORTANT: Send the EXACT amount!
console.log(`Send exactly ${swap.getInput()} to ${btcAddress}`);

await swap.waitForBitcoinTransaction((txId, confirmations, target, etaMs) => {
  console.log(`Waiting: ${confirmations}/${target} confirmations`);
});

const settled = await swap.waitTillClaimed(60);
if (!settled) {
  await swap.claim(solanaSigner);
}
```

## Swap States

| State | Value | Description |
|-------|-------|-------------|
| `EXPIRED` | -3 | Bitcoin swap address expired |
| `QUOTE_EXPIRED` | -2 | Quote expired |
| `QUOTE_SOFT_EXPIRED` | -1 | Quote probably expired |
| `PR_CREATED` | 0 | Waiting for swap address to be opened |
| `CLAIM_COMMITED` | 1 | Swap address opened |
| `BTC_TX_CONFIRMED` | 2 | Bitcoin tx confirmed |
| `CLAIM_CLAIMED` | 3 | Swap complete, funds claimed |

## API Reference

- [FromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap) - Solana swap class
- [SwapAmountType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapAmountType) - Amount type enum
