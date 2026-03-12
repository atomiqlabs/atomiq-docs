---
sidebar_position: 1
---

# Bitcoin -> Solana

Swap Bitcoin L1 (on-chain) to Solana tokens. Solana still uses the legacy [PrTLC](/overview/core-primitives/prtlc/) based Bitcoin -> smart chain flow, verified through the on-chain [Bitcoin light client](/overview/core-primitives/bitcoin-light-client/). Unlike the newer [UTXO-controlled vault](/overview/core-primitives/utxo-controlled-vault/) protocol used on Starknet and EVM, the user must first initialize a destination-side swap escrow on Solana and lock a SOL deposit before sending BTC.

The user first pre-locks LP funds in the Solana-side PrTLC, sends the exact BTC amount to a dedicated swap address, and then a watchtower or the user proves the confirmed Bitcoin payment on Solana to claim the output. Because the user must post a security deposit and watchtower bounty in SOL on swap initation, this legacy flow has a cold-start requirement that the newer protocol avoids.

:::info Looking for the newer flow?
Starknet and EVM use the newer UTXO-controlled vault protocol. See [Bitcoin -> Smart Chain](../btc-to-smart-chain).
:::

## Executing the Swap

Here is a full flow for creating and executing the swap in the Bitcoin -> Solana direction via the `execute()` helper function, using the [FromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap) swap class:

```typescript
import {SwapAmountType} from "@atomiqlabs/sdk";

// Create a quote
const swap = await swapper.swap(
  Tokens.BITCOIN.BTC,         // Bitcoin on-chain input
  Tokens.SOLANA.SOL,          // Destination Solana token
  "0.0001",                   // Amount (10,000 sats to send)
  SwapAmountType.EXACT_IN,
  undefined,                  // Source address is not used for BTC source swaps
  solanaSigner.getAddress()   // Destination Solana address
); // Type gets inferred as FromBTCSwap

// Inspect the native-SOL amounts locked during initialization
console.log("Security deposit:", swap.getSecurityDeposit().toString());
console.log("Claimer bounty:", swap.getClaimerBounty().toString());

// Execute the swap
const automaticallySettled = await swap.execute(
  solanaSigner,               // Destination signer used to open the PrTLC escrow on Solana
  {
    address: "bc1q...",       // User's Bitcoin address
    publicKey: "03...",       // User's Bitcoin public key
    signPsbt: (psbt, signInputs) => {
      // Sign the funded PSBT with the Bitcoin wallet
      // Return the signed PSBT in hex or base64 format
      return "<signed PSBT>";
    }
  },
  {
    onDestinationCommitSent: (txId) => {
      console.log(`Swap escrow opened on Solana: ${txId}`);
    },
    onSourceTransactionSent: (txId) => {
      console.log(`Bitcoin tx sent: ${txId}`);
    },
    onSourceTransactionConfirmationStatus: (txId, confirmations, target, etaMs) => {
      console.log(`Confirmations: ${confirmations}/${target}, ETA: ${etaMs / 1000}s`);
    },
    onSourceTransactionConfirmed: (txId) => {
      console.log(`Bitcoin tx confirmed: ${txId}`);
    },
    onSwapSettled: (destinationTxId) => {
      console.log(`Swap settled on Solana: ${destinationTxId}`);
    }
  }
);

if (!automaticallySettled) {
  // Handle the edge-case when watchtowers do not settle the PrTLC in time
  console.log("Automatic settlement timed out, claiming manually...");
  await swap.claim(solanaSigner);
  console.log("Claimed!");
} else {
  console.log("Success! Output transaction ID:", swap.getOutputTxId());
}
```

:::warning
`execute()` requires a Solana signer because the legacy Solana flow must open the destination-side PrTLC before a usable Bitcoin swap address exists.

This flow assumes a single-address (non-HD) Bitcoin wallet capable of signing PSBTs. If you want to handle the Bitcoin payment manually from an external wallet instead, use the manual flow below.
:::

## Manual Execution Flow

```typescript
import {SwapAmountType} from "@atomiqlabs/sdk";

// Create a quote
const swap = await swapper.swap(
  Tokens.BITCOIN.BTC,
  Tokens.SOLANA.SOL,
  "0.0001",
  SwapAmountType.EXACT_IN,
  undefined,
  solanaSigner.getAddress()
);

// 1. Commit the swap on Solana to open the Bitcoin swap address
const txsCommit = await swap.txsCommit(); // Or use `swap.commit(solanaSigner)`
// Sign and send these Solana transactions here
...
// Important: wait until the SDK processes the commit before using the address
await swap.waitTillCommited();

// 2. Send the Bitcoin payment
const {psbtBase64, signInputs} = await swap.getFundedPsbt({
  address: "bc1q...",
  publicKey: "03..."
});
// Or use `swap.getAddress()` / `swap.getHyperlink()` and pay the exact amount from an external wallet
const signedPsbt = await externalBitcoinWallet.signPsbt(psbtBase64, signInputs);
const bitcoinTxId = await swap.submitPsbt(signedPsbt);

// 3. Wait for the Bitcoin transaction to reach the required confirmation count
await swap.waitForBitcoinTransaction((txId, confirmations, targetConfirmations, txEtaMs) => {
  console.log(`${confirmations}/${targetConfirmations} confirmations, ETA ${txEtaMs / 1000}s`);
});

// 4. Wait for watchtower settlement on Solana
const automaticallySettled = await swap.waitTillClaimed(30);

// 5. If watchtowers do not settle in time, claim manually
if (!automaticallySettled) {
  await swap.claim(solanaSigner);
}
```

