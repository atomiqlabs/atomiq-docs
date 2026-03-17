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

## Listing Supported Tokens

Use [`getSupportedTokens()`](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getsupportedtokens) to get a list of available source and destination tokens. This takes into account the current set of active and discovered LPs and returns tokens for which the LPs advertise support.

```typescript
import {SwapSide} from "@atomiqlabs/sdk";

const sourceTokens = swapper.getSupportedTokens(SwapSide.INPUT); // Usable as the swap input
const destinationTokens = swapper.getSupportedTokens(SwapSide.OUTPUT); // Usable as the swap output

console.log(
  "Sources:",
  sourceTokens.map((token) => token.ticker).join(", ")
);

console.log(
  "Destinations:",
  destinationTokens.map((token) => token.ticker).join(", ")
);
```

:::info
`Factory.Tokens` may contain more tokens than `swapper.getSupportedTokens(...)`, because a token can exist in the configured chain catalog even when no currently discovered LP offers a route for it.
:::

## Getting Valid Counter Tokens

Use [`getSwapCounterTokens()`](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getswapcountertokens) when the token one side of the swap is already known and you want to constrain the other side.

If the user already selected the input token, pass `SwapSide.INPUT` to get the valid output tokens:

```typescript
const outputsFromStrk = swapper.getSwapCounterTokens(
  Tokens.STARKNET.STRK,
  SwapSide.INPUT
);

console.log(outputsFromStrk);
// Returns BTC and/or BTC-LN if STRK can currently be swapped out to them
```

If the user already selected the output token, pass `SwapSide.OUTPUT` to get the valid input tokens:

```typescript
const inputsForBtc = swapper.getSwapCounterTokens(
  Tokens.BITCOIN.BTC,
  SwapSide.OUTPUT
);

console.log(inputsForBtc);
// Returns various smart chain (Solana, Starknet, EVM...) tokens that can be swapped to BTC
```

## Resolving Tokens from Identifiers

