---
sidebar_position: 1
---

# Swap Tutorials

This section contains tutorials for all swap directions supported by the Atomiq SDK.

## Swap Types Overview

The SDK supports swaps between Bitcoin (both L1 on-chain and L2 Lightning Network) and smart chains (Solana, Starknet, EVM).

| Source | Destination | Protocol | Page |
|--------|-------------|----------|------|
| BTC L1 | Solana | Legacy (FromBTC) | [BTC to Smart Chain](./btc-to-smart-chain) |
| BTC L1 | Starknet/EVM | SPV (SpvFromBTC) | [BTC to Smart Chain](./btc-to-smart-chain) |
| Solana/Starknet/EVM | BTC L1 | ToBTC | [Smart Chain to BTC](./smart-chain-to-btc) |
| BTC Lightning | Solana | Legacy (FromBTCLN) | [Lightning to Smart Chain](./lightning-to-smart-chain) |
| BTC Lightning | Starknet/EVM | Auto (FromBTCLNAuto) | [Lightning to Smart Chain](./lightning-to-smart-chain) |
| Solana/Starknet/EVM | BTC Lightning | ToBTCLN | [Smart Chain to Lightning](./smart-chain-to-lightning) |
| LNURL-withdraw | Smart Chain | - | [LNURL Swaps](./lnurl-swaps) |
| Smart Chain | LNURL-pay | - | [LNURL Swaps](./lnurl-swaps) |

## Protocol Differences

### Solana vs Starknet/EVM

The swap protocols differ between Solana and other chains:

- **Solana**: Uses the legacy swap protocol which requires opening a swap address on-chain before sending Bitcoin
- **Starknet/EVM**: Uses the newer SPV-based protocol which is simpler and doesn't require pre-commitment

### Lightning Network

Lightning swaps are instant and don't require Bitcoin confirmations, making them ideal for smaller amounts.

## Tutorials

- [BTC to Smart Chain](./btc-to-smart-chain) - Swap Bitcoin L1 to Solana, Starknet, or EVM tokens
- [Smart Chain to BTC](./smart-chain-to-btc) - Swap smart chain tokens to Bitcoin L1
- [Lightning to Smart Chain](./lightning-to-smart-chain) - Swap Lightning BTC to smart chain tokens
- [Smart Chain to Lightning](./smart-chain-to-lightning) - Swap smart chain tokens to Lightning BTC
- [LNURL Swaps](./lnurl-swaps) - Use LNURL-pay and LNURL-withdraw for reusable addresses
