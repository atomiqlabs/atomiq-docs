---
sidebar_position: 1
---

# Quick Start

This guide walks you through setting up and initializing the Atomiq SDK.

## Setup

Set your RPC URLs:

```typescript
const solanaRpc = "https://api.mainnet-beta.solana.com";
const starknetRpc = "https://starknet-mainnet.public.blastapi.io/rpc/v0_8";
const citreaRpc = "https://rpc.testnet.citrea.xyz";
```

Create a swapper factory with your desired chain support. Use `as const` so TypeScript can properly infer the types:

```typescript
import {SolanaInitializer, SolanaInitializerType} from "@atomiqlabs/chain-solana";
import {StarknetInitializer, StarknetInitializerType} from "@atomiqlabs/chain-starknet";
import {CitreaInitializer, CitreaInitializerType} from "@atomiqlabs/chain-evm";
import {SwapperFactory, TypedTokens} from "@atomiqlabs/sdk";

// Define chains you want to support
const chains = [SolanaInitializer, StarknetInitializer, CitreaInitializer] as const;
type SupportedChains = typeof chains;

const Factory = new SwapperFactory<SupportedChains>(chains);
const Tokens: TypedTokens<SupportedChains> = Factory.Tokens;
```

## Browser Setup

Uses browser's IndexedDB by default:

```typescript
import {BitcoinNetwork, TypedSwapper} from "@atomiqlabs/sdk";

const swapper: TypedSwapper<SupportedChains> = Factory.newSwapper({
  chains: {
    SOLANA: {
      rpcUrl: solanaRpc // Can also pass Connection object
    },
    STARKNET: {
      rpcUrl: starknetRpc // Can also pass Provider object
    },
    CITREA: {
      rpcUrl: citreaRpc // Can also pass JsonApiProvider object
    }
  },
  bitcoinNetwork: BitcoinNetwork.TESTNET // or MAINNET, TESTNET4
});
```

:::info
The `bitcoinNetwork` setting also determines the network for Solana (devnet for testnet) and Starknet (sepolia for testnet).
:::

## Node.js Setup

For Node.js, use SQLite storage:

```typescript
import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";
import {BitcoinNetwork, TypedSwapper} from "@atomiqlabs/sdk";

const swapper: TypedSwapper<SupportedChains> = Factory.newSwapper({
  chains: {
    SOLANA: { rpcUrl: solanaRpc },
    STARKNET: { rpcUrl: starknetRpc },
    CITREA: { rpcUrl: citreaRpc }
  },
  bitcoinNetwork: BitcoinNetwork.TESTNET,
  // Required for Node.js (SDK defaults to browser's IndexedDB)
  swapStorage: chainId => new SqliteUnifiedStorage("CHAIN_"+chainId+".sqlite3"),
  chainStorageCtor: name => new SqliteStorageManager("STORE_"+name+".sqlite3"),
});
```

## Setting Up Signers

### Solana

```typescript
import {SolanaSigner} from "@atomiqlabs/chain-solana";

// Browser - using Solana wallet adapter
const anchorWallet = useAnchorWallet();
const wallet = new SolanaSigner(anchorWallet);
```

```typescript
import {Keypair} from "@solana/web3.js";
import {SolanaKeypairWallet, SolanaSigner} from "@atomiqlabs/chain-solana";

// From private key
const solanaSigner = new SolanaSigner(
  new SolanaKeypairWallet(Keypair.fromSecretKey(solanaKey)),
  Keypair.fromSecretKey(solanaKey)
);
```

### Starknet

```typescript
import {WalletAccount} from "starknet";
import {StarknetSigner} from "@atomiqlabs/chain-starknet";

// Browser - using get-starknet
const swo = await connect();
const wallet = new StarknetBrowserSigner(new WalletAccount(starknetRpc, swo.wallet));
```

```typescript
import {StarknetSigner, StarknetKeypairWallet} from "@atomiqlabs/chain-starknet";

// From private key
const starknetSigner = new StarknetSigner(
  new StarknetKeypairWallet(starknetRpc, starknetKey)
);
```

### EVM (Citrea, etc.)

```typescript
import {BaseWallet, SigningKey} from "ethers";
import {EVMSigner} from "@atomiqlabs/chain-evm";

// From private key
const wallet = new BaseWallet(new SigningKey(evmKey));
const evmWallet = new EVMSigner(wallet, wallet.address);
```

## Initialization

Initialize the swapper once when your app starts. This checks existing in-progress swaps and does initial LP discovery:

```typescript
await swapper.init();
```

## Extract Chain-Specific Swapper

For easier swaps between Bitcoin and a specific chain, extract a chain-specific swapper:

```typescript
const solanaSwapper = swapper.withChain<"SOLANA">("SOLANA");
```

Now you're ready to execute swaps! See [Swap Examples](./swaps) for all swap types.
