# PrTLC (proof-time locked contract)

A PrTLC is an escrow smart contract between two parties — an ***offerer*** who funds the escrow, and a ***claimer*** who is the intended recipient. Its construction closely resembles an [HTLC](./htlc.md), with the key difference being the use of a **proof-lock** instead of a hash-lock. The proof-lock enables conditional release to the ***claimer***, contingent on the confirmation of a specified Bitcoin transaction — verified through the on-chain [Bitcoin light client](./bitcoin-light-client.md). The time-lock provides a unilateral refund path for the ***offerer*** after a ***timeout***, in case the proof-lock condition is never satisfied.

The PrTLC also introduces economic incentives: a ***bond*** posted by the ***claimer*** as slashable collateral, and a ***reward*** that compensates any third party for executing the claim on the ***claimer's*** behalf.

This primitive is used for [Smart chain → Bitcoin swaps](../swaps/sc-bitcoin.md) and [legacy Bitcoin → Smart chain swaps](../swaps/bitcoind-sc-legacy.md).

## Proof-lock

Enables the ***claimer*** to withdraw funds from the escrow by proving that a ***Bitcoin transaction TX*** that sends *btcAmount* BTC to Alice's address was confirmed in a Bitcoin block. The proof is verified through the [Bitcoin light client](./bitcoin-light-client.md) by providing:

1. The raw Bitcoin transaction ***tx***
2. A Merkle proof ***&pi;*** proving ***tx*** is included in a specific block
3. The ***block*** reference, which must have at least ***confs*** confirmations in the light client

Upon successful verification: ***amount + bond*** is transferred to the ***claimer***, and the ***reward*** is paid to the caller (which can be the ***claimer*** themselves, or a third-party watchtower).

## Timelock

Allows the ***offerer*** to unilaterally recover funds after the ***timeout*** expires. The ***offerer*** receives ***amount + bond*** as compensation for the ***claimer's*** failure to execute. The ***reward*** is returned to the ***claimer***.

## Cooperative close

Enables early cancellation when both parties agree. Both the ***offerer*** and ***claimer*** sign an authorization, allowing the ***offerer*** to reclaim ***amount*** immediately. Since this is mutual cancellation rather than failure, the ***bond + reward*** is returned to the ***claimer*** without penalty.

## Transaction verification methods

PrTLCs require specifying which Bitcoin transaction satisfies the proof-lock. This is expressed through the ***verify*** predicate.

### Transaction hash (txid) verification

The simplest approach — the ***verify*** predicate checks only the transaction hash (txid), which implicitly commits to the full transaction data (inputs, outputs, etc.). This is limiting because the contract can only see the hash, not inspect the transaction structure, pushing complexity off-chain.

### Full transaction parsing

The transaction can be fully parsed on-chain, allowing the ***verify*** predicate to assert arbitrary conditions based on the transaction structure: inputs, outputs, locktimes, sequences, etc. For example: "transaction has an output paying ***btcAmount*** BTC to output script ***X***". Claiming requires submitting the raw transaction to the smart chain, which parses it and checks the assertions before hashing it to derive the txid for Merkle verification against the light client. **This is the approach used by Atomiq for all swaps.**

## Role in Atomiq swaps

### Smart chain → Bitcoin

In this direction, the user takes the ***offerer*** role and the LP takes the ***claimer*** role. The user locks tokens on the smart chain, and the LP must send BTC on Bitcoin and prove it to claim. If the LP fails, the user refunds and claims the LP's ***bond*** as compensation. This flow has **no liveness requirement for the user** — once the PrTLC is created, the user can go offline. See [Smart chain → Bitcoin swaps](../swaps/sc-bitcoin.md) for the full flow.

### Bitcoin → Smart chain (legacy)

In the reverse direction, the LP takes the ***offerer*** role and the user takes the ***claimer*** role. The user must post a ***bond*** and ***reward*** on the smart chain, then send BTC on Bitcoin. Watchtowers claim the PrTLC on the user's behalf, earning the ***reward***. This flow has practical limitations — users need smart chain tokens upfront (the "cold start" problem), and security depends on watchtower availability. These limitations led to the development of [UTXO-controlled vaults](./utxo-controlled-vault.md), which supersede PrTLCs for this swap direction. See [legacy Bitcoin → Smart chain swaps](../swaps/bitcoind-sc-legacy.md) for details.

## Comparison with other primitives

|  | HTLC | PrTLC |
|---|---|---|
| Lock mechanism | Hash preimage | Bitcoin transaction proof |
| Liveness requirement | Both parties | Claimer only (LP) |
| No-execution penalty | None | Slashable bond |
| Bitcoin on-chain footprint | Commit + claim on both chains | Single Bitcoin tx |
| Cryptographic assumption | Hash function | Bitcoin light client |
