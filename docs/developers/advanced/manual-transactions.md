---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manual Transactions

Use the `txs*()` methods when your app needs to sign and broadcast smart-chain transactions outside the SDK's built-in signer flow. This is useful for manual signing flows (e.g. hardware wallets or custom custody solutions) or apps where transaction approval is handled by another application layer.

:::tip Runnable Examples
- [smartchain-to-btc/swapAdvancedSolana.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btc/swapAdvancedSolana.ts)
- [smartchain-to-btc/swapAdvancedStarknet.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btc/swapAdvancedStarknet.ts)
- [smartchain-to-btc/swapAdvancedEVM.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btc/swapAdvancedEVM.ts)
- [smartchain-to-btcln/swapAdvancedSolana.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btcln/swapAdvancedSolana.ts)
- [btc-to-smartchain/swapAdvancedEVM.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btc-to-smartchain/swapAdvancedEVM.ts)
:::

## How Manual Execution Works

Each action method has a transaction-producing counterpart and a matching wait method:

| Action | Manual transaction method | Wait after broadcasting |
|--------|---------------------------|-------------------------|
| `commit()` | `txsCommit()` | `waitTillCommited()` |
| `claim()` | `txsClaim()` | `waitTillClaimed()` |
| `refund()` | `txsRefund()` | `waitTillRefunded()` |
| `commitAndClaim()` | `txsCommitAndClaim()` | `waitTillClaimed()` |

The manual transaction flow is always the same:

1. Create the swap quote normally with `swapper.swap(...)`.
2. Call the relevant `txs*()` method to get the smart-chain transactions.
3. Sign and broadcast the returned transactions with your external wallet flow.
4. Call the matching `waitTill*()` method so the SDK can observe the result, update storage, and emit swap state changes.

```typescript
// 1. Get the smart-chain transactions for the next action
const txsCommit = await swap.txsCommit();

// 2. Sign and broadcast them with your own wallet flow
...

// 3. Let the SDK observe the result and update swap state
await swap.waitTillCommited();
```

:::info
`txs*()` only replaces the smart-chain signing and broadcasting step. Bitcoin-side and Lightning-side steps such as `waitForBitcoinTransaction()`, `getFundedPsbt()`, or `waitForPayment()` stay the same as in the regular swap tutorials.
:::

## Sending Transactions by Chain

The returned transaction shape depends on the smart chain. The same pattern applies whether you are calling `txsCommit()`, `txsClaim()`, `txsRefund()`, or `txsCommitAndClaim()`.

<Tabs groupId="manual-transactions-chain">
<TabItem value="solana" label="Solana" default>

For Solana, each returned [SolanaTx](/sdk-reference/api/atomiq-chain-solana/src/type-aliases/SolanaTx) contains a `tx` and any additional `signers` that the SDK needs to attach before your wallet signs.

```typescript
import {Connection} from "@solana/web3.js";

const connection = new Connection(rpcUrl);

const txsCommit = await swap.txsCommit();

// Sign helper keypairs required by the SDK first
txsCommit.forEach(({tx, signers}) => {
  if (signers.length > 0) {
    tx.sign(...signers);
  }
});

// Then let the external wallet sign the transactions
const signedTransactions = await wallet.signAllTransactions(
  txsCommit.map(({tx}) => tx)
);

// IMPORTANT: Broadcast sequentially
for (const tx of signedTransactions) {
  const signature = await connection.sendRawTransaction(tx.serialize());
  // Wait for confirmation before sending the next transaction
  await connection.confirmTransaction(signature);
}

// Make sure you wait till the SDK processes the transaction
await swap.waitTillCommited();
```

</TabItem>
<TabItem value="starknet" label="Starknet">

For Starknet, the returned [StarknetTx](/sdk-reference/api/atomiq-chain-starknet/src/type-aliases/StarknetTx) objects tell you whether to execute a normal invoke or deploy an account first.

```typescript
const txsCommit = await swap.txsCommit();

// Starknet has two transaction types: INVOKE and DEPLOY_ACCOUNT
// SDK automatically detects if account is not deployed and adds a DEPLOY_ACCOUNT transaction
// IMPORTANT: Broadcast sequentially
for (const tx of txsCommit) {
  // You may also sign all the transactions first and then broadcast them
  if (tx.type === "INVOKE") {
    await account.execute(tx.tx, tx.details);
  }

  if (tx.type === "DEPLOY_ACCOUNT") {
    await account.deployAccount(tx.tx, tx.details);
  }
}

// Make sure you wait till the SDK processes the transaction
await swap.waitTillCommited();
```

</TabItem>
<TabItem value="evm" label="EVM">

For EVM chains, the returned objects use the `ethers` [TransactionRequest](https://docs.ethers.org/v6/api/providers/#TransactionRequest) shape.

```typescript
const txsCommit = await swap.txsCommit();

// IMPORTANT: Broadcast sequentially
for (const tx of txsCommit) {
  // You may also sign all the transactions first and then broadcast them
  const response = await wallet.sendTransaction(tx);
  // Wait for confirmation before sending the next transaction
  await response.wait();
}

// Make sure you wait till the SDK processes the transaction
await swap.waitTillCommited();
```

</TabItem>
</Tabs>

:::warning
Ensure that you broadcast the transactions sequentially, always waiting for the previous one to confirm before sending the next one. Otherwise, you might expose yourself to the risk of losing funds especially during HTLC swaps where the pre-image **must** only be revealed after the HTLC is initiated.
:::

## Skip Checks for Fresh Quotes

If you call `txsCommit()` immediately after a fresh quote is created, you can skip the redundant init-signature checks:

```typescript
const txsCommit = await swap.txsCommit(true);
```

Use `skipChecks=true` only when you are executing the quote right away. Do not reuse it for older swaps that may have already expired or changed state.

## Common Mistakes

- forgetting to call the matching `waitTill*()` method after broadcasting transactions.
- sending returned transactions out of order when the swap flow depends on sequential confirmation.
- treating `txs*()` as a replacement for Bitcoin or Lightning payment steps. It only replaces the smart-chain side.
- using `skipChecks=true` on stale quotes.

## API Reference

- [txsCommit](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCSwap#txscommit) - Get smart-chain commit transactions
- [txsClaim](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap#txsclaim) - Get smart-chain claim transactions
- [txsRefund](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCSwap#txsrefund) - Get smart-chain refund transactions
- [txsCommitAndClaim](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNSwap#txscommitandclaim) - Get combined commit and claim transactions
- [waitTillCommited](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCSwap#waittillcommited) - Wait for commit to be observed by the SDK
- [waitTillClaimed](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap#waittillclaimed) - Wait for claim or automatic settlement
- [waitTillRefunded](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCSwap#waittillrefunded) - Wait for refund to be observed by the SDK

## Next Steps

### Swap Tutorials

Use the route-specific swap guides to see where each manual transaction step fits into the full swap flow.

**[Swap Tutorials →](/developers/swaps/)**

---

### Claiming and Refunds

Manual transaction signing is commonly paired with recovery flows for past swaps.

**[Swap Management →](/developers/swap-management/)**

---
