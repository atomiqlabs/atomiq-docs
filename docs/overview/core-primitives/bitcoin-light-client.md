# Bitcoin light client (on-chain)

The Bitcoin light client (also called **bitcoin relay**) is a smart contract deployed on smart chains (Solana, Starknet, EVM, etc.) that verifies and stores Bitcoin block headers using the proof-of-work consensus algorithm. It acts as a **permissionless & trustless oracle** of Bitcoin's state — anyone can submit block headers and their validity is verified entirely on-chain. No trusted third party, signer set, or attestation is required.

This contract is the cryptographic anchor of the Atomiq protocol. It enables swap contracts to verify that a specific Bitcoin transaction was confirmed, which is the foundation for both [PrTLCs](./prtlc.md) (proof-time locked contracts) and [UTXO-controlled vaults](./utxo-controlled-vault.md) — the two primitives upon which all Bitcoin on-chain swaps are built.

## What is a light client?

Light clients are blockchain clients that don't verify full blocks by re-executing transactions. Instead, they only verify the **consensus mechanism** of the blockchain network (in Bitcoin's case, proof-of-work). They trust the consensus of the network to attest to the validity of the transactions included in the blockchain.

This approach was first proposed in the Bitcoin whitepaper under the name *simplified payment verification (SPV)*. Light clients only need to store the relatively small block headers (~80 bytes each, see [Bitcoin block header structure](https://developer.bitcoin.org/reference/block_chain.html#block-headers) for details), yet can verify any transaction's inclusion through a short Merkle proof.

Each block contains a **merkle root**, that is the key field for bitcoin transaction verification. It commits (using a merkle tree) to every transaction in the block, enabling efficient proofs of transaction inclusion via merkle proofs.

The computational cost of verifying a Bitcoin block header is minimal — just 2 SHA256 invocations, some bitshifting, and comparisons. This makes them well-suited for running inside a smart contract on another chain, where storage and computation are expensive. The light client needs to verify on average 144 block headers per day (one every ~10 minutes).

## Proof-of-work verification

To verify Bitcoin's consensus, the light client runs the following checks on each submitted block header:

- **Proof-of-Work difficulty target** — the `nBits` field matches the previous block's difficulty, or is adjusted correctly according to the difficulty adjustment algorithm (every 2016 blocks)
- **Link to previous block** — the `prev_block_hash` equals the hash of the current chain tip (the latest stored block header)
- **Proof-of-work** — the block header's double-SHA256 hash is lower than the difficulty target defined by the `nBits` field
- **Timestamp bounds** — the timestamp is strictly larger than the median of the last 11 block headers and at most 2 hours ahead of the current system time

If all checks pass, the block header is accepted and stored, extending the verified chain.

## Handling forks

Blockchain forks naturally occur when multiple miners find a block at roughly the same time. The Bitcoin network uses the **highest chainwork** fork selection rule — the chain with the greatest cumulative proof-of-work wins and becomes the canonical chain.

The on-chain light client replicates this behavior. When a fork is submitted, the contract compares the total chainwork (sum of difficulty across all blocks) of each fork and accepts the one with the highest cumulative chainwork as the main canonical chain.

For edge cases where the fork length exceeds the smart chain (Solana, Starknet, EVM) transaction size limit, the relay contract supports piece-by-piece fork submission across multiple transactions. The submitted blocks are merged into the canonical chain once the fork's chainwork exceeds that of the current main chain.

## Relayers

Since smart contracts cannot access Bitcoin's P2P network directly, the light client relies on **relayers** to submit the latest block headers. The role of a relayer is permissionless — anyone can submit block headers (including the LP and the user) as the contract verifies their validity regardless of who submits them.

Since submitting a block header incurs a transaction fee on the smart chain, relayers must be economically motivated to do so. In Atomiq, any swap participant has a vested economic interest in keeping the light client synchronized — [LPs](/overview/actors/#liquidity-provider-lp) need it to unlock capital, [Watchtowers](/overview/actors/#watchtower) earn fees for settling swaps, and [Users](/overview/actors/#user) can always submit headers themselves to self-settle.

## Implementations

* [Solana bitcoin light client program](https://github.com/atomiqlabs/atomiq-contracts-solana/tree/main/btcrelay)
* [Starknet bitcoin light client contract](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/btc_relay)
* [EVM bitcoin light client contract](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/btc_relay)
