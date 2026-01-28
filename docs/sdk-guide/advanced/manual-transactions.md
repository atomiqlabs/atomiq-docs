---
sidebar_position: 2
---

# Manual Transactions

For custom wallet integrations, you can sign and send transactions manually instead of using the SDK's signer.

## Transaction Methods

Every action method has a corresponding `txs*` method:

| Action | Transaction Method | Wait Method |
|--------|-------------------|-------------|
| `commit()` | `txsCommit()` | `waitTillCommited()` |
| `claim()` | `txsClaim()` | `waitTillClaimed()` |
| `refund()` | `txsRefund()` | `waitTillRefunded()` |
| `commitAndClaim()` | `txsCommitAndClaim()` | `waitTillClaimed()` |

## General Flow

1. Get transactions with `txs*()` method
2. Sign transactions externally
3. Send transactions to the network
4. Call `waitTill*()` to let SDK process the result

## Solana

```typescript
import {Connection} from "@solana/web3.js";

// Get transactions
const txns = await swap.txsCommit();

// Sign any transactions that have additional signers
txns.forEach(val => {
  if (val.signers.length > 0) {
    val.tx.sign(...val.signers);
  }
});

// Sign all transactions with your wallet
const signedTxs = await wallet.signAllTransactions(
  txns.map(val => val.tx)
);

// Send transactions sequentially
const connection = new Connection(rpcUrl);
for (const tx of signedTxs) {
  const signature = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(signature);
}

// Let SDK process the result
await swap.waitTillCommited();
```

### Complete Solana Example

```typescript
async function manualSolanaSwap(swap: ToBTCSwap<SolanaChainType>) {
  // 1. Commit
  const commitTxns = await swap.txsCommit();
  commitTxns.forEach(val => {
    if (val.signers.length > 0) val.tx.sign(...val.signers);
  });

  const signedCommit = await wallet.signAllTransactions(
    commitTxns.map(val => val.tx)
  );

  for (const tx of signedCommit) {
    const sig = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(sig);
  }

  await swap.waitTillCommited();

  // 2. Wait for result
  const success = await swap.waitForPayment();

  // 3. Refund if needed
  if (!success) {
    const refundTxns = await swap.txsRefund();
    refundTxns.forEach(val => {
      if (val.signers.length > 0) val.tx.sign(...val.signers);
    });

    const signedRefund = await wallet.signAllTransactions(
      refundTxns.map(val => val.tx)
    );

    for (const tx of signedRefund) {
      const sig = await connection.sendRawTransaction(tx.serialize());
      await connection.confirmTransaction(sig);
    }

    await swap.waitTillRefunded();
  }
}
```

## Starknet

```typescript
import {Account} from "starknet";

// Get transactions
const txns = await swap.txsCommit();

// Send transactions
for (const tx of txns) {
  if (tx.type === "INVOKE") {
    await account.execute(tx.tx, tx.details);
  }
  if (tx.type === "DEPLOY_ACCOUNT") {
    await account.deployAccount(tx.tx, tx.details);
  }
}

// Let SDK process
await swap.waitTillCommited();
```

### Complete Starknet Example

```typescript
async function manualStarknetSwap(swap: SpvFromBTCSwap<StarknetChainType>) {
  // For SPV swaps, claiming is done after BTC confirms

  // Wait for Bitcoin confirmation
  await swap.waitForBitcoinTransaction((txId, confirmations, target, etaMs) => {
    console.log(`${confirmations}/${target} confirmations`);
  });

  // Wait for auto-settlement
  const autoSettled = await swap.waitTillClaimed(60);

  if (!autoSettled) {
    // Manual claim
    const claimTxns = await swap.txsClaim();

    for (const tx of claimTxns) {
      if (tx.type === "INVOKE") {
        await account.execute(tx.tx, tx.details);
      }
    }

    await swap.waitTillClaimed();
  }
}
```

## EVM (Citrea, etc.)

```typescript
import {Wallet} from "ethers";

// Get transactions
const txns = await swap.txsCommit();

// Send transactions
for (const tx of txns) {
  await wallet.sendTransaction(tx);
}

// Let SDK process
await swap.waitTillCommited();
```

### Complete EVM Example

```typescript
async function manualEVMSwap(swap: ToBTCSwap<EVMChainType>) {
  // 1. Commit
  const commitTxns = await swap.txsCommit();
  for (const tx of commitTxns) {
    const response = await wallet.sendTransaction(tx);
    await response.wait();
  }
  await swap.waitTillCommited();

  // 2. Wait for payment
  const success = await swap.waitForPayment();

  // 3. Refund if needed
  if (!success) {
    const refundTxns = await swap.txsRefund();
    for (const tx of refundTxns) {
      const response = await wallet.sendTransaction(tx);
      await response.wait();
    }
    await swap.waitTillRefunded();
  }
}
```

## Transaction Types

### Solana Transaction Object

```typescript
interface SolanaTransaction {
  tx: Transaction;           // Solana Transaction object
  signers: Keypair[];        // Additional signers required
}
```

### Starknet Transaction Object

```typescript
interface StarknetTransaction {
  type: "INVOKE" | "DEPLOY_ACCOUNT";
  tx: Call | Call[];         // Contract calls
  details?: InvocationsDetails;
}
```

### EVM Transaction Object

```typescript
interface EVMTransaction {
  to: string;
  data: string;
  value?: bigint;
  gasLimit?: bigint;
}
```

## Skip Checks for Fresh Quotes

When calling `txs*` immediately after getting a quote:

```typescript
// Pass skipChecks=true to avoid redundant validation
const txns = await swap.txsCommit(true);
```

## Hardware Wallet Integration

Example with Ledger on Solana:

```typescript
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Solana from "@ledgerhq/hw-app-solana";

async function signWithLedger(txns: SolanaTransaction[]) {
  const transport = await TransportWebUSB.create();
  const solana = new Solana(transport);

  const signedTxs = [];

  for (const {tx, signers} of txns) {
    // Sign with additional signers first
    if (signers.length > 0) {
      tx.sign(...signers);
    }

    // Get serialized message
    const message = tx.serializeMessage();

    // Sign with Ledger
    const signature = await solana.signTransaction(
      "44'/501'/0'/0'",
      message
    );

    tx.addSignature(
      new PublicKey(signature.address),
      signature.signature
    );

    signedTxs.push(tx);
  }

  return signedTxs;
}
```

## API Reference

- [txsCommit](/sdk-reference/sdk/classes/ToBTCSwap#txscommit)
- [txsClaim](/sdk-reference/sdk/classes/FromBTCSwap#txsclaim)
- [txsRefund](/sdk-reference/sdk/classes/ToBTCSwap#txsrefund)
- [txsCommitAndClaim](/sdk-reference/sdk/classes/FromBTCLNSwap#txscommitandclaim)
- [waitTillCommited](/sdk-reference/sdk/classes/ToBTCSwap#waittillcommited)
- [waitTillClaimed](/sdk-reference/sdk/classes/FromBTCSwap#waittillclaimed)
- [waitTillRefunded](/sdk-reference/sdk/classes/ToBTCSwap#waittillrefunded)
