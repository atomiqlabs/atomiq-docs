---
sidebar_position: 2
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

// Create the swapper factory
const Factory = new SwapperFactory<SupportedChains>(chains);

// Get the tokens for the supported chains
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

// Initialize the swapper - see Swapper Initialization section for more details
await swapper.init();
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

// Initialize the swapper - see Swapper Initialization section for more details
await swapper.init();
```

## Swapper Initialization

Initialize the swapper once when your app starts. Ideally, you should create only one swapper instance for your entire app, and use that instance for all your swaps. This checks existing in-progress swaps and does initial LP discovery:

```typescript
// Browser setup or Node.js setup <...>

// Initialize the swapper
await swapper.init();
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

## Extract Chain-Specific Swapper

For easier swaps between Bitcoin and a specific chain, extract a chain-specific swapper:

```typescript
const solanaSwapper = swapper.withChain<"SOLANA">("SOLANA");
```

## Your First Swap

Here's a complete example of a Smart Chain to Lightning swap:

```typescript
import {SwapAmountType} from "@atomiqlabs/sdk";

// Create a swap: SOL to Lightning
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,              // From token
  Tokens.BITCOIN.BTCLN,           // To Lightning
  undefined,                      // Amount from invoice
  SwapAmountType.EXACT_OUT,       // Invoice has fixed amount
  solanaSigner.getAddress(),      // Source address
  "lnbc10u1p..."                  // Lightning invoice
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
