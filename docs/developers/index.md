---
sidebar_position: 1
---

# SDK Guide

The Atomiq SDK is a TypeScript multichain client for trustless cross-chain swaps between smart chains (Solana, Starknet, EVM) and Bitcoin (on-chain L1 and Lightning Network L2).

:::tip Getting Started
See complete working Node.js examples in the [atomiq-sdk-demo](https://github.com/atomiqlabs/atomiq-sdk-demo) repository.
The repo contains [setup.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/setup.ts) and [wallets.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/wallets.ts), which are good boilerplate to start from and build swaps on top of. For browser environments, see the [Quick Start (Browser)](./quick-start/quick-start-browser) guide.
:::

## Documentation Sections

### Getting Started
- [Quick Start (Browser)](./quick-start/quick-start-browser) - Set up in browser environments
- [Quick Start (Node.js)](./quick-start/quick-start-nodejs) - Set up in Node.js environments
- [Configuration](advanced/configuration.md) - Swapper options

### Swap Tutorials
- [Creating Quotes](quick-start/creating-quotes.md) - How to create and inspect swap quotes
- [BTC to Smart Chain](./swaps/btc-to-smart-chain) - Bitcoin L1 to Starknet/EVM
- [Smart Chain to BTC](./swaps/smart-chain-to-btc.mdx) - Starknet/EVM to Bitcoin L1
- [Lightning to Smart Chain](./swaps/lightning-to-smart-chain) - Lightning to Starknet/EVM
- [Smart Chain to Lightning](./swaps/smart-chain-to-lightning) - Starknet/EVM to Lightning
- [LNURL Swaps](utilities/lnurl-swaps.md) - Reusable payment addresses
- **Solana (Legacy)**: [BTC to Solana](./swaps/solana/btc-to-solana) | [Solana to BTC](./swaps/solana/solana-to-btc) | [Lightning to Solana](./swaps/solana/lightning-to-solana) | [Solana to Lightning](./swaps/solana/solana-to-lightning)

### Utilities
- [Address Parser](./utilities/address-parser) - Parse any address format
- [Wallet Balance](./utilities/wallet-balance) - Get spendable balances
- [Supported Tokens](./utilities/supported-tokens) - Discover tokens
- [Swap Types](./utilities/swap-types) - Inspect swap protocols

### Swap Management
- [Swap States](./swap-management/swap-states) - State machine documentation
- [Historical Swaps](./swap-management/historical-swaps) - Retrieve past swaps
- [Refunds](./swap-management/refunds) - Handle failed swaps
- [Claiming](./swap-management/claiming) - Manual settlement

### Advanced
- [Manual Transactions](./advanced/manual-transactions) - Custom signing flows
- [Configuration](./advanced/configuration) - Swapper options
- [Events](./advanced/events) - Real-time updates
- [Swap Limits](./advanced/swap-limits) - Amount constraints

### Integrations
- [Solana Pay](./integrations/solana-pay) - Wallet QR code integration

## API Reference

For detailed TypeScript API documentation, see the [SDK API Reference](/sdk-reference/).


## Common Tasks

| Task | Where to Look |
|------|---|
| Create a swapper instance | [SwapperFactory](/sdk-reference/api/atomiq-sdk/src/classes/SwapperFactory) |
| Execute a swap | [ToBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCSwap), [FromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap), [ToBTCLNSwap](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCLNSwap), [FromBTCLNSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNSwap) |
| Handle swap events | [SwapEvent](/sdk-reference/api/atomiq-sdk/src/classes/SwapEvent), [ChainEvent](/sdk-reference/api/atomiq-sdk/src/classes/ChainEvent) |
| Configure Solana chain | [SolanaChainInterface](/sdk-reference/api/atomiq-chain-solana/src/classes/SolanaChainInterface) |
| Manage wallet | [BitcoinWallet](/sdk-reference/api/atomiq-sdk/src/classes/BitcoinWallet), [IBitcoinWallet](/sdk-reference/api/atomiq-sdk/src/interfaces/IBitcoinWallet) |
| Store swap state | [IUnifiedStorage](/sdk-reference/api/atomiq-sdk/src/interfaces/IUnifiedStorage) |
| Parse addresses | [identifyAddressType](/sdk-reference/api/atomiq-sdk/src/functions/identifyAddressType) |
| Check balances | [IBitcoinWallet](/sdk-reference/api/atomiq-sdk/src/interfaces/IBitcoinWallet) |