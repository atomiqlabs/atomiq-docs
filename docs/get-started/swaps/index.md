# Swaps

Swaps between Bitcoin and smart chains are inherently asymmetric — Bitcoin cannot execute smart contracts, so each direction requires a different approach. Smart chain → Bitcoin swaps use [PrTLCs](../core-primitives/prtlc.md) where the LP proves it sent BTC, while Bitcoin → Smart chain swaps use [UTXO-controlled vaults](../core-primitives/utxo-controlled-vault.md) where a single cooperatively-signed Bitcoin transaction atomically settles both sides. Lightning swaps follow a symmetric [HTLC](../core-primitives/htlc.md) pattern, linking Lightning payment secrets to smart chain contracts.

The protocol has evolved over time — the Bitcoin → Solana swaps use a legacy protocol design, while the other swaps use a new UTXO-controlled vault based design.

## Bitcoin On-chain (L1)

On-chain swaps interact directly with the Bitcoin base layer. They use the [Bitcoin light client](../core-primitives/bitcoin-light-client.md) to verify Bitcoin transactions on the smart chain, secured by [PrTLCs](../core-primitives/prtlc.md) and [UTXO-controlled vaults](../core-primitives/utxo-controlled-vault.md).

| Swap | Description |
|------|-------------|
| [Smart chain -> Bitcoin](./sc-bitcoin.md) | Send smart chain tokens, receive on-chain BTC |
| [Bitcoin -> Smart chain](./bitcoin-sc-new.md) | Send on-chain BTC, receive smart chain tokens (current protocol using UTXO-controlled vaults) |
| [Bitcoin -> Solana (legacy)](./bitcoind-sc-legacy.md) | Legacy protocol for on-chain BTC to Solana swaps using PrTLCs |

## Bitcoin Lightning (L2)

Lightning swaps use the Lightning Network for faster, cheaper transfers. They leverage [HTLCs](../core-primitives/htlc.md) to atomically link Lightning payments with smart chain contract state.

| Swap | Description |
|------|-------------|
| [Smart chain -> Lightning](./sc-lightning.md) | Send smart chain tokens, receive a Lightning payment |
| [Lightning -> Smart chain](./lightning-sc-new.md) | Send a Lightning payment, receive smart chain tokens (current protocol using watchtowers + Nostr) |
| [Lightning -> Solana (legacy)](./lightning-sc-legacy.md) | Legacy protocol for Lightning to Solana swaps |
