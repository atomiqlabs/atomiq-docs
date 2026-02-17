# PrTLC (proof-time locked contract)

A PrTLC is an escrow smart contract between two parties that uses a proof of a Bitcoin transaction—provided through the on-chain Bitcoin light client—to enable conditional release of funds on the smart chain (Solana, Starknet, EVM). The protocol replaces the hash-based condition of traditional [HTLCs](./htlc/) with a proof-lock tied to a Bitcoin transaction confirming on the Bitcoin blockchain, creating an all-or-nothing outcome: either the counterparty sends the required Bitcoin transaction and proves it to claim the escrowed assets, or the funds are refunded after a timeout.

PrTLCs are a novel primitive introduced by Atomiq to enable trustless [Smart chain → Bitcoin swaps](../swaps/sc-bitcoin/), addressing key limitations of [HTLCs](./htlc/) such as user liveness requirements and the free option problem. They leverage on-chain Bitcoin light client verification for secure cross-chain settlement. While PrTLCs are central to Atomiq's core protocol for this direction, the reverse (Bitcoin → smart chain) primarily uses [UTXO-controlled vaults](./utxo-controlled-vault/), with PrTLCs serving as a legacy option.

This primitive is used for [Smart chain → Bitcoin swaps](../swaps/sc-bitcoin.md) and [legacy Bitcoin → Smart chain swaps](../swaps/bitcoind-sc-legacy.md).

## Mechanism

A PrTLC is created between an **offerer**—who funds the escrow with the source chain assets, and a **claimer**—who is the intended recipient upon fulfilling the condition. It uses the following parameters:

- A **proof-lock** ensures that funds can be claimed by the claimer only when they provide a proof that a Bitcoin transaction sending the agreed BTC amount to the **offerer**'s Bitcoin address has been confirmed. This proof consists of the raw transaction and a merkle proof of inclusion, the smart contract then checks the transaction and verifies that it has been confirmed in a Bitcoin block using the Bitcoin light client. Upon successful verification, the escrow releases the funds to the claimer.

- A **timelock** ensures that the offerer can reclaim funds after the timeout expires if the proof-lock condition is not met. In this case, the offerer receives the escrowed amount as a refund.

The escrow also supports a cooperative close path, where both parties can mutually agree to cancel early via signatures. In this scenario, the offerer reclaims the escrowed amount immediately, and any associated reward is returned without penalty.

## Transaction verification

The escrow has to verify that a bitcoin transaction sends exact BTC amount to the specified address (identified by the bitcoin output script). The raw Bitcoin transaction data are submitted to the smart contract, which parses it, inspects its structure—verifying outputs, amounts, scripts, and other required conditions—before confirming its inclusion in a block via the Bitcoin light client. This enables precise, programmable validation directly in the contract.

## Swap mechanism

In Atomiq swaps using PrTLCs, one party locks assets in the PrTLC escrow on the smart chain, while the counterparty must send a specific Bitcoin transaction (paying the agreed amount to the designated address) and prove its confirmation through the light client to claim the escrowed funds. If the Bitcoin transaction is not sent, confirmed and submitted before the timeout, the **offerer** can reclaim the locked assets.

---

The PrTLC design removes liveness requirements for the **claimer**—watchtowers can submit the proof and settle on their behalf if needed—making the process user-friendly and secure. Because PrTLCs tie settlement directly to Bitcoin's proof-of-work consensus (via the light client), they achieve fully trustless and non-custodial execution: no intermediaries hold funds, and outcomes are enforced by verifiable on-chain proofs and smart contract logic.
