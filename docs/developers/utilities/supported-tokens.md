---
sidebar_position: 4
---

# Supported Tokens

The SDK exposes route discovery helpers on the `swapper` instance so you can build token selectors, validate route availability before quoting, and resolve stored token identifiers back into typed token objects.

These helpers reflect two things:

- the chains enabled in your `SwapperFactory`
- the LPs discovered during `await swapper.init()`

That means `Factory.Tokens` gives you the static typed token catalog with a list of supported tokens for the configured chains, while the methods below give you the runtime view of what is currently swappable.

:::info
Call these helpers after `await swapper.init()` so LP discovery has already completed. The returned set depends on the currently discovered LPs and the chains you initialized.
:::

:::tip Runnable Example
See the complete working example: [utils/supportedTokens.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/utils/supportedTokens.ts)
:::

## Token Object

All token helpers and `Factory.Tokens.*` return the same [`Token`](/sdk-reference/api/atomiq-sdk/src/type-aliases/Token) object, this contains all the information about the token and comes with helpers for checking token equality and serializing the token to its string representation.

| Field             | Type                                                | Description                                                                                                                                  |
|-------------------|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `chainId`         | `"BITCOIN"` \| `"LIGHTNING"` \| `"STARKNET"` \| ... | Canonical chain identifier, i.e. `SOLANA`, `STARKNET`, `CITREA`, etc. for Smart chain tokens and `BITCOIN` or `LIGHTNING` for Bitcoin tokens |
| `ticker`          | `string`                                            | Token symbol used in quotes and UI.                                                                                                          |
| `name`            | `string`                                            | Full token name.                                                                                                                             |
| `decimals`        | `number`                                            | Raw token precision used for amount parsing.                                                                                                 |
| `displayDecimals` | `number`                                            | Optional preferred display precision for UI formatting.                                                                                      |
| `address`         | `string`                                            | Smart-chain contract address or mint. For BTC and BTC-LN this is an empty string.                                                            |
| `equals(other)`   | `boolean`                                           | Checks whether the token equals some other token.                                                                                                |
| `toString()`      | `string`                                            | Stable token identifier string that can be passed back into `swapper.getToken(...)`. Smart-chain tokens use `<chainId>-<ticker>` format.     |


[`SCToken`](/sdk-reference/api/atomiq-sdk/src/type-aliases/SCToken) and [`BtcToken`](/sdk-reference/api/atomiq-sdk/src/type-aliases/BtcToken) are narrowed down types for smart-chain and bitcoin based tokens, respectively. This distinction is used for automatic swap type inference in `swap()` function and also in other places. Use [`isSCToken()`](/sdk-reference/api/atomiq-sdk/src/functions/isSCToken) and [`isBtcToken()`](/sdk-reference/api/atomiq-sdk/src/functions/isBtcToken) typeguards to narrow down the type of `Token` to the respective `BtcToken` and `SCToken` types.

:::tip
If you need to persist a token in your database, URL, or form state, prefer `token.toString()` over manually constructing an identifier string. The returned value is compatible with `swapper.getToken(...)`.
:::

## Listing Supported Tokens

Use [`getSupportedTokens()`](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getsupportedtokens) to get a list of available source and destination tokens. This takes into account the current set of active and discovered LPs and returns tokens for which the LPs advertise support.

```typescript
import {SwapSide} from "@atomiqlabs/sdk";

const sourceTokens = swapper.getSupportedTokens(SwapSide.INPUT); // Usable as the swap input
const destinationTokens = swapper.getSupportedTokens(SwapSide.OUTPUT); // Usable as the swap output

console.log("Sources:", sourceTokens.map((token) => token.toString()));
console.log("Destinations:", destinationTokens.map((token) => token.toString()));
```

:::info
`Factory.Tokens` may contain more tokens than `swapper.getSupportedTokens(...)`, because a token can exist in the configured chain catalog even when no currently discovered LP offers a route for it.
:::

## Getting Valid Counter Tokens

Use [`getSwapCounterTokens()`](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getswapcountertokens) when the token one side of the swap is already known and you want to constrain the other side.

If the user already selected the input token, pass `SwapSide.INPUT` to get the valid output tokens:

```typescript
import {SwapSide} from "@atomiqlabs/sdk";

const outputsFromStrk = swapper.getSwapCounterTokens(
  Tokens.STARKNET.STRK,
  SwapSide.INPUT
);

console.log(outputsFromStrk.map((token) => token.toString()));
// Returns BTC and/or BTC-LN if STRK can currently be swapped out to them
```

If the user already selected the output token, pass `SwapSide.OUTPUT` to get the valid input tokens:

