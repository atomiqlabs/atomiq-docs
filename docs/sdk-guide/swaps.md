---
sidebar_position: 2
---

# Swap Examples

This page contains code examples for all swap types supported by the SDK.

## Bitcoin On-Chain Swaps

### Smart Chain to Bitcoin On-Chain

```typescript
// Create swap: SOL to Bitcoin on-chain
const swap: ToBTCSwap<SolanaChainType> = await swapper.swap(
  Tokens.SOLANA.SOL,           // From token
  Tokens.BITCOIN.BTC,          // To BTC
  "0.0001",                    // Amount (string for decimal, bigint for base units)
  SwapAmountType.EXACT_OUT,    // Specify output amount
  solanaSigner.getAddress(),   // Source address
  "bc1qtw67hj77rt8zrkkg3jgngutu0yfgt9czjwusxt" // BTC recipient
);

// Get amounts and fees
const input = swap.getInputWithoutFee().toString();
const fee = swap.getFee().amountInSrcToken.toString();
const inputWithFees = swap.getInput().toString();
const output = swap.getOutput().toString();

// Quote expiration
const expiry = swap.getQuoteExpiry();

// Pricing info
const swapPrice = swap.getPriceInfo().swapPrice;
const marketPrice = swap.getPriceInfo().marketPrice;
const difference = swap.getPriceInfo().difference;
```

Execute the swap:

```typescript
const swapSuccessful = await swap.execute(
  solanaSigner,
  {
    onSourceTransactionSent: (txId) => {
      // Transaction sent on source chain
    },
    onSourceTransactionConfirmed: (txId) => {
      // Transaction confirmed on source chain
    },
    onSwapSettled: (destinationTxId) => {
      // Bitcoin transaction sent, swap settled
    }
  }
);

// Refund if failed
if (!swapSuccessful) {
  await swap.refund(solanaSigner);
}
```

### Bitcoin On-Chain to Solana

:::info
Solana uses an older swap protocol for Bitcoin on-chain swaps. The flow differs from Starknet/EVM.
:::

```typescript
const swap: FromBTCSwap<SolanaChainType> = await swapper.swap(
  Tokens.BITCOIN.BTC,
  Tokens.SOLANA.SOL,
  "0.0001",
  SwapAmountType.EXACT_IN,
  undefined,                   // Not used for BTC swaps
  solanaSigner.getAddress()
);

// Additional info for this swap type
const securityDeposit = swap.getSecurityDeposit().toString();
const claimerBounty = swap.getClaimerBounty().toString();
```

Execute with Bitcoin wallet:

```typescript
const automaticSettlementSuccess = await swap.execute(
  solanaSigner,
  {
    address: "bc1p...",
    publicKey: "03a2d8b7...",
    signPsbt: (psbt, signInputs) => {
      // Sign the PSBT with your Bitcoin wallet
      return "<signed PSBT>"; // hex or base64
    }
  },
  {
    onDestinationCommitSent: (txId) => {},
    onSourceTransactionSent: (txId) => {},
    onSourceTransactionConfirmationStatus: (txId, confirmations, target, etaMs) => {},
    onSourceTransactionConfirmed: (txId) => {},
    onSwapSettled: (txId) => {}
  }
);

// Manual claim if automatic settlement fails
if (!automaticSettlementSuccess) {
  await swap.claim(solanaSigner);
}
```

### Bitcoin On-Chain to Starknet/EVM

:::info
Starknet and EVM use a newer swap protocol with a simpler flow.
:::

```typescript
const swap: SpvFromBTCSwap<StarknetChainType> = await swapper.swap(
  Tokens.BITCOIN.BTC,
  Tokens.STARKNET.STRK,
  "0.0001",
  SwapAmountType.EXACT_IN,
  undefined,
  starknetSigner.getAddress(),
  {
    gasAmount: 1_000_000_000_000_000_000n // Request 1 STRK gas drop
  }
);
```

Execute:

```typescript
const automaticSettlementSuccess = await swap.execute(
  {
    address: "bc1p...",
    publicKey: "03a2d8b7...",
    signPsbt: (psbt, signInputs) => {
      return "<signed PSBT>";
    }
  },
  {
    onSourceTransactionSent: (txId) => {},
    onSourceTransactionConfirmationStatus: (txId, confirmations, target, etaMs) => {},
    onSourceTransactionConfirmed: (txId) => {},
    onSwapSettled: (txId) => {}
  }
);

if (!automaticSettlementSuccess) {
  await swap.claim(starknetSigner);
}
```

## Lightning Network Swaps

### Smart Chain to Lightning

```typescript
const swap: ToBTCLNSwap<SolanaChainType> = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTCLN,
  undefined,                   // Amount from invoice
  SwapAmountType.EXACT_OUT,
  solanaSigner.getAddress(),
  "lnbc10u1pj2q0g9pp5..."     // Lightning invoice with amount
);
```

Execute:

```typescript
const swapSuccessful = await swap.execute(
  solanaSigner,
  {
    onSourceTransactionSent: (txId) => {},
    onSourceTransactionConfirmed: (txId) => {},
    onSwapSettled: (txId) => {
      // Lightning payment sent
    }
  }
);

if (!swapSuccessful) {
  await swap.refund(solanaSigner);
}
```

### Lightning to Solana

```typescript
const swap: FromBTCLNSwap<SolanaChainType> = await swapper.swap(
  Tokens.BITCOIN.BTCLN,
  Tokens.SOLANA.SOL,
  10000n,
  SwapAmountType.EXACT_IN,
  undefined,
  signer.getAddress()
);

// Get invoice to pay
const invoice = swap.getAddress();
const qrCodeData = swap.getHyperlink();

// Security deposit (returned on success)
const securityDeposit = swap.getSecurityDeposit().toString();
```

