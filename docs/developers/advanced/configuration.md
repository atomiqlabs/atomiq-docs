---
sidebar_position: 3
---

# Configuration

Customize the swapper instance with advanced options.

:::tip Runnable Example
See the complete working example: [setup.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/setup.ts)
:::

## Basic Configuration

The `chains` object is typed from the initializer list passed to `SwapperFactory`. With Solana, Starknet, and Citrea initializers, `SOLANA`, `STARKNET`, and `CITREA` are typed as [SolanaSwapperOptions](/sdk-reference/api/atomiq-chain-solana/src/type-aliases/SolanaSwapperOptions), [StarknetOptions](/sdk-reference/api/atomiq-chain-starknet/src/type-aliases/StarknetOptions), and [CitreaOptions](/sdk-reference/api/atomiq-chain-evm/src/type-aliases/CitreaOptions), respectively.

```typescript
const swapper = Factory.newSwapper({
  chains: {
    SOLANA: {
      rpcUrl: "https://api.mainnet-beta.solana.com"
    }, // SolanaSwapperOptions
    STARKNET: {
      rpcUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8"
    }, // StarknetOptions
    CITREA: {
      rpcUrl: "https://rpc.citrea.xyz"
    } // CitreaOptions
  },
  bitcoinNetwork: BitcoinNetwork.MAINNET
});
```

## Top-Level Options

| Parameter | Type | Description |
|-----------|------|-------------|
| `chains` | `GetAllOptions<T>` | Required. The keys are derived from the initializers passed to `SwapperFactory`, and each value is that initializer's option type. |
| `intermediaryUrl` | `string \| string[]` | Manually pin one or more LP URLs instead of relying on registry discovery. |
| `registryUrl` | `string` | Registry URL used to discover LPs. Defaults to the SDK's per-network registry. |
| `defaultTrustedIntermediaryUrl` | `string` | Trusted LP used for gas swaps. Defaults to the SDK's per-network value. |
| `getRequestTimeout` | `number` | HTTP GET timeout in milliseconds for SDK requests. |
| `postRequestTimeout` | `number` | HTTP POST timeout in milliseconds for SDK requests. |
| `defaultAdditionalParameters` | `{[key: string]: any}` | Extra parameters included when requesting quotes from intermediaries. |
| `messenger` | `Messenger` | Data propagation messenger used for watchtower broadcasting. Defaults to the SDK's Nostr-based messenger. |

### Storage

| Parameter | Type | Description |
|-----------|------|-------------|
| `swapStorage` | `(storageName: string) => IUnifiedStorage<...>` | Swap persistence backend. Defaults to IndexedDB in browser environments. |
| `chainStorageCtor` | `<T extends StorageObject>(storageName: string) => IStorageManager<T>` | Key-value storage backend used by chain integrations. Defaults to browser local storage. |
| `storagePrefix` | `string` | Prefix used for swap-storage names. `SwapperFactory.newSwapper()` defaults this to `atomiqsdk-${bitcoinNetwork}-`. |

#### SQLite Storage Example (Node.js)

```typescript
import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";

const swapper = Factory.newSwapper({
  ...
  swapStorage: storageName => new SqliteUnifiedStorage(`${storageName}.sqlite3`),
  chainStorageCtor: storageName => new SqliteStorageManager(`${storageName}.sqlite3`)
});
```

When you run outside the browser, provide both `swapStorage` and `chainStorageCtor`.

### Pricing

| Parameter | Type | Description |
|-----------|------|-------------|
| `pricingFeeDifferencePPM` | `bigint` | Maximum allowed difference between LP pricing and market pricing, in parts-per-million. Defaults to `10000n` (1%). |
| `getPriceFn` | `(tickers: string[], abortSignal?: AbortSignal) => Promise<number[]>` | Custom pricing callback. Return USD prices in the same order as the input `tickers`. |

#### Custom Pricing API

Your custom pricing callback must return `Promise<number[]>`, with results in the same order as the input tickers.

