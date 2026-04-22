---
sidebar_position: 5
---

# Swap Types

`swapper.getSwapType()` is the SDK's protocol classifier for a token pair. Given a source [`Token`](/sdk-reference/api/atomiq-sdk/src/type-aliases/Token) and destination `Token`, it tells you which swap protocol the SDK will use. This is useful when you want to branch UI, show capability flags such as gas drop support, or understand which swap flow a later `swapper.swap(...)` quote will follow.

For an overview and background on various swap types, see [Swap Types](/sdk-guide/swaps/).

:::tip Runnable Example
See the complete working example: [utils/swapTypes.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/utils/swapTypes.ts)
:::

:::info
Use [Supported Tokens](/sdk-guide/utilities/supported-tokens) when you need LP-aware token lists or valid counter tokens. `getSwapType()` classifies a token pair, but it does not replace runtime route discovery.
:::

## Getting Swap Type

[`getSwapType()`](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getswaptype) accepts the input and output token and infers the swap type that will be used to execute the swap between these tokens. It returns the [`SwapType`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType) enum. Check the [Swap Types](/sdk-guide/swaps/) page to understand the differences between the various swap types.

```typescript
import {SwapType} from "@atomiqlabs/sdk";

const swapType = swapper.getSwapType(
  Tokens.BITCOIN.BTC,
  Tokens.STARKNET.STRK
);

console.log(SwapType[swapType]); // "SPV_VAULT_FROM_BTC"
```

:::warning
Currently atomiq only supports swaps between Smart Chains and Bitcoin in both directions. Swaps between different Smart Chains (i.e. Starknet \<\> Solana) or between the Bitcoin layers (i.e. Lightning \<\> Bitcoin) are not currently supported.

If you build your token selector by following [Supported Tokens](/sdk-guide/utilities/supported-tokens), you usually avoid these invalid combinations before `getSwapType()` is called.
:::

:::info
The main pattern is that Bitcoin/Lightning → Solana swaps use the legacy `FROM_BTC` and `FROM_BTCLN` swap types, non-Solana Bitcoin/Lightning → smart-chain swaps use the newer `SPV_VAULT_FROM_BTC` and `FROM_BTCLN_AUTO` swap types, and all smart-chain → Bitcoin/Lightning swaps use the same `TO_BTC` and `TO_BTCLN` swap types.
:::

## Swap Type Capabilities

Once you have the `SwapType`, you can inspect its capability flags through the statically typed [`SwapProtocolInfo`](/sdk-reference/api/atomiq-sdk/src/variables/SwapProtocolInfo) dictionary.

```typescript
import {SwapProtocolInfo, SwapType} from "@atomiqlabs/sdk";

// Get swap type
const swapType = swapper.getSwapType(
  Tokens.BITCOIN.BTCLN,
  Tokens.STARKNET.WBTC
);

// Retrieve capabilites of the given swap type
const capabilities = SwapProtocolInfo[swapType];

console.log(SwapType[swapType]);                // "FROM_BTCLN_AUTO"
console.log(capabilities.requiresInputWallet);  // false
console.log(capabilities.requiresOutputWallet); // false
console.log(capabilities.supportsGasDrop);      // true
```

### Capabilities

| Field | Description |
|------|------|
| `requiresInputWallet` | Whether the normal flow requires a connected wallet on the input side that can sign or pay. |
| `requiresOutputWallet` | Whether the normal flow requires a connected wallet on the output smart-chain side that can sign transactions. |
| `supportsGasDrop` | Whether the swap type supports receiving a small amount of native smart-chain token together with the output - a "gas drop" feature. |

### Capability Matrix

| Direction | SwapType | `requiresInputWallet` | `requiresOutputWallet` | `supportsGasDrop` |
|------|------|------|------|------|
| Smart chain → Bitcoin | `TO_BTC` | `true` | `false` | `false` |
| Smart chain → Lightning | `TO_BTCLN` | `true` | `false` | `false` |
| Bitcoin → Smart chain | `SPV_VAULT_FROM_BTC` | `true` | `false` | `true` |
| Lightning → Smart chain | `FROM_BTCLN_AUTO` | `false` | `false` | `true` |
| *Legacy Bitcoin → Solana* | `FROM_BTC` | `false` | `true` | `false` |
| *Legacy Lightning → Solana* | `FROM_BTCLN` | `false` | `true` | `false` |

## Using Swap Type in UI

Swap type and swap type capabilities are most useful when you want to enforce the need to have either a source or destination wallets connected, toggle optional features such as gas drop, or explain the route to the user.

```typescript
import {SwapProtocolInfo, SwapType, Token} from "@atomiqlabs/sdk";

function describeRoute(from: Token, to: Token) {
  const swapType = swapper.getSwapType(from, to);
  const info = SwapProtocolInfo[swapType];

  return {
    swapType: swapType,
    from: from.toString(),
    to: to.toString(),
    supportsGasDrop: info.supportsGasDrop,
    requiresInputWallet: info.requiresInputWallet,
    requiresOutputWallet: info.requiresOutputWallet
  };
}

const route = describeRoute(Tokens.BITCOIN.BTC, Tokens.STARKNET.WBTC);

if (route.supportsGasDrop) {
  showGasDropToggle();
}
```

This is also a clean place to branch user-facing text, for example showing that:

- `FROM_BTC` and `FROM_BTCLN` are legacy Bitcoin/Lightning → Solana routes, which also require the destination wallet connected and **don't** support gas drop
- `SPV_VAULT_FROM_BTC` and `FROM_BTCLN_AUTO` are the newer Bitcoin/Lightning → Smart chain routes which don't require the destination wallet to be connected and support a gas drop
- `TO_BTC` and `TO_BTCLN` are Smart chain → Bitcoin/Lightning routes

## API Reference

- [Swapper](/sdk-reference/api/atomiq-sdk/src/classes/Swapper) - Main SDK client exposing `getSwapType()` and `SwapTypeInfo`
- [getSwapType](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getswaptype) - Get the swap protocol classification for a token pair
- [SwapType](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType) - Swap type enum
- [SwapProtocolInfo](/sdk-reference/api/atomiq-sdk/src/variables/SwapProtocolInfo) - Static capability metadata for swap types
- [SwapTypeMapping](/sdk-reference/api/atomiq-sdk/src/type-aliases/SwapTypeMapping) - Type-level mapping from swap type to swap class
- [Token](/sdk-reference/api/atomiq-sdk/src/type-aliases/Token) - Token type accepted by `getSwapType()`

## Next Steps

### Supported Tokens

Use the token discovery helpers to build valid route selectors before you classify the selected pair with `getSwapType()`.

**[Supported Tokens →](/sdk-guide/utilities/supported-tokens)**

---

### Creating Quotes

Once you know the token pair and swap family, the next step is requesting a quote with `swapper.swap(...)`.

**[Creating Quotes →](/sdk-guide/quick-start/creating-quotes)**

---

### Swaps Overview

For the protocol-level background behind the swap types, see the overview docs covering legacy vs newer swap designs.

**[Swaps Overview →](/overview/swaps/)**
