---
sidebar_position: 1
---

# Advanced Topics

This section covers advanced SDK features for power users and custom integrations.

## Topics

| Topic | Description |
|-------|-------------|
| [Manual Transactions](./manual-transactions) | Sign and send transactions without the SDK signer |
| [Configuration](./configuration) | Customize swapper instance options |
| [Events](./events) | Listen to swap and system events |
| [Swap Limits](./swap-limits) | Understand and query swap size limits |

## When to Use Advanced Features

### Manual Transaction Signing

Use manual signing when:
- Integrating with hardware wallets
- Using custom transaction signing flows
- Building non-standard wallet integrations

### Custom Configuration

Customize the swapper when:
- Using private LP nodes
- Running custom mempool.space instances
- Implementing custom pricing APIs
- Adjusting timeout or pricing parameters

### Event Listeners

Use events for:
- Real-time UI updates
- Logging and analytics
- Multi-swap coordination
- Dynamic limit display

## Quick Reference

```typescript
// Manual transaction flow
const txs = await swap.txsCommit();
// Sign externally...
await swap.waitTillCommited();

// Custom configuration
const swapper = Factory.newSwapper({
  pricingFeeDifferencePPM: 20000n,
  intermediaryUrl: "https://my-lp.example.com",
  getRequestTimeout: 15000,
});

// Event listeners
swapper.on("swapState", (swap) => { /* ... */ });
swapper.on("swapLimitsChanged", () => { /* ... */ });
```
