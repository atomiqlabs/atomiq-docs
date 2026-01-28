---
sidebar_position: 3
---

# Configuration

Customize the swapper instance with advanced options.

:::tip Runnable Example
See the complete working example: [setup.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/setup.ts)
:::

## Basic Configuration

```typescript
import {BitcoinNetwork, SwapperFactory} from "@atomiqlabs/sdk";
import {SolanaInitializer} from "@atomiqlabs/chain-solana";
import {StarknetInitializer} from "@atomiqlabs/chain-starknet";
import {CitreaInitializer} from "@atomiqlabs/chain-evm";

const chains = [SolanaInitializer, StarknetInitializer, CitreaInitializer] as const;
const Factory = new SwapperFactory(chains);

const swapper = Factory.newSwapper({
  chains: {
    SOLANA: {
      rpcUrl: "https://api.mainnet-beta.solana.com"
    },
    STARKNET: {
      rpcUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8"
    },
    CITREA: {
      rpcUrl: "https://rpc.citrea.xyz"
    }
  },
  bitcoinNetwork: BitcoinNetwork.MAINNET
});
```

## All Configuration Options

```typescript
const swapper = Factory.newSwapper({
  // Required: Chain configuration
  chains: {
    SOLANA: { rpcUrl: solanaRpc },
    STARKNET: { rpcUrl: starknetRpc },
    CITREA: { rpcUrl: citreaRpc, chainType: "MAINNET" }
  },

  // Required: Bitcoin network
  bitcoinNetwork: BitcoinNetwork.MAINNET,

  // Storage (required for Node.js)
  swapStorage: chainId => new SqliteUnifiedStorage(`CHAIN_${chainId}.sqlite3`),
  chainStorageCtor: name => new SqliteStorageManager(`STORE_${name}.sqlite3`),

  // Pricing configuration
  pricingFeeDifferencePPM: 20000n,  // Max 2% price difference (20000 ppm)
  getPriceFn: customPriceGetter,     // Custom pricing API

  // Mempool API
  mempoolApi: new MempoolApi("https://mempool.space"),

  // LP configuration
  intermediaryUrl: "https://my-lp.example.com",
  registryUrl: "https://registry.example.com",
  defaultTrustedIntermediaryUrl: "https://trusted-lp.example.com",

  // Timeouts
  getRequestTimeout: 10000,   // 10 seconds for GET requests
  postRequestTimeout: 10000,  // 10 seconds for POST requests

  // Additional LP request parameters
  defaultAdditionalParameters: {
    clientId: "my-app",
    customData: "value"
  }
});
```

## Chain Configuration

### Solana

```typescript
import {Connection} from "@solana/web3.js";

// Using URL string
chains: {
  SOLANA: {
    rpcUrl: "https://api.mainnet-beta.solana.com"
  }
}

// Using Connection object
const connection = new Connection(rpcUrl, "confirmed");
chains: {
  SOLANA: {
    rpcUrl: connection
  }
}
```

### Starknet

```typescript
import {RpcProvider} from "starknet";

// Using URL string
chains: {
  STARKNET: {
    rpcUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8"
  }
}

// Using Provider object
const provider = new RpcProvider({ nodeUrl: rpcUrl });
chains: {
  STARKNET: {
    rpcUrl: provider
  }
}
```

### EVM (Citrea)

```typescript
import {JsonRpcProvider} from "ethers";

// Using URL string
chains: {
  CITREA: {
    rpcUrl: "https://rpc.citrea.xyz",
    chainType: "MAINNET"  // or "TESTNET4"
  }
}

// Using Provider object
const provider = new JsonRpcProvider(rpcUrl);
chains: {
  CITREA: {
    rpcUrl: provider,
    chainType: "MAINNET"
  }
}
```

## Bitcoin Network

```typescript
import {BitcoinNetwork} from "@atomiqlabs/sdk";

// Mainnet
bitcoinNetwork: BitcoinNetwork.MAINNET

// Testnet (also sets Solana to devnet, Starknet to sepolia)
bitcoinNetwork: BitcoinNetwork.TESTNET

// Testnet4
bitcoinNetwork: BitcoinNetwork.TESTNET4
```

## Storage Configuration

### Browser (Default)

No configuration needed - uses IndexedDB automatically.

### Node.js (SQLite)

```typescript
import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";

swapStorage: chainId => new SqliteUnifiedStorage(`CHAIN_${chainId}.sqlite3`),
chainStorageCtor: name => new SqliteStorageManager(`STORE_${name}.sqlite3`)
```

## Pricing Configuration

### Price Tolerance

```typescript
// Allow up to 2% difference from market price
pricingFeeDifferencePPM: 20000n  // 20000 ppm = 2%

// Stricter: only 0.5% tolerance
pricingFeeDifferencePPM: 5000n   // 5000 ppm = 0.5%
```

### Custom Pricing API

```typescript
getPriceFn: async (tickers: string[], abortSignal?: AbortSignal) => {
  // Return map of ticker -> USD price
  const response = await fetch(
    `https://my-api.com/prices?tickers=${tickers.join(",")}`,
    { signal: abortSignal }
  );
  const data = await response.json();

  const prices = {};
  for (const ticker of tickers) {
    prices[ticker] = data[ticker].usd;
  }
  return prices;
}
```

## Custom Mempool API

```typescript
import {MempoolApi} from "@atomiqlabs/sdk";

// Use custom mempool.space instance
mempoolApi: new MempoolApi("https://mempool.mycompany.com")
```

## LP Configuration

### Single LP

```typescript
// Connect to specific LP only
intermediaryUrl: "https://my-lp.example.com"
```

### Custom Registry

```typescript
// Use custom LP registry for discovery
registryUrl: "https://registry.example.com"
```

### Trusted LP for Gas Swaps

```typescript
// Specific LP for trusted operations
defaultTrustedIntermediaryUrl: "https://trusted-lp.example.com"
```

## Request Timeouts

```typescript
// Increase timeouts for slow networks
getRequestTimeout: 15000,   // 15 seconds
postRequestTimeout: 20000   // 20 seconds
```

## Additional LP Parameters

```typescript
// Send custom data with every LP request
defaultAdditionalParameters: {
  clientVersion: "1.0.0",
  clientId: "my-dapp",
  referralCode: "PARTNER123"
}
```

## Debug Logging

```typescript
// Enable verbose logging
global.atomiqLogLevel = 3;
```

| Level | Description |
|-------|-------------|
| 0 | No logs |
| 1 | Errors only |
| 2 | Warnings and errors |
| 3 | All logs (verbose) |

## API Reference

- [SwapperFactory](/sdk-reference/sdk/classes/SwapperFactory)
- [newSwapper](/sdk-reference/sdk/classes/SwapperFactory#newswapper)
- [BitcoinNetwork](/sdk-reference/sdk/enumerations/BitcoinNetwork)
