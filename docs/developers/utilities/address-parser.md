---
sidebar_position: 2
---

# Address Parser

`swapper.Utils.parseAddress()` is the SDK's unified parser for user-entered destination and source fields. It is useful anywhere you accept free-form input before calling [`swapper.swap(...)`](/developers/quick-start/creating-quotes), because the same field may contain a Bitcoin address, a BOLT11 invoice, an LNURL, a Lightning address, or a smart chain address.

The parser recognizes:

- Bitcoin on-chain addresses and [`bitcoin:` BIP-21](https://en.bitcoin.it/wiki/BIP_0021) URIs
- BOLT11 Lightning invoices with an embedded amount
- LNURL-pay, LNURL-withdraw and [Lightning addresses / LUD-16](https://github.com/lnurl/luds/blob/luds/16.md)
- Smart chain addresses for the chains configured in your swapper instance

The returned object is normalized and can include `type`, `address`, `swapType`, `amount`, `min` and `max`. Amount fields are returned as [`TokenAmount`](/sdk-reference/api/atomiq-sdk/src/type-aliases/TokenAmount), so they can be formatted and compared the same way as quote amounts in [Creating Quotes](/developers/quick-start/creating-quotes) and balance values in [Wallet Balance](/developers/utilities/wallet-balance).

## Parsing User Input

Use the async [`parseAddress()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#parseaddress) helper when you need the final normalized result:

```typescript
const parsed = await swapper.Utils.parseAddress(userInput);

if (parsed == null) {
  throw new Error("Unsupported address format");
}

switch (parsed.type) {
  case "BITCOIN":
    console.log("Bitcoin destination:", parsed.address);
    console.log("Optional amount from BIP-21:", parsed.amount?.toString());
    break;
  case "LIGHTNING":
    console.log("Lightning invoice amount:", parsed.amount?.toString());
    break;
  case "LNURL":
    if (parsed.lnurl.type === "pay") {
      console.log("LNURL-pay / Lightning address");
      console.log("Min:", parsed.min?.toString());
      console.log("Max:", parsed.max?.toString());
      console.log("Fixed amount:", parsed.amount?.toString());
    }
    if (parsed.lnurl.type === "withdraw") {
      console.log("LNURL-withdraw");
      console.log("Min:", parsed.min?.toString());
      console.log("Max:", parsed.max?.toString());
      console.log("Fixed amount:", parsed.amount?.toString());
    }
    break;
  default:
    console.log("Smart chain address on:", parsed.type); // e.g. SOLANA, STARKNET, CITREA
}
```

:::tip
For interactive forms, use [`parseAddressSync()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#parseaddresssync) while the user is typing and only call the async `parseAddress()` on blur or submit. The async parser may contact LNURL services, so you usually do not want to run it on every keystroke.
:::

## Async vs Sync Parsing

The SDK exposes two variants of the parser:

| Function | Use it when | Notes |
|------|------|------|
| [`parseAddress()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#parseaddress) | You need the final parsed result for quoting or execution | Fetches LNURL metadata and returns `lnurl`, `min`, `max` and `amount` when available |
| [`parseAddressSync()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#parseaddresssync) | You need fast local validation while the user is typing | Does not fetch LNURL metadata, so it cannot distinguish LNURL-pay from LNURL-withdraw |

If you already know the input is an LNURL and only need the fetched LNURL metadata, you can call [`getLNURLTypeAndData()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#getlnurltypeanddata) directly.

## Address Families

### Bitcoin and BIP-21

Bitcoin addresses and `bitcoin:` payment URIs are parsed as `type === "BITCOIN"`. This is the format you typically use as the destination in [Smart Chain -> BTC/Lightning](/developers/swaps/smart-chain-to-btc) swaps.

If the user pastes a BIP-21 URI with an amount, that amount is returned as `parsed.amount`, which is useful for pre-filling an `EXACT_OUT` quote.

```typescript
const parsed = await swapper.Utils.parseAddress(
  "bitcoin:bc1qexample...?amount=0.0001"
);

if (parsed?.type === "BITCOIN") {
  console.log("Destination address:", parsed.address);
  console.log("Requested BTC amount:", parsed.amount?.toString());
}
```

:::info
If you only need a quick format check, use [`isValidBitcoinAddress()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#isvalidbitcoinaddress) instead of the general parser.
:::

### Lightning Invoices

BOLT11 invoices are parsed as `type === "LIGHTNING"`. This is the fixed-amount destination format used in standard Lightning payouts in [Smart Chain -> BTC/Lightning](/developers/swaps/smart-chain-to-btc).

Unlike a generic BOLT11 validator, `parseAddress()` requires the invoice to include an amount. That matches the quoting flow, since the SDK needs to know how much the invoice requests.

```typescript
const parsed = await swapper.Utils.parseAddress("lnbc1000n1...");

if (parsed?.type === "LIGHTNING") {
  console.log("Invoice amount:", parsed.amount.toString());
}
```

If your UI needs to distinguish between "syntactically valid invoice" and "invoice valid for swap creation", use both helpers:

- [`isLightningInvoice()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#islightninginvoice) checks whether the string is a valid BOLT11 invoice at all.
- [`isValidLightningInvoice()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#isvalidlightninginvoice) checks whether the invoice also contains an amount.

:::warning
Amount-less Lightning invoices are not accepted by `parseAddress()`. If the user pastes one, the parser throws instead of returning a `LIGHTNING` result.
:::

### LNURLs and Lightning Addresses

LNURL parsing is most useful in the two Lightning-related swap families:

- [Smart Chain -> BTC/Lightning](/developers/swaps/smart-chain-to-btc) for LNURL-pay and Lightning addresses
- [Lightning -> Smart Chain](/developers/swaps/lightning-to-smart-chain) or [Lightning -> Solana](/developers/swaps/solana/lightning-to-solana) for LNURL-withdraw

The parser accepts both raw `lnurl1...` strings and human-readable Lightning addresses such as `user@example.com`. In the async path it fetches LNURL metadata and returns:

- `parsed.lnurl.type === "pay"` for LNURL-pay / Lightning address inputs
- `parsed.lnurl.type === "withdraw"` for LNURL-withdraw inputs
- `parsed.amount` when the LNURL has a fixed amount
- `parsed.min` and `parsed.max` when the amount is user-selectable

```typescript
const parsed = await swapper.Utils.parseAddress("user@example.com");

if (parsed?.type === "LNURL" && parsed.lnurl.type === "pay") {
  console.log("Min payable:", parsed.min?.toString());
  console.log("Max payable:", parsed.max?.toString());
  console.log("Fixed amount:", parsed.amount?.toString());
  console.log("Comment limit:", parsed.lnurl.commentMaxLength);
  console.log("Short description:", parsed.lnurl.shortDescription);
}
```

```typescript
const parsed = await swapper.Utils.parseAddress("lnurl1...");

if (parsed?.type === "LNURL" && parsed.lnurl.type === "withdraw") {
  console.log("Min withdrawable:", parsed.min?.toString());
  console.log("Max withdrawable:", parsed.max?.toString());
  console.log("Fixed amount:", parsed.amount?.toString());
  console.log("Description:", parsed.lnurl.params.defaultDescription);
}
```

:::info
If you only need to check whether a string looks like LNURL before fetching metadata, use [`isValidLNURL()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#isvalidlnurl). To fetch the metadata after that, call [`getLNURLTypeAndData()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#getlnurltypeanddata).
:::

### Smart Chain Addresses

If the input is a supported smart chain address, the parser returns the configured chain identifier as the `type`, for example `SOLANA`, `STARKNET` or `CITREA`. This is the format you typically use as the destination in [Bitcoin -> Smart Chain](/developers/swaps/btc-to-smart-chain), [Lightning -> Smart Chain](/developers/swaps/lightning-to-smart-chain), [Bitcoin -> Solana](/developers/swaps/solana/btc-to-solana) and [Lightning -> Solana](/developers/swaps/solana/lightning-to-solana).

```typescript
const parsed = await swapper.Utils.parseAddress(starknetSigner.getAddress());

if (parsed?.type === "STARKNET") {
  console.log("Destination is a Starknet address:", parsed.address);
}
```

If the chain is already known from your UI state, [`isValidSmartChainAddress()`](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#isvalidsmartchainaddress) is a cheaper and simpler validation helper.

## Using Parsed Results in Quote Forms

Parsed address data is most useful before you create a quote:

- use `parsed.amount` from BIP-21 or BOLT11 to pre-fill the quote amount
- use `parsed.min` and `parsed.max` from LNURLs to clamp user-entered amounts
- use `parsed.lnurl.type === "pay"` to show comment input for LNURL-pay if `commentMaxLength > 0`
- use the returned smart-chain `type` to pick the correct destination chain flow before calling `execute()` as described in [Executing Swaps](/developers/quick-start/executing-swaps)

```typescript
const parsed = await swapper.Utils.parseAddress(destinationInput);
if (parsed == null) throw new Error("Unsupported destination");

if (parsed.amount != null) {
  console.log("Pre-fill quoted amount:", parsed.amount.toString());
}

if (parsed.type === "LNURL" && parsed.lnurl.type === "pay") {
  console.log("User may add a comment up to", parsed.lnurl.commentMaxLength, "chars");
}

const quote = await swapper.swap(
  fromToken,
  toToken,
  parsed.amount?.amount ?? userSelectedAmount,
  amountType,
  sourceAddress,
  parsed.address
);
```

:::tip
For Lightning and LNURL destinations, validate and normalize the destination field before the user presses "Swap". For smart chain destinations, combine address parsing with the spendable balance helpers from [Wallet Balance](/developers/utilities/wallet-balance) so your form can validate both the destination and the source-side amount in the same pass.
:::

## API Reference

- [SwapperUtils](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils) - Utility class exposed as `swapper.Utils`
- [parseAddress](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#parseaddress) - Parse any supported address format with LNURL metadata fetching
- [parseAddressSync](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#parseaddresssync) - Parse locally without LNURL network requests
- [getLNURLTypeAndData](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#getlnurltypeanddata) - Fetch LNURL-pay or LNURL-withdraw details directly
- [isValidBitcoinAddress](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#isvalidbitcoinaddress) - Validate Bitcoin addresses
- [isLightningInvoice](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#islightninginvoice) - Validate generic BOLT11 invoices
- [isValidLightningInvoice](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#isvalidlightninginvoice) - Validate BOLT11 invoices with amount
- [isValidLNURL](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#isvalidlnurl) - Validate LNURL format
- [isValidSmartChainAddress](/sdk-reference/api/atomiq-sdk/src/classes/SwapperUtils#isvalidsmartchainaddress) - Validate smart chain addresses, optionally for a specific chain
- [TokenAmount](/sdk-reference/api/atomiq-sdk/src/type-aliases/TokenAmount) - Amount object returned by the parser
- [LNURLPay](/sdk-reference/api/atomiq-sdk/src/type-aliases/LNURLPay) - Parsed LNURL-pay data
- [LNURLWithdraw](/sdk-reference/api/atomiq-sdk/src/type-aliases/LNURLWithdraw) - Parsed LNURL-withdraw data
