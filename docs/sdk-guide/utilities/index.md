---
sidebar_position: 1
---

# Utilities

The Utilities section is for the helper APIs you use while assembling a swap form or route selection flow. Rather than walking through a single swap end to end, these pages focus on the smaller decisions that happen around it: parsing user input, choosing valid token pairs, understanding the route, checking limits, and estimating spendable balance. In UI terms, this includes parsing Bitcoin addresses, BOLT11 invoices, LNURLs, Lightning addresses, and smart-chain addresses, building route-aware token selectors, and adapting the form based on the selected swap protocol.

## Usage

A typical integration uses these utilities in roughly this order:

1. Normalize any user-entered destination or source address with [Address Parser](./address-parser). This lets the UI accept Bitcoin addresses, BOLT11 invoices, LNURLs, Lightning addresses, and smart-chain addresses in a single input field, while also automatically updating the selected tokens and swap type based on the provided address.
2. Use [Supported Tokens](./supported-tokens) to populate the token selectors in the UI and constrain them to routes that are actually available for the current LP and chain setup.
3. Use [Swap Types](./swap-types) to understand which protocol the chosen pair maps to, whether the route requires a connected source or destination wallet, and whether optional capabilities such as gas drop are supported.
4. Before the user requests a quote, combine [Wallet Balance](./wallet-balance) and [Swap Limits](./swap-limits) to guide amount entry, enforce min and max bounds for the selected route, and support "Send Max" actions where appropriate.

## Topics

### Address Parser

Parse destination and source inputs such as Bitcoin addresses, BOLT11 invoices, LNURLs, Lightning addresses, and smart-chain addresses before creating a quote.

**[Address Parser →](./address-parser)**

---

### Supported Tokens

Discover which source and destination tokens are currently swappable and constrain token selectors to valid routes.

**[Supported Tokens →](./supported-tokens)**

---

### Swap Types

Inspect which swap protocol a token pair uses and whether that route supports capabilities such as gas drop or requires a wallet on a specific side.

**[Swap Types →](./swap-types)**

---

### Swap Limits

Read route-specific minimum and maximum bounds so your UI can validate amounts and react to changing LP limits.

**[Swap Limits →](./swap-limits)**

---

### Wallet Balance

Estimate how much can actually be swapped after fees, both for smart-chain wallets and for Bitcoin on-chain balances.

**[Wallet Balance →](./wallet-balance)**

---
