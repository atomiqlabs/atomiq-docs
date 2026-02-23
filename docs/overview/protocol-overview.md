# Protocol Overview

Atomiq facilitates trustless cross-chain swaps through a combination of on-chain smart contract logic and off-chain coordination, ensuring atomic execution without intermediaries. Users initiate swaps by requesting quotes from a decentralized network of Liquidity Providers (LPs) via an off-chain request-for-quote (RFQ) system. This allows competitive pricing and zero slippage while keeping the actual settlement fully on-chain and trustless.

![RFQ based Swap Flow](/img/rfq.svg)

## Swap Flow and Settlement

Once a user accepts a quote, the swap proceeds with atomic guarantees enforced by protocol-specific primitives. For swaps from smart chains to Bitcoin, funds are escrowed in a smart contract vault on the smart chain side (Solana, Starknet, EVM). Settlement occurs only when the counterparty demonstrates successful delivery of Bitcoin, verified through the protocol's mechanisms. If cooperation fails at any point, escrowed funds are automatically refunded to the original owner after a predefined timeout period.


## Core Settlement Mechanisms

The protocol relies on Bitcoin's proof-of-work consensus, verified directly on the smart chain via an on-chain [Bitcoin light client](/overview/core-primitives/bitcoin-light-client/). This light client serves as a permissionless oracle of bitcoin state, maintaining and validating Bitcoin block headers submitted by any participant. It enables secure verification of Bitcoin-side transactions on the smart chain without trusted intermediaries.

Two novel primitives handle the primary swap directions and address longstanding limitations in traditional atomic swaps:

- [Proof-time Locked Contracts (PrTLCs)](/overview/core-primitives/prtlc/) manage [Smart chain → Bitcoin swaps](/overview/swaps/sc-bitcoin/), replacing conventional HTLC hashlocks with bitcoin light client based transaction proofs. This eliminates the free option problem for liquidity providers and removes user liveness requirements, as anyone can permissionlessly settle the swap using light client transaction proofs.
- [UTXO-controlled vaults](/overview/core-primitives/utxo-controlled-vault/) secure [Bitcoin → Smart chain swaps](/overview/swaps/bitcoin-sc-new), enabling atomic execution through bitcoin light client based transaction proofs and UTXO-chaining. This enables swaps without LPs having to pre-lock liquidity on the Smart chain side, while eliminating the free option problem and the user liveness requirement (anyone can settle using light client transaction proofs).

These primitives eliminate liveness dependencies for users—anyone, including specialized [watchtowers](/overview/actors/#watchtower), can permissionlessly settle swaps on behalf of participants while earning fees for doing so.

## Lightning Network Integration

For swaps involving the Bitcoin Lightning Network, Atomiq incorporates established [HTLC (hash-time locked contracts)](/overview/core-primitives/htlc/) based mechanisms, similar to submarine swaps to ensure atomicity in a similar trust-minimized manner.

While HTLC swaps are not an ideal construction for cross-chain swaps, using it with the lightning network at least partially mitigates their drawbacks as the user livneness requirement is significantly reduced thanks to Lightning’s fast settlement times—payments are typically confirmed in seconds.

---

This architecture delivers practical, everyday usability while preserving full non-custodial security: users retain control of their funds throughout, and settlement is enforced purely by code and verifiable blockchain consensus.

