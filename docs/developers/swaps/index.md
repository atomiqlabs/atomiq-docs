---
sidebar_position: 1
---

# Swap Tutorials

This section contains tutorials for all swap directions supported by the Atomiq SDK.

## Swap Types Overview

The SDK supports swaps between Bitcoin (both L1 on-chain and L2 Lightning Network) and smart chains (Solana, Starknet, EVM).

| Source | Destination | `SwapType` | Swap Class | Tutorial |
|--------|-------------|-----------|------------|----------|
| BTC L1 | Smart Chain | [`SPV_VAULT_FROM_BTC`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#spv_vault_from_btc) | [`SpvFromBTCSwap`](/sdk-reference/api/atomiq-sdk/src/classes/SpvFromBTCSwap) | [BTC to Smart Chain](./btc-to-smart-chain) |
| Lightning | Smart Chain | [`FROM_BTCLN_AUTO`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#from_btcln_auto) | [`FromBTCLNAutoSwap`](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNAutoSwap) | [Lightning to Smart Chain](./lightning-to-smart-chain) |
| Smart Chain | BTC L1 | [`TO_BTC`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#to_btc) | [`ToBTCSwap`](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCSwap) | [Smart Chain to BTC](./smart-chain-to-btc.mdx) |
| Smart Chain | Lightning | [`TO_BTCLN`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#to_btcln) | [`ToBTCLNSwap`](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCLNSwap) | [Smart Chain to BTC](./smart-chain-to-btc.mdx) |

### Legacy (Solana)

| Source | Destination | `SwapType` | Swap Class | Tutorial |
|--------|-------------|-----------|------------|----------|
| BTC L1 | Solana | [`FROM_BTC`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#from_btc) | [`FromBTCSwap`](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap) | [BTC to Solana](./solana/btc-to-solana) |
| Lightning | Solana | [`FROM_BTCLN`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#from_btcln) | [`FromBTCLNSwap`](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNSwap) | [Lightning to Solana](./solana/lightning-to-solana) |

### Lightning Network

Lightning swaps are instant and don't require Bitcoin confirmations, making them ideal for smaller amounts.

## Tutorials

- [Creating Quotes](../quick-start/creating-quotes.md) - How to create and inspect swap quotes
- [BTC to Smart Chain](./btc-to-smart-chain) - Swap Bitcoin L1 to Starknet or EVM tokens
- [Smart Chain to BTC](./smart-chain-to-btc.mdx) - Swap Starknet/EVM tokens to Bitcoin L1 and Lightning
- [Lightning to Smart Chain](./lightning-to-smart-chain) - Swap Lightning BTC to Starknet/EVM tokens
- [LNURL Swaps](../utilities/lnurl-swaps.md) - Use LNURL-pay and LNURL-withdraw for reusable addresses

### Solana (Legacy)

Solana uses a different (legacy) swap protocol for receiving Bitcoin. These tutorials cover Solana-specific integration:

- [BTC to Solana](./solana/btc-to-solana) - Bitcoin L1 to Solana (legacy FromBTC protocol)
- [Lightning to Solana](./solana/lightning-to-solana) - Lightning to Solana (legacy FromBTCLN protocol)
