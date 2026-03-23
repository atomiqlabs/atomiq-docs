---
sidebar_position: 1
---

# Swap Guides

This section helps you choose the guide for the exact swap your app is executing. Each page covers one swap family in detail, including the protocol behind it, the required wallets or signers, the manual execution path, and the recovery actions that matter when the automatic flow does not fully finish.

:::info
Use this section together with [Executing Swaps](/developers/quick-start/executing-swaps). The quick-start page explains the shared high-level `execute()` flow, while the swap guides explain what changes from one swap family to another.
:::

## Usage

The simplest way to choose a guide is by the Bitcoin layer involved in the swap:

### Bitcoin On-Chain (L1)

| Source | Destination | `SwapType` | Swap Class | Guide | Primitive |
|--------|-------------|-----------|------------|-------|-----------|
| BTC L1 | Smart Chain | [`SPV_VAULT_FROM_BTC`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#spv_vault_from_btc) | [`SpvFromBTCSwap`](/sdk-reference/api/atomiq-sdk/src/classes/SpvFromBTCSwap) | [Bitcoin -> Smart Chain](./btc-to-smart-chain) | [UTXO-controlled vault](/overview/core-primitives/utxo-controlled-vault/) |
| Smart Chain | BTC L1 | [`TO_BTC`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#to_btc) | [`ToBTCSwap`](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCSwap) | [Smart Chain -> BTC/Lightning](./smart-chain-to-btc) | [PrTLC](/overview/core-primitives/prtlc/) |

### Bitcoin Lightning (L2)

| Source | Destination | `SwapType` | Swap Class | Guide | Primitive |
|--------|-------------|-----------|------------|-------|-----------|
| Lightning | Smart Chain | [`FROM_BTCLN_AUTO`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#from_btcln_auto) | [`FromBTCLNAutoSwap`](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNAutoSwap) | [Lightning -> Smart Chain](./lightning-to-smart-chain) | [LP-initiated HTLC](/overview/core-primitives/htlc/) |
| Smart Chain | Lightning | [`TO_BTCLN`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#to_btcln) | [`ToBTCLNSwap`](/sdk-reference/api/atomiq-sdk/src/classes/ToBTCLNSwap) | [Smart Chain -> BTC/Lightning](./smart-chain-to-btc) | [HTLC](/overview/core-primitives/htlc/) |

The Lightning guides also cover the LNURL-based variants of these swaps: [Smart Chain -> BTC/Lightning](./smart-chain-to-btc) includes LNURL-pay, while [Lightning -> Smart Chain](./lightning-to-smart-chain) and [Lightning -> Solana](./solana/lightning-to-solana) include LNURL-withdraw flows.

### Legacy Solana Swaps

:::info
The Solana guides are separate because the Bitcoin/Lightning -> Solana direction still uses older protocol flows with different requirements and recovery behavior than the newer Starknet and EVM swaps. The reverse Smart Chain -> Bitcoin/Lightning direction is the same across Solana, Starknet, and EVM.
:::

| Source | Destination | `SwapType` | Swap Class | Guide | Primitive |
|--------|-------------|-----------|------------|-------|-----------|
| BTC L1 | Solana | [`FROM_BTC`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#from_btc) | [`FromBTCSwap`](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCSwap) | [Bitcoin -> Solana](./solana/btc-to-solana) | [PrTLC](/overview/core-primitives/prtlc/) |
| Lightning | Solana | [`FROM_BTCLN`](/sdk-reference/api/atomiq-sdk/src/enumerations/SwapType#from_btcln) | [`FromBTCLNSwap`](/sdk-reference/api/atomiq-sdk/src/classes/FromBTCLNSwap) | [Lightning -> Solana](./solana/lightning-to-solana) | [User-initiated HTLC](/overview/core-primitives/htlc/) |

## Topics

### Standard Swaps

Use these guides for the standard swap flows used across Starknet and EVM, as well as for the common **Smart Chain -> Bitcoin/Lightning** flow shared across Solana, Starknet, and EVM.

**[Smart Chain -> BTC/Lightning](./smart-chain-to-btc)** | **[Bitcoin -> Smart Chain](./btc-to-smart-chain)** | **[Lightning -> Smart Chain](./lightning-to-smart-chain)**

---

### Legacy Swaps

Use these guides when the destination is Solana and the source is Bitcoin on-chain or Lightning, since those swaps still follow the legacy Solana-specific flows.

**[Bitcoin -> Solana](./solana/btc-to-solana)** | **[Lightning -> Solana](./solana/lightning-to-solana)**

---
