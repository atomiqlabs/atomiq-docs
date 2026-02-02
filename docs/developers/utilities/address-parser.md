---
sidebar_position: 2
---

# Address Parser

The SDK provides a unified address parser that automatically recognizes all supported address formats.

:::tip Runnable Example
See the complete working example: [utils/parseAddress.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/utils/parseAddress.ts)
:::

## Supported Formats

| Format | Example |
|--------|---------|
| Bitcoin P2PKH | `1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2` |
| Bitcoin P2WPKH | `bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq` |
| Bitcoin P2TR | `bc1p...` |
| BIP-21 URI | `bitcoin:bc1q...?amount=0.001` |
| BOLT11 Invoice | `lnbc10u1p...` |
| LNURL-pay | `lnurl1dp68gurn8ghj7...` |
| LNURL-withdraw | `lnurl1dp68gurn8ghj7...` |
| Lightning Address | `user@walletofsatoshi.com` |
| Solana Address | `7fZcxMrQpeeLjtLPQmWzY1pNwGtfoGjVai3SH4uPPdv3` |
| Starknet Address | `0x06e31d218acfb5a34364306d84c65084da9c9bae...` |
| EVM Address | `0x742d35Cc6634C0532925a3b844Bc9e7595f2bD70` |

## Basic Usage

```typescript
const result = await swapper.Utils.parseAddress(address);

switch (result.type) {
  case "BITCOIN":
    console.log("Bitcoin address");
    if (result.amount) {
      console.log("Amount:", result.amount, "BTC");
    }
    break;

  case "LIGHTNING":
    console.log("Lightning invoice");
    console.log("Amount:", result.amount, "sats");
    break;

  case "LNURL":
    console.log("LNURL");
    // Further check the LNURL type
    break;

  case "SOLANA":
    console.log("Solana address");
    break;

  case "STARKNET":
    console.log("Starknet address");
    break;

  default:
    console.log("Smart chain address:", result.type);
    break;
}
```

## LNURL Parsing

```typescript
import {isLNURLPay, isLNURLWithdraw} from "@atomiqlabs/sdk";

const result = await swapper.Utils.parseAddress(address);

if (result.type === "LNURL") {
  if (isLNURLWithdraw(result.lnurl)) {
    console.log("LNURL-withdraw");
    console.log("Min withdrawable:", result.min, "sats");
    console.log("Max withdrawable:", result.max, "sats");

    // Fixed amount if min === max
    if (result.amount) {
      console.log("Fixed amount:", result.amount, "sats");
    }
  }

  if (isLNURLPay(result.lnurl)) {
    console.log("LNURL-pay");
    console.log("Min payable:", result.min, "sats");
    console.log("Max payable:", result.max, "sats");

    // Fixed amount if min === max
    if (result.amount) {
      console.log("Fixed amount:", result.amount, "sats");
    }

    // LNURL-pay metadata
    console.log("Icon:", result.lnurl.icon);
    console.log("Short description:", result.lnurl.shortDescription);
    console.log("Long description:", result.lnurl.longDescription);
    console.log("Max comment length:", result.lnurl.commentMaxLength);
  }
}
```

## BIP-21 Bitcoin URIs

```typescript
// Parse BIP-21 URI with amount
const result = await swapper.Utils.parseAddress(
  "bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.001"
);

if (result.type === "BITCOIN") {
  console.log("Bitcoin address:", result.address);
  console.log("Amount:", result.amount, "BTC"); // 0.001
}
```

## Validation Helpers

The SDK also provides specific validation functions:

```typescript
// Check if valid Lightning invoice
const isInvoice = swapper.Utils.isValidLightningInvoice("lnbc10u1p...");

// Check if valid LNURL
const isLnurl = swapper.Utils.isValidLNURL("lnurl1dp68gurn8...");

// Get Lightning invoice value in sats
const amountSats = swapper.Utils.getLightningInvoiceValue("lnbc10u1p...");
```

## Complete Example

```typescript
async function handleUserInput(input: string) {
  try {
    const result = await swapper.Utils.parseAddress(input);

    switch (result.type) {
      case "BITCOIN":
        // Show Bitcoin swap UI
        return {
          swapType: "toBTC",
          address: result.address,
          suggestedAmount: result.amount
        };

      case "LIGHTNING":
        // Show Lightning swap UI with fixed amount
        return {
          swapType: "toLightning",
          invoice: input,
          amount: result.amount,
          amountEditable: false
        };

      case "LNURL":
        if (isLNURLPay(result.lnurl)) {
          // Show Lightning swap UI with variable amount
          return {
            swapType: "toLightning",
            destination: input,
            minAmount: result.min,
            maxAmount: result.max,
            amountEditable: true,
            metadata: {
              icon: result.lnurl.icon,
              description: result.lnurl.shortDescription
            }
          };
        }
        if (isLNURLWithdraw(result.lnurl)) {
          // Show withdrawal UI
          return {
            swapType: "fromLightning",
            source: input,
            minAmount: result.min,
            maxAmount: result.max
          };
        }
        break;

      case "SOLANA":
        // Show Solana receive address
        return {
          swapType: "toSolana",
          address: result.address
        };

      case "STARKNET":
        // Show Starknet receive address
        return {
          swapType: "toStarknet",
          address: result.address
        };

      default:
        // Other smart chain
        return {
          swapType: `to${result.type}`,
          address: result.address
        };
    }
  } catch (error) {
    console.error("Invalid address:", error.message);
    return null;
  }
}
```

## Error Handling

```typescript
try {
  const result = await swapper.Utils.parseAddress("invalid-address");
} catch (error) {
  // Throws if address format is not recognized
  console.error("Could not parse address:", error.message);
}
```

## API Reference

- [identifyAddressType](/sdk-reference/api/atomiq-sdk/src/functions/identifyAddressType) - Identify and parse address format
- [isLNURLPay](/sdk-reference/api/atomiq-sdk/src/functions/isLNURLPay) - Type guard for LNURL-pay
- [isLNURLWithdraw](/sdk-reference/api/atomiq-sdk/src/functions/isLNURLWithdraw) - Type guard for LNURL-withdraw
