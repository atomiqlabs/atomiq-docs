---
sidebar_position: 1
---

# Swap Tutorials

This section contains tutorials for all swap directions supported by the Atomiq SDK.

## Swap Types Overview

The SDK supports swaps between Bitcoin (both L1 on-chain and L2 Lightning Network) and smart chains (Solana, Starknet, EVM).

| Source | Destination | Protocol | Page |
|--------|-------------|----------|------|
| BTC L1 | Starknet/EVM | SPV (SpvFromBTC) | [BTC to Smart Chain](./btc-to-smart-chain) |
| Starknet/EVM | BTC L1 | ToBTC | [Smart Chain to BTC](./smart-chain-to-btc) |
| BTC Lightning | Starknet/EVM | Auto (FromBTCLNAuto) | [Lightning to Smart Chain](./lightning-to-smart-chain) |
| Starknet/EVM | BTC Lightning | ToBTCLN | [Smart Chain to Lightning](./smart-chain-to-lightning) |
| LNURL-withdraw | Smart Chain | - | [LNURL Swaps](./lnurl-swaps) |
| Smart Chain | LNURL-pay | - | [LNURL Swaps](./lnurl-swaps) |
| BTC L1 | Solana | Legacy (FromBTC) | [BTC to Solana](./solana/btc-to-solana) |
| Solana | BTC L1 | ToBTC | [Solana to BTC](./solana/solana-to-btc) |
| BTC Lightning | Solana | Legacy (FromBTCLN) | [Lightning to Solana](./solana/lightning-to-solana) |
| Solana | BTC Lightning | ToBTCLN | [Solana to Lightning](./solana/solana-to-lightning) |

### Lightning Network

Lightning swaps are instant and don't require Bitcoin confirmations, making them ideal for smaller amounts.

## Tutorials

- [Creating Quotes](./creating-quotes) - How to create and inspect swap quotes
- [BTC to Smart Chain](./btc-to-smart-chain) - Swap Bitcoin L1 to Starknet or EVM tokens
- [Smart Chain to BTC](./smart-chain-to-btc) - Swap Starknet/EVM tokens to Bitcoin L1
- [Lightning to Smart Chain](./lightning-to-smart-chain) - Swap Lightning BTC to Starknet/EVM tokens
- [Smart Chain to Lightning](./smart-chain-to-lightning) - Swap Starknet/EVM tokens to Lightning BTC
- [LNURL Swaps](./lnurl-swaps) - Use LNURL-pay and LNURL-withdraw for reusable addresses

### Solana (Legacy)

Solana uses a different (legacy) swap protocol for receiving Bitcoin. These tutorials cover Solana-specific integration:

- [BTC to Solana](./solana/btc-to-solana) - Bitcoin L1 to Solana (legacy FromBTC protocol)
- [Solana to BTC](./solana/solana-to-btc) - Solana to Bitcoin L1
- [Lightning to Solana](./solana/lightning-to-solana) - Lightning to Solana (legacy FromBTCLN protocol)
- [Solana to Lightning](./solana/solana-to-lightning) - Solana to Lightning
