---
sidebar_position: 4
---

# Events

The SDK emits events on both individual swaps and the top-level `swapper`. Use them for real-time UI state, pending swap tracking, analytics, LP monitoring, and route-limit refreshes.

:::tip Runnable Example
See the complete working example: [utils/events.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/utils/events.ts)
:::

## Event Emitters

The SDK uses the standard javascript [`EventEmitter`](https://nodejs.org/api/events.html#class-eventemitter) pattern in both places - individual swaps and the overall `Swapper` instance:

- `swapper` itself extends `EventEmitter`, so you can subscribe directly with `swapper.on(...)`.
- Each `ISwap` exposes its own `EventEmitter` on `swap.events`, using the same `on(...)` / `off(...)` API.

Here is a list of the SDK emitted events on the individual swaps and on the `Swapper` instance:

| Emitter        | Event | Payload | Description                           |
|----------------|-------|---------|---------------------------------------|
| `ISwap.events` | `swapState` | `ISwap` | The specific swap changed state       |
| `Swapper`      | `swapState` | `ISwap` | Any tracked swap changed state        |
| `Swapper`      | `swapLimitsChanged` | none | Swap minimum / maximum limits changed |
| `Swapper`      | `lpsAdded` | `Intermediary[]` | New LPs were discovered               |
| `Swapper`      | `lpsRemoved` | `Intermediary[]` | Known LPs were removed                |

Example snippet showing how to add new event listeners using the `.on()` method and remove existing listeners using the `.off()` method.

```typescript
import {ISwap, Intermediary} from "@atomiqlabs/sdk";

// Create functions that will fire on events
const handleSwapState = (updatedSwap: ISwap) => {
  console.log("Swap state changed:", updatedSwap.getStateInfo().name);
};
const handleLpsAdded = (lps: Intermediary[]) => {
  console.log("New LPs discovered:", lps.length);
};

// Subscribe to relevant events on the swapper instance directly
swapper.on("swapState", handleSwapState); // Fires for all swap state changes
swapper.on("lpsAdded", handleLpsAdded);
// Or subscribe directly on a specific swap instance
swap.events.on("swapState", handleSwapState); // Fires only when the specific swap's state changes

// Later, unsubscribe with the same handler reference
swapper.off("swapState", handleSwapState);
swapper.off("lpsAdded", handleLpsAdded);
swap.events.off("swapState", handleSwapState);
```

For the meaning of individual swap states, see the swap-specific guides under [Swap Tutorials](/developers/swaps/).

## Listening to a Single Swap

Each swap exposes an `events` emitter. The event payload is the current swap instance, so the usual pattern is to re-read the state through `getState()` or `getStateInfo()`.

```typescript
import {ISwap} from "@atomiqlabs/sdk";

const handleSwapState = (updatedSwap: ISwap) => {
  const state = updatedSwap.getState();
  const info = updatedSwap.getStateInfo();

  console.log("Swap ID:", updatedSwap.getId());
  console.log("State:", state, info.name);
  console.log("Description:", info.description);
};

swap.events.on("swapState", handleSwapState);

// Later, unsubscribe
swap.events.off("swapState", handleSwapState);
```

:::tip
This is the right choice when a screen or component is focused on a single known swap.
:::

## Listening on the Whole Swapper

The top-level `swapper` aggregates swap state changes across all currently tracked swaps and also emits system-level events for LP discovery and swap minimum / maximum limit updates.

### Global swap state updates

`swapState` triggers when any of the tracked swaps changes state, allowing you to track states of all currently active swaps. This is useful for updating the pending swaps list or for notifications.

```typescript
swapper.on("swapState", (updatedSwap) => {
  const info = updatedSwap.getStateInfo();

  console.log(
    `Swap ${updatedSwap.getId()} changed to ${info.name}: ${info.description}`
  );
});
```

### Swap limit updates

`swapLimitsChanged` is emitted when the known bounds for one or more routes change. This can happen because:

- new LPs were discovered or existing LPs disappeared.
- an LP returned updated min/max bounds after a quote failed as out of range.

```typescript
swapper.on("swapLimitsChanged", () => {
  const limits = swapper.getSwapLimits(srcToken, dstToken);
  updateLimitUI(limits);
});
```

:::info
For more details on swap limits, see [Swap Limits](/developers/utilities/swap-limits).
:::

### LP discovery updates

If your UI exposes LP status or route availability, you can also listen for LP discovery events directly:

```typescript
swapper.on("lpsAdded", (lps) => {
  console.log("LPs added:", lps.map(lp => lp.url));
});

swapper.on("lpsRemoved", (lps) => {
  console.log("LPs removed:", lps.map(lp => lp.url));
});
```

:::info
In most apps, `swapLimitsChanged` is enough for route refreshes. The LP events are mainly useful when you want to show LP availability explicitly or log discovery changes.
:::

## Best Practices

- always unsubscribe listeners when a component unmounts or when you stop tracking a swap.
- treat the emitted swap object in `swapState` event as the source of truth and re-read derived values through getters such as `getStateInfo()`, `getInput()`, or `getOutput()`.
- use `swapLimitsChanged` to dynamically update your UI with newer swap minimum / maximum limits

## API Reference

- [ISwap.events](/sdk-reference/api/atomiq-sdk/src/classes/ISwap#events) - Per-swap event emitter
- [getState](/sdk-reference/api/atomiq-sdk/src/classes/ISwap#getstate) - Get current numeric state
- [getStateInfo](/sdk-reference/api/atomiq-sdk/src/classes/ISwap#getstateinfo) - Get human-readable state info
- [Swapper](/sdk-reference/api/atomiq-sdk/src/classes/Swapper) - Top-level SDK client exposing global events
- [getSwapLimits](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getswaplimits) - Re-read route limits after `swapLimitsChanged`

## Next Steps

### Swap Limits

Use `swapLimitsChanged` together with the route-bound helpers when building quote forms.

**[Swap Limits →](/developers/utilities/swap-limits)**

---
