---
sidebar_position: 2
---

# SDK Guide

The Atomiq SDK is a TypeScript multichain client for Atomiq trustless cross-chain swaps. It enables trustless swaps between smart chains (Solana, EVM, Starknet, etc.) and Bitcoin (on-chain L1 and Lightning Network L2).

Example SDK integration in Node.js available [here](https://github.com/atomiqlabs/atomiq-sdk-demo).

## Installation

```bash
npm install @atomiqlabs/sdk@latest
```

## Chain-Specific Connectors

Install only the chain connectors your project requires:

```bash
npm install @atomiqlabs/chain-solana@latest
npm install @atomiqlabs/chain-starknet@latest
npm install @atomiqlabs/chain-evm@latest
```

## Node.js Storage

For Node.js applications, install the SQLite storage adapter:

```bash
npm install @atomiqlabs/storage-sqlite@latest
```

## What's Next

- [Quick Start](./quick-start) - Set up your first swapper instance
- [Swap Examples](./swaps) - Code examples for all swap types
- [Advanced Usage](./advanced) - Swap states, limits, helpers, and configuration options

## API Reference

For detailed TypeScript API documentation, see the [SDK API Reference](/sdk-reference/sdk).
