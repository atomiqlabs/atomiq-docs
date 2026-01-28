---
sidebar_position: 5
---

# Swap Limits

Swap sizes are constrained by LP liquidity and protocol limits.

## Getting Limits

```typescript
const limits = swapper.getSwapLimits(srcToken, dstToken);

console.log("Input min:", limits.input.min?.toString());
console.log("Input max:", limits.input.max?.toString());
console.log("Output min:", limits.output.min?.toString());
console.log("Output max:", limits.output.max?.toString());
```

## Immediate vs Discovered Limits

:::info
**BTC limits** are available immediately after initialization.

**Other token limits** are discovered when a swap quote fails due to amount being too low or too high.
:::

### Example: Discovering Limits

```typescript
// After init, BTC limits are available
const limits = swapper.getSwapLimits(Tokens.BITCOIN.BTC, Tokens.SOLANA.SOL);
console.log("Input min:", limits.input.min);   // Available
console.log("Input max:", limits.input.max);   // Available
console.log("Output min:", limits.output.min); // May be undefined
console.log("Output max:", limits.output.max); // May be undefined

// Try a swap with very small amount to trigger limit discovery
try {
  await swapper.swap(
    Tokens.BITCOIN.BTC,
    Tokens.SOLANA.SOL,
    1n,  // 1 sat - too small
    SwapAmountType.EXACT_OUT,
    undefined,
    solanaSigner.getAddress()
  );
} catch (error) {
  // OutOfBoundsError - limits now populated
}

// Now output limits are available
const updatedLimits = swapper.getSwapLimits(Tokens.BITCOIN.BTC, Tokens.SOLANA.SOL);
console.log("Output min:", updatedLimits.output.min); // Now available
console.log("Output max:", updatedLimits.output.max); // Now available
```

## Listening for Limit Changes

```typescript
swapper.on("swapLimitsChanged", () => {
  // Limits were updated
  const newLimits = swapper.getSwapLimits(srcToken, dstToken);
  updateUI(newLimits);
});
```

## Using Limits in UI

### Input Validation

```typescript
function validateAmount(amount: bigint, srcToken: Token, dstToken: Token): string | null {
  const limits = swapper.getSwapLimits(srcToken, dstToken);

  if (limits.input.min && amount < limits.input.min) {
    return `Minimum amount is ${formatAmount(limits.input.min, srcToken)}`;
  }

  if (limits.input.max && amount > limits.input.max) {
    return `Maximum amount is ${formatAmount(limits.input.max, srcToken)}`;
  }

  return null; // Valid
}
```

### React Hook

```typescript
function useSwapLimits(srcToken: Token, dstToken: Token) {
  const [limits, setLimits] = useState(
    swapper.getSwapLimits(srcToken, dstToken)
  );

  useEffect(() => {
    // Update when tokens change
    setLimits(swapper.getSwapLimits(srcToken, dstToken));

    // Listen for limit updates
    const handler = () => {
      setLimits(swapper.getSwapLimits(srcToken, dstToken));
    };

    swapper.on("swapLimitsChanged", handler);
    return () => swapper.off("swapLimitsChanged", handler);
  }, [srcToken, dstToken]);

  return limits;
}

// Usage
function SwapForm() {
  const limits = useSwapLimits(srcToken, dstToken);

  return (
    <input
      type="number"
      min={limits.input.min?.toString()}
      max={limits.input.max?.toString()}
      placeholder={`Min: ${formatAmount(limits.input.min)} - Max: ${formatAmount(limits.input.max)}`}
    />
  );
}
```

## Getting All Bounds

Get limits for all token pairs at once:

```typescript
const allBounds = swapper.getSwapBounds();

// Structure:
// {
//   [srcChain]: {
//     [srcToken]: {
//       [dstChain]: {
//         [dstToken]: { input: { min, max }, output: { min, max } }
//       }
//     }
//   }
// }
```

## Pre-populating Limits

To ensure limits are available before user interaction:

```typescript
async function populateLimits(srcToken: Token, dstToken: Token) {
  // Try a very small swap to trigger limit discovery
  try {
    await swapper.swap(
      srcToken,
      dstToken,
      1n,
      SwapAmountType.EXACT_OUT,
      sourceAddress,
      destAddress
    );
  } catch (error) {
    // Expected to fail - limits are now populated
  }

  // Also try a very large amount for max limits
  try {
    await swapper.swap(
      srcToken,
      dstToken,
      BigInt(Number.MAX_SAFE_INTEGER),
      SwapAmountType.EXACT_OUT,
      sourceAddress,
      destAddress
    );
  } catch (error) {
    // Expected to fail - max limits now populated
  }

  return swapper.getSwapLimits(srcToken, dstToken);
}
```

## Handling OutOfBoundsError

```typescript
import {OutOfBoundsError} from "@atomiqlabs/sdk";

try {
  const swap = await swapper.swap(/* ... */);
} catch (error) {
  if (error instanceof OutOfBoundsError) {
    // Amount is outside allowed range
    const limits = swapper.getSwapLimits(srcToken, dstToken);

    if (amount < limits.input.min) {
      showError(`Amount too small. Minimum: ${limits.input.min}`);
    } else if (amount > limits.input.max) {
      showError(`Amount too large. Maximum: ${limits.input.max}`);
    }
  } else {
    throw error;
  }
}
```

## Limit Factors

Limits depend on:

1. **LP Liquidity** - Available funds in LP's hot wallet
2. **Protocol Limits** - Hard-coded protocol constraints
3. **Network Conditions** - May vary with network congestion
4. **Token Pair** - Different pairs have different limits

## API Reference

- [getSwapLimits](/sdk-reference/sdk/classes/Swapper#getswaplimits) - Get limits for token pair
- [getSwapBounds](/sdk-reference/sdk/classes/Swapper#getswapbounds) - Get all limits
- [OutOfBoundsError](/sdk-reference/sdk/classes/OutOfBoundsError) - Error for invalid amounts
