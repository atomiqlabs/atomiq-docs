# Swaps

Atomiq enables trustless cross-chain swaps between Bitcoin and smart chains (Solana, Starknet, etc.) through an RFQ (Request for Quote) model where Liquidity Provider (LP) nodes facilitate the exchange. Swaps are secured by on-chain contracts - no custody or trust required.

There are two categories of swaps depending on which Bitcoin layer is used:

## Bitcoin On-chain (L1)

On-chain swaps interact directly with the Bitcoin base layer. They use the [Bitcoin light client](../core-primitives/bitcoin-light-client.md) to verify Bitcoin transactions on the smart chain, secured by [PrTLCs](../core-primitives/prtlc.md) and [UTXO-chain vaults](../core-primitives/utxo-chain-vault.md).

| Swap | Description |
|------|-------------|
| [Smart chain -> Bitcoin](./sc-bitcoin.md) | Send smart chain tokens, receive on-chain BTC |
| [Bitcoin -> Smart chain](./bitcoin-sc-new.md) | Send on-chain BTC, receive smart chain tokens (current protocol using UTXO-chain vaults) |
| [Bitcoin -> Solana (legacy)](./bitcoind-sc-legacy.md) | Legacy protocol for on-chain BTC to Solana swaps using PrTLCs |

## Bitcoin Lightning (L2)

Lightning swaps use the Lightning Network for faster, cheaper transfers. They leverage [HTLCs](../core-primitives/htlc.md) to atomically link Lightning payments with smart chain contract state.

| Swap | Description |
|------|-------------|
| [Smart chain -> Lightning](./sc-lightning.md) | Send smart chain tokens, receive a Lightning payment |
| [Lightning -> Smart chain](./lightning-sc-new.md) | Send a Lightning payment, receive smart chain tokens (current protocol using watchtowers + Nostr) |
| [Lightning -> Solana (legacy)](./lightning-sc-legacy.md) | Legacy protocol for Lightning to Solana swaps |
