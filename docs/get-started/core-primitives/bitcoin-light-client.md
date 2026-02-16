# Bitcoin light client (on-chain)

The Bitcoin light client is a smart contract deployed on smart chains (Solana, Starknet, EVM, etc.) that verifies and stores Bitcoin block headers using the proof-of-work consensus algorithm. It acts as a **permissionless, trustless oracle** of Bitcoin's state — anyone can submit block headers and their validity is verified entirely on-chain. No trusted third party, signer set, or attestation is required.

This contract is the cryptographic anchor of the Atomiq protocol. It enables swap contracts to verify that a specific Bitcoin transaction was confirmed, which is the foundation for both [PrTLCs](./prtlc.md) (proof-time locked contracts) and [UTXO-controlled vaults](./utxo-controlled-vault.md) — the two primitives upon which all Bitcoin on-chain swaps are built.

## What is a light client?

Light clients are blockchain clients that don't verify full blocks by re-executing transactions. Instead, they only verify the **consensus mechanism** of the blockchain network (in Bitcoin's case, proof-of-work). They trust the consensus of the network to attest to the validity of the transactions included in the blockchain.

This approach was first proposed in the Bitcoin whitepaper under the name *simplified payment verification (SPV)*. Light clients only need to store the relatively small block headers (~80 bytes each, ~80MB total since genesis, see [Bitcoin block header structure](https://developer.bitcoin.org/reference/block_chain.html#block-headers) for details), yet can verify any transaction's inclusion through a short Merkle proof. This makes them well-suited for running inside a smart contract on another chain, where storage and computation are expensive.

Each block contains a **merkle root**, that is the key field for swap verification. It commits to every transaction in the block, enabling efficient proofs of transaction inclusion via a short Merkle proof path.

## Proof-of-work verification

To verify Bitcoin's consensus, the light client runs the following checks on each submitted block header:

1. **Difficulty target** — the `nBits` field matches the previous block's difficulty, or is adjusted correctly according to the difficulty adjustment algorithm (every 2016 blocks)
2. **Chain linkage** — the `prev_block_hash` equals the hash of the current chain tip (the latest stored block header)
3. **Proof-of-work** — the block header's double-SHA256 hash is lower than the difficulty target defined by the `nBits` field
4. **Timestamp bounds** — the timestamp is strictly larger than the median of the last 11 block headers and at most 2 hours ahead of the current system time

If all checks pass, the block header is accepted and stored, extending the verified chain.

## Handling forks

Blockchain forks naturally occur when multiple miners find a block at roughly the same time. The Bitcoin network uses the **highest chainwork** fork selection rule — the chain with the greatest cumulative proof-of-work wins and becomes the canonical chain.

The on-chain light client must replicate this behavior. When a fork is submitted, the contract compares the total chainwork (sum of difficulty across all blocks) of each fork and accepts the one with the highest cumulative chainwork. This can happen in two ways:

- **Same difficulty** — one fork simply grows longer than the other
- **Different difficulty** — a fork mined at higher difficulty can overtake a longer fork at lower difficulty

For edge cases where the fork length exceeds the network-wide transaction size limit, the relay contract supports piece-by-piece fork submission across multiple transactions. The submitted blocks are merged into the canonical chain once the fork's chainwork exceeds that of the current main chain.

## On-chain implementation

Smart contracts on chains like Solana, Starknet, or EVM can execute the light client logic as a program. These contracts are called **relays** — a smart contract on blockchain A that reads and verifies the state of blockchain B. The computational cost of verifying a Bitcoin block header is minimal — just 2 SHA256 invocations, some bitshifting, and comparisons. The light client needs to verify on average 144 block headers per day (one every ~10 minutes).

## Relayers

Since smart contracts cannot access Bitcoin's P2P network directly, the light client relies on **relayers** to submit the latest block headers. The role of a relayer is fully permissionless — anyone can submit block headers, and the contract verifies their validity regardless of who submits them.

Since submitting a block header incurs a transaction fee on the smart chain, relayers must be economically motivated. In Atomiq, any swap participant has a vested economic interest in keeping the light client synchronized — LPs need it to unlock capital, watchtowers earn fees for settling swaps, and users can always submit headers themselves to self-settle.

## Watchtowers

Watchtowers are relayers with an additional role: they automatically claim swaps (specifically [Bitcoin → Smart chain swaps](../swaps/bitcoin-sc-new.md)) on behalf of users, improving UX and security. They earn a small ***reward*** fee deposited by the user for each successfully settled swap. This creates a direct profit motive for keeping the light client in sync.

### Process

1. **Watchtower** observes the creation of a swap on-chain (the user must explicitly opt-in)
2. **Watchtower** monitors subsequent Bitcoin blocks for the required transaction
3. Once the Bitcoin transaction is found, the **watchtower** waits for the required number of confirmations
4. After sufficient confirmations, the **watchtower** claims the swap funds to the user's account and receives the ***reward*** fee


## Implementations

* [Solana bitcoin light client program](https://github.com/atomiqlabs/atomiq-contracts-solana/tree/main/btcrelay)
* [Starknet bitcoin light client contract](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/btc_relay)
* [EVM bitcoin light client contract](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/btc_relay)
