---
sidebar_position: 6
---

# Swap Limits

`swapper.getSwapLimits()` returns the currently known minimum and maximum bounds for a given token pair. This is useful for amount validation and min/max hints in quote forms.

Like the other route utilities, swap limits are pair-specific and LP-dependent. Use [Supported Tokens](/sdk-guide/utilities/supported-tokens) first to choose a valid route, then use `getSwapLimits()` to understand how large or small the input / output amounts can be.

:::info
Call `getSwapLimits()` after `await swapper.init()`, as the returned data depends on the currently discovered LPs.
:::

## Getting Swap Limits

[`getSwapLimits()`](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getswaplimits) accepts the input and output token and determines the swap minimum and maximum amounts for a given route. It returns both, limits for input (`EXACT_IN` mode) and output (`EXACT_OUT` mode).

:::warning
When discovering LPs, only the BTC-denominated minimums / maximums are part of the handshake. Limits denominated in other tokens are populated only after a quote fails because the requested amount was too low or too high. For automatically refreshing swap limits after they are populated see the next [Listening for Limit Changes](#listening-for-limit-changes) section.

That means a pair can have partially known bounds at startup, then become more complete as the SDK interacts with LPs.
:::

```typescript
const limits = swapper.getSwapLimits(
  Tokens.BITCOIN.BTC,
  Tokens.STARKNET.WBTC
);

// Swap limits for EXACT_IN mode, correspond to the source token passed (i.e. here BTC)
console.log("Input min:", limits.input.min.toString());
console.log("Input max:", limits.input.max?.toString());
// Swap limits for EXACT_OUT mode, correspond to the destination token passed (i.e. here WBTC)
console.log("Output min:", limits.output.min.toString());
console.log("Output max:", limits.output.max?.toString()); // May initially be undefined as it is a non-BTC asset
```

All returned amounts use the [`TokenAmount`](/sdk-reference/api/atomiq-sdk/src/type-aliases/TokenAmount) type:

| Field          | Description |
|----------------|------|
| `input.min`    | Lowest currently known amount on the source-token side |
| `input.max?`   | Highest currently known amount on the source-token side |
| `output.min`   | Lowest currently known amount on the destination-token side |
| `output.max?`  | Highest currently known amount on the destination-token side |

## Listening for Limit Changes

The swapper emits a `swapLimitsChanged` event whenever the swap bounds are updated, this can be due to:

- new LP is discovered, or existing LP is removed.
- swap with an LP failed due to the amount being too high or too low and the LP returned the new minimums / maximums.

:::tip
This is the right hook for keeping UI state in sync.
:::

```typescript
import {Token} from "@atomiqlabs/sdk";

function subscribeToLimits(srcToken: Token, dstToken: Token) {
  const handler = () => {
    const limits = swapper.getSwapLimits(srcToken, dstToken);
    updateUI(limits);
  };

  swapper.on("swapLimitsChanged", handler);
  return () => swapper.off("swapLimitsChanged", handler);
}
```

## Using Limits in UI

The most common use of `getSwapLimits()` is validating the user-entered amount before or after attempting to create a quote. Or passing the minimums / maximums to the HTML input fields for input / output amounts.

```typescript
import {SwapAmountType, Token} from "@atomiqlabs/sdk";

function validateAmount(
  amount: bigint,
  amountType: SwapAmountType,
  srcToken: Token,
  dstToken: Token
): string | null {
  // Get the swap limits for the pair
  const limits = swapper.getSwapLimits(srcToken, dstToken);
  // Select the correct limits based on EXACT_IN or EXACT_OUT mode
  const side = amountType === SwapAmountType.EXACT_IN ? limits.input : limits.output;
  
  if (amount < side.min.rawAmount)
    return `Minimum amount is ${side.min.toString()}`;

  // If maximum is populated also check if the amount isn't higher than the maximum
  if (side.max && amount > side.max.rawAmount)
    return `Maximum amount is ${side.max.toString()}`;

  return null;
}
```

## Handling `OutOfBoundsError`

If `swapper.swap(...)` fails with [`OutOfBoundsError`](/sdk-reference/api/atomiq-sdk/src/classes/OutOfBoundsError), the SDK is telling you that the requested amount is outside the route's currently allowed bounds.

```typescript
import {OutOfBoundsError, SwapAmountType} from "@atomiqlabs/sdk";

try {
  await swapper.swap(
    srcToken,
    dstToken,
    amount,
    amountType,
    sourceAddress,
    destinationAddress
  );
} catch (error) {
  if (error instanceof OutOfBoundsError) {
    const limits = swapper.getSwapLimits(srcToken, dstToken);
    const side = amountType === SwapAmountType.EXACT_IN ? limits.input : limits.output;

    console.log("Allowed minimum:", side.min.toString());
    console.log("Allowed maximum:", side.max?.toString());
  } else {
    throw error;
  }
}
```

`OutOfBoundsError.min` and `OutOfBoundsError.max` are raw `bigint` values in base units of the side in which the quote amount was requested. In UI code it is usually more convenient to re-read `getSwapLimits()` and use the `TokenAmount` values for display.

## API Reference

- [Swapper](/sdk-reference/api/atomiq-sdk/src/classes/Swapper) - Main SDK client exposing `getSwapLimits()`
- [getSwapLimits](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getswaplimits) - Get input and output bounds for a token pair
- [TokenAmount](/sdk-reference/api/atomiq-sdk/src/type-aliases/TokenAmount) - Amount object returned inside the limits structure
- [SwapAmountType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapAmountType) - Distinguishes `EXACT_IN` vs `EXACT_OUT`
- [OutOfBoundsError](/sdk-reference/api/atomiq-sdk/src/classes/OutOfBoundsError) - Error returned when a quote amount is outside the allowed range

## Next Steps

### Supported Tokens

Choose a valid token pair first, then query the limits for that route.

**[Supported Tokens →](/sdk-guide/utilities/supported-tokens)**

---

### Creating Quotes

Once you know the allowed range, the next step is requesting a quote with `swapper.swap(...)`.

**[Creating Quotes →](/sdk-guide/quick-start/creating-quotes)**

---
