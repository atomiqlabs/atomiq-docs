---
sidebar_position: 1
---

# SDK Guide

The Atomiq SDK is a TypeScript multichain client for trustless cross-chain swaps between smart chains (Solana, Starknet, EVM) and Bitcoin (on-chain L1 and Lightning Network L2).

:::tip Demo Repository
See complete working examples: [atomiq-sdk-demo](https://github.com/atomiqlabs/atomiq-sdk-demo)
:::

## Swap Type Matrix

| From | To | Protocol | Settlement |
|------|-----|----------|------------|
| BTC L1 | Solana | Legacy (FromBTC) | Requires claim |
| BTC L1 | Starknet/EVM | SPV (SpvFromBTC) | Auto-settled |
| Lightning | Solana | Legacy (FromBTCLN) | Requires claim |
| Lightning | Starknet/EVM | Auto (FromBTCLNAuto) | Auto-settled |
| Solana/Starknet/EVM | BTC L1 | ToBTC | LP sends BTC |
| Solana/Starknet/EVM | Lightning | ToBTCLN | LP sends LN |

## Quick Installation

```bash
# Core SDK
npm install @atomiqlabs/sdk@latest

# Chain connectors (install only what you need)
npm install @atomiqlabs/chain-solana@latest
npm install @atomiqlabs/chain-starknet@latest
npm install @atomiqlabs/chain-evm@latest

# Node.js storage (not needed in browser)
npm install @atomiqlabs/storage-sqlite@latest
```

## Quick Example

```typescript
import {SwapperFactory, BitcoinNetwork, SwapAmountType} from "@atomiqlabs/sdk";
import {SolanaInitializer} from "@atomiqlabs/chain-solana";

// Create factory with desired chains
const Factory = new SwapperFactory([SolanaInitializer] as const);
const Tokens = Factory.Tokens;

// Create swapper
const swapper = Factory.newSwapper({
  chains: {
    SOLANA: { rpcUrl: "https://api.mainnet-beta.solana.com" }
  },
  bitcoinNetwork: BitcoinNetwork.MAINNET
});

// Initialize
await swapper.init();

// Create swap: SOL to Bitcoin Lightning
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTCLN,
  undefined,
  SwapAmountType.EXACT_OUT,
  signer.getAddress(),
  "lnbc10u1p..."  // Lightning invoice
);

// Execute
const success = await swap.execute(signer, {
  onSwapSettled: (txId) => console.log("Complete!", txId)
});

if (!success) {
  await swap.refund(signer);
}
```

## Documentation Sections

### Getting Started
- [Installation](./installation) - Install SDK and chain connectors
- [Quick Start](./quick-start) - Set up your first swapper

### Swap Tutorials
- [BTC to Smart Chain](./swaps/btc-to-smart-chain) - Bitcoin L1 to Solana/Starknet/EVM
- [Smart Chain to BTC](./swaps/smart-chain-to-btc) - Solana/Starknet/EVM to Bitcoin L1
- [Lightning to Smart Chain](./swaps/lightning-to-smart-chain) - Lightning to smart chains
- [Smart Chain to Lightning](./swaps/smart-chain-to-lightning) - Smart chains to Lightning
- [LNURL Swaps](./swaps/lnurl-swaps) - Reusable payment addresses

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