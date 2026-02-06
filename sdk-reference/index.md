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
- **Events** - [SwapEvent](/sdk-reference/api/atomiq-sdk/src/classes/SwapEvent), [ChainEvent](/sdk-reference/api/atomiq-sdk/src/classes/ChainEvent) for swap lifecycle events
- **Storage** - [IUnifiedStorage](/sdk-reference/api/atomiq-sdk/src/interfaces/IUnifiedStorage) for managing swap state
- **Utilities** - [identifyAddressType](/sdk-reference/api/atomiq-sdk/src/functions/identifyAddressType) and helpers for address parsing, balance checking, token identification

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
Persistence layers for storing swap state:

- File-based [**SQLite**](/sdk-reference/api/atomiq-storage-sqlite/src/) storage (Node.js)
- [**React Native Async**](/sdk-reference/api/atomiq-storage-rn-async/src/) storage
- [**Memory Indexed KV**](/sdk-reference/api/atomiq-storage-memory-indexed-kv/src/) for in-memory storage (browser)


---

**Ready to integrate?** Visit the [SDK Guide](/developers/) for detailed tutorials and examples.

**Want to learn more about the Atomiq protocol?** Check out the [protocol overview](/).
