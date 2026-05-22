---
sidebar_position: 1
---

# Advanced

This section is for integrations that go beyond the default SDK flow. It focuses on production concerns around transaction control, runtime behavior, real-time state, and persistence.

:::info
If you are still setting up the SDK or learning the swap lifecycle, start with [Creating Quotes](/sdk-guide/quick-start/creating-quotes) and [Executing Swaps](/sdk-guide/quick-start/executing-swaps) first. The advanced pages assume that part is already familiar.
:::

## Usage

Most integrations use the advanced features once the standard quote and execution flow is already in place and the remaining work is about adapting the SDK to the application's runtime:

- Use [Manual Transactions](./manual-transactions) when your app needs to get smart-chain transactions from the SDK, hand them off to an external signer or wallet flow, and then let the SDK observe the result afterwards, such as with hardware wallets, custody systems, or a separate approval layer.
- Use [Configuration](./configuration) when you need to customize how the swapper runs, including RPC setup, LP discovery behavior, pricing hooks, runtime flags, and chain-specific options.
- Use [Events](./events) when your UI or backend needs to react to live swap state updates, LP discovery, or limit changes, for example to show pending swaps, update route availability, or drive notifications.
- Use [Storage](./storage) when you need to understand what the SDK persists or provide a custom storage backend, especially outside browser environments or when integrating with your own database layer.

## Topics

### Manual Transactions

Use the `txs*()` methods to sign and broadcast smart-chain transactions outside the SDK, for example with hardware wallets, custom custody, or a separate approval layer.

**[Manual Transactions →](./manual-transactions)**

---

### Configuration

Tune how the swapper is initialized, including RPCs, LP discovery, storage hooks, pricing, runtime flags, and per-chain options.

**[Configuration →](./configuration)**

---

### Events

Subscribe to swap state, LP discovery, and swap-limit updates so UIs and services can react in real time.

**[Events →](./events)**

---

### Storage

Understand what the SDK persists, how the default browser setup works, and how to provide Node.js, React Native, or custom storage backends.

**[Storage →](./storage)**

---
