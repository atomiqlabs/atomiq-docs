# Solana Contracts

The Solana deployment uses a **monolithic architecture** — the protocol is implemented as two standalone Anchor programs that interact via Cross-Program Invocation (CPI). Unlike the [modular EVM & Starknet contracts](../evm-starknet/), all swap logic (HTLC, PTLC, and transaction verification) lives within a single swap program rather than being split into separate handler contracts.

This is the original contract design, built as the first implementation of the Atomiq protocol.

## Architecture

The Solana deployment consists of two programs:

1. **BTC Relay** — Bitcoin SPV light client
2. **Swap Program** — Escrow-based swap execution with built-in claim/refund logic

The swap program determines the verification path at runtime based on the swap type, dispatching to internal sub-modules. For on-chain Bitcoin swaps, it reads the result of a prior BTC relay instruction within the same transaction — a pattern enabled by Solana's instruction introspection.

---

## BTC Relay (Bitcoin Light Client)

**Program ID:** `BrNUaNvLqsovy9Q5JwyZ58UUgB2TmhRkv94UW4Pi18ve`

A permissionless Bitcoin SPV light client that verifies and stores Bitcoin block headers on Solana. Functionally equivalent to the EVM/Starknet relays, but adapted to Solana's constraints.

### Storage

Block headers are stored in a **ring buffer of 250 blocks**. Only a 32-byte SHA-256 commitment hash is stored per block — full header data is emitted as events for off-chain indexing. The program tracks the tip block hash, block height, and cumulative chainwork.

### Instructions

| Instruction | Purpose |
|---|---|
| `initialize` | Set up initial state with a trusted Bitcoin block header |
| `submit_block_headers` | Append new blocks to the main chain with PoW verification |
| `submit_short_fork_headers` | Handle short forks (< 7 blocks) in a single transaction |
| `submit_fork_headers` | Handle longer forks via a temporary fork PDA, accumulated across multiple transactions |
| `close_fork_account` | Clean up fork PDA after resolution |
| `verify_transaction` | Verify Bitcoin transaction inclusion via Merkle proof (CPI-callable by the swap program) |
| `block_height` | Validate current Bitcoin block height against a value (used for blockheight-based refunds) |

### Fork Handling

Forks are handled the same way as on EVM/Starknet — the chain with the greatest cumulative chainwork becomes canonical. Short forks (< 7 blocks) are resolved in a single transaction. Longer forks use a separate `ForkState` PDA that accumulates headers until the fork overtakes the main chain.

| | |
|---|---|
| Repository | [btcrelay](https://github.com/atomiqlabs/atomiq-contracts-solana/tree/main/btcrelay) |

---

## Swap Program

**Program ID:** `8TaLxktu3mtmbBjdUJVbYmmhKrkZq3kY7UnBQChVMrTJ`

Handles all swap execution — initialization, claiming, refunding, and cooperative closing. Unlike the modular EVM/Starknet approach where claim/refund logic is in separate handler contracts, the swap program contains all verification logic internally and dispatches based on swap type.

### Swap Types

The program supports four swap types, each with its own claim verification path:

| Type | Name | Used For | Claim Verification |
|---|---|---|---|
| 0 | **HTLC** | Lightning Network swaps | SHA-256 preimage revelation |
| 1 | **Chain** | Bitcoin on-chain (legacy) | Bitcoin output verified via BTC relay |
| 2 | **ChainNonced** | Bitcoin on-chain (with nonce) | Bitcoin output + nonce from `locktime`/`nSequence` |
| 3 | **ChainTxhash** | Bitcoin txid (future) | Bitcoin transaction ID verified via BTC relay |

### Escrow State

Each swap creates an `EscrowState` PDA containing:

- **Offerer** and **claimer** — the two swap participants
- **Token mint and amount** — the escrowed asset
- **Swap data** — type, payment hash, required confirmations, expiry, nonce
- **Security deposit** — penalty in SOL if the swap fails
- **Claimer bounty** — reward in SOL for watchtowers that settle the swap

### Instructions

| Instruction | Purpose |
|---|---|
| `deposit` / `withdraw` | Manage LP token balance in the program vault |
| `offerer_initialize` / `offerer_initialize_pay_in` | Create escrow — from internal vault balance or external wallet |
| `claimer_claim` / `claimer_claim_pay_out` | Claim funds — to internal vault or external wallet |
| `offerer_refund` / `offerer_refund_pay_in` | Refund after timeout or cooperative close — to internal vault or external wallet |
| `init_data` / `write_data` / `close_data` | Manage data accounts for storing Bitcoin transaction proofs (needed for on-chain claims due to Solana's transaction size limits) |

### Claim Verification

**HTLC (Lightning):** The claimer provides a secret. The program hashes it with SHA-256 and compares against the stored payment hash.

**Chain / ChainNonced / ChainTxhash (Bitcoin on-chain):** The claimer provides the full Bitcoin transaction data. The program parses it, verifies the output matches the committed hash, and checks that a prior `verify_transaction` instruction from the BTC relay program exists in the same transaction — confirming the Bitcoin transaction is included in a confirmed block.

For `ChainNonced` swaps, the program additionally extracts a nonce from the Bitcoin transaction's `locktime` and `nSequence` fields to uniquely identify the swap and prevent replay.

### Refund Verification

Refunds are triggered in two ways:

- **Timeout** — the current timestamp exceeds the escrow's expiry, or the Bitcoin blockheight exceeds a threshold (verified via BTC relay CPI)
- **Cooperative close** — the claimer signs a refund authorization (verified via ED25519 signature introspection)

### Reputation Tracking

The program tracks LP reputation in a `UserAccount` PDA per LP per token, recording success/failure/cooperative-close counts and volumes for each swap type.

| | |
|---|---|
| Repository | [swaps](https://github.com/atomiqlabs/atomiq-contracts-solana/tree/main/swaps) |

---

## Cross-Program Integration

The two programs interact via Solana's instruction introspection rather than traditional CPI calls:

1. The BTC relay's `verify_transaction` instruction is included as a **prior instruction** in the same transaction as the swap claim
2. The swap program reads and validates the prior instruction's data and accounts to confirm the Bitcoin transaction was verified
3. This pattern avoids CPI overhead while maintaining the verification chain

```
Transaction for an on-chain Bitcoin claim:
  Instruction 0: BTC Relay → verify_transaction(txid, merkle_proof, ...)
  Instruction 1: Swap Program → claimer_claim(secret)
                    └─ reads instruction 0 to confirm BTC relay verification
```

---

## Comparison with EVM & Starknet

| Aspect | Solana | EVM & Starknet |
|---|---|---|
| Architecture | Monolithic — single swap program | Modular — separate handler contracts |
| Claim logic | Internal dispatch by swap type | External claim handler contracts |
| Refund logic | Internal timeout + cooperative close | External refund handler contracts |
| Adding new swap types | Requires program upgrade | Deploy a new handler contract |
| Bitcoin verification | Instruction introspection | Direct contract calls |
| SPV Vault (UTXO-controlled) | Not implemented | Separate SPV Swap Vault contract |
| Anchor version | BTC relay: 0.26.0, Swaps: 0.29.0 | N/A (Solidity / Cairo) |