Use [`getToken()`](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#gettoken) when your UI stores token identifiers as strings or when a user pastes a token contract address or mint.

```typescript
const btc = swapper.getToken("BTC");
const btcln = swapper.getToken("BTC-LN");

const strk = swapper.getToken("STARKNET-STRK");
const solUsdc = swapper.getToken("SOLANA-USDC");

const starknetEth = swapper.getToken(
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
);

const solanaUsdc = swapper.getToken(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
```

Bare tickers are convenient, but they can be ambiguous on a multichain swapper:

```typescript
const token = swapper.getToken("WBTC"); // Can throw if WBTC exists on multiple configured chains
const starknetWbtc = swapper.getToken("STARKNET-WBTC"); // Unambiguous
```

:::tip
When persisting token identifiers in your application, prefer `CHAIN-TICKER` notation for smart-chain tokens and `BTC` / `BTC-LN` for Bitcoin tokens. It keeps the identifier stable and avoids ticker collisions across chains.
:::

## Token Object Shape

The returned token type is a union of Bitcoin tokens and smart-chain tokens. Use [`isBtcToken()`](/sdk-reference/api/atomiq-sdk/src/functions/isBtcToken) and [`isSCToken()`](/sdk-reference/api/atomiq-sdk/src/functions/isSCToken) to handle them safely.

```typescript
import {isBtcToken, isSCToken, Token} from "@atomiqlabs/sdk";

function describeToken(token: Token): string {
  if (isBtcToken(token)) {
    return token.lightning ? "BTC-LN" : "BTC";
  }

  if (isSCToken(token)) {
    return `${token.ticker} on ${token.chainId}`;
  }

  throw new Error("Unknown token type");
}
```

For Bitcoin tokens:

- `token.chain === "BTC"`
- `token.lightning` distinguishes on-chain BTC from Lightning BTC

For smart-chain tokens:

- `token.chain === "SC"`
- the actual network identifier is `token.chainId`
- `token.address` contains the token contract address or mint

```typescript
import {isSCToken} from "@atomiqlabs/sdk";

const token = swapper.getToken("STARKNET-STRK");

if (!isSCToken(token)) {
  throw new Error("Expected a smart-chain token");
}

console.log(token.chain);   // "SC"
console.log(token.chainId); // "STARKNET"
console.log(token.ticker);  // "STRK"
console.log(token.address); // Token contract address
```

## Using `Factory.Tokens` with Runtime Discovery

The setup shown in the SDK README is the right starting point when you want type-safe token references in app code:

```typescript
import {SwapperFactory, TypedTokens} from "@atomiqlabs/sdk";

const Factory = new SwapperFactory(chains);
const Tokens: TypedTokens<typeof chains> = Factory.Tokens;

Tokens.BITCOIN.BTC;
Tokens.BITCOIN.BTCLN;
Tokens.STARKNET.STRK;
Tokens.SOLANA.USDC;
```

Use `Factory.Tokens` for stable code references, then use the runtime discovery helpers to drive the UI:

```typescript
const sourceToken = Tokens.STARKNET.STRK;

const availableOutputs = swapper.getSwapCounterTokens(sourceToken, true);
const canSwapToBitcoin = availableOutputs.some(
  (token) => token.chain === "BTC" && token.lightning === false
);
```

This split is generally the most useful pattern:

- `Factory.Tokens` for compile-time-safe token references
- `swapper.getSupportedTokens(...)` for populating selectors
- `swapper.getSwapCounterTokens(...)` for constraining route choices

## Building a Route-Aware Token Selector

```typescript
import {isBtcToken, isSCToken, Token} from "@atomiqlabs/sdk";

function getTokenId(token: Token): string {
  if (isBtcToken(token)) {
    return token.lightning ? "BTC-LN" : "BTC";
  }

  if (isSCToken(token)) {
    return `${token.chainId}-${token.ticker}`;
  }

  throw new Error("Unknown token type");
}

const sourceOptions = swapper.getSupportedTokens(true).map((token) => ({
  value: getTokenId(token),
  label: isBtcToken(token) ? token.name : `${token.ticker} on ${token.chainId}`
}));

function onSourceTokenChange(sourceToken: Token) {
  const destinationTokens = swapper.getSwapCounterTokens(sourceToken, true);

  updateDestinationOptions(
    destinationTokens.map((token) => ({
      value: getTokenId(token),
      label: isBtcToken(token) ? token.name : `${token.ticker} on ${token.chainId}`
    }))
  );
}
```

If you need to filter by a specific smart chain, filter on `token.chainId`, not on `token.chain`:

```typescript
import {isSCToken} from "@atomiqlabs/sdk";

const starknetOutputs = swapper
  .getSupportedTokens(false)
  .filter((token) => isSCToken(token) && token.chainId === "STARKNET");
```

## API Reference

- [Swapper](/sdk-reference/api/atomiq-sdk/src/classes/Swapper) - Main SDK client
- [getSupportedTokens](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getsupportedtokens) - Get currently supported inputs or outputs
- [getSwapCounterTokens](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getswapcountertokens) - Get valid counterpart tokens for one side of a route
- [getToken](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#gettoken) - Resolve a token by ticker or address
- [Token](/sdk-reference/api/atomiq-sdk/src/type-aliases/Token) - Union of Bitcoin and smart-chain token types
- [BtcToken](/sdk-reference/api/atomiq-sdk/src/type-aliases/BtcToken) - Bitcoin token type
- [SCToken](/sdk-reference/api/atomiq-sdk/src/type-aliases/SCToken) - Smart-chain token type
- [isBtcToken](/sdk-reference/api/atomiq-sdk/src/functions/isBtcToken) - Bitcoin token type-guard
- [isSCToken](/sdk-reference/api/atomiq-sdk/src/functions/isSCToken) - Smart-chain token type-guard
- [SwapperFactory](/sdk-reference/api/atomiq-sdk/src/classes/SwapperFactory) - Factory for building typed swappers
- [TypedTokens](/sdk-reference/api/atomiq-sdk/src/type-aliases/TypedTokens) - Typed token catalog derived from the configured chains

## Next Steps

### Creating Quotes

Once you know the source and destination tokens, the next step is requesting a route quote with `swapper.swap(...)`.

**[Creating Quotes ->](/developers/quick-start/creating-quotes)**

---

### Swap Types

Inspect the swap protocol used for a given token pair and what capabilities it supports.

**[Swap Types ->](/developers/utilities/swap-types)**

---

### Wallet Balance

For source-token selectors and "Max" buttons, pair route discovery with the SDK's fee-aware balance helpers.

**[Wallet Balance ->](/developers/utilities/wallet-balance)**
