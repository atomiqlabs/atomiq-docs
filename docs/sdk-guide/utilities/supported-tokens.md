---
sidebar_position: 4
---

# Supported Tokens

The SDK provides methods to discover available tokens and trading pairs.

:::tip Runnable Example
See the complete working example: [utils/supportedTokens.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/utils/supportedTokens.ts)
:::

## Getting Supported Tokens

### All Input/Output Tokens

```typescript
// Tokens that can be used as swap input (source)
const inputTokens = swapper.getSupportedTokens(true);
console.log("Input tokens:", inputTokens.map(t => t.ticker).join(", "));

// Tokens that can be used as swap output (destination)
const outputTokens = swapper.getSupportedTokens(false);
console.log("Output tokens:", outputTokens.map(t => t.ticker).join(", "));
```

### Counter Tokens for a Specific Token

Find what tokens can be swapped to/from a specific token:

```typescript
// What can I swap TO Bitcoin?
const tokensToBtc = swapper.getSwapCounterTokens(Tokens.BITCOIN.BTC, true);
console.log("Can swap to BTC:", tokensToBtc.map(t => t.ticker).join(", "));

// What can I swap STRK TO?
const strkSwapsTo = swapper.getSwapCounterTokens(Tokens.STARKNET.STRK, false);
console.log("STRK swaps to:", strkSwapsTo.map(t => t.ticker).join(", "));
```

## Getting Tokens by Identifier

### By Ticker

```typescript
// Simple ticker (throws if same ticker on multiple chains)
const strk = swapper.getToken("STRK");

// Chain-qualified ticker
const sol = swapper.getToken("SOLANA-SOL");
const starkStrk = swapper.getToken("STARKNET-STRK");
```

### By Contract Address

```typescript
// Starknet ETH by address
const ethToken = swapper.getToken(
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
);

// Solana USDC by mint
const usdcToken = swapper.getToken(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
```

## Token Properties

```typescript
const token = swapper.getToken("STRK");

console.log("Name:", token.name);           // "Starknet"
console.log("Ticker:", token.ticker);       // "STRK"
console.log("Chain:", token.chain);         // "STARKNET"
console.log("Decimals:", token.decimals);   // 18
console.log("Address:", token.address);     // Contract address
```

## Accessing the Tokens Object

The `Tokens` object provides typed access to all tokens:

```typescript
import {Tokens} from "./setup"; // From your SwapperFactory

// Bitcoin tokens
Tokens.BITCOIN.BTC     // Bitcoin L1
Tokens.BITCOIN.BTCLN   // Bitcoin Lightning

// Solana tokens
Tokens.SOLANA.SOL      // Native SOL
Tokens.SOLANA.USDC     // USDC on Solana

// Starknet tokens
Tokens.STARKNET.STRK   // Native STRK
Tokens.STARKNET.ETH    // ETH on Starknet

// EVM tokens (e.g., Citrea)
Tokens.CITREA.CBTC     // Citrea BTC
```

## Building a Token Selector UI

```typescript
async function getTokenOptions(isInput: boolean) {
  const tokens = swapper.getSupportedTokens(isInput);

  return tokens.map(token => ({
    value: `${token.chain}-${token.ticker}`,
    label: token.name,
    ticker: token.ticker,
    chain: token.chain,
    icon: getTokenIcon(token), // Your icon logic
  }));
}

// When user selects a source token, get valid destination tokens
function onSourceTokenChange(sourceToken: Token) {
  const destTokens = swapper.getSwapCounterTokens(sourceToken, false);
  updateDestinationOptions(destTokens);
}
```

## Filtering by Chain

```typescript
// Get all Solana tokens
const solanaTokens = swapper.getSupportedTokens(true)
  .filter(t => t.chain === "SOLANA");

// Get all Starknet tokens
const starknetTokens = swapper.getSupportedTokens(false)
  .filter(t => t.chain === "STARKNET");
```

## Checking Token Availability

```typescript
function canSwap(from: Token, to: Token): boolean {
  const counterTokens = swapper.getSwapCounterTokens(from, false);
  return counterTokens.some(t =>
    t.chain === to.chain && t.ticker === to.ticker
  );
}

// Usage
if (canSwap(Tokens.SOLANA.SOL, Tokens.BITCOIN.BTC)) {
  console.log("SOL -> BTC swaps are available");
}
```

## API Reference

- [getSupportedTokens](/sdk-reference/sdk/classes/Swapper#getsupportedtokens) - Get input/output tokens
- [getSwapCounterTokens](/sdk-reference/sdk/classes/Swapper#getswapcountertokens) - Get counter tokens
- [getToken](/sdk-reference/sdk/classes/Swapper#gettoken) - Get token by identifier
