
## Storage Backends

### Browser (IndexedDB)

Swaps are stored in IndexedDB by default in browser environments:

```typescript
// Automatic - no configuration needed
const swapper = Factory.newSwapper({
  // ...chain config
});
```

### Node.js (SQLite)

For Node.js, use SQLite storage:

```typescript
import {SqliteStorageManager, SqliteUnifiedStorage} from "@atomiqlabs/storage-sqlite";

const swapper = Factory.newSwapper({
  // ...chain config
  swapStorage: chainId => new SqliteUnifiedStorage(`CHAIN_${chainId}.sqlite3`),
  chainStorageCtor: name => new SqliteStorageManager(`STORE_${name}.sqlite3`),
});
```
