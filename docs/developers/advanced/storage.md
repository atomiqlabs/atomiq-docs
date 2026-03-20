---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Storage

The SDK persists initiated swaps and a small amount of chain-specific helper data. In browser environments this works out of the box. In Node.js or custom environments you need to provide storage backends explicitly.

Storage is what enables:

- recovering swaps after app restarts.
- swap getters like `getSwapById()` and `getAllSwaps()`.
- refund and claim recovery flows after app restarts.
- long-running apps that need durable swap history.

## What the SDK Stores

The swapper uses two separate storage backends:

| Option | Purpose                                                                                                                                      | Browser default |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| `swapStorage` | Indexed swap database used for swap history that allows querying data based on indexes                                                       | Indexed DB      |
| `chainStorageCtor` | General-purpose key-value storage used by chain integrations for auxiliary data (e.g. Solana ephemeral data storage accounts are saved here) | Local Storage   |

:::info
By default, only initiated swaps are persisted. If you need to retrieve quotes that were created but not yet committed or executed, enable `saveUninitializedSwaps` in [Configuration](/developers/advanced/configuration#runtime-flags).
:::

:::info
If multiple SDK instances or processes access the same swap database, also set `noSwapCache: true` so each read is refreshed from persistent storage instead of the in-memory `WeakRef` cache.
:::

## Default Setups

The SDK supports browser-based environments out of the box, React Native environments with the `@atomiqlabs/storage-rn-async` adapter, and backend Node.JS environments with the atomiq-built SQLite storage backend. If you use a different storage backend (i.e. other SQL or NoSQL databases) check the [Implementing Custom Storage](#implementing-custom-storage) section.

<Tabs groupId="storage-environment">
<TabItem value="browser" label="Browser" default>

In the browser, no extra storage configuration is required. The SDK uses IndexedDB for swaps and browser local storage for chain-level key-value data.

```typescript
const swapper = Factory.newSwapper({
  chains: {
    SOLANA: {rpcUrl: solanaRpc},
    STARKNET: {rpcUrl: starknetRpc}
  },
  bitcoinNetwork: BitcoinNetwork.MAINNET
});
```

</TabItem>
<TabItem value="nodejs" label="Node.js">

In Node.js, provide both `swapStorage` and `chainStorageCtor`. The recommended backend is SQLite provided by the `@atomiqlabs/storage-sqlite` npm package:

```bash
npm install @atomiqlabs/storage-sqlite@latest
```

```typescript
import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";

const swapper = Factory.newSwapper({
  ...
  swapStorage: storageName => new SqliteUnifiedStorage(`${storageName}.sqlite3`),
  chainStorageCtor: storageName => new SqliteStorageManager(`${storageName}.sqlite3`)
});
```

:::warning
If you run outside the browser, do not provide only one of the two hooks. The SDK expects both persistent swap storage and chain-level key-value storage to exist.
:::

</TabItem>
<TabItem value="react-native" label="React Native">

In React Native, provide both `swapStorage` and `chainStorageCtor` using the `@atomiqlabs/storage-rn-async` package. This adapter uses `@react-native-async-storage/async-storage` under the hood, because React Native does not provide the browser IndexedDB storage used by default in web environments.

```bash
npm install @atomiqlabs/storage-rn-async
```

```typescript
import {RNAsyncStorageManager, RNAsyncUnifiedStorage} from "@atomiqlabs/storage-rn-async";

const swapper = Factory.newSwapper({
  ...
  // React Native does not provide the browser IndexedDB storage
  // used by default in web environments, so provide AsyncStorage-backed adapters.
  swapStorage: storageName => new RNAsyncUnifiedStorage(storageName),
  chainStorageCtor: storageName => new RNAsyncStorageManager(storageName)
});
```

:::warning
`RNAsyncUnifiedStorage` builds the SDK's indexed storage behavior on top of the key-value AsyncStorage, so indexing is handled in memory. In React Native, this is naturally a client-side, per-device storage setup. The practical limit is therefore the size of the local dataset on that device, so this is suitable for per-device datasets with fewer than roughly `10,000` saved swaps.
:::

</TabItem>
</Tabs>

## Implementing Custom Storage

Use custom storage when you want the SDK to persist into your existing backend, such as AWS DynamoDB, Azure Cosmos DB, PostgreSQL, MySQL, MongoDB Atlas, or another hosted database service.

:::info Key-Value Helper Adapter
If you already have a simple key-value store and do not want to implement both interfaces from scratch, you can use the [`@atomiqlabs/storage-memory-indexed-kv`](/sdk-reference/api/atomiq-storage-memory-indexed-kv/src/) wrapper, which can use any simple key-value storage backend (synchronous or async). It keeps the indexes required for `query()` operations in memory and serializes writes through a single queue. It is meant for single-user, client-side style datasets, not shared multi-user backends or large server-side swap databases.
:::

`Factory.newSwapper()` expects two storage hooks:

- `swapStorage(storageName)` for the indexed swap database, returning an [`IUnifiedStorage`](/sdk-reference/api/atomiq-sdk/src/interfaces/IUnifiedStorage) implementation.
- `chainStorageCtor(storageName)` for the chain-specific key-value storage, returning an [`IStorageManager<T>`](/sdk-reference/api/atomiq-base/src/interfaces/IStorageManager) implementation.

The `storageName` argument is the SDK namespace for that storage instance, which depends on the current environment (i.e. mainnet, testnet or regtest). Depending on your backend, you can use it as a table name, collection name, partition key prefix, tenant key, or any other logical namespace.

```typescript
const swapper = Factory.newSwapper({
  ...
  // Use `storageName` for e.g. the table name
  swapStorage: storageName =>
    new MyUnifiedStorage({
      databaseName: "atomiq_swaps",
      tableName: storageName
    }),

  // This backend is for chain-level key-value data, not swap history.
  chainStorageCtor: storageName =>
    new MyStorageManager({
      databaseName: "atomiq_chain_state",
      tableName: storageName
    })
});
```

:::tip SQLite Reference
For an example storage backend integration, you can check out how the SQLite storage library implements the storage interfaces:

- [`SqliteUnifiedStorage`](https://github.com/atomiqlabs/atomiq-storage-sqlite/blob/main/src/SqliteUnifiedStorage.ts) for the indexed `IUnifiedStorage` implementation.
- [`SqliteStorageManager`](https://github.com/atomiqlabs/atomiq-storage-sqlite/blob/main/src/SqliteStorageManager.ts) for the `IStorageManager` implementation.
:::

### `IUnifiedStorage`

`swapStorage` must return an implementation of [`IUnifiedStorage`](/sdk-reference/api/atomiq-sdk/src/interfaces/IUnifiedStorage). This is the swap database used by the SDK. Treat it as an indexed JSON document store keyed by swap `id`, with additional indexes based on the statically typed `UnifiedSwapStorageIndexes` and `UnifiedSwapStorageCompositeIndexes` arguments passed to `init()`.

Your backend needs to support all of the following:

- upserts by `id`, because `save()` and `saveAll()` are used both when swaps are first created and when existing swaps are updated later.
- deletes by `id` for cleanup and expired swap removal.
- equality queries over the indexes declared in `init(indexes, compositeIndexes)`.

Your backend needs to implement the following interface:

```typescript
import {
  IUnifiedStorage,
  QueryParams,
  UnifiedStoredObject,
  UnifiedSwapStorageCompositeIndexes,
  UnifiedSwapStorageIndexes,
} from "@atomiqlabs/sdk";

// Shown as a concrete class shell for documentation purposes.
// In your implementation, replace these empty bodies with real logic.
class MyUnifiedStorage implements IUnifiedStorage<
  UnifiedSwapStorageIndexes,
  UnifiedSwapStorageCompositeIndexes
> {
  // These inputs are statically typed, so you can either create the schema here
  // or validate a schema that was provisioned earlier by migrations / DDL.
  init(
    indexes: UnifiedSwapStorageIndexes,
    compositeIndexes: UnifiedSwapStorageCompositeIndexes
  ): Promise<void> {}

  // `params` is OR-of-ANDs:
  // [[{key: "type", value: 1}, {key: "state", value: [2, 3]}], [{key: "id", value: "swap-123"}]]
  // means:
  // (type = 1 AND state IN [2, 3]) OR (id = "swap-123")
  query(params: QueryParams[][]): Promise<UnifiedStoredObject[]> {}

  // Upsert by `value.id`. The SDK calls this when a swap is first persisted
  // and again when that same swap changes state.
  save(value: UnifiedStoredObject): Promise<void> {}

  // Same semantics as repeated `save()`, just batched for efficiency.
  saveAll(values: UnifiedStoredObject[]): Promise<void> {}

  // Delete by `value.id`.
  remove(value: UnifiedStoredObject): Promise<void> {}

  // Same semantics as repeated `remove()`, just batched for efficiency.
  removeAll(values: UnifiedStoredObject[]): Promise<void> {}
}
```

#### Indexes

`init(indexes, compositeIndexes)` tells your backend exactly which lookup patterns the SDK will use.

These arguments are statically typed as [`UnifiedSwapStorageIndexes`](/sdk-reference/api/atomiq-sdk/src/type-aliases/UnifiedSwapStorageIndexes) and [`UnifiedSwapStorageCompositeIndexes`](/sdk-reference/api/atomiq-sdk/src/type-aliases/UnifiedSwapStorageCompositeIndexes), so the set of supported index shapes is known ahead of time. That means you can pre-create the database schema manually with migrations, raw SQL, or cloud-database provisioning tools, and then have `init()` only validate or open it. The SDK still passes both index lists to `init()` so implementations that prefer auto-provisioning can create them there on first run.

The SDK currently provides these single-field indexes through [`UnifiedSwapStorageIndexes`](/sdk-reference/api/atomiq-sdk/src/type-aliases/UnifiedSwapStorageIndexes):

| Key | Type | Unique | Nullable |
|-----|------|--------|----------|
| `id` | `string` | &#x2611; | &#x2610; |
| `escrowHash` | `string` | &#x2611; | &#x2611; |
| `type` | `number` | &#x2610; | &#x2610; |
| `initiator` | `string` | &#x2610; | &#x2610; |
| `state` | `number` | &#x2610; | &#x2610; |
| `paymentHash` | `string` | &#x2610; | &#x2611; |

The SDK currently provides these composite indexes through [`UnifiedSwapStorageCompositeIndexes`](/sdk-reference/api/atomiq-sdk/src/type-aliases/UnifiedSwapStorageCompositeIndexes):

| Keys | Unique |
|------|--------|
| `["initiator", "id"]` | &#x2610; |
| `["type", "state"]` | &#x2610; |
| `["type", "paymentHash"]` | &#x2610; |
| `["type", "initiator", "state"]` | &#x2610; |

#### Queries

`query()` receives `QueryParams[][]`, where [`QueryParams`](/sdk-reference/api/atomiq-sdk/src/type-aliases/QueryParams) is `{key: string, value: any | any[]}`.

A single `QueryParams` entry matches one field (identified by its `key` parameter), with the `value` being:
- an exact (non-array) value, which means "match this exact value", similar to SQL's `=` operator
- an array, which means "match any of these values for the same key", similar to SQL's `IN (...)`

The full `QueryParams[][]` input then forms an OR-of-ANDs query: the outer array is the OR layer, with each inner array being one AND group, and each group contains one or more `QueryParams` conditions.

Here is a comparison between various input arguments and their SQL equivalents:

| Query Input | SQL Equivalent |
|-------------|----------------|
| `[[{key: "id", value: "swap-123"}]]` | `id = "swap-123"` |
| `[[{key: "type", value: 1}, {key: "state", value: [2, 3]}]]` | `type = 1 AND state IN (2, 3)` |
| `[[{key: "type", value: 1}, {key: "state", value: 2}], [{key: "type", value: 4}, {key: "initiator", value: "alice"}]]` | `(type = 1 AND state = 2) OR (type = 4 AND initiator = "alice")` |

:::info
You should expect the SDK to construct queries only from the declared single-field and composite indexes. For composite lookups, the keys will be passed in the exact order in which that composite index is defined. For example, the composite index `["type", "state"]` will be queried as `[{key: "type", ...}, {key: "state", ...}]`, not in any other order. Your backend should therefore optimize for these exact lookup shapes; a full scan may still be useful as a defensive fallback, but it should not be the expected production path.
:::

#### Save and Remove Operations

`save()` and `saveAll()` must behave like upserts, not insert-only writes. The SDK uses them for both initial persistence and later state transitions of the same swap, always keyed by the serialized object's `id` field.

`remove()` and `removeAll()` are the delete counterparts. They should remove the stored swap by that same `id` key, including any related index entries your backend maintains.

As with the save methods, the `All` variants should have the same semantics as repeated single-item operations, just implemented more efficiently when your backend supports batch writes or deletes.

### `IStorageManager<T>`

`chainStorageCtor` must return an [`IStorageManager<T>`](/sdk-reference/api/atomiq-base/src/interfaces/IStorageManager) implementation for general key-value storage used by the chain integrations. This is not the swap history database. It is a typed key-value store for auxiliary chain data.

The key behavioral requirement here is that `loadData()` must load every stored record for that namespace, recreate typed objects, and populate the in-memory `data` map. Chain integrations may call `loadData()` once during init and then read directly from `storage.data` afterwards.

This can be a class or any object that satisfies the following interface:

```typescript
import {StorageObject} from "@atomiqlabs/sdk";

export interface IStorageManager<T extends StorageObject> {
  // In-memory cache of stored objects, keyed by id/hash.
  data: {
    [key: string]: T
  };

  // Initializes the storage backend.
  init(): Promise<void>;

  // Saves an object to storage. This is used for both new records and updates.
  // `StorageObject`s implement `serialize()`, which returns a JSON-stringify-safe object.
  saveData(hash: string, object: T): Promise<void>;

  // Removes an object from storage.
  removeData(hash: string): Promise<void>;

  // Loads all stored objects, recreates them via `new type(...)`,
  // returns them, and also repopulates `data`.
  loadData(type: new (data: any) => T): Promise<T[]>;

  // Optional batch delete optimization.
  removeDataArr?(keys: string[]): Promise<void>;

  // Optional batch upsert optimization.
  saveDataArr?(values: {id: string, object: T}[]): Promise<void>;
}
```

Important details:
- `StorageObject` instances implement a `serialize()` function, which returns a JSON-stringify-safe object
- `saveData()` is used for both creating new records and updating existing ones, so implement it as an upsert
- keep `data` synchronized with every successful save or delete.
- `loadData()` must read every stored key-value pair, deserialize it with `new type(serializedValue)`, return those objects, and also repopulate `data`, keyed by the stored `id`.
- `saveDataArr()` and `removeDataArr()` are optional batch helpers. Implement them only if your backend has efficient batch APIs; otherwise, leaving them undefined is fine.

## API Reference

- [SwapperFactory](/sdk-reference/api/atomiq-sdk/src/classes/SwapperFactory) - Creates swapper instances and accepts the storage hooks
- [IUnifiedStorage](/sdk-reference/api/atomiq-sdk/src/interfaces/IUnifiedStorage) - Swap storage interface
- [UnifiedSwapStorageIndexes](/sdk-reference/api/atomiq-sdk/src/type-aliases/UnifiedSwapStorageIndexes) - Static single-field index definition passed to `IUnifiedStorage.init()`
- [UnifiedSwapStorageCompositeIndexes](/sdk-reference/api/atomiq-sdk/src/type-aliases/UnifiedSwapStorageCompositeIndexes) - Static composite index definition passed to `IUnifiedStorage.init()`
- [Historical Swaps](/developers/swap-management/historical-swaps) - Retrieving persisted swaps
- [Configuration](/developers/advanced/configuration) - Runtime flags such as `saveUninitializedSwaps`, `noSwapCache`, and `storagePrefix`

## Next Steps

### Configuration

For more runtime options affecting swapper behavior, continue with the configuration guide.

**[Configuration ->](/developers/advanced/configuration)**

---

### Quick Start

Continue with the main quick start index to pick the setup flow for your environment.

**[Quick Start ->](/developers/quick-start/)**

---
