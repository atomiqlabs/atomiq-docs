---
slug: /
sidebar_position: 1
---

# Introduction

atomiq.exchange is a fully trustless cross-chain decentralized exchange (DEX) enabling swaps between Bitcoin and smart contract blockchains (Solana, Starknet, EVM) without trusting any intermediary.

In contrast to existing cross-chain solutions that force users to choose between usability and trustlessness, Atomiq achieves both by leveraging Bitcoin proof-of-work consensus through on-chain [light client verification](/get-started/bitcoin-light-client/) and novel swap primitives. Combined with an off-chain request-for-quote (RFQ) system, this enables zero slippage swaps with competitive price discovery—without exposing participants to MEV risks.

The protocol uses a network of Liquidity Provider nodes to process swaps via RFQ—anyone can [run an LP node](/get-started/lps/running-lp-node). LPs are not trusted: swaps only complete when both sides cooperate, enforced by smart contract escrows with atomic settlement guarantees.

## Use Cases

### Swap

Fast, secure, and trustless cross-chain swaps between Bitcoin and smart chain assets. No custody risk, no bridging delays—just atomic settlement with cryptographic guarantees.

**[Try Atomiq now →](https://app.atomiq.exchange)**

---

### Build

Integrate trustless Bitcoin swaps into your application using the Atomiq SDK. Build Bitcoin-native onboarding flows, DeFi integrations, or custom swap interfaces.

**[SDK Documentation →](/developers)** · **[SDK Reference →](/sdk-reference)**

---

### Provide Liquidity

Become a Liquidity Provider by running an LP node. Earn fees by providing quotes and settling swaps, while maintaining full control of your funds through non-custodial smart contracts.

**[Run an LP Node →](/get-started/lps/running-lp-node)**
