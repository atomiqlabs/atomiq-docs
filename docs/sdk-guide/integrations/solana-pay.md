---
sidebar_position: 2
---

# Solana Pay Integration

Integrate Atomiq swaps with Solana Pay for seamless wallet-to-wallet payments.

:::tip Runnable Example
See the complete working example: [solana-pay/quickSwapProxyToBtcLnWithExpress.ts](https://github.com/atomiqlabs/atomiq-sdk-demo/blob/main/src/solana-pay/quickSwapProxyToBtcLnWithExpress.ts)
:::

## Overview

Solana Pay allows users to scan a QR code or click a deeplink to initiate transactions from their wallet. This guide shows how to create a server that generates Solana Pay-compatible swap transactions.

## How It Works

1. User scans QR code with Solana wallet
2. Wallet makes GET request to your server for display info
3. User approves the action
4. Wallet makes POST request to get the transaction
5. Wallet signs and sends the transaction
6. LP processes the swap and sends Bitcoin

## Server Setup

```typescript
import express from "express";
import cors from "cors";
import {swapper, Tokens} from "./setup";
import {SwapAmountType, ToBTCLNSwap} from "@atomiqlabs/sdk";

const app = express();
app.use(cors());
app.use(express.json());

await swapper.init();
```

## GET Handler (Display Info)

```typescript
app.get("/swapToBtcLn", (req, res) => {
  const {srcToken, destination} = req.query;

  // Validate token
  if (typeof srcToken !== "string" || !Tokens.SOLANA[srcToken]) {
    return res.status(400).json({message: "Invalid srcToken"});
  }

  // Validate Lightning invoice
  if (typeof destination !== "string" ||
      !swapper.Utils.isValidLightningInvoice(destination)) {
    return res.status(400).json({message: "Invalid Lightning invoice"});
  }

  // Get amount from invoice
  const amountSats = swapper.Utils.getLightningInvoiceValue(destination);

  res.json({
    icon: "https://app.atomiq.exchange/icons/atomiq-flask.png",
    label: `Swap ${srcToken} to ${amountSats} sats`
  });
});
```

## POST Handler (Transaction)

```typescript
app.post("/swapToBtcLn", async (req, res) => {
  const {srcToken, destination} = req.query;
  const {account} = req.body;

  // Validate inputs
  if (typeof srcToken !== "string" || !Tokens.SOLANA[srcToken]) {
    return res.status(400).json({message: "Invalid srcToken"});
  }

  if (typeof destination !== "string" ||
      !swapper.Utils.isValidLightningInvoice(destination)) {
    return res.status(400).json({message: "Invalid Lightning invoice"});
  }

  if (!account) {
    return res.status(400).json({message: "Invalid account"});
  }

  try {
    // Create the swap
    const swap = await swapper.swap(
      Tokens.SOLANA[srcToken],
      Tokens.BITCOIN.BTCLN,
      undefined,  // Amount from invoice
      SwapAmountType.EXACT_OUT,
      account,
      destination
    );

    // Get commit transaction
    const txs = await swap.txsCommit(true);

    if (txs.length > 1) {
      return res.status(500).json({message: "Unexpected multiple transactions"});
    }

    // Return serialized transaction
    res.json({
      transaction: txs[0].tx.serialize({requireAllSignatures: false}).toString("base64"),
      message: `Swap ${swap.getInput()} to ${swap.getOutput()} sats initiated!`
    });

  } catch (error) {
    console.error("Swap error:", error);
    res.status(500).json({message: error.message});
  }
});
```

## Refund Handler

```typescript
app.get("/refundToBtcLn", (req, res) => {
  const {destination} = req.query;

  if (typeof destination !== "string" ||
      !swapper.Utils.isValidLightningInvoice(destination)) {
    return res.status(400).json({message: "Invalid Lightning invoice"});
  }

  res.json({
    icon: "https://app.atomiq.exchange/icons/atomiq-flask.png",
    label: `Refund swap to ${destination.slice(0, 20)}...`
  });
});

app.post("/refundToBtcLn", async (req, res) => {
  const {destination} = req.query;
  const {account} = req.body;

  if (typeof destination !== "string" ||
      !swapper.Utils.isValidLightningInvoice(destination)) {
    return res.status(400).json({message: "Invalid Lightning invoice"});
  }

  if (!account) {
    return res.status(400).json({message: "Invalid account"});
  }

  // Find refundable swap for this invoice
  const refundableSwaps = await swapper.getRefundableSwaps("SOLANA", account);
  const swap = refundableSwaps.find(s =>
    s instanceof ToBTCLNSwap && s.getOutputAddress() === destination
  );

  if (!swap) {
    return res.status(400).json({message: "No refundable swap found"});
  }

  if (swap.isSuccessful()) {
    return res.status(400).json({
      message: `Swap successful, preimage: ${swap.getSecret()}`
    });
  }

  if (!swap.isRefundable()) {
    return res.status(400).json({message: "Swap not refundable yet"});
  }

  // Get refund transaction
  const txs = await swap.txsRefund(account);

  if (txs.length > 1) {
    return res.status(500).json({message: "Unexpected multiple transactions"});
  }

  res.json({
    transaction: txs[0].tx.serialize({requireAllSignatures: false}).toString("base64"),
    message: `Refunded swap to ${destination.slice(0, 20)}...`
  });
});
```

## Generating Deeplinks

```typescript
function generateDeeplinks(domain: string, srcToken: string, invoice: string) {
  const swapUrl = `https://${domain}/swapToBtcLn?srcToken=${srcToken}&destination=${invoice}`;
  const refundUrl = `https://${domain}/refundToBtcLn?destination=${invoice}`;

  return {
    swap: `solana:${encodeURIComponent(swapUrl)}`,
    refund: `solana:${encodeURIComponent(refundUrl)}`
  };
}