Execute with Lightning wallet:

```typescript
await swap.execute(
  solanaSigner,
  {
    payInvoice: (bolt11) => {
      // Pay via WebLN or NWC
      return Promise.resolve("");
    }
  },
  {
    onSourceTransactionReceived: (paymentHash) => {},
    onDestinationCommitSent: (txId) => {},
    onDestinationClaimSent: (txId) => {},
    onSwapSettled: (txId) => {}
  }
);
```

### Lightning to Starknet/EVM

```typescript
const swap: FromBTCLNAutoSwap<StarknetChainType> = await swapper.swap(
  Tokens.BITCOIN.BTCLN,
  Tokens.STARKNET.STRK,
  10000n,
  SwapAmountType.EXACT_IN,
  undefined,
  signer.getAddress(),
  {
    gasAmount: 1_000_000_000_000_000_000n // Request gas drop
  }
);

const invoice = swap.getAddress();
const qrCodeData = swap.getHyperlink();
```

Execute:

```typescript
const automaticSettlementSuccess = await swap.execute(
  {
    payInvoice: (bolt11) => Promise.resolve("")
  },
  {
    onSourceTransactionReceived: (paymentHash) => {},
    onSwapSettled: (txId) => {}
  }
);

if (!automaticSettlementSuccess) {
  await swap.claim(starknetSigner);
}
```

## LNURL Swaps

LNURLs provide reusable payment addresses with programmable amounts.

### Smart Chain to LNURL-pay

```typescript
const swap: ToBTCLNSwap<SolanaChainType> = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTCLN,
  10000n,                      // Now we can specify amount!
  SwapAmountType.EXACT_OUT,
  solanaSigner.getAddress(),
  "lnurl1dp68gurn8ghj7...",   // LNURL-pay or lightning address
  {
    comment: "Hello world"     // Optional comment
  }
);
```

Execute and handle success action:

```typescript
const swapSuccessful = await swap.execute(solanaSigner, { /* callbacks */ });

if (swapSuccessful && swap.hasSuccessAction()) {
  const successMessage = swap.getSuccessAction();
  const description = successMessage.description;
  const text = successMessage.text;
  const url = successMessage.url;
}
```

### LNURL-withdraw to Smart Chain

```typescript
const swap: FromBTCLNSwap<SolanaChainType> = await swapper.swap(
  Tokens.BITCOIN.BTCLN,
  Tokens.SOLANA.SOL,
  10000n,
  SwapAmountType.EXACT_IN,
  "lnurl1dp68gurn8ghj7...",   // LNURL-withdraw link
  signer.getAddress()
);

// Execute - no wallet needed, funds come from LNURL-withdraw
await swap.execute(
  solanaSigner,
  undefined, // No Lightning wallet needed
  { /* callbacks */ }
);
```

## Exact-In Lightning Swaps

For wallets that support on-demand invoice generation:

```typescript
const swap: ToBTCLNSwap<SolanaChainType> = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTCLN,
  1_000_000_000n,              // Input amount
  SwapAmountType.EXACT_IN,     // Exact input
  solanaSigner.getAddress(),
  {
    getInvoice: async (amountSats, abortSignal?) => {
      // Generate invoice for exact amount
      return invoice;
    },
    minMsats: 1_000_000n,      // Optional min (millisatoshis)
    maxMsats: 1_000_000_000n   // Optional max
  }
);
```

## Swap States

Check swap state:

```typescript
const state = swap.getState();

// Listen for state changes
swap.events.on("swapState", swap => {
  const newState = swap.getState();
});
```

<details>
<summary>ToBTC Swap States</summary>

- `REFUNDED = -3` - Swap failed and was refunded
- `QUOTE_EXPIRED = -2` - Quote expired
- `QUOTE_SOFT_EXPIRED = -1` - Quote probably expired (may still succeed if tx sent)
- `CREATED = 0` - Quote created, waiting for execution
- `COMMITED = 1` - Init transaction sent
- `SOFT_CLAIMED = 2` - Processed but not claimed on-chain
- `CLAIMED = 3` - Successfully completed
- `REFUNDABLE = 4` - Can be refunded

</details>

<details>
<summary>FromBTC Swap States (Solana)</summary>

- `EXPIRED = -3` - Bitcoin swap address expired
- `QUOTE_EXPIRED = -2` - Quote expired
- `QUOTE_SOFT_EXPIRED = -1` - Quote probably expired
- `PR_CREATED = 0` - Waiting for user to open swap address
- `CLAIM_COMMITED = 1` - Swap address opened
- `BTC_TX_CONFIRMED = 2` - Bitcoin tx confirmed
- `CLAIM_CLAIMED = 3` - Funds claimed

</details>

<details>
<summary>SpvFromBTC Swap States (Starknet/EVM)</summary>

- `CLOSED = -5` - Catastrophic failure
- `FAILED = -4` - Bitcoin tx double-spent
- `DECLINED = -3` - LP declined
- `QUOTE_EXPIRED = -2` - Quote expired
- `QUOTE_SOFT_EXPIRED = -1` - Quote probably expired
- `CREATED = 0` - Waiting for Bitcoin tx signature
- `SIGNED = 1` - Bitcoin tx signed
- `POSTED = 2` - Posted to LP
- `BROADCASTED = 3` - LP broadcast Bitcoin tx
- `FRONTED = 4` - Funds fronted early
- `BTC_TX_CONFIRMED = 5` - Bitcoin tx confirmed
- `CLAIM_CLAIMED = 6` - Funds claimed

</details>
