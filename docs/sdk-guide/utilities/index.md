---
sidebar_position: 1
---

# Utilities

The Atomiq SDK provides utility functions accessible via `swapper.Utils` to help with common tasks.

## Available Utilities

| Utility | Description | Page |
|---------|-------------|------|
| Address Parser | Parse Bitcoin, Lightning, LNURL, and smart chain addresses | [Address Parser](./address-parser) |
| Wallet Balance | Get spendable balances accounting for fees | [Wallet Balance](./wallet-balance) |
| Supported Tokens | Discover available tokens and trading pairs | [Supported Tokens](./supported-tokens) |
| Swap Types | Inspect swap types and their features | [Swap Types](./swap-types) |

## Quick Examples

### Parse Any Address

```typescript
const result = await swapper.Utils.parseAddress("bc1q...");
// Returns type: "BITCOIN", "LIGHTNING", "LNURL", or chain name
```

### Get Spendable Balance

```typescript
const balance = await swapper.Utils.getSpendableBalance(signer, token);
```

### Check Token Support

```typescript
const supportedInputs = swapper.getSupportedTokens(true);
const supportedOutputs = swapper.getSupportedTokens(false);
```

## Tutorials

- [Address Parser](./address-parser) - Unified parsing for all address formats
- [Wallet Balance](./wallet-balance) - Get spendable balances with fee calculations
- [Supported Tokens](./supported-tokens) - Token discovery and trading pair queries
- [Swap Types](./swap-types) - Inspect swap protocols and features
