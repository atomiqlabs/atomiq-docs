---
sidebar_position: 2
---

# Creating Quotes

Every swap starts with a quote. Call `swapper.swap()` to create one — this contacts LPs, finds the best rate, and returns a swap object you can inspect before executing.

## The `swapper.swap()` Method

```typescript
import {SwapAmountType} from "@atomiqlabs/sdk";

const swap = await swapper.swap(
  fromToken,          // Source token (e.g. Tokens.BITCOIN.BTC, Tokens.STARKNET.STRK)
  toToken,            // Destination token
  amount,             // Amount as string, bigint, or undefined (for invoice-based swaps)
  amountType,         // SwapAmountType.EXACT_IN or SwapAmountType.EXACT_OUT
  sourceAddress,      // Source wallet address (undefined for BTC/Lightning source)
  destinationAddress, // Destination address, Lightning invoice, or LNURL
  options?            // Optional: { gasAmount, comment }
);
```

## Example

```typescript
const swap = await swapper.swap(
  Tokens.STARKNET.STRK,
  Tokens.BITCOIN.BTC,
  "0.0001",
  SwapAmountType.EXACT_OUT,       // Receive exactly 0.0001 BTC
  starknetSigner.getAddress(),
  "bc1q..."
);
```

## Inspecting the Quote

### Amounts

```typescript
swap.getInput()              // Total input amount (including fees)
swap.getInputWithoutFee()    // Input amount excluding fees
swap.getOutput()             // Output amount you'll receive
```

### Fees

```typescript
import {FeeType} from "@atomiqlabs/sdk";

swap.getFee().amountInSrcToken    // Total fee in source token
swap.getFee().amountInDstToken    // Total fee in destination token

// Detailed fee breakdown
for (const fee of swap.getFeeBreakdown()) {
  console.log(`${FeeType[fee.type]}: ${fee.fee.amountInSrcToken}`);
}
```

### Pricing

```typescript
const priceInfo = swap.getPriceInfo();
priceInfo.swapPrice       // Effective swap price
priceInfo.marketPrice     // Current market price
priceInfo.difference      // Difference between swap and market price
```

### Quote Expiry

```typescript
swap.getQuoteExpiry()     // Timestamp (ms) when the quote expires
```

## EXACT_IN vs EXACT_OUT

- **EXACT_IN** — You specify how much to spend, the SDK calculates what you'll receive
- **EXACT_OUT** — You specify how much to receive, the SDK calculates the cost

```typescript
// Spend exactly 100 STRK
const swap = await swapper.swap(
  Tokens.STARKNET.STRK, Tokens.BITCOIN.BTC,
  "100", SwapAmountType.EXACT_IN,
  starknetSigner.getAddress(), "bc1q..."
);

// Receive exactly 10,000 sats
const swap = await swapper.swap(
  Tokens.STARKNET.STRK, Tokens.BITCOIN.BTC,
  "0.0001", SwapAmountType.EXACT_OUT,
  starknetSigner.getAddress(), "bc1q..."
);
```

## Options

### Gas Drop

Request native tokens on the destination chain (available for BTC/Lightning to smart chain swaps):

```typescript
const swap = await swapper.swap(
  Tokens.BITCOIN.BTC, Tokens.STARKNET.STRK,
  "0.0001", SwapAmountType.EXACT_IN,
  undefined, starknetSigner.getAddress(),
  {
    gasAmount: 1_000_000_000_000_000_000n  // Request 1 STRK for gas
  }
);

swap.getGasDropOutput()    // Amount of native token gas drop
```

### Comment (LNURL-pay)

```typescript
const swap = await swapper.swap(
  Tokens.STARKNET.STRK, Tokens.BITCOIN.BTCLN,
  10000n, SwapAmountType.EXACT_OUT,
  starknetSigner.getAddress(), "user@walletofsatoshi.com",
  {
    comment: "Payment for coffee"
  }
);
```

## Swap-Specific Quote Info

### To-Bitcoin Swaps

```typescript
swap.getBitcoinFeeRate()         // Bitcoin fee rate in sats/vB
await swap.getSmartChainNetworkFee()  // Estimated smart chain network fee
```

### Lightning Source Swaps

```typescript
swap.getAddress()     // Lightning invoice (BOLT11) to pay
swap.getHyperlink()   // Payment deeplink / QR code data
```

### Lightning Destination Swaps

```typescript
swap.isPayingToNonCustodialWallet()  // True if recipient must be online
swap.willLikelyFail()                // True if payment is likely to fail
```

### Solana Swaps (Legacy)

```typescript
swap.getSecurityDeposit()    // SOL deposit (refunded on success)
swap.getClaimerBounty()      // Bounty for the claimer
```

## API Reference

- [SwapAmountType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapAmountType) - EXACT_IN / EXACT_OUT
- [FeeType](/sdk-reference/api/atomiq-sdk/src/enumerations/FeeType) - Fee type enum
- [SwapperFactory](/sdk-reference/api/atomiq-sdk/src/classes/SwapperFactory) - Creating a swapper instance
