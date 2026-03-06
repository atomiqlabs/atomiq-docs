---
sidebar_position: 4
---


# Quick Start (Testnet)

This guide shows how to configure the Atomiq SDK for testnet environments. We use the Node.js setup here — imports, signers, and swap logic are the same as in the [Node.js Quick Start](./quick-start-nodejs), only the RPC URLs and `bitcoinNetwork` setting change.

:::info
On testnets, only native tokens are generally supported (e.g. SOL, STRK, ETH, cBTC).
:::

## Network Overview

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

## Example: Solana + Starknet (Testnet)

```typescript
import {SolanaInitializer} from "@atomiqlabs/chain-solana";
import {StarknetInitializer} from "@atomiqlabs/chain-starknet";

import {BitcoinNetwork, TypedSwapper, SwapperFactory, TypedTokens} from "@atomiqlabs/sdk";
import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";

// Testnet RPCs
const solanaRpc = "https://api.devnet.solana.com";
const starknetRpc = "https://rpc.starknet-testnet.lava.build/";

const chains = [SolanaInitializer, StarknetInitializer] as const;
type SupportedChains = typeof chains;

const Factory = new SwapperFactory<SupportedChains>(chains);
const Tokens: TypedTokens<SupportedChains> = Factory.Tokens;

const swapper: TypedSwapper<SupportedChains> = Factory.newSwapper({
  chains: {
    SOLANA: { rpcUrl: solanaRpc },
    STARKNET: { rpcUrl: starknetRpc }
  },
  bitcoinNetwork: BitcoinNetwork.TESTNET3,
  swapStorage: chainId => new SqliteUnifiedStorage("CHAIN_"+chainId+".sqlite3"),
  chainStorageCtor: name => new SqliteStorageManager("STORE_"+name+".sqlite3"),
});

async function main() {
  await swapper.init();
  console.log("Testnet swapper initialized!");
  console.log("Available tokens:", Object.keys(Tokens));
}
main();
```

## Example: Starknet + Citrea (Testnet4)

```typescript
import {StarknetInitializer} from "@atomiqlabs/chain-starknet";
import {CitreaInitializer} from "@atomiqlabs/chain-evm";

import {BitcoinNetwork, TypedSwapper, SwapperFactory, TypedTokens} from "@atomiqlabs/sdk";
import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";

// Testnet4 RPCs
const starknetRpc = "https://rpc.starknet-testnet.lava.build/";
const citreaRpc = "https://rpc.testnet.citrea.xyz";

const chains = [StarknetInitializer, CitreaInitializer] as const;
type SupportedChains = typeof chains;

const Factory = new SwapperFactory<SupportedChains>(chains);
const Tokens: TypedTokens<SupportedChains> = Factory.Tokens;

const swapper: TypedSwapper<SupportedChains> = Factory.newSwapper({
  chains: {
    STARKNET: { rpcUrl: starknetRpc },
    CITREA: { rpcUrl: citreaRpc, chainType: "TESTNET3" }
  },
  bitcoinNetwork: BitcoinNetwork.TESTNET4,
  swapStorage: chainId => new SqliteUnifiedStorage("CHAIN_"+chainId+".sqlite3"),
  chainStorageCtor: name => new SqliteStorageManager("STORE_"+name+".sqlite3"),
});

async function main() {
  await swapper.init();
  console.log("Testnet4 swapper initialized!");
  console.log("Available tokens:", Object.keys(Tokens));
}
main();
```

## Signers

Setting up signers is identical to the [Node.js Quick Start](./quick-start-nodejs#setting-up-signers) — just use the testnet RPC URLs when creating providers:

```typescript
// Starknet: use testnet RPC for the provider
const starknetProvider = new RpcProvider({nodeUrl: "https://rpc.starknet-testnet.lava.build/"});

// EVM (Citrea): use testnet RPC for the provider
const evmProvider = new JsonRpcProvider("https://rpc.testnet.citrea.xyz");
```

## Getting Testnet Tokens

To test swaps you'll need testnet tokens:

- **Bitcoin Testnet/Testnet4** — Use a [Bitcoin testnet faucet](https://bitcoinfaucet.uo1.net/)
- **Solana Devnet** — `solana airdrop 1` or use the [Solana faucet](https://faucet.solana.com/)
- **Starknet Sepolia** — Use the [Starknet faucet](https://starknet-faucet.vercel.app/)
- **Citrea Testnet** — TODO

## Next Steps

Once your testnet setup is working, see the swap tutorials:

- [BTC to Smart Chain](./swaps/btc-to-smart-chain) - Bitcoin on-chain to Solana/Starknet/EVM
- [Smart Chain to BTC](./swaps/smart-chain-to-btc) - Solana/Starknet/EVM to Bitcoin on-chain
- [Lightning to Smart Chain](./swaps/lightning-to-smart-chain) - Lightning to smart chains
- [Smart Chain to Lightning](./swaps/smart-chain-to-lightning) - Smart chains to Lightning
