---
sidebar_position: 1
---

# SDK Guide

The Atomiq SDK is a TypeScript multichain client for building trustless swaps between smart chains and Bitcoin, both on-chain and over Lightning. This page is the entry point for the SDK docs and helps you choose the right path through the documentation, whether you are setting up the SDK for the first time, implementing a specific swap family, building the surrounding quote UI, or hardening the integration for production.

:::tip
These resources complement the guides in this section:

- For runnable end-to-end examples in Node.js, see the [atomiq-sdk-demo](https://github.com/atomiqlabs/atomiq-sdk-demo) repository.
- For exact SDK classes, methods, enums, interfaces, and type signatures, see the [SDK API Reference](/sdk-reference/).
- For the low-level protocol background behind these integration guides, see [Protocol Overview](/overview/protocol-overview/) and [Swaps](/overview/swaps/).
:::

## Where To Start

### First Working Swap

Start with [Quick Start](/developers/quick-start/) to choose Browser or Node.js, initialize the swapper, and connect wallets or signers. Then continue with [Creating Quotes](/developers/quick-start/creating-quotes) and [Executing Swaps](/developers/quick-start/executing-swaps) to get the default high-level flow running end to end.

### Handling Edge Cases

Use [Swap Management](/developers/swap-management/) once your app needs to recover saved swaps after restart or interruption. In practice, this is a core part of a production integration rather than an optional extra: apps should expose clear recovery paths for swaps that did not finish automatically, including surfacing refund or claim actions when saved swaps still need user attention.

### Building the Swap UI

Once the basic flow works, use [Utilities](/developers/utilities/) to handle the smaller decisions around quoting: parse Bitcoin addresses, BOLT11 invoices, LNURLs, and smart-chain addresses, populate token selectors from the supported routes, inspect the `SwapType`, enforce route-specific limits, and calculate spendable balances for "Max" actions.

### Implementing Specific Swap Families

Use [Swap Guides](/developers/swaps/) when your app needs the details of the exact swap it is executing. These pages cover the direction-specific signer and wallet inputs, LNURL variants, manual execution paths, recovery actions, and the distinction between the standard Starknet and EVM flows and the legacy inbound Solana flows.

### Advanced Runtime Control

Use [Advanced](/developers/advanced/) when the default SDK flow is already working but the app needs more control over how it runs, such as handing smart-chain transactions off to external signers, subscribing to runtime events, customizing storage, or tuning swapper configuration.

## Sections

### Quick Start

Set up the SDK in Browser or Node.js, initialize the swapper, and follow the shared path from setup to quoting and execution.

**[Quick Start ->](/developers/quick-start/)**

---

### Swap Guides

Find the exact swap family your app is implementing, including standard Bitcoin and Lightning routes, LNURL variants, and the legacy Solana inbound flows.

**[Swap Guides ->](/developers/swaps/)**

---

### Utilities

Build the quote form and route-selection layer around swaps with helpers for address parsing, supported tokens, swap classification, amount limits, and spendable balances.

**[Utilities ->](/developers/utilities/)**

---

### Swap Management

Recover saved swaps from storage and handle the cases where a refund or claim action is still required after restart or interruption.

**[Swap Management ->](/developers/swap-management/)**

---

### Advanced

Adapt the SDK to more complex runtimes with manual transaction signing, event subscriptions, storage customization, and advanced swapper configuration.

**[Advanced ->](/developers/advanced/)**

---