// Usage
const links = generateDeeplinks(
  "api.myapp.com",
  "SOL",
  "lnbc10u1p..."
);

console.log("Swap deeplink:", links.swap);
console.log("Refund deeplink:", links.refund);
```

## QR Code Generation

```typescript
import QRCode from "qrcode";

async function generateQRCode(deeplink: string): Promise<string> {
  return await QRCode.toDataURL(deeplink);
}

// In your API
app.get("/qr", async (req, res) => {
  const {srcToken, destination} = req.query;

  const swapUrl = `https://${req.hostname}/swapToBtcLn?srcToken=${srcToken}&destination=${destination}`;
  const deeplink = `solana:${encodeURIComponent(swapUrl)}`;

  const qrDataUrl = await generateQRCode(deeplink);

  res.json({
    deeplink,
    qrCode: qrDataUrl
  });
});
```

## HTTPS Requirement

:::warning
Solana Pay requires HTTPS. For local development, use a tunneling service like ngrok:

```bash
ngrok http 3000
```

Then use the generated HTTPS URL.
:::

## Complete Example

```typescript
import express from "express";
import cors from "cors";
import {swapper, Tokens} from "./setup";
import {SwapAmountType} from "@atomiqlabs/sdk";

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  await swapper.init();

  // Swap endpoint
  app.get("/swap", (req, res) => {
    const {token, invoice} = req.query;
    const amount = swapper.Utils.getLightningInvoiceValue(invoice as string);
    res.json({
      icon: "https://myapp.com/icon.png",
      label: `Pay ${amount} sats`
    });
  });

  app.post("/swap", async (req, res) => {
    const {token, invoice} = req.query;
    const {account} = req.body;

    const swap = await swapper.swap(
      Tokens.SOLANA[token as string],
      Tokens.BITCOIN.BTCLN,
      undefined,
      SwapAmountType.EXACT_OUT,
      account,
      invoice as string
    );

    const txs = await swap.txsCommit(true);

    res.json({
      transaction: txs[0].tx.serialize({requireAllSignatures: false}).toString("base64"),
      message: "Swap initiated!"
    });
  });

  app.listen(3000, () => console.log("Server running on :3000"));
}

main();
```

## Security Considerations

1. **Validate all inputs** - Check tokens exist, invoices are valid
2. **Rate limiting** - Prevent abuse of your API
3. **HTTPS only** - Required by Solana Pay
4. **CORS configuration** - Allow wallet domains
5. **Error handling** - Don't expose internal errors

## API Reference

- [txsCommit](/sdk-reference/sdk/classes/ToBTCLNSwap#txscommit) - Get commit transactions
- [txsRefund](/sdk-reference/sdk/classes/ToBTCLNSwap#txsrefund) - Get refund transactions
- [getRefundableSwaps](/sdk-reference/sdk/classes/Swapper#getrefundableswaps) - Get refundable swaps
