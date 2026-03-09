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
// https://github.com/atomiqlabs/atomiq-sdk-demo/blob/ab/signed-txs/src/utils/parseAddress.ts
import {isLNURLPay, isLNURLWithdraw} from "@atomiqlabs/sdk";
import {swapper} from "../setup";

//Prints out parsed address details, throws when address is malformatted
async function parseAddress(address: string) {
    const res = await swapper.Utils.parseAddress(address);
    switch(res.type) {
        case "BITCOIN":
            //Bitcoin on-chain L1 address or BIP-21 URI scheme with amount
            console.log("Bitcoin on-chain address");
            if(res.amount!=null) console.log("   - amount: "+res.amount);
            break;
        case "LIGHTNING":
            //Lightning network invoice with pre-set amount
            console.log("Lightning invoice");
            console.log("   - amount: "+res.amount);
            break;
        case "LNURL":
            //LNURL payment or withdrawal link
            if(isLNURLWithdraw(res.lnurl)) {
                //LNURL-withdraw allowing withdrawals over the lightning network
                console.log("LNURL-withdraw");
                if(res.min!=null) console.log("   - withdrawable min: "+res.min);
                if(res.max!=null) console.log("   - withdrawable max: "+res.max)
                if(res.amount!=null) console.log("   - withdrawable exact: "+res.amount);
            }
            if(isLNURLPay(res.lnurl)) {
                //LNURL-pay allowing repeated payments over the lightning network
                console.log("LNURL-pay");
                if(res.min!=null) console.log("   - payable min: "+res.min);
                if(res.max!=null) console.log("   - payable max: "+res.max);
                if(res.amount!=null) console.log("   - payable exact: "+res.amount);
                console.log("   - icon data: "+res.lnurl.icon);
                console.log("   - short description: "+res.lnurl.shortDescription);
                console.log("   - long description: "+res.lnurl.longDescription);
                console.log("   - max comment length: "+res.lnurl.commentMaxLength);
            }
            break;
        default:
            //Addresses for smart chains
            console.log(res.type+" address");
            break;
    }
}

async function main() {
    //Address parsing
    //LNURL-pay static internet identifier
    await parseAddress("chicdeal13@walletofsatoshi.com");
    //Bitcoin on-chain address
    await parseAddress("tb1ql8d7vqr9mmuqwwrruz45zwxxa5apmmlra04s4f");
    //Bitcoin BIP-21 payment URI
    await parseAddress("bitcoin:tb1ql8d7vqr9mmuqwwrruz45zwxxa5apmmlra04s4f?amount=0.0001");
    //BOLT11 lightning network invoice
    await parseAddress("lntb10u1p5zwshxpp5jscdeenmxu66ntydmzhhmnwhw36md9swldy8g25875q42rld5z0sdrc2d2yz5jtfez4gtfs0qcrvefnx9jryvfcv93kvc34vyengvekxsenqdny8q6xxd34xqurgerp893njcnpv5crjefjvg6nse3exenxvdnxxycnzvecvcurxephcqpexqzz6sp58pcdqc5ztrr8ech3gzgrw9rxp50edwft9uqnnch9706nsqchv9ss9qxpqysgqasmulwmczrjhwg4vp9tqlat7lns8u80wvrcsreug8fpvna6p3arslsukkh5n83rqu6auvcrl7h6vczwaq58nu9mz60t03xtvrwz6vmsq6pv7zx");
    //LNURL-pay link
    await parseAddress("LNURL1DP68GURN8GHJ7MRWVF5HGUEWVDAZ7MRWW4EXCUP0FP692S6TDVYS94YU");
    //LNURL-withdraw link
    await parseAddress("LNURL1DP68GURN8GHJ7MRWVF5HGUEWVDAZ7AMFW35XGUNPWUHKZURF9AMRZTMVDE6HYMP0DP65YW2Y2FF8X7NC2DHY6AZHVEJ8SS6EGEPQ55X0HQ");
    //Starknet wallet address
    await parseAddress("0x06e31d218acfb5a34364306d84c65084da9c9bae09e2b58f96ff6f11138f83d7");
    //Solana wallet address
    await parseAddress("7fZcxMrQpeeLjtLPQmWzY1pNwGtfoGjVai3SH4uPPdv3");
}
main();
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
