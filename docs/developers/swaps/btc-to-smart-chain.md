---
sidebar_position: 2
---

# BTC to Smart Chain

This guide covers swapping Bitcoin L1 (on-chain) to smart chain tokens like SOL, STRK, or EVM tokens.

:::tip Runnable Examples
See complete working examples:
- [btc-to-smartchain/swapBasic.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btc-to-smartchain/swapBasic.ts)
- [btc-to-smartchain/swapAdvancedStarknet.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btc-to-smartchain/swapAdvancedStarknet.ts)
- [btc-to-smartchain/swapAdvancedEVM.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btc-to-smartchain/swapAdvancedEVM.ts)
:::

## Protocol Differences

:::info
**Solana** uses the legacy swap protocol which requires opening a swap address on-chain before sending Bitcoin.

**Starknet/EVM** uses the newer SPV-based protocol which is simpler - you just sign and send the Bitcoin transaction.
:::

## BTC to Starknet/EVM (Recommended)

### Getting a Quote

```typescript
import {SpvFromBTCSwapState, SwapAmountType, FeeType} from "@atomiqlabs/sdk";

const swap = await swapper.swap(
  Tokens.BITCOIN.BTC,           // From BTC
  Tokens.STARKNET.STRK,         // To destination token
  "0.00003",                    // Amount (3000 sats)
  SwapAmountType.EXACT_IN,      // Specify input amount
  undefined,                    // Source address (not used for BTC swaps)
  starknetSigner.getAddress(),  // Destination address
  {
    gasAmount: 0n               // Optional: request gas drop on destination
  }
);

// Quote information
console.log("Input:", swap.getInputWithoutFee().toString());
console.log("Fees:", swap.getFee().amountInSrcToken.toString());
console.log("Total input:", swap.getInput().toString());
console.log("Output:", swap.getOutput().toString());
console.log("Quote expires:", new Date(swap.getQuoteExpiry()));

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

### Executing the Swap

```typescript
// Listen for state changes (optional)
swap.events.on("swapState", (swap) => {
  console.log("State:", SpvFromBTCSwapState[swap.getState()]);
});

// Execute with Bitcoin wallet
const automaticSettlementSuccess = await swap.execute(
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
if (!automaticSettlementSuccess) {
  console.log("Auto-settlement failed, claiming manually...");
  await swap.claim(starknetSigner);
}
```

### Gas Drop

You can request native tokens on the destination chain to cover transaction fees:

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

// Check gas drop amount
console.log("Gas drop:", swap.getGasDropOutput().toString());
```

## BTC to Solana (Legacy Protocol)

The Solana protocol requires an additional commitment step.

### Getting a Quote

```typescript
import {FromBTCSwapState, SwapAmountType} from "@atomiqlabs/sdk";

const swap = await swapper.swap(
  Tokens.BITCOIN.BTC,
  Tokens.SOLANA.SOL,
  "0.0001",
  SwapAmountType.EXACT_IN,
  undefined,
  solanaSigner.getAddress()
);

// Additional info for Solana swaps
console.log("Security deposit:", swap.getSecurityDeposit().toString());
console.log("Claimer bounty:", swap.getClaimerBounty().toString());
```

:::info Security Deposit
Solana swaps require a security deposit in SOL that you get back when the swap succeeds. This deposit reserves liquidity from the LP.
:::

### Executing the Swap

```typescript
const automaticSettlementSuccess = await swap.execute(
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

if (!automaticSettlementSuccess) {
  await swap.claim(solanaSigner);
}
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

### SpvFromBTC States (Starknet/EVM)

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

### FromBTC States (Solana)

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

- [SpvFromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/SpvFromBTCSwap) - Starknet/EVM swap class
- [FromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap) - Solana swap class
- [SwapAmountType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapAmountType) - Amount type enum
