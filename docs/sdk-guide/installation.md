---
sidebar_position: 1
---

# Installation

This guide covers installing the Atomiq SDK and its chain-specific connectors.

## Core SDK

Install the main SDK package:

```bash
npm install @atomiqlabs/sdk@latest
```

## Chain Connectors

Install only the chain connectors your project requires:

```bash
# Solana support
npm install @atomiqlabs/chain-solana@latest

# Starknet support
npm install @atomiqlabs/chain-starknet@latest

# EVM support (Citrea, etc.)
npm install @atomiqlabs/chain-evm@latest
```

## Node.js Storage

For Node.js applications, install the SQLite storage adapter:

```bash
npm install @atomiqlabs/storage-sqlite@latest
```

:::info Browser Storage
Browser applications use IndexedDB by default and don't require additional storage packages.
:::

## Example: Full Installation

For a project supporting all chains in Node.js:

```bash
npm install @atomiqlabs/sdk@latest \
  @atomiqlabs/chain-solana@latest \
  @atomiqlabs/chain-starknet@latest \
  @atomiqlabs/chain-evm@latest \
  @atomiqlabs/storage-sqlite@latest
```

For a browser project with Solana and Starknet:

```bash
npm install @atomiqlabs/sdk@latest \
  @atomiqlabs/chain-solana@latest \
  @atomiqlabs/chain-starknet@latest
```

## Peer Dependencies

The chain connectors have peer dependencies on their respective chain libraries:

| Connector | Peer Dependencies |
|-----------|-------------------|
| `@atomiqlabs/chain-solana` | `@solana/web3.js` |
| `@atomiqlabs/chain-starknet` | `starknet` |
| `@atomiqlabs/chain-evm` | `ethers` |

Install the peer dependencies for your chosen chains:

```bash
# For Solana
npm install @solana/web3.js

# For Starknet
npm install starknet

# For EVM
npm install ethers
```

## TypeScript Support

The SDK is written in TypeScript and includes type definitions. No additional `@types` packages are required.

## Next Steps

After installation, proceed to [Quick Start](./quick-start) to initialize your swapper instance.
