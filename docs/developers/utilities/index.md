---
sidebar_position: 1
---

# Utilities

The SDK exposes two kinds of utility helpers:

- general parsing and balance helpers on `swapper.Utils`
- route and protocol inspection helpers directly on `swapper`

These utilities are meant to support quote forms, token selectors, destination/source input fields, and route-aware swap UIs.

## Utility Overview

| Utility | Accessed via | Use                                                                                   |
|---------|-------------|---------------------------------------------------------------------------------------|
| [Address Parser](./address-parser) | `swapper.Utils.parseAddress()` | Parse Bitcoin, Lightning, LNURL, and smart-chain inputs from user-entered text        |
| [Wallet Balance](./wallet-balance.mdx) | `swapper.Utils.getSpendableBalance()` / `getBitcoinSpendableBalance()` | Estimate how much can actually be swapped after fees                                  |
| [Supported Tokens](./supported-tokens) | `swapper.getSupportedTokens()` / `getSwapCounterTokens()` / `getToken()` | Discover valid route tokens and resolve token identifiers                             |
| [Swap Types](./swap-types) | `swapper.getSwapType()` / `SwapProtocolInfo` | Inspect which swap protocol and capabilities a a specific route uses                  |
| [Swap Limits](./swap-limits) | `swapper.getSwapLimits()` | Get route-specific swap limits (minimums and maximums) in both EXACT_IN / EXACT_OUT modes |

## Practical Pattern

For most swap forms, the useful pattern is to combine the utilities:

- Use [Wallet Balance](./wallet-balance.mdx) to populate maximum input amount and "swap all available balance" behavior, if the source wallet is known.
- Parse user-provided address with [Address Parser](./address-parser), which parses Bitcoin addresses, Lightning invoices, LNURLs, or smart-chain (i.e. Solana, Starknet, EVM) addresses.
- Use [Supported Tokens](./supported-tokens) to show supported source tokens and destination tokens.
- Use [Swap Types](./swap-types) to detect which swap protocol the selected token pair will use and whether the route supports things like gas drop or requires a connected wallet on a specific side.
- Use [Swap Limits](./swap-limits) to populate min/max limits for input fields and validate the currently selected route before creating the quote.

The exact starting point differs by app, but the same idea holds: parse the input, get supported input / output tokens, classify the protocol, estimate spendable balance, validate the route bounds, then create the quote.

```typescript
import {
  isBtcToken,
  isSCToken,
  SwapProtocolInfo,
  SwapSide
} from "@atomiqlabs/sdk";

// 1. Optional: parse a user-entered destination/source string
const parsed = await swapper.Utils.parseAddress(userInput);

// 2. Select tokens from the currently valid route set
const sourceTokens = swapper.getSupportedTokens(SwapSide.INPUT);
const destinationTokens = swapper.getSwapCounterTokens(selectedSourceToken, SwapSide.INPUT);

// 3. Inspect the protocol for the selected pair
const swapType = swapper.getSwapType(selectedSourceToken, selectedDestinationToken);
const protocolInfo = SwapProtocolInfo[swapType];

// 4. Get fee-aware spendable balance for the selected source side, when applicable
if (isSCToken(selectedSourceToken)) {
  const spendable = await swapper.Utils.getSpendableBalance(signer, selectedSourceToken);
}

if (
  isBtcToken(selectedSourceToken) &&
  !selectedSourceToken.lightning &&
  isSCToken(selectedDestinationToken)
) {
  const {balance} = await swapper.Utils.getBitcoinSpendableBalance(
    bitcoinWalletAddress,
    selectedDestinationToken.chainId
  );
}

// 5. Get route-specific min/max bounds
const limits = swapper.getSwapLimits(selectedSourceToken, selectedDestinationToken);

// 6. Create the quote
const quote = await swapper.swap(
  selectedSourceToken,
  selectedDestinationToken,
  amount,
  amountType,
  sourceAddress,
  destinationAddress
);
```

## Next Steps

### Address Parser

Use the parser when the user can paste a destination or source field in multiple formats.

**[Address Parser →](./address-parser)**

---

### Supported Tokens

Use route-aware token discovery when building token selectors and swap forms.

**[Supported Tokens →](./supported-tokens)**

---

### Creating Quotes

Once your form uses the utility helpers to settle on a route and amount, request the actual quote with `swapper.swap(...)`.

**[Creating Quotes →](/developers/quick-start/creating-quotes)**

---