---
sidebar_position: 2
---

# Creating Quotes

Every swap starts with a quote. Call `swapper.swap()` to create one — this contacts LPs, finds the best rate, and returns a swap object you can inspect before executing the swap.

```typescript
import {SwapAmountType} from "@atomiqlabs/sdk";

const swap = await swapper.swap(
  fromToken,          // Source token (e.g. Tokens.BITCOIN.BTC, Tokens.STARKNET.STRK)
  toToken,            // Destination token (e.g. Tokens.CITREA.CBTC, Tokens.BITCOIN.BTCLN)
  amount,             // Amount as string (in human readable format - "0.0001") or bigint (in base units - 10000n)
  amountType,         // SwapAmountType.EXACT_IN (specifying exact input amount) or SwapAmountType.EXACT_OUT (specifying exact output amount)
  sourceAddress,      // Source wallet address [not required for BTC/Lightning source]
  destinationAddress, // Destination wallet address, Lightning invoice, or LNURL
  options?            // Optional: { gasAmount }
);
```

:::info
Preferably use the `Tokens.<chain>.<asset>` notation for `fromToken` and `toToken` for to get automatic swap type inference.

You can alternatively also use ticker strings such as `"BTC"`, `"BTC-LN"`, `"WBTC"`, or chain + ticker combination, such as `"STARKNET-WBTC"`, `"SOLANA-WBTC"`, `"CITREA-CBTC"`. But these don't automatically infer the swap type of the returned quote. You can use the [isSwapType](/sdk-reference/api/atomiq-sdk/src/functions/isSwapType) type-guard to narrow down the type in those cases.
:::

## Example

```typescript
const swap = await swapper.swap(
  Tokens.STARKNET.STRK,           // Correct token notation for automatic swap type inference
  Tokens.BITCOIN.BTC,             // Correct token notation for automatic swap type inference
  "0.0001",                       // Amount as human readable string
  SwapAmountType.EXACT_OUT,       // Receive exactly 0.0001 BTC
  starknetSigner.getAddress(),    // Sender wallet address, in this case Starknet wallet address
  "bc1q..."                       // Destination address, in this case a Bitcoin on-chain address
); // Type of swap will get correctly infered as `ToBTCSwap`
```

## Inspecting the Quote

Once quote is created you can check the amounts, fees, pricing. This is fixed after a quote is received and valid until quote expiry. Atomiq protocol uses an RFQ model so there is no additional slippage!

### Amounts

Amounts are returned as [TokenAmount](/sdk-reference/api/atomiq-sdk/src/type-aliases/TokenAmount) objects, making it easy to print them out, show them in human-readable format, get the amount in base units or estimate their value in USD-terms.

```typescript
swap.getInput()              // Total input amount (including fees)
swap.getInputWithoutFee()    // Input amount excluding fees
swap.getOutput()             // Output amount you'll receive
```

### Fees

Fees are returned as [Fee](/sdk-reference/api/atomiq-sdk/src/type-aliases/Fee) objects, making it easy to get the fee denominated in input/output (source & destination) tokens or in USD. Relevant fee types returned by the `getFeeBreakdown()` function use the [FeeType](/sdk-reference/api/atomiq-sdk/src/enumerations/FeeType) enum.

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

Return the information about the swap price, the current market price and the difference between the two.

```typescript
const priceInfo = swap.getPriceInfo();
priceInfo.swapPrice       // Effective swap price
priceInfo.marketPrice     // Current market price
priceInfo.difference      // Difference between swap and market price
```

### Quote Expiry

Every created quote has an expiry time until which it needs to be executed, trying to execute the quote after expiry will lead to reverted transactions.

```typescript
swap.getQuoteExpiry()     // Timestamp (ms) when the quote expires
```

### Checking Swap State

Check the current lifecycle state of the swap, the main state-check helpers are:

- `swap.isQuoteExpired()` - whether the quote has definitely expired and cannot be initiated anymore
- `swap.isQuoteSoftExpired()` - whether the quote is close enough to expiry that there might not be enough time buffer left to execute it, it is usually good practice to show the quote as expired to the user at this point already
- `swap.isFinished()` - whether the swap reached a terminal state (can be either success or fail)
- `swap.isSuccessful()` - whether the swap finished successfully
- `swap.isFailed()` - whether the swap failed, for example because it was refunded

```typescript
if (swap.isQuoteExpired()) {
  throw new Error("Quote expired");
}

if (swap.isFinished()) {
  if (swap.isSuccessful()) console.log("Swap finished successfully");
  if (swap.isFailed()) console.log("Swap finished in a failed state");
}
```

:::info
If you need the raw swap type specific state value, use [`getState()`](/sdk-reference/api/atomiq-sdk/src/classes/ISwap#getstate). If you want something human-readable, use [`getStateInfo()`](http://localhost:3000/sdk-reference/api/atomiq-sdk/src/classes/ISwap#getstateinfo), more details about this can be found on the [TODO: Swap states page](/broken-link)
:::

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
  10000n, SwapAmountType.EXACT_OUT,
  starknetSigner.getAddress(), "bc1q..."
);
```

## Gas Drop

When swapping from Bitcoin on-chain or lightning to smart chains (i.e. Starknet, EVM chains) and swapping to non-native token (e.g. WBTC on Starknet), you can additionally request to receive some amount of native token along with your swap - this ensures that you can have some native token ready to cover gas fees when doing your first transactions on the destination chain.

```typescript
// Swapping 0.0001 BTC to WBTC on Starknet and requesting to also receive 1 STRK gas drop
const swap = await swapper.swap(
  Tokens.BITCOIN.BTC, Tokens.STARKNET.WBTC,
  "0.0001", SwapAmountType.EXACT_IN,
  undefined,                                // Not required when using Bitcoin or Lightning as source
  starknetSigner.getAddress(),              // Destination Starknet signer address
  {
    gasAmount: 1_000_000_000_000_000_000n   // Request 1 STRK in addition as gas drop
  }
);

swap.getGasDropOutput()                     // Amount of native token gas drop
```

When using `SwapAmountType.EXACT_IN`, the value of the gas drop gets deducted from the output token amount by the LP, while with `SwapAmountType.EXACT_OUT` the gas token value gets added to the input token amount.

:::warning
When already swapping to the native token of the respective destination chain (i.e. STRK on Starknet, cBTC on Citrea, etc.) don't specify the `gasAmount`, as LPs usually don't hold the necessary gas drop liquidity for those tokens! This will lead to errors during quoting and make it unable for you to request the quote.
:::

:::info
This is so far not supported on **Solana**, which still uses legacy swap protocol.
:::

## Executing the swap

After the quote is created you are ready to execute the swap. Executing the swap is handled differently for various swap types, therefore to see how to execute the specific see the respective tab:

