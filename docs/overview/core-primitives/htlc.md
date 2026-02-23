# HTLC (hash-time locked contract)

An HTLC is an escrow smart contract between two parties that uses a cryptographic hash to link transactions across independent blockchains. The swap protocol uses a **secret** and its **hash** (where the hash is calculated ***sha256(secret)***) to create an all-or-nothing outcome: either both parties successfully exchange assets, or both safely refund through time-bound recovery paths.

HTLCs are the foundational primitive behind traditional atomic swaps and the Lightning Network. While Atomiq uses more advanced primitives ([PrTLCs](./prtlc.md) and [UTXO-controlled vaults](./utxo-controlled-vault.md)) for its Bitcoin on-chain swap protocol, the HTLC submarine swaps are still used for [Lightning Network swaps](/overview/swaps/#bitcoin-lightning-l2).

## Mechanism

An HTLC is created between an **offerer**—funding the escrow, and a **claimer**—recipient of the escrowed funds, with two parameters:

- A **hashlock** — specified by the hash ***P***, ensures that funds can be claimed by the **claimer** only when they reveal a **secret** on-chain, such that it hashes the to specified hashlock: ***P***=sha256(***secret***). Once the ***secret*** is revealed on one chain, the counterparty can observe it and use it to claim on the other chain. This is the happy path — the swap completes successfully on both sides.
- A **timelock** — specified by the timeout ***T***, ensures that the **offerer** can reclaim funds after the **timelock** expires: ***T***>*CurrentTime*. This is the sad path — used when the counterparty fails to cooperate — and ensures that funds are never permanently locked.

The escrow also allows the **offerer** to reclaim funds from the escrow using the cooperative refund path by providing a valid signature from the **claimer** that authorizes a premature cooperative refund without waiting for the timelock.

## Swap mechanism

In Lightning Network swaps with smart chains (commonly referred to as submarine swaps), HTLCs bridge the on-chain smart contract environment with the off-chain Lightning layer. One side locks funds in a smart contract HTLC on the smart chain, while the counterparty creates a corresponding Lightning HTLC (typically as part of an invoice or routed payment). When the claimer reveals the secret to claim on one side, the revelation is immediately usable on the other side to complete the swap.

---

While HTLCs are not an ideal construction for general cross-chain swaps due to their inherent limitations, pairing them with the Lightning Network at least partially mitigates the key drawbacks. Lightning’s fast settlement times—payments are typically confirmed in seconds—significantly reduce the user liveness requirement. Crucially, HTLCs achieve fully trustless and non-custodial execution: neither party needs to hand over control of funds to a third party, and the outcome is enforced purely by cryptography and on-chain consensus rules.
