---
sidebar_position: 3
---

# Wallet Balance

The SDK provides helper functions to get spendable wallet balances, accounting for transaction fees.

## Smart Chain Balances

Get the spendable balance of a smart chain wallet:

```typescript
// Starknet balance
const strkBalance = await swapper.Utils.getSpendableBalance(
  starknetSigner,
  Tokens.STARKNET.STRK
);
console.log("Spendable STRK:", strkBalance.toString());

// Solana balance
const solBalance = await swapper.Utils.getSpendableBalance(
  solanaSigner,
  Tokens.SOLANA.SOL
);
console.log("Spendable SOL:", solBalance.toString());

// EVM balance
const ethBalance = await swapper.Utils.getSpendableBalance(
  evmSigner,
  Tokens.CITREA.CBTC
);
console.log("Spendable CBTC:", ethBalance.toString());
```

:::info Fee Deduction
`getSpendableBalance` returns the balance minus estimated transaction fees, so users can swap their full balance without running into insufficient funds errors.
:::

## Bitcoin Balance

For Bitcoin, you need to specify the destination chain since different swap protocols have different on-chain footprints:

```typescript
const {balance, feeRate} = await swapper.Utils.getBitcoinSpendableBalance(
  bitcoinWalletAddress,
  "SOLANA"  // Destination chain affects fee calculation
);

console.log("Spendable BTC:", balance.toString(), "sats");
console.log("Current fee rate:", feeRate, "sats/vB");
```

### Different Chains, Different Fees

```typescript
// Fee for SPV swap (Starknet/EVM) - smaller tx
const starknetSwap = await swapper.Utils.getBitcoinSpendableBalance(
  address,
  "STARKNET"
);

// Fee for legacy swap (Solana) - different tx structure
const solanaSwap = await swapper.Utils.getBitcoinSpendableBalance(
  address,
  "SOLANA"
);

console.log("For Starknet swap:", starknetSwap.balance, "sats");
console.log("For Solana swap:", solanaSwap.balance, "sats");
```

## Token Balances

For non-native tokens, fees are paid in the native currency:

```typescript
// USDC balance on Solana
const usdcBalance = await swapper.Utils.getSpendableBalance(
  solanaSigner,
  Tokens.SOLANA.USDC
);

// Full token balance available (fees paid in SOL)
console.log("USDC balance:", usdcBalance.toString());
```

## Using with Swaps

### Pre-fill Maximum Amount

```typescript
// Get max spendable
const maxSpendable = await swapper.Utils.getSpendableBalance(
  solanaSigner,
  Tokens.SOLANA.SOL
);

// Create swap for full balance
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTC,
  maxSpendable,                  // Use full spendable balance
  SwapAmountType.EXACT_IN,
  solanaSigner.getAddress(),
  btcAddress
);
```

### Show Available Balance in UI

```typescript
async function getBalanceForUI(chain: string, token: Token) {
  const balance = await swapper.Utils.getSpendableBalance(signer, token);

  return {
    raw: balance,
    formatted: (Number(balance) / 10 ** token.decimals).toFixed(token.decimals),
    symbol: token.ticker
  };
}
```

## Error Handling

```typescript
try {
  const balance = await swapper.Utils.getSpendableBalance(signer, token);
} catch (error) {
  if (error.message.includes("RPC")) {
    console.error("Network error - check RPC connection");
  } else {
    console.error("Failed to get balance:", error.message);
  }
}
```

## API Reference

- [SwapperUtils](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils) - Utility class with balance methods
- [IBitcoinWallet](/sdk-reference/api/atomiq-sdk/src/interfaces/IBitcoinWallet) - Bitcoin wallet interface with spendable balance
