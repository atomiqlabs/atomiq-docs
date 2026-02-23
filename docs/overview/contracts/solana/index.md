# Solana Contracts

The Solana deployment uses a **monolithic architecture**, where the protocol is implemented as two standalone Anchor programs — a swap program and a BTC relay program. Unlike the [modular EVM & Starknet contracts](../evm-starknet/), all swap logic ([HTLC](../../core-primitives/htlc.md), [PrTLC](../../core-primitives/prtlc.md), and transaction verification) lives within a single swap program rather than being split into separate handler contracts. The [UTXO-controlled vault](../../core-primitives/utxo-controlled-vault.md) primitive is not implemented on Solana, meaning Solana can only process legacy swaps in the Bitcoin → Solana direction.

This is the original contract design, built as the first implementation of the Atomiq protocol.

## BTC Relay (Bitcoin Light Client)

**Repository**: [atomiq-contracts-solana/btcrelay](https://github.com/atomiqlabs/atomiq-contracts-solana/tree/main/btcrelay)

A permissionless, trustless Bitcoin SPV light client deployed on-chain. It verifies and stores Bitcoin block headers using proof-of-work validation, serving as a **trustless oracle of Bitcoin state**. Anyone can submit block headers — the contract verifies their validity regardless of who submits them.

The relay validates consensus rules (PoW difficulty, difficulty adjustments, previous block hash, timestamps) and handles forks automatically by adopting the chain with the greatest cumulative chainwork. Block headers are stored in a **ring buffer of 250 blocks** (meaning only the last 250 blocks can be used for verification). The relay stores only a single 32-byte SHA-256 commitment hash per block — full header data is emitted as a program event.

Bitcoin relay program is used for verifying PrTLC claim conditions (bitcoin block inclusion merkle proofs) by the swap program.

### Fork Handling

Short forks (< 6 bitcoin blocks) are resolved in a single transaction. Longer forks use a separate `ForkState` PDA that accumulates headers until the fork overtakes the main chain.

## Swap Program

**Repository**: [atomiq-contracts-solana/swaps](https://github.com/atomiqlabs/atomiq-contracts-solana/tree/main/swaps)

Handles all swap execution — initialization, claiming, refunding, and cooperative closing. Unlike the modular EVM/Starknet approach where claim/refund logic is in separate handler contracts, the swap program contains all verification logic internally and dispatches based on swap type.

### BTC Relay Integration

The swap program interacts with the BTC Relay to verify Bitcoin transaction proofs for PrTLC based swaps via Solana's instruction introspection rather than traditional CPI calls:

1. The BTC relay's `verify_transaction` instruction is included as a **prior instruction** in the same transaction as the swap claim
2. The swap program reads and validates the prior instruction's data and accounts to confirm the Bitcoin transaction was verified

This pattern avoids CPI overhead while maintaining the verification chain

```
Solana transaction for PrTLC swap claim (providing an on-chain Bitcoin transaction and merkle proof):
  Instruction 0: BTC Relay → verify_transaction(txid, merkle_proof, ...)
  Instruction 1: Swap Program → claimer_claim(secret)
                    └─ reads instruction 0 to confirm BTC relay verification
```

### Swap Types

The program supports four swap types, each with its own claim verification path:

| Type | Name | Used For                | Claim Verification                                                                                  |
|---|---|-------------------------|-----------------------------------------------------------------------------------------------------|
| 0 | **HTLC** | Lightning Network swaps | SHA-256 preimage revelation                                                                         |
| 1 | **Chain** | Bitcoin → Solana        | Specific Bitcoin output and block inclusion proof via BTC relay                                     |
| 2 | **ChainNonced** | Solana → Bitcoin        | Specific Bitcoin output + nonce from `locktime`/`nSequence` and block inclusion proof via BTC relay |
| 3 | **ChainTxhash** | None (Future extension) | Raw bitcoin transaction ID verified via BTC relay                                                   |

#### Claim Verification

0. **HTLC (Lightning)**: The claimer provides a secret. The program hashes it with SHA-256 and compares against the stored payment hash.

For BTC Relay based swap types, the program checks that a prior `verify_transaction` instruction from the BTC relay program exists in the same transaction — confirming the Bitcoin transaction (identified by its transaction hash) is included in a confirmed block.

1. **Chain (Bitcoin → Solana)**: The claimer provides the full Bitcoin transaction data. The program parses it, verifies the transaction's output script & amount matches the payment hash (i.e. sha256(*scriptPubKey*, *amountSats*) = *paymentHash*), then computes the transaction hash to be checked via the BTC Relay
2. **ChainNonced (Solana → Bitcoin)**: The claimer provides the full Bitcoin transaction data. The program parses it, verifies the transaction's output script, amount and nonce (extracted from the Bitcoin transaction's `locktime` and `nSequence`) matches the payment hash (i.e. sha256(*scriptPubKey*, *amountSats*, *nonce*) = *paymentHash*), then computes the transaction hash to be checked via the BTC Relay
3. **ChainTxhash**: Payment hash is an explicit Bitcoin transaction hash that is verified through the BTC relay to be included in a confirmed block

### Refund Verification

Swap escrow refunds are triggered in two ways:

- **Timeout**: the offerer is able to refund unilaterally after the current timestamp exceeds the escrow's expiry, or the Bitcoin blockheight exceeds a threshold (verified via BTC Relay)
- **Cooperative close**: the claimer signs a refund authorization (verified via ED25519 signature introspection) allowing the offerer to refund before the timeout.

### Reputation Tracking

The program tracks LP reputation in a `UserAccount` PDA per LP per token, recording success/failure/cooperative-close counts and volumes for each swap type.

## Comparison with EVM & Starknet

| Aspect                | Solana                               | EVM & Starknet |
|-----------------------|--------------------------------------|---|
| Architecture          | Monolithic — single swap program     | Modular — separate handler contracts |
| Claim logic           | Internal dispatch by swap type       | External claim handler contracts |
| Refund logic          | Internal timeout + cooperative close | External refund handler contracts |
| Adding new swap types | Requires program upgrade             | Deploy a new handler contract |
| Bitcoin verification  | Instruction introspection            | Direct contract calls |
| UTXO-controlled vault | *Not implemented*                    | Separate SPV Swap Vault contract |
