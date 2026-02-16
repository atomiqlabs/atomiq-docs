# HTLC (hash-time locked contract)

An HTLC is an escrow smart contract between two parties that uses a cryptographic hash to link transactions across independent blockchains. The swap protocol uses a ***secret x*** and its ***hash P = H(x)*** to create an all-or-nothing outcome: either both parties successfully exchange assets, or both safely refund through time-bound recovery paths.

HTLCs are the foundational primitive behind traditional atomic swaps and the Lightning Network. While Atomiq uses more advanced primitives ([PrTLCs](./prtlc.md) and [UTXO-controlled vaults](./utxo-controlled-vault.md)) for its swap protocol, understanding HTLCs is essential context — they represent the baseline trustless cross-chain mechanism that Atomiq improves upon.

## Mechanism

An HTLC is created with two parameters: ***hash P*** and ***timelock T***. The party initiating the swap generates a random ***secret x*** and computes ***P = H(x)***. This hash is used to construct escrows on both chains, cryptographically linking them through the same preimage.

### Hashlock

Enables the claimer to withdraw funds from the escrow by revealing a valid ***secret x*** such that **P = H(x)**. Once ***x*** is revealed on one chain, the counterparty can observe it and use it to claim on the other chain. This is the happy path — the swap completes successfully on both sides.

### Timelock

Allows the original depositor to reclaim funds after the ***timelock T*** expires. This is the sad path — used when the counterparty fails to cooperate — and ensures that funds are never permanently locked.

### Cooperative close

Both parties can also agree to close the contract early without waiting for the timelock, provided they both sign the closing terms.

## Swap flow

The classic HTLC swap flow (known as the Tier-Nolan protocol) works as follows between Alice and Bob, swapping tokens across Chain X and Chain Y:

**Setup:** Alice generates a random ***secret x*** and computes ***P = H(x)***.

**Happy path:**
1. Alice locks ***W*** tokens on Chain X in an HTLC — Bob can claim with ***x*** where **H(x) = P**, or Alice can refund after ***T<sub>A</sub>*** (e.g. 12h)
2. Bob observes the locking transaction and extracts ***P***
3. Bob locks ***V*** tokens on Chain Y in an HTLC — Alice can claim with ***x*** where **H(x) = P**, or Bob can refund after ***T<sub>B</sub>*** (e.g. 6h)
4. Alice reveals ***x*** to claim ***V*** tokens on Chain Y
5. Bob observes ***x*** (now public) and claims ***W*** tokens on Chain X

**Sad path (Alice withholds *x*):**
1. ***T<sub>B</sub>*** expires — Bob refunds ***V*** tokens on Chain Y
2. ***T<sub>A</sub>*** expires — Alice refunds ***W*** tokens on Chain X

### Asymmetric timelocks

The timelocks must be asymmetric: ***T<sub>B</sub> < T<sub>A</sub>***. Bob's refund timeout (e.g. 6h) must expire before Alice's (e.g. 12h). This ensures that Alice must reveal ***x*** before ***T<sub>B</sub>*** to claim Bob's tokens, giving Bob enough remaining time to extract ***x*** and claim on Chain X before ***T<sub>A</sub>***. If both timelocks were equal, Alice could claim Bob's tokens at the last moment, leaving Bob no time to claim on the other chain.

## Trust model

HTLCs achieve fully **trustless** cross-chain exchange through cryptographic hash preimage revelation and asymmetric timelocks. No third-party custody or attestation is required — atomicity is guaranteed purely by the mathematical properties of the hash function.

| Property | HTLC |
|---|---|
| Custody | Self-custody |
| Third-party trust | None |
| Atomicity guarantee | Cryptographic (hash function) |
| Censorship resistance | High (user-driven) |

## Limitations

Despite being trustless, HTLCs introduce two critical drawbacks that have hindered their practical adoption for cross-chain swaps:

### Liveness requirement

Both participants must stay online and actively monitor the swap during the entire timeout window. Failure to claim before the timelock expires leads to loss of funds. This is particularly problematic for slower blockchains like Bitcoin, where both participants must wait for transaction finality before settling — requiring the user to stay online for tens of minutes post-swap initiation. In practice, many solutions skip waiting for finality (for swaps to Bitcoin), making the swap seem instant but degrading the trust assumptions to that of a centralized bridge operator.

### Free option problem

The timelock-based nature of HTLC swaps creates a **free American call option** for one party at the counterparty's expense. After both parties lock funds, the party who must reveal the secret (Alice) can observe market movements throughout the entire timeout window and retroactively decide whether to complete the swap or let it expire. If the price moves favorably, she completes — if unfavorably, she refunds. The optionality cost (estimated at 0.5-1% of trade value) cannot be internalized and represents pure value leakage for the market maker, ruling out participation of any economically rational LP. This is why HTLC swaps remain mainly used for same-asset swaps (e.g. Lightning BTC to on-chain BTC), where optionality cost is essentially zero.

## Role in Atomiq

Atomiq acknowledges HTLC's design principles and builds upon them. The protocol replaces the hashlock with a **proof-lock** — verified through the on-chain [Bitcoin light client](./bitcoin-light-client.md) — creating [PrTLCs](./prtlc.md) that eliminate the liveness requirement and internalize the option premium through slashable bonds. For Bitcoin-to-smart-chain swaps, the protocol goes further with [UTXO-controlled vaults](./utxo-controlled-vault.md), which remove per-swap lockups, timeouts, and watchtower dependencies entirely. HTLCs are still used for [Lightning Network swaps](../swaps/sc-lightning.md), where their limitations are less pronounced due to the instant settlement nature of payment channels.
