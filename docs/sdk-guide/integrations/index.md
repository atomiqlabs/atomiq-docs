---
sidebar_position: 1
---

# Integrations

This section covers integrating the Atomiq SDK with external systems and protocols.

## Available Integrations

| Integration | Description | Page |
|-------------|-------------|------|
| Solana Pay | Use Solana Pay protocol for wallet-initiated swaps | [Solana Pay](./solana-pay) |

## Integration Patterns

### Server-Side Integrations

For server-side integrations (Node.js backends, APIs):

```typescript
import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";

const swapper = Factory.newSwapper({
  // ... chain config
  swapStorage: chainId => new SqliteUnifiedStorage("CHAIN_"+chainId+".sqlite3"),
  chainStorageCtor: name => new SqliteStorageManager("STORE_"+name+".sqlite3"),
});
```

### Client-Side Integrations

For browser applications, the SDK uses IndexedDB by default:

```typescript
const swapper = Factory.newSwapper({
  // ... chain config
  // Storage is automatic in browser
});
```

### Wallet Integrations

When integrating with wallet providers:

1. Use the appropriate signer for your wallet type
2. For custom signing flows, use `txs*` methods for manual transaction handling
3. Implement proper error handling for user rejection

## Coming Soon

Additional integration guides for:
- React/Next.js applications
- Mobile wallets (React Native)
- Payment gateways
- Point-of-sale systems
