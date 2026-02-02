---
sidebar_position: 1
---

# Swap Management

This section covers managing swap lifecycle, including tracking state, recovering past swaps, handling refunds, and manual claiming.

## Overview

Swaps go through various states during execution. The SDK persists swap data locally, allowing you to:

- Track swap progress in real-time
- Recover swaps after app restarts
- Refund failed swaps
- Manually claim swaps that weren't auto-settled

## Key Concepts

### Swap Persistence

All swaps are automatically persisted to local storage (IndexedDB in browser, SQLite in Node.js). This means:

- Swaps survive page refreshes and app restarts
- You can retrieve any past swap by its ID
- The SDK can check for pending actions on startup

### Automatic vs Manual Settlement

Most swaps settle automatically via watchtower services. However, manual intervention may be needed when:

- Watchtowers are temporarily unavailable
- Network congestion delays automatic settlement
- The client was offline during settlement

## Tutorials

| Topic | Description |
|-------|-------------|
| [Swap States](./swap-states) | Understand all possible swap states and transitions |
| [Historical Swaps](./historical-swaps) | Retrieve past swaps by ID |
| [Refunds](./refunds) | Handle failed swaps and cooperative refunds |
| [Claiming](./claiming) | Manually claim swaps when auto-settlement fails |

## Quick Reference

```typescript
// Get swap by ID
const swap = await swapper.getSwapById(swapId);

// Check current state
const state = swap.getState();

// Listen for state changes
swap.events.on("swapState", (swap) => {
  console.log("New state:", swap.getState());
});

// Get refundable swaps on startup
const refundable = await swapper.getRefundableSwaps("SOLANA", address);

// Get claimable swaps on startup
const claimable = await swapper.getClaimableSwaps("SOLANA", address);
```
