---
sidebar_position: 1
---

# Advanced Topics

This section covers lower-level SDK integration points for apps that need more control over transaction execution, runtime configuration, event handling, or persistence. These topics are most useful when you need to go beyond the default browser or signer-driven setup.

## Topics

| Topic | Description |
|-------|-------------|
| [Manual Transactions](./manual-transactions) | Build `txs*()` transaction flows and sign or broadcast them outside the SDK signer |
| [Configuration](./configuration) | Customize top-level options, chain-specific settings, storage hooks, runtime flags, and debug logging |
| [Events](./events) | Subscribe to standard `EventEmitter`-style events on `swapper` and `swap.events` |
| [Storage](./storage) | Use browser, Node.js, or React Native persistence defaults, or implement custom storage backends |

## When to Use Advanced Features

### Manual Transaction Signing

Use manual signing when:
- integrating with hardware wallets
- using custom custody or approval flows
- building wallet integrations that sign and broadcast outside the SDK

### Custom Configuration

Customize the swapper when:
- using private LP nodes or custom registries
- running custom mempool.space or pricing backends
- changing request timeouts or runtime flags
- adjusting chain-specific RPC and integration options

### Event Listeners

Use events for:
- real-time UI updates
- pending swap tracking
- logging and analytics
- LP monitoring and route-limit refreshes

### Custom Storage

Use storage customization when:
- running in Node.js or React Native
- integrating with your own database or key-value backend
- replacing the default browser persistence layer
- implementing custom `IUnifiedStorage` or `IStorageManager` backends

## Quick Reference

```typescript
// Manual transaction flow
const txs = await swap.txsCommit();
// Sign and broadcast externally...
await swap.waitTillCommited();

// Custom configuration
const swapper = Factory.newSwapper({
  chains: {...},
  bitcoinNetwork: BitcoinNetwork.MAINNET,
  pricingFeeDifferencePPM: 20000n,
  registryUrl: "https://my-registry.example.com",
  getRequestTimeout: 15000,
});

// Custom storage
const swapperWithStorage = Factory.newSwapper({
  ...,
  swapStorage: storageName => new SqliteUnifiedStorage(`${storageName}.sqlite3`),
  chainStorageCtor: storageName => new SqliteStorageManager(`${storageName}.sqlite3`)
});

// Event subscriptions
swapper.on("swapState", (updatedSwap) => { /* ... */ });
swap.events.on("swapState", (updatedSwap) => { /* ... */ });
swapper.on("swapLimitsChanged", () => { /* ... */ });
```