```typescript
import {SwapSide} from "@atomiqlabs/sdk";

const inputsForBtc = swapper.getSwapCounterTokens(
  Tokens.BITCOIN.BTC,
  SwapSide.OUTPUT
);

console.log(inputsForBtc.map((token) => token.toString()));
// Returns various smart-chain tokens that can currently be swapped to BTC
```

## Resolving Tokens from Identifiers

Use [`getToken()`](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#gettoken) to resolve `Token` object from strings returned from `Token.toString()`, raw contract addresses or tickers.

```typescript
// Bitcoin tokens
const btc = swapper.getToken("BTC");
const btcln = swapper.getToken("BTC-LN");

// Chain-prefixed smart chain tickers
const strk = swapper.getToken("STARKNET-STRK");
const solUsdc = swapper.getToken("SOLANA-USDC");

// Parse based on token contract address
const starknetEth = swapper.getToken(
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
);
```

You can round-trip a token through its string representation:

```typescript
const token = swapper.getToken("STARKNET-STRK");
const serialized = token.toString(); // "STARKNET-STRK"
const sameToken = swapper.getToken(serialized);

console.log(serialized); // "STARKNET-STRK"
console.log(token.equals(sameToken)); // true
```

:::warning
Bare tickers are convenient, but they can be ambiguous in a multichain context:

```typescript
const token = swapper.getToken("WBTC"); // Can throw if WBTC exists on multiple configured chains
const starknetWbtc = swapper.getToken("STARKNET-WBTC"); // Unambiguous
```
:::

:::tip
For compile-time setup prefer the use of a statically typed `Factory.Tokens`, instead of relying on `swapper.getToken()`. Using the `swapper.getToken()` method is useful for resolving tokens during runtime.
:::

## Usage in a Token Selector UI

You can use the exposed helper functions to build a route-aware token selector form, which automatically detects which tokens are supported and also which routes are available given an input token is chosen.

```typescript
import {SwapSide} from "@atomiqlabs/sdk";

// Get tokens supported as a swap input
const supportedSourceTokens = swapper.getSupportedTokens(SwapSide.INPUT);
// You can also filter the tokens based on the chain
const starknetSupportedSourceTokens = supportedSourceTokens
  .filter(token => token.chainId === "STARKNET");

// Check which swap routes are available from a selected source token
function onSourceTokenChange(sourceTokenId: string) {
  // Can also pass `sourceToken: Token` directly as a function argument
  const sourceToken = swapper.getToken(sourceTokenId);
  const supportedDestinationTokens = swapper.getSwapCounterTokens(sourceToken, SwapSide.INPUT);
  ...
}
```

## API Reference

- [Swapper](/sdk-reference/api/atomiq-sdk/src/classes/Swapper) - Main SDK client
- [getSupportedTokens](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getsupportedtokens) - Get currently supported inputs or outputs
- [getSwapCounterTokens](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getswapcountertokens) - Get valid counterpart tokens for one side of a route
- [getToken](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#gettoken) - Resolve a token by ticker or address
- [SwapSide](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapSide) - Input/output side enum for token helper functions
- [Token](/sdk-reference/api/atomiq-sdk/src/type-aliases/Token) - Shared token object shape returned by all token helpers
- [BtcToken](/sdk-reference/api/atomiq-sdk/src/type-aliases/BtcToken) - Bitcoin token specialization
- [SCToken](/sdk-reference/api/atomiq-sdk/src/type-aliases/SCToken) - Smart-chain token specialization
- [isBtcToken](/sdk-reference/api/atomiq-sdk/src/functions/isBtcToken) - Bitcoin token type-guard
- [isSCToken](/sdk-reference/api/atomiq-sdk/src/functions/isSCToken) - Smart-chain token type-guard
- [SwapperFactory](/sdk-reference/api/atomiq-sdk/src/classes/SwapperFactory) - Factory for building typed swappers
- [TypedTokens](/sdk-reference/api/atomiq-sdk/src/type-aliases/TypedTokens) - Typed token catalog derived from the configured chains

## Next Steps

### Creating Quotes

Once you know the source and destination tokens, the next step is requesting a route quote with `swapper.swap(...)`.

**[Creating Quotes →](/developers/quick-start/creating-quotes)**

---

### Swap Types

Inspect the swap protocol used for a given token pair and what capabilities it supports.

**[Swap Types →](/developers/utilities/swap-types)**

---

### Wallet Balance

For source-token selectors and "Max" buttons, pair route discovery with the SDK's fee-aware balance helpers.

**[Wallet Balance →](/developers/utilities/wallet-balance)**

---