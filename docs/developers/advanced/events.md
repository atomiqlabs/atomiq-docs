---
sidebar_position: 4
---

# Events

The SDK provides event listeners for real-time updates on swap state and system changes.

:::tip Runnable Example
See the complete working example: [utils/events.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/utils/events.ts)
:::

## Swap Events

### State Change Events

Listen for state changes on individual swaps:

```typescript
// On a specific swap
swap.events.on("swapState", (swap) => {
  console.log("New state:", swap.getState());
});

// Clean up when done
swap.events.off("swapState", handler);
```

### Global Swap State Events

Listen for state changes across all swaps:

```typescript
// On the swapper instance
swapper.on("swapState", (swap) => {
  console.log(`Swap ${swap.getId()} changed to state ${swap.getState()}`);
});

// Remove listener
swapper.off("swapState", handler);
```

## System Events

### Swap Limits Changed

Triggered when LP reports new swap limits:

```typescript
swapper.on("swapLimitsChanged", () => {
  // Refresh limits in UI
  const limits = swapper.getSwapBounds();
  console.log("New limits:", limits);
});
```

## Use Cases

### Real-time UI Updates

```typescript
function useSwapState(swap: ISwap) {
  const [state, setState] = useState(swap.getState());

  useEffect(() => {
    const handler = (s: ISwap) => {
      setState(s.getState());
    };

    swap.events.on("swapState", handler);
    return () => swap.events.off("swapState", handler);
  }, [swap]);

  return state;
}
```

### Progress Tracking

```typescript
swap.events.on("swapState", (swap) => {
  const state = swap.getState();

  switch (state) {
    case ToBTCSwapState.COMMITED:
      updateUI({ step: 1, message: "Tokens locked" });
      break;
    case ToBTCSwapState.SOFT_CLAIMED:
      updateUI({ step: 2, message: "Processing payment" });
      break;
    case ToBTCSwapState.CLAIMED:
      updateUI({ step: 3, message: "Complete!" });
      break;
    case ToBTCSwapState.REFUNDABLE:
      updateUI({ step: -1, message: "Failed - refund available" });
      break;
  }
});
```

### Logging and Analytics

```typescript
swapper.on("swapState", (swap) => {
  // Log to analytics service
  analytics.track("swap_state_change", {
    swapId: swap.getId(),
    state: swap.getState(),
    timestamp: Date.now()
  });
});
```

### Dynamic Limit Display

```typescript
function useLimits(srcToken: Token, dstToken: Token) {
  const [limits, setLimits] = useState(
    swapper.getSwapLimits(srcToken, dstToken)
  );

  useEffect(() => {
    const handler = () => {
      setLimits(swapper.getSwapLimits(srcToken, dstToken));
    };

    swapper.on("swapLimitsChanged", handler);
    return () => swapper.off("swapLimitsChanged", handler);
  }, [srcToken, dstToken]);

  return limits;
}
```

### Multi-Swap Coordination

```typescript
const pendingSwaps = new Map<string, ISwap>();

swapper.on("swapState", (swap) => {
  const id = swap.getId();

  if (swap.isSuccessful()) {
    pendingSwaps.delete(id);
    console.log(`Swap ${id} completed`);
  } else if (swap.isFailed()) {
    pendingSwaps.delete(id);
    console.log(`Swap ${id} failed`);
  }

  // Update pending count
  updatePendingCount(pendingSwaps.size);
});

// When creating new swaps
const swap = await swapper.swap(/* ... */);
pendingSwaps.set(swap.getId(), swap);
```

## Event Types

### Swap Events

| Event | Payload | Description |
|-------|---------|-------------|
| `swapState` | `ISwap` | Swap state changed |

### Swapper Events

| Event | Payload | Description |
|-------|---------|-------------|
| `swapState` | `ISwap` | Any swap state changed |
| `swapLimitsChanged` | none | LP reported new limits |

## Best Practices

### Clean Up Listeners

Always remove listeners when components unmount:

```typescript
// React example
useEffect(() => {
  const handler = (swap) => { /* ... */ };
  swapper.on("swapState", handler);

  return () => {
    swapper.off("swapState", handler);
  };
}, []);
```

### Debounce Rapid Updates

For UI updates, consider debouncing:

```typescript
import {debounce} from "lodash";

const debouncedUpdate = debounce((swap) => {
  updateUI(swap.getState());
}, 100);

swap.events.on("swapState", debouncedUpdate);
```

### Error Handling in Handlers

```typescript
swap.events.on("swapState", (swap) => {
  try {
    handleStateChange(swap);
  } catch (error) {
    console.error("Error in state handler:", error);
    // Don't let handler errors break the app
  }
});
```

## API Reference

- [Swapper Events](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#on)
- [ISwap Events](/sdk-reference/api/atomiq-sdk/src/classes/ISwap#events)