```typescript
const swapper = Factory.newSwapper({
  ...
  getPriceFn: async (tickers: string[], abortSignal?: AbortSignal) => {
    const response = await fetch(
      `https://my-api.com/prices?tickers=${tickers.join(",")}`,
      {signal: abortSignal}
    );
    const data = await response.json();
  
    return tickers.map(ticker => data[ticker].usd);
  }
});
```

### Bitcoin network and RPC

| Parameter | Type | Description                                                                                                                                              |
|-----------|------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `bitcoinNetwork` | `BitcoinNetwork` | Defaults to `BitcoinNetwork.MAINNET`. Controls both the Bitcoin network and the canonical smart-chain deployments selected by the chain initializers |
| `mempoolApi` | `MempoolApi \| MempoolBitcoinRpc \| string \| string[]` | Custom mempool API client or URL(s). If omitted, the SDK uses built-in URLs for the selected Bitcoin network.                                            |

### Runtime Flags

| Parameter | Type | Description                                                                                                                                                                                                                              |
|-----------|------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `noTimers` | `boolean` | Disable automatic tick timers. If you set this, call `swapper._syncSwaps()` periodically yourself, this updates the state of the swaps.                                                                                                                                                    |
| `noEvents` | `boolean` | Disable on-chain event subscriptions. If you set this, call `swapper._syncSwaps()` periodically yourself, this updates the state of the swaps.                                                                                           |
| `noSwapCache` | `boolean` | Always load swaps from persistent storage instead of using the in-memory `WeakRef` cache. Set this if you access the same swap storage from multiple instances!                                                                          |
| `dontCheckPastSwaps` | `boolean` | Skip past-swap checking during `init()`. If you set this, call `swapper._syncSwaps()` manually on startup to synchronize the swaps.                                                                                                      |
| `dontFetchLPs` | `boolean` | Skip LP discovery during `init()`. LP metadata is fetched lazily later when needed.                                                                                                                                                      |
| `saveUninitializedSwaps` | `boolean` | Persist swaps before they are initialized, i.e. `commit()`, `execute()`, or `waitTillPayment()` is called. Useful for backend systems, where one endpoint creates a quote and other endpoint then provides the swap transactions/status. |
| `automaticClockDriftCorrection` | `boolean` | Checks for clock drift during `init()` and corrects `Date.now()` if the local clock is far off. Having invalid local time can lead to quotes displaying as expired before they actually expire!                                          |

---

Here is the full configuration example as passed to the `Factory.newSwapper()` function:

```typescript
const swapper = Factory.newSwapper({
  chains: {
    SOLANA: { rpcUrl: solanaRpc },
    STARKNET: { rpcUrl: starknetRpc },
    CITREA: { rpcUrl: citreaRpc }
  },
  intermediaryUrl: ["https://lp-1.example.com", "https://lp-2.example.com"],
  registryUrl: "https://registry.example.com",
  defaultTrustedIntermediaryUrl: "https://trusted-lp.example.com",
  getRequestTimeout: 15000,
  postRequestTimeout: 20000,
  defaultAdditionalParameters: {
    clientId: "my-app",
    referralCode: "PARTNER123"
  },

  //Bitcoin network and RPC
  bitcoinNetwork: BitcoinNetwork.MAINNET,
  mempoolApi: new MempoolApi("https://mempool.space"),

  //Storage
  swapStorage: storageName => new SqliteUnifiedStorage(`${storageName}.sqlite3`),
  chainStorageCtor: storageName => new SqliteStorageManager(`${storageName}.sqlite3`),
  storagePrefix: "my-app-mainnet-",

  //Pricing
  pricingFeeDifferencePPM: 20000n,
  getPriceFn: customPriceGetter,

  //Runtime flags
  noTimers: true,
  noEvents: true,
  noSwapCache: true,
  dontCheckPastSwaps: true,
  dontFetchLPs: true,
  saveUninitializedSwaps: true,
  automaticClockDriftCorrection: true
});
```

## Chain Configuration

Each `chains.<CHAIN_ID>` entry is the options type exposed by that chain initializer.

### Solana

`chains.SOLANA` is [`SolanaSwapperOptions`](/sdk-reference/api/atomiq-chain-solana/src/type-aliases/SolanaSwapperOptions).

| Parameter | Type | Description |
|-----------|------|-------------|
| `rpcUrl` | `string \| Connection` | Required. Solana RPC URL or a prebuilt `Connection`. |
| `dataAccountStorage` | `IStorageManager<StoredDataAccount>` | Storage backend for ephemeral Solana data-submission accounts. If omitted, the initializer uses `chainStorageCtor("solAccounts")`. |
| `retryPolicy` | `SolanaRetryPolicy` | Retry policy for Solana RPC calls and transaction submission. If omitted, the initializer uses `{ transactionResendInterval: 1000 }`. |
| `btcRelayContract` | `string` | Override the canonical BTC Relay program address. |
| `swapContract` | `string` | Override the canonical swap program address. |
| `fees` | `SolanaFees` | Custom Solana fee API implementation. |

```typescript
const swapper = Factory.newSwapper({
  chains: {
    SOLANA: {
      rpcUrl: "https://api.mainnet-beta.solana.com", //Or `new Connection("https://api.mainnet-beta.solana.com", "confirmed")`
      dataAccountStorage: new SqliteStorageManager('solAccountsStore.sqlite3'),
      retryPolicy: {...},
      btcRelayContract: "<btc relay program address>",
      swapContract: "<swap program address>",
      fees: new SolanaFees(...)
    },
    ...
  },
  ...
});
```

### Starknet

`chains.STARKNET` is [`StarknetOptions`](/sdk-reference/api/atomiq-chain-starknet/src/type-aliases/StarknetOptions).

| Parameter | Type | Description |
|-----------|------|-------------|
| `rpcUrl` | `string \| Provider` | Required. Starknet RPC URL or a prebuilt provider. |
| `wsUrl` | `string \| WebSocketChannel` | Optional websocket endpoint or channel for realtime subscriptions. |
| `retryPolicy` | `{maxRetries?: number, delay?: number, exponential?: boolean}` | Retry policy for RPC calls. |
| `chainId` | `constants.StarknetChainId` | Optional chain ID override. If omitted, the initializer uses `SN_MAIN` for Bitcoin mainnet and `SN_SEPOLIA` for non-mainnet networks. |
| `swapContract` | `string` | Override the Escrow Manager contract address. |
| `swapContractDeploymentHeight` | `number` | Override the swap contract deployment height used as the event-query genesis. |
| `btcRelayContract` | `string` | Override the BTC Relay contract address. |
| `btcRelayContractDeploymentHeight` | `number` | Override the BTC Relay deployment height used as the event-query genesis. |
| `spvVaultContract` | `string` | Override the SPV Vault manager contract address. |
| `spvVaultContractDeploymentHeight` | `number` | Override the SPV Vault deployment height used as the event-query genesis. |
| `handlerContracts` | `{ refund?: { timelock?: string }, claim?: { [type in ChainSwapType]?: string } }` | Optional refund and claim handler overrides. Use `refund.timelock` to override the refund handler and `claim[ChainSwapType]` to override individual claim handlers. |
| `fees` | `StarknetFees` | Custom Starknet fee API implementation. |
| `starknetConfig` | `StarknetConfig` | Advanced Starknet configuration passed into the chain interface. |

```typescript
const swapper = Factory.newSwapper({
  chains: {
    STARKNET: {
      rpcUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8", //Or `new RpcProvider({ nodeUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8" })`
      wsUrl: "wss://starknet-mainnet.public.blastapi.io/ws",
      retryPolicy: {...},
      chainId: constants.StarknetChainId.SN_MAIN,
      swapContract: "<escrow manager contract address>",
      swapContractDeploymentHeight: 123456,
      btcRelayContract: "<btc relay contract address>",
      btcRelayContractDeploymentHeight: 123456,
      spvVaultContract: "<spv vault contract address>",
      spvVaultContractDeploymentHeight: 123456,
      handlerContracts: {
        refund: {
          timelock: "<refund handler address>"
        },
        claim: {...}
      },
      fees: new StarknetFees(...),
      starknetConfig: {...}
    },
    ...
  },
  ...
});
```

### EVM Chains

Every EVM initializer exposes its own options type built on [`EVMOptions`](/sdk-reference/api/atomiq-chain-evm/src/type-aliases/EVMOptions). For example, `chains.CITREA` uses [`CitreaOptions`](/sdk-reference/api/atomiq-chain-evm/src/type-aliases/CitreaOptions), which is `EVMOptions<"MAINNET" | "TESTNET4", CitreaFees>`.

Shared `EVMOptions` fields:

| Parameter | Type                                                                                                | Description                                                                                                                                                                             |
|-----------|-----------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `rpcUrl` | `string \| JsonRpcApiProvider`                                                                      | Required. EVM RPC URL or a prebuilt provider.                                                                                                                                           |
| `retryPolicy` | `EVMRetryPolicy`                                                                                    | Retry policy for EVM RPC calls.                                                                                                                                                         |
| `chainType` | `string`                                                                                            | EVM network variant for that initializer. The exact union depends on the chain. For Citrea, it is `"MAINNET" \| "TESTNET4"`.                                                            |
| `swapContract` | `string`                                                                                            | Override the Escrow Manager contract address.                                                                                                                                           |
| `swapContractDeploymentHeight` | `number`                                                                                            | Override the swap contract deployment height used as the event-query genesis.                                                                                                           |
| `btcRelayContract` | `string`                                                                                            | Override the BTC Relay contract address.                                                                                                                                                |
| `btcRelayDeploymentHeight` | `number`                                                                                            | Override the BTC Relay deployment height used as the event-query genesis.                                                                                                               |
| `spvVaultContract` | `string`                                                                                            | Override the SPV Vault manager contract address.                                                                                                                                        |
| `spvVaultDeploymentHeight` | `number`                                                                                            | Override the SPV Vault deployment height used as the event-query genesis.                                                                                                               |
| `handlerContracts` | `{ refund?: { timelock?: string }, claim?: { [type in ChainSwapType]?: string } }`                  | Optional refund and claim handler overrides. Use `refund.timelock` to override the refund handler and `claim[ChainSwapType]` to override individual claim handlers.                     |
| `fees` | `EVMFees`                                                                                                 | Custom EVM fee API implementation for that chain. Generally uses the [EVMFees](/sdk-reference/api/atomiq-chain-evm/src/classes/EVMFees) class, only for Citrea the custom [CitreaFees](/sdk-reference/api/atomiq-chain-evm/src/classes/CitreaFees) class is used, because of additional state diff fees. |
| `evmConfig` | `Partial<Omit<EVMConfiguration, "safeBlockTag" \| "finalizedBlockTag" \| "finalityCheckStrategy">>` | Advanced EVM configuration. Those omitted fields are controlled by the initializer itself.                                                                                              |

For Citrea specifically, `chainType` is derived automatically from `bitcoinNetwork` on `MAINNET` and `TESTNET4`. On other Bitcoin networks, set it explicitly.

```typescript
const swapper = Factory.newSwapper({
  chains: {
    CITREA: {
      rpcUrl: "https://rpc.citrea.xyz", //Or `new JsonRpcProvider("https://rpc.citrea.xyz")`
      retryPolicy: {...},
      chainType: "MAINNET",
      swapContract: "<escrow manager contract address>",
      swapContractDeploymentHeight: 123456,
      btcRelayContract: "<btc relay contract address>",
      btcRelayDeploymentHeight: 123456,
      spvVaultContract: "<spv vault contract address>",
      spvVaultDeploymentHeight: 123456,
      handlerContracts: {
        refund: {
          timelock: "<refund handler address>"
        },
        claim: {...}
      },
      fees: new CitreaFees(...),
      evmConfig: {...}
    },
    ...
  },
  ...
});
```

## Debug Logging

Verbosity of the atomiq packages is controlled by the global `atomiqLogLevel` flag. Set it at any time before initiating the SDK to control the log verbosity level.

```typescript
// Enable verbose logging
global.atomiqLogLevel = 3;
```

| Level | Description         |
|-------|---------------------|
| 0 | No logs             |
| 1 | Errors only         |
| 2 | Warnings and errors |
| 3 | Verbose (all logs)  |
