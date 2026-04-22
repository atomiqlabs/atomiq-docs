---
sidebar_position: 2
---

# Quick Start

This section is the shortest path from an empty project to a working swap. The guides here help you pick the right runtime, initialize the SDK, connect wallets or signers, request a quote, and execute the route.

:::info
The Quick Start pages are meant for the default high-level SDK flow. If your integration later needs custom persistence, event handling, or manual transaction signing, continue with the [Advanced](/sdk-guide/advanced/) section after the basic flow is working.
:::

## Usage

Most integrations use this section in the following order:

### Environment Setup

- Use [Quick Start - Browser](./quick-start-browser) for browser-based web apps that connect user wallets directly through wallet adapters, injected wallets, or browser wallet connection flows.
- Use [Quick Start - Node.js](./quick-start-nodejs) for Node.js backends that require explicit storage setup to run the SDK outside the browser and typically use keypair-based signers.

### Swap Flow

1. Start with [Creating Quotes](./creating-quotes) once you have the swapper instance initialized and are ready to get your first swap quote.
2. Continue with [Executing Swaps](./executing-swaps) once you are ready to move from inspecting the quote to the full swap flow and need to understand the expected signer or wallet inputs for each swap protocol.

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

The `bitcoinNetwork` setting determines both the Bitcoin network and which smart chain network is used by the chain initializers.

:::tip Getting Testnet Tokens
- **Bitcoin Testnet/Testnet4** - Use a [Bitcoin testnet faucet](https://bitcoinfaucet.uo1.net/) or [Bitcoin testnet4 faucet](https://mempool.space/testnet4/faucet)
- **Solana Devnet** - Use Solana CLI's `solana airdrop 1` or the [Solana faucet](https://faucet.solana.com/)
- **Starknet Sepolia** - Use the [Starknet faucet](https://starknet-faucet.vercel.app/)
- **Botanix Testnet** - Use the [Botanix faucet](https://faucet.botanixlabs.dev/)
- **Alpen Testnet** - Use the [Alpen CLI](https://docs.alpenlabs.io/welcome/using-the-alpen-cli#user-content-request-btc)
:::

## Topics

### Quick Start - Browser

Install the browser SDK packages, initialize the swapper, and connect supported browser wallets.

**[Quick Start - Browser →](./quick-start-browser)**

---

### Quick Start - Node.js

Install the Node.js SDK packages, configure storage, initialize the swapper, and construct server-side signers.

**[Quick Start - Node.js →](./quick-start-nodejs)**

---

### Creating Quotes

Request quotes from LPs and inspect the resulting swap object before moving on to execution.

**[Creating Quotes →](./creating-quotes)**

---

### Executing Swaps

Execute the swap and understand which signer or wallet type is needed for each route direction.

**[Executing Swaps →](./executing-swaps)**

---
