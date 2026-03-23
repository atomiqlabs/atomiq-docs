---
sidebar_position: 1
---

# Swap Management

This section covers what happens after a swap has already been created and persisted. These pages are for retrieving past swaps, recovering them after app restarts, and handling the cases where a swap needs follow-up outside the normal high-level flow.

:::info
This is still a core responsibility of an app integrating the SDK. The common swap path may complete automatically, but real integrations still need to detect when a saved swap requires explicit user action and guide the user through refund or claim recovery flows.
:::

## Usage

A typical integration uses this section in roughly this order:

1. Use [Historical Swaps](./historical-swaps) to load previously created swaps from storage, either by ID or as a filtered list for a chain or signer.
2. Check whether any saved **Smart Chain → Bitcoin/Lightning** swaps have become refundable, then use [Refunds](./refunds) to return those funds to the source wallet.
3. Check whether any saved **Bitcoin/Lightning → Smart Chain** swaps have become claimable, then use [Claiming](./claiming) to settle those funds to the destination wallet.

Apps usually run this recovery flow on startup and then periodically in long-running sessions, so saved swaps that still need attention are surfaced as clear refund or claim actions for the user.

## Topics

### Historical Swaps

Retrieve persisted swaps by ID or query them in bulk so your app can resume previously created swaps after restart.

**[Historical Swaps →](./historical-swaps)**

---

### Refunds

Handle failed **Smart Chain → Bitcoin/Lightning** swaps that can be refunded back to the source-chain wallet.

**[Refunds →](./refunds)**

---

### Claiming

Handle **Bitcoin/Lightning → Smart Chain** swaps that need manual destination-side settlement because automatic settlement did not finish.

**[Claiming →](./claiming)**

---
