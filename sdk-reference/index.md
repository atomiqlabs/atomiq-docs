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
- **Swap Classes** - Specific implementations and base abstractions for the different swap flows:
  - [ISwap](/sdk-reference/api/atomiq-sdk/src/classes/ISwap) / [IEscrowSwap](/sdk-reference/api/atomiq-sdk/src/classes/IEscrowSwap) - Base and abstract swap building blocks
  - [ToBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCSwap) / [ToBTCLNSwap](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCLNSwap) - Smart chain to Bitcoin and Lightning
  - [FromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap) / [FromBTCLNSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNSwap) / [FromBTCLNAutoSwap](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNAutoSwap) / [SpvFromBTCSwap](/sdk-reference/api/atomiq-sdk/src/classes/SpvFromBTCSwap) - Bitcoin and Lightning to smart chain
  - [LnForGasSwap](/sdk-reference/api/atomiq-sdk/src/classes/LnForGasSwap) / [OnchainForGasSwap](/sdk-reference/api/atomiq-sdk/src/classes/OnchainForGasSwap) - Trusted gas swap flows
  - [IAddressSwap](/sdk-reference/api/atomiq-sdk/src/interfaces/IAddressSwap) / [IBTCWalletSwap](/sdk-reference/api/atomiq-sdk/src/interfaces/IBTCWalletSwap) / [ISwapWithGasDrop](/sdk-reference/api/atomiq-sdk/src/interfaces/ISwapWithGasDrop) - Shared swap capability interfaces
- **Bitcoin** - [BitcoinWallet](/sdk-reference/api/atomiq-sdk/src/classes/BitcoinWallet), [IBitcoinWallet](/sdk-reference/api/atomiq-sdk/src/interfaces/IBitcoinWallet), headers, RPC
- **Chains** - [ChainInterface](/sdk-reference/api/atomiq-sdk/src/interfaces/ChainInterface), [SwapContract](/sdk-reference/api/atomiq-sdk/src/interfaces/SwapContract), [SpvVaultContract](/sdk-reference/api/atomiq-sdk/src/classes/SpvVaultContract) for chain integrations and contract abstractions
- **Errors** - [IntermediaryError](/sdk-reference/api/atomiq-sdk/src/classes/IntermediaryError), [RequestError](/sdk-reference/api/atomiq-sdk/src/classes/RequestError), [TransactionRevertedError](/sdk-reference/api/atomiq-sdk/src/classes/TransactionRevertedError) for SDK and on-chain failure handling
- **LPs** - [Intermediary](/sdk-reference/api/atomiq-sdk/src/classes/Intermediary), [IntermediaryDiscovery](/sdk-reference/api/atomiq-sdk/src/classes/IntermediaryDiscovery) for working with liquidity providers
- **Lightning** - [LightningNetworkApi](/sdk-reference/api/atomiq-sdk/src/interfaces/LightningNetworkApi), [LNURLPay](/sdk-reference/api/atomiq-sdk/src/type-aliases/LNURLPay), [LNURLWithdraw](/sdk-reference/api/atomiq-sdk/src/type-aliases/LNURLWithdraw) for Lightning payments and LNURL
- **Messenger** - [Messenger](/sdk-reference/api/atomiq-sdk/src/interfaces/Messenger), [NostrMessenger](/sdk-reference/api/atomiq-sdk/src/classes/NostrMessenger) for data propagation/broadcasting layer between the SDK and Watchtowers
- **Pricing** - [ISwapPrice](/sdk-reference/api/atomiq-sdk/src/classes/ISwapPrice) for swap price API & fees
- **Storage** - [IUnifiedStorage](/sdk-reference/api/atomiq-sdk/src/interfaces/IUnifiedStorage) for implementing custom storage backends
- **Swap Actions** - [SwapExecutionAction](/sdk-reference/api/atomiq-sdk/src/type-aliases/SwapExecutionAction) for execution step modeling
- **Tokens** - [Token](/sdk-reference/api/atomiq-sdk/src/type-aliases/Token), [TokenAmount](/sdk-reference/api/atomiq-sdk/src/type-aliases/TokenAmount) for token metadata and amount handling
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
