---
id: sdk-reference-overview
title: Overview
---

# SDK Reference Overview

The Atomiq SDK provides a complete TypeScript/JavaScript interface for trustless cross-chain swaps between Bitcoin and smart chains (Solana, Starknet, EVM).

## What You'll Find Here

### **Core SDK**
The main SDK package containing:

- [**Swapper**](/sdk-reference/api/atomiq-sdk/src/classes/Swapper) - The central class for managing all swap operations
- [**SwapperFactory**](/sdk-reference/api/atomiq-sdk/src/classes/SwapperFactory) - Configuration and initialization
- **Swap Classes** - Specific implementations for different swap types:
  - [ToBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCSwap) / [ToBTCLNSwap](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCLNSwap) - Smart chain to Bitcoin
  - [FromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap) / [FromBTCLNSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNSwap) / [FromBTCLNAutoSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNAutoSwap) / [SpvFromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/SpvFromBTCSwap) - Bitcoin to smart chain
- **Bitcoin** - [BitcoinWallet](/sdk-reference/api/atomiq-sdk/src/classes/BitcoinWallet), [IBitcoinWallet](/sdk-reference/api/atomiq-sdk/src/interfaces/IBitcoinWallet), headers, RPC
- **Storage** - [IUnifiedStorage](/sdk-reference/api/atomiq-sdk/src/interfaces/IUnifiedStorage) interface for implementing custom storage backends
- **Utilities** - [SwapperUtils](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils) and helpers for address parsing, balance checking, token identification

### **Chain Integrations**
Chain-specific implementations you need based on your target blockchains:

- [**Solana**](/sdk-reference/api/atomiq-chain-solana/src/)
- [**Starknet**](/sdk-reference/api/atomiq-chain-starknet/src/)
- [**EVM**](/sdk-reference/api/atomiq-chain-evm/src/)

Each chain module includes:
- Chain-specific swap implementations
- Wallet integrations
- RPC configuration
- Network-specific types and utilities

### **Storage Adapters**

The SDK uses browser-based IndexedDB by default. To use the SDK in different environments, e.g. Node.js or React Native you need to use the respective storage adapter:

- File-based [**SQLite**](/sdk-reference/api/atomiq-storage-sqlite/src/) storage (Node.js)
- [**React Native Async**](/sdk-reference/api/atomiq-storage-rn-async/src/) storage

In case you need to integrate your own storage adapter for your environment check the [**IUnifiedStorage**](/sdk-reference/api/atomiq-sdk/src/interfaces/IUnifiedStorage) interface.

:::info
If you already have a key-value storage backend you can use the [**Memory Indexed KV**](/sdk-reference/api/atomiq-storage-memory-indexed-kv/src/) to easily turn it into the swap storage backend. This keeps the necessary indexes in-memory so is only suitable for single-user swap storage (not for backend handling a great number of swaps).
:::


---

**Ready to integrate?** Visit the [SDK Guide](/developers/) for detailed tutorials and examples.

**Want to learn more about the Atomiq protocol?** Check out the [protocol overview](/).
