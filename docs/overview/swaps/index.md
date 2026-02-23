# Swaps

Swaps between Bitcoin and smart chains are inherently asymmetric — Bitcoin cannot execute smart contracts, so each direction requires a different approach. Smart chain → Bitcoin swaps use [PrTLCs](../core-primitives/prtlc.md) where the LP proves it sent BTC, while Bitcoin → Smart chain swaps use [UTXO-controlled vaults](../core-primitives/utxo-controlled-vault.md) where a single cooperatively-signed Bitcoin transaction atomically settles both sides. Lightning swaps follow a symmetric [HTLC](../core-primitives/htlc.md) pattern, linking Lightning payment secrets to smart chain contracts.

:::info
The protocol has evolved over time — the Bitcoin (on-chain and lightning) → Solana swaps use legacy protocol designs, while the other chains support newer swap protocols.
:::

## Bitcoin On-chain (L1) swaps

On-chain swaps interact directly with the Bitcoin base layer. They use the [Bitcoin light client](../core-primitives/bitcoin-light-client.md) to verify Bitcoin transactions on the smart chain, secured by [PrTLCs](../core-primitives/prtlc.md) and [UTXO-controlled vaults](../core-primitives/utxo-controlled-vault.md).

| Swap        | Primitive             | Description                                                                                                                                                                                                                            |
|------------------------------------------------------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Smart chain → Bitcoin](./sc-bitcoin.md)            | PrTLC                 | User funds a PrTLC escrow and LP claims funds upon proving that it sent BTC to the user                                                                                                                                                |
| [Bitcoin → Smart chain](./bitcoin-sc-new.md)        | UTXO-controlled vault | Single cooperatively signed bitcoin transaction between LP and user settles both sides of the swap                                                                                                                                     |
| [Bitcoin → Solana (legacy)](./bitcoind-sc-legacy.md) | PrTLC                 | Legacy protocol where the user initiates the creation of a PrTLC on the smart chain (by pulling the funds from the LP), sends BTC to LP's address and watchtower automatically settle the PrTLC after the Bitcoin transaction confirms |

## Bitcoin Lightning (L2) swaps

Lightning swaps use the Lightning Network for faster, cheaper transfers. They leverage [HTLCs](../core-primitives/htlc.md) to atomically link Lightning payments with smart chain contract state.

| Swap | Primitive            | Description                                                                                                                                                                                                                                          |
|------|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Smart chain → Lightning](./sc-lightning.md) | HTLC                 | Escrow based swap, where LP requires the knowledge of the secret preimage obtained by paying a lightning network invoice                                                                                                                             |
| [Lightning → Smart chain](./lightning-sc-new.md) | LP-initiated HTLC    | User initiates the lightning network invoice payment, the LP funds an HTLC on the smart chain, user broadcasts the secret preimage over Nostr and watchtowers claim the HTLC on user's behalf while revealing the secret preimage on the smart chain |
| [Lightning → Solana (legacy)](./lightning-sc-legacy.md) | User-inititated HTLC | Legacy protocol where the user initiates the creation of an HTLC on the smart chain (by pulling the funds from the LP) and has to claim the HTLC manually (no watchtowers are used)                                                                  |
