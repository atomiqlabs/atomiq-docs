---
sidebar_position: 6
---

# LNURL Swaps

This guide covers using LNURL-pay and LNURL-withdraw for Lightning Network swaps.

:::tip Runnable Examples
See complete working examples:
- [smartchain-to-btcln/swapBasicLNURL.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/smartchain-to-btcln/swapBasicLNURL.ts)
- [btcln-to-smartchain/swapBasicLNURL.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/btcln-to-smartchain/swapBasicLNURL.ts)
:::

## What are LNURLs?

LNURLs extend Lightning Network functionality with:

- **Reusable addresses** - Pay to the same address multiple times
- **Variable amounts** - Sender chooses the amount (within limits)
- **Comments** - Attach messages to payments
- **Success actions** - Receive confirmations or URLs after payment

## Supported LNURL Types

| Type | LUD | Description |
|------|-----|-------------|
| LNURL-pay | [LUD-6](https://github.com/lnurl/luds/blob/luds/06.md) | Pay to a static address |
| LNURL-withdraw | [LUD-3](https://github.com/lnurl/luds/blob/luds/03.md) | Pull funds from a service |
| Lightning Address | [LUD-16](https://github.com/lnurl/luds/blob/luds/16.md) | Human-readable addresses (user@domain.com) |

## LNURL-pay: Smart Chain to Lightning

### Basic Usage

```typescript
// LNURL-pay link or Lightning address
const destination = "user@walletofsatoshi.com";
// Or: "lnurl1dp68gurn8ghj7..."

const swap = await swapper.swap(
  Tokens.STARKNET.STRK,
  Tokens.BITCOIN.BTCLN,
  10000n,                        // Amount in sats (variable!)
  SwapAmountType.EXACT_OUT,
  starknetSigner.getAddress(),
  destination,
  {
    comment: "Thanks for the coffee!" // Optional comment
  }
);

const success = await swap.execute(starknetSigner, {
  onSwapSettled: (txId) => console.log("Payment sent!")
});

// Handle success action
if (success && swap.hasSuccessAction()) {
  const action = swap.getSuccessAction();
  console.log("Message:", action.description);
  if (action.text) console.log("Text:", action.text);
  if (action.url) console.log("URL:", action.url);
}
```

### With EXACT_IN

```typescript
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,
  Tokens.BITCOIN.BTCLN,
  1_000_000_000n,               // Spend 1 SOL
  SwapAmountType.EXACT_IN,      // Calculate output
  solanaSigner.getAddress(),
  "user@walletofsatoshi.com"
);

// Output is calculated based on exchange rate
console.log("Will send:", swap.getOutput().toString(), "sats");
```

### Parsing LNURL-pay Data

Before creating a swap, you can parse the LNURL to show info to users:

```typescript
const result = await swapper.Utils.parseAddress("user@wallet.com");

if (result.type === "LNURL" && isLNURLPay(result.lnurl)) {
  console.log("Min payable:", result.min, "sats");
  console.log("Max payable:", result.max, "sats");
  console.log("Icon:", result.lnurl.icon);
  console.log("Description:", result.lnurl.shortDescription);
  console.log("Max comment length:", result.lnurl.commentMaxLength);

  // Fixed amount if min === max
  if (result.amount) {
    console.log("Fixed amount:", result.amount, "sats");
  }
}
```

## LNURL-withdraw: Lightning to Smart Chain

LNURL-withdraw lets you pull funds from a service that holds your Bitcoin.

### Basic Usage

```typescript
const lnurlWithdraw = "lnurl1dp68gurn8ghj7...";

const swap = await swapper.swap(
  Tokens.BITCOIN.BTCLN,
  Tokens.STARKNET.STRK,
  10000n,                        // Amount to withdraw
  SwapAmountType.EXACT_IN,
  lnurlWithdraw,                 // Source is the LNURL!
  starknetSigner.getAddress()    // Destination
);

// Execute - no wallet needed, funds come from LNURL
const success = await swap.execute(
  undefined,  // No Lightning wallet needed
  {
    onSourceTransactionReceived: (hash) => {
      console.log("Withdrawal requested");
    },
    onSwapSettled: (txId) => {
      console.log("Swap complete:", txId);
    }
  }
);

if (!success) {
  await swap.claim(starknetSigner);
}
```

### For Solana (Legacy Protocol)

```typescript
const swap = await swapper.swap(
  Tokens.BITCOIN.BTCLN,
  Tokens.SOLANA.SOL,
  10000n,
  SwapAmountType.EXACT_IN,
  lnurlWithdraw,
  solanaSigner.getAddress()
);

await swap.execute(
  solanaSigner,
  undefined,  // No Lightning wallet needed
  {
    onSourceTransactionReceived: (hash) => console.log("Withdrawal requested"),
    onDestinationCommitSent: (txId) => console.log("HTLC opened"),
    onSwapSettled: (txId) => console.log("Complete")
  }
);
```

### Parsing LNURL-withdraw Data

```typescript
const result = await swapper.Utils.parseAddress("lnurl1...");

if (result.type === "LNURL" && isLNURLWithdraw(result.lnurl)) {
  console.log("Min withdrawable:", result.min, "sats");
  console.log("Max withdrawable:", result.max, "sats");

  // Fixed amount if min === max
  if (result.amount) {
    console.log("Fixed amount:", result.amount, "sats");
  }
}
```

## LNURL vs Regular Invoices

| Feature | Invoice | LNURL |
|---------|---------|-------|
| Reusable | No | Yes |
| Amount | Fixed | Variable or fixed |
| Comments | No | Yes (LNURL-pay) |
| Expiration | Fixed | Programmable |
| Direction | Pay only | Pay or withdraw |
| Success action | No | Yes (LNURL-pay) |

## Validation Helpers

```typescript
// Check if valid LNURL
const isLnurl = swapper.Utils.isValidLNURL(address);

// Check if valid Lightning invoice
const isInvoice = swapper.Utils.isValidLightningInvoice(address);

// Parse any address type
const parsed = await swapper.Utils.parseAddress(address);
switch (parsed.type) {
  case "LIGHTNING":
    // BOLT11 invoice
    break;
  case "LNURL":
    if (isLNURLPay(parsed.lnurl)) {
      // LNURL-pay or Lightning address
    }
    if (isLNURLWithdraw(parsed.lnurl)) {
      // LNURL-withdraw
    }
    break;
}
```

## Error Handling

```typescript
try {
  const swap = await swapper.swap(
    Tokens.STARKNET.STRK,
    Tokens.BITCOIN.BTCLN,
    1000000n,  // 1M sats - might exceed LNURL limits
    SwapAmountType.EXACT_OUT,
    starknetSigner.getAddress(),
    "user@wallet.com"
  );
} catch (error) {
  if (error.message.includes("amount")) {
    // Amount outside LNURL limits
    const parsed = await swapper.Utils.parseAddress("user@wallet.com");
    console.log("Min:", parsed.min, "Max:", parsed.max);
  }
}
```

## API Reference

- [isLNURLPay](/sdk-reference/api/atomiq-sdk/src/functions/isLNURLPay) - Type guard for LNURL-pay
- [isLNURLWithdraw](/sdk-reference/api/atomiq-sdk/src/functions/isLNURLWithdraw) - Type guard for LNURL-withdraw
- [LNURLPay](/sdk-reference/api/atomiq-sdk/src/type-aliases/LNURLPay) - LNURL-pay data type
- [LNURLWithdraw](/sdk-reference/api/atomiq-sdk/src/type-aliases/LNURLWithdraw) - LNURL-withdraw data type
