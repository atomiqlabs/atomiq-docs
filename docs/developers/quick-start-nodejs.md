---
sidebar_position: 2
---


# Quick Start (Node.js)

This guide covers installing the Atomiq SDK in Node.js and its chain-specific connectors and walks you through setting up and initializing the Atomiq SDK.

## Core SDK

Install the main SDK package, and for Node.js applications, install the SQLite storage adapter:

```bash
npm install @atomiqlabs/sdk@latest
npm install @atomiqlabs/storage-sqlite@latest
```
### Chain Connectors

The SDK supports multiple chains. Install only the chain connectors your project needs, and mix and match them as required: 

```bash
npm install @atomiqlabs/chain-solana@latest
npm install @atomiqlabs/chain-starknet@latest
npm install @atomiqlabs/chain-evm@latest
```

## Setup

Set your RPC URLs:

```typescript
const solanaRpc = "https://api.mainnet-beta.solana.com";
const starknetRpc = "https://api.zan.top/public/starknet-mainnet/rpc/v0_9";
const citreaRpc = "https://rpc.mainnet.citrea.xyz";
```

Create a swapper factory with your desired chain support. Use `as const` so TypeScript can properly infer the types:

```typescript
import {SolanaInitializer, SolanaInitializerType} from "@atomiqlabs/chain-solana";
import {StarknetInitializer, StarknetInitializerType} from "@atomiqlabs/chain-starknet";
import {CitreaInitializer, CitreaInitializerType} from "@atomiqlabs/chain-evm";

import {BitcoinNetwork, TypedSwapper, SwapperFactory, TypedTokens} from "@atomiqlabs/sdk";
import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";

// Define chains you want to support
const chains = [SolanaInitializer, StarknetInitializer, CitreaInitializer] as const;
type SupportedChains = typeof chains;

// Create the swapper factory
const Factory = new SwapperFactory<SupportedChains>(chains);

// Get the tokens for the supported chains
const Tokens: TypedTokens<SupportedChains> = Factory.Tokens;

// Create one swapper instance for your entire app, and use that instance for all your swaps.
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

// Initialize the swapper
await swapper.init();
```

:::info
Initialize the swapper with `await swapper.init();` shown above once when your app starts. Ideally, you should create only one swapper instance for your entire app, and use that instance for all your swaps. This checks existing in-progress swaps and does initial LP discovery.
:::


## Setting Up Signers

### Solana

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

## Your First Swap

Here's a complete example of a Smart Chain to Lightning swap:

```typescript
import {SwapAmountType} from "@atomiqlabs/sdk";

// Create a swap: SOL to Lightning
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,              // From token
  Tokens.BITCOIN.BTC,             // To Bitcoin on-chain
  undefined,                      // Amount from invoice
  SwapAmountType.EXACT_OUT,       // Invoice has fixed amount
  solanaSigner.getAddress(),      // Source address
  "bc1q..."                       // Bitcoin on-chain address
);

// Check quote details
console.log("Input:", swap.getInput().toString());
console.log("Output:", swap.getOutput().toString());
console.log("Expires:", new Date(swap.getQuoteExpiry()));

// Execute the swap
const success = await swap.execute(solanaSigner, {
  onSourceTransactionSent: (txId) => console.log("Tx sent:", txId),
  onSwapSettled: (hash) => console.log("Payment sent!")
});

// Handle failure
if (!success) {
  await swap.refund(solanaSigner);
}
```

## Next Steps

Now you're ready to explore specific swap types:

- [BTC to Smart Chain](./swaps/btc-to-smart-chain) - Bitcoin on-chain to Solana/Starknet/EVM
- [Smart Chain to BTC](./swaps/smart-chain-to-btc) - Solana/Starknet/EVM to Bitcoin on-chain
- [Lightning to Smart Chain](./swaps/lightning-to-smart-chain) - Lightning to smart chains
- [Smart Chain to Lightning](./swaps/smart-chain-to-lightning) - Smart chains to Lightning
- [LNURL Swaps](./swaps/lnurl-swaps) - Reusable payment addresses