:::warning
`getAddress()` and `getHyperlink()` only work after the swap has been committed. When paying from an external wallet, the amount must match [`getInput()`](/sdk-reference/api/atomiq-sdk/src/classes/ISwap#getinput) exactly. Sending a different amount can lead to loss of funds.
:::

:::info
If you need to sign the Solana transactions manually, use [`txsCommit()`](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap#txscommit) (like in the example) and [`txsClaim()`](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap#txsclaim) instead of [`claim()`](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap#claim). The returned transactions use the [SolanaTx](/sdk-reference/api/atomiq-chain-solana/src/type-aliases/SolanaTx) type.

For more information about how to sign and send these transactions manually refer to the [Manual Transactions](/developers/advanced/manual-transactions) page.
:::

## Claiming Past Unsettled Swaps

If the app was offline and the watchtower did not settle the PrTLC automatically, the swap can still be manually claimed on Solana once the Bitcoin transaction reaches the required confirmations.

Checking if a single swap is claimable and claiming it:

```typescript
if (swap.isClaimable()) {
  await swap.claim(solanaSigner);
}
```

Getting all swaps that are claimable and claiming them:

```typescript
const claimable = await swapper.getClaimableSwaps(
  "SOLANA",                  // Only get claimable swaps on SOLANA
  solanaSigner.getAddress()  // Only get claimable swaps for this destination address
); // This returns claimable Bitcoin -> Solana and Lightning -> Solana swaps

for (const swap of claimable) {
  // All the claimable swap types have the same `claim()` function signature
  await swap.claim(solanaSigner);
}
```

:::info
It is a good practice to query claimable swaps on your app's startup and either claim them automatically or prompt the user to claim them.

This legacy flow is more time-sensitive than the newer Bitcoin -> Smart chain protocol, because the LP can refund the PrTLC after expiry if no successful claim happens in time.
:::

## Security Deposit And Watchtower Bounty

Legacy Bitcoin -> Solana swaps require native SOL to initialize the destination-side PrTLC. The deposit has two parts:

- `getSecurityDeposit()`: the slashable SOL deposit that the LP can keep if the user never sends the Bitcoin payment.
- `getClaimerBounty()`: the SOL reward reserved for watchtowers that claim the swap automatically after Bitcoin confirmation.

You can inspect these amounts, along with the total native-token amount locked during initialization:

```typescript
console.log("Security deposit:", swap.getSecurityDeposit().toString());
console.log("Claimer bounty:", swap.getClaimerBounty().toString());
console.log("Total locked deposit:", swap.getTotalDeposit().toString());
```

:::warning
You need enough SOL to cover the legacy deposit requirements and the Solana transaction fees before calling `commit()` or `execute()`. This cold-start requirement is specific to the legacy Solana flow and does not exist in the newer Bitcoin -> Smart chain protocol used on Starknet and EVM.
:::

## Swap States

Read the current state of the swap in its [FromBTCSwapState](/sdk-reference/api/atomiq-sdk/src/enumerations/FromBTCSwapState) enum form with [`getState()`](/sdk-reference/api/atomiq-sdk/src/classes/ISwap#getstate) or in human readable [SwapStateInfo](/sdk-reference/api/atomiq-sdk/src/type-aliases/SwapStateInfo) form with description with [`getStateInfo()`](/sdk-reference/api/atomiq-sdk/src/classes/ISwap#getstateinfo):

```typescript
import {FromBTCSwapState, SwapStateInfo} from "@atomiqlabs/sdk";

const state: FromBTCSwapState = swap.getState();
console.log(`State (numeric): ${state}`);

const richState: SwapStateInfo<FromBTCSwapState> = swap.getStateInfo();
console.log(`State name: ${richState.name}`);
console.log(`State description: ${richState.description}`);
```

Subscribe to swap state updates with:

```typescript
swap.events.on("swapState", () => {
  const state: FromBTCSwapState = swap.getState();
});
```

### Table of States

| State | Value | Description |
|-------|-------|-------------|
| `FAILED` | -4 | The Bitcoin swap address expired and the LP already refunded its Solana-side liquidity. No BTC should be sent anymore. |
| `EXPIRED` | -3 | The Bitcoin swap address expired and should no longer be used, though a Bitcoin transaction already in flight might still let the swap succeed. |
| `QUOTE_EXPIRED` | -2 | Swap quote expired and can no longer be executed. |
| `QUOTE_SOFT_EXPIRED` | -1 | Swap should be treated as expired, though it might still succeed if the commit transaction is already in flight. |
| `PR_CREATED` | 0 | Quote created. Use `commit()` or `txsCommit()` to open the destination-side PrTLC escrow and activate the Bitcoin swap address. |
| `CLAIM_COMMITED` | 1 | The Solana escrow is open and the user can send BTC with `getFundedPsbt()`, `getAddress()`, or `getHyperlink()`. |
| `BTC_TX_CONFIRMED` | 2 | The Bitcoin payment has enough confirmations. Wait for watchtowers with `waitTillClaimed()` or claim manually with `claim()` / `txsClaim()`. |
| `CLAIM_CLAIMED` | 3 | Swap settled on Solana and funds were received. |

## API Reference

- [FromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap) - Swap class for Bitcoin -> Solana
- [SwapAmountType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapAmountType) - Amount type enum
- [FromBTCSwapState](/sdk-reference/api/atomiq-sdk/src/enumerations/FromBTCSwapState) - Swap states
