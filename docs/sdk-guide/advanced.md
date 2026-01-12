---
sidebar_position: 3
---

# Advanced Usage

## Swap Size Limits

Swap sizes are limited by LPs and advertised in BTC terms during handshake:

```typescript
const swapLimits = swapper.getSwapLimits(srcToken, dstToken);
const inputMin = swapLimits.input.min;
const inputMax = swapLimits.input.max;
const outputMin = swapLimits.output.min;
const outputMax = swapLimits.output.max;
```

:::info
BTC limits are available immediately. Other token limits are populated when a quote fails due to amount being too low or high.
:::

```typescript
// Listen for limit updates
swapper.on("swapLimitsChanged", () => {
  // New limits available
});

// Trigger limit discovery with a failed quote
try {
  const swap = await swapper.swap(
    Tokens.BITCOIN.BTC,
    Tokens.SOLANA.SOL,
    1n, // Too small
    false,
    undefined,
    solanaSigner.getAddress()
  );
} catch (e) {
  // OutOfBoundsError - limits now populated
}
```

## Stored Swaps

### Get Swap by ID

```typescript
// Get swap ID
const swapId = swap.getId();

// Retrieve later with known type
const typedSwap = await swapper.getTypedSwapById(swapId, chainId, swapType);

// Or retrieve with unknown type
import {isSwapType} from "@atomiqlabs/sdk";

const swap = await swapper.getSwapById(swapId);
if (isSwapType(swap, swapType)) {
  // Properly typed swap
}
```

### Get Refundable Swaps

Check on startup and periodically:

```typescript
const refundableSolana = await swapper.getRefundableSwaps(
  "SOLANA",
  solanaSigner.getAddress()
);
for (let swap of refundableSolana) {
  await swap.refund(solanaSigner);
}

const refundableStarknet = await swapper.getRefundableSwaps(
  "STARKNET",
  starknetSigner.getAddress()
);
for (let swap of refundableStarknet) {
  await swap.refund(starknetSigner);
}
```

### Get Claimable Swaps

For swaps completed while client was offline:

```typescript
const claimableSolana = await swapper.getClaimableSwaps(
  "SOLANA",
  solanaSigner.getAddress()
);
for (let swap of claimableSolana) {
  await swap.claim(solanaSigner);
}
```

## Helper Functions

### Wallet Balances

Get maximum spendable balance (accounting for fees):

```typescript
// Smart chain balances
const strkBalance = await swapper.Utils.getSpendableBalance(
  starknetSigner,
  Tokens.STARKNET.STRK
);

const solBalance = await swapper.Utils.getSpendableBalance(
  solanaSigner,
  Tokens.SOLANA.SOL
);

// Bitcoin balance - specify destination chain for fee calculation
const {balance, feeRate} = await swapper.Utils.getBitcoinSpendableBalance(
  bitcoinWalletAddress,
  "SOLANA"
);
```

### Address Parser

Parse any address format supported by the SDK:

```typescript
const res = await swapper.Utils.parseAddress(address);

switch (res.type) {
  case "BITCOIN":
    // Bitcoin address or BIP-21 URI
    const btcAmount = res.amount;
    break;

  case "LIGHTNING":
    // BOLT11 invoice
    const lnAmount = res.amount;
    break;

  case "LNURL":
    if (isLNURLWithdraw(res.lnurl)) {
      const minWithdrawable = res.min;
      const maxWithdrawable = res.max;
      const fixedAmount = res.amount; // If min === max
    }

    if (isLNURLPay(res.lnurl)) {
      const minPayable = res.min;
      const maxPayable = res.max;
      const icon = res.lnurl.icon;
      const shortDescription = res.lnurl.shortDescription;
      const longDescription = res.lnurl.longDescription;
      const maxCommentLength = res.lnurl.commentMaxLength;
    }
    break;

  default:
    // Smart chain address
    break;
}
```

## Manual Transaction Signing

Sign transactions externally instead of using the signer:

```typescript
// Each action has a txs* counterpart
// commit() -> txsCommit()
// claim() -> txsClaim()
// refund() -> txsRefund()
// commitAndClaim() -> txsCommitAndClaim()

// And waitTill* to ensure SDK receives confirmation
// waitTillCommited(), waitTillClaimed(), waitTillRefunded()
```

### Solana

```typescript
const txns = await swap.txsCommit();
txns.forEach(val => {
  if (val.signers.length > 0) val.tx.sign(...val.signers);
});

const signedTxs = await solanaSigner.wallet.signAllTransactions(
  txns.map(val => val.tx)
);

for (let tx of signedTxs) {
  const res = await solanaRpc.sendRawTransaction(tx.serialize());
  await solanaRpc.confirmTransaction(res);
}

await swap.waitTillCommited();
```

### Starknet

```typescript
const txns = await swap.txsCommit();

for (let tx of txns) {
  if (tx.type === "INVOKE") {
    await starknetSigner.account.execute(tx.tx, tx.details);
  }
  if (tx.type === "DEPLOY_ACCOUNT") {
    await starknetSigner.account.deployAccount(tx.tx, tx.details);
  }
}

await swap.waitTillCommited();
```

### EVM

```typescript
const txns = await swap.txsCommit();

for (let tx of txns) {
  await evmSigner.account.sendTransaction(tx);
}

await swap.waitTillCommited();
```

## Configuration Options

Customize the swapper instance:

```typescript
const swapper = Factory.newSwapper({
  // Chain configuration
  chains: { /* ... */ },
  bitcoinNetwork: BitcoinNetwork.MAINNET,

  // Pricing
  pricingFeeDifferencePPM: 20000n, // Max 2% price difference from market

  // Custom APIs
  mempoolApi: new MempoolApi("<custom mempool.space URL>"),
  getPriceFn: (tickers, abortSignal) => customApi.getPrices(tickers),

  // LP configuration
  intermediaryUrl: "<custom LP node URL>",
  registryUrl: "<custom LP registry URL>",
  defaultTrustedIntermediaryUrl: "<LP for trusted gas swaps>",

  // Timeouts
  getRequestTimeout: 10000,  // ms
  postRequestTimeout: 10000, // ms

  // Additional LP request parameters
  defaultAdditionalParameters: { lpData: "custom data" },
});
```
