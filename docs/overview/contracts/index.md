# Contracts

Atomiq's smart contracts are deployed across multiple chains, with two distinct architectural approaches depending on the target platform.

## Solana

The Solana contracts use a **monolithic architecture** — the BTC relay and swap logic are implemented as standalone Anchor programs. This is the older contract design, originally built as the first implementation of the Atomiq protocol.

**[Solana Contracts →](./solana/)**

## EVM & Starknet

The EVM and Starknet contracts use a **modular architecture** — the protocol logic is decomposed into small, composable contract modules (BTC relay, escrow manager, claim/refund handlers, etc.) that can be combined and upgraded independently. This is the newer contract design, enabling greater flexibility and reuse across chains.

**[EVM & Starknet Contracts →](./evm-starknet/)**
