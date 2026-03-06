---
sidebar_position: 2
---

# Quick Start

Get started with the Atomiq SDK. Choose your environment:

- [**Browser**](./quick-start-browser) — For web applications with wallet adapters
- [**Node.js**](./quick-start-nodejs) — For backend services and scripts

## Network Availability

Not all chains are available on all Bitcoin testnets. Use the table below to pick the right `bitcoinNetwork` setting for your chain combination:

| Chain | Mainnet | Testnet3 | Testnet4 |
|-------|---------|----------|----------|
| **Solana** | Mainnet-beta | Devnet | - |
| **Starknet** | Mainnet | Sepolia | Sepolia |
| **Citrea** | Mainnet | - | Testnet |
| **Botanix** | Mainnet | Testnet | - |
| **Alpen** | - | Testnet | Testnet |
| **GOAT Network** | - | Testnet | Testnet |

The `bitcoinNetwork` setting determines both the Bitcoin network and which smart chain network is used (e.g. `TESTNET3` maps Solana to devnet and Starknet to Sepolia).

## Getting Testnet Tokens

- **Bitcoin Testnet/Testnet4** — Use a [Bitcoin testnet faucet](https://bitcoinfaucet.uo1.net/)
- **Solana Devnet** — `solana airdrop 1` or use the [Solana faucet](https://faucet.solana.com/)
- **Starknet Sepolia** — Use the [Starknet faucet](https://starknet-faucet.vercel.app/)
