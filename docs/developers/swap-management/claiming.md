---
sidebar_position: 5
---

# Claiming

Manual claiming is needed when automatic settlement fails for **Bitcoin to Smart Chain** swaps.

:::tip Runnable Example
See the complete working example: [utils/pastSwaps.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/utils/pastSwaps.ts)
:::

## When Do You Need to Claim?

For swaps from Bitcoin (L1 or Lightning) to smart chains, the SDK normally handles claiming automatically via watchtower services. Manual claiming is needed when:

1. **Watchtowers are unavailable** - The automatic settlement service is down
2. **Network congestion** - Watchtowers couldn't settle in time
3. **App was offline** - You closed the app during settlement

## Checking Claimable Status

```typescript
// Check if swap needs manual claiming
if (swap.isClaimable && swap.isClaimable()) {
  console.log("Swap needs manual claiming");
  await swap.claim(signer);
}
```

## Claiming After Execute

```typescript
// For BTC to Starknet/EVM swaps
const automaticSettlementSuccess = await swap.execute(
  bitcoinWallet,
  { /* callbacks */ }
);

if (!automaticSettlementSuccess) {
  console.log("Auto-settlement failed, claiming manually...");
  await swap.claim(starknetSigner);
}

// For Lightning to Solana swaps
await swap.execute(
  solanaSigner,
  lightningWallet,
  { /* callbacks */ }
);

// Solana swaps handle claiming internally during execute
```

## Checking for Claimable Swaps on Startup

```typescript
async function checkAndClaim() {
  // Check Solana swaps
  const claimableSolana = await swapper.getClaimableSwaps(
    "SOLANA",
    solanaSigner.getAddress()
  );

  for (const swap of claimableSolana) {
    console.log("Found claimable swap:", swap.getId());
    await swap.claim(solanaSigner);
    console.log("Claimed!");
  }

  // Check Starknet swaps
  const claimableStarknet = await swapper.getClaimableSwaps(
    "STARKNET",
    starknetSigner.getAddress()
  );

  for (const swap of claimableStarknet) {
    await swap.claim(starknetSigner);
  }

  // Check EVM swaps
  const claimableEVM = await swapper.getClaimableSwaps(
    "CITREA",
    evmSigner.getAddress()
  );

  for (const swap of claimableEVM) {
    await swap.claim(evmSigner);
  }
}

// Call on app startup
await swapper.init();
await checkAndClaim();
```

## Complete Startup Check

Combine refund and claim checks:

```typescript
async function recoverSwaps() {
  const chains = ["SOLANA", "STARKNET", "CITREA"];
  const signers = {
    SOLANA: solanaSigner,
    STARKNET: starknetSigner,
    CITREA: evmSigner
  };

  for (const chain of chains) {
    const signer = signers[chain];
    const address = signer.getAddress();

    // Check refundable
    const refundable = await swapper.getRefundableSwaps(chain, address);
    for (const swap of refundable) {
      console.log(`Refunding ${chain} swap:`, swap.getId());
      await swap.refund(signer);
    }

    // Check claimable
    const claimable = await swapper.getClaimableSwaps(chain, address);
    for (const swap of claimable) {
      console.log(`Claiming ${chain} swap:`, swap.getId());
      await swap.claim(signer);
    }
  }
}
```

## Manual Claim Transactions

If you need to handle transactions manually:

```typescript
// Get claim transactions
const txs = await swap.txsClaim();

// Sign and send based on chain type
// ...see Manual Transactions page

// Wait for SDK to register the claim
await swap.waitTillClaimed();
```

## Waiting for Automatic Settlement

Before claiming manually, you can wait for automatic settlement:

```typescript
// Wait up to 60 seconds for watchtower settlement
const autoSettled = await swap.waitTillClaimed(60);

if (!autoSettled) {
  // Watchtowers didn't settle, claim manually
  await swap.claim(signer);
}
```

## Swap Types That Support Claiming

| Swap Type | Supports Claiming | Notes |
|-----------|------------------|-------|
| `FROM_BTC` | Yes | Solana legacy protocol |
| `SPV_FROM_BTC` | Yes | Starknet/EVM protocol |
| `FROM_BTCLN` | Yes | Solana Lightning |
| `FROM_BTCLN_AUTO` | Yes | Starknet/EVM Lightning |
| `TO_BTC` | No | Uses refund instead |
| `TO_BTCLN` | No | Uses refund instead |

## Error Handling

```typescript
try {
  await swap.claim(signer);
} catch (error) {
  if (error.message.includes("already claimed")) {
    console.log("Swap was already claimed");
  } else if (error.message.includes("not claimable")) {
    console.log("Swap is not in claimable state");
  } else if (error.message.includes("insufficient")) {
    console.log("Insufficient funds for gas");
  } else {
    console.error("Claim failed:", error);
  }
}
```

## API Reference

- [claim](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap#claim) - Execute claim
- [txsClaim](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap#txsclaim) - Get claim transactions
- [waitTillClaimed](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap#waittillclaimed) - Wait for claim
- [getClaimableSwaps](/sdk-reference/api/atomiq-sdk/src/classes/Swapper#getclaimableswaps) - Get all claimable swaps
