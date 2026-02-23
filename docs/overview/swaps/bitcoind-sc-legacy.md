# Bitcoin → Solana (legacy)

:::info
This is the legacy protocol only used on Solana, superseded by the [UTXO-controlled vault based Bitcoin → Smart chain swap](./bitcoin-sc-new.md) on all the other chains which eliminates the cold-start problem and watchtower dependency.
:::

This swap uses a [PrTLC](../core-primitives/prtlc.md) in the reverse direction: the LP locks tokens on the smart chain, and the user sends BTC on-chain. A watchtower (or the user) then proves the Bitcoin payment through the [Bitcoin light client](../core-primitives/bitcoin-light-client.md) and claims the smart chain tokens. Because the user must post a bond and needs an existing smart chain balance to initiate the swap, this approach suffers from the "cold start" problem — users cannot onboard without already holding smart chain tokens.

## Parties

- **User** - has bitcoin and smart chain wallets and wants to swap bitcoin to smart chain asset, also needs to have funds on the smart chain to inititate the swap.
- **LP** - handling the swap and providing the liquidity, locks-up smart chain tokens in the PrTLC escrow and receives a Bitcoin on-chain payment
- **Watchtower** - submitting the bitcoin transaction data on the smart chain on behalf of the user, while earning the watchtower fee

## Process

1. **User** sends an RFQ (request for quote) to the **LP** indicating the requested input (or output) amount of assets
2. **LP** responds with the swap fees, bond amount (that the user needs to lockup on the smart chain side to guarantee the execution of the swap) and the signed authorization, allowing the **User** to create a PrTLC on the smart chain by pulling funds from the **LP**'s balance
3. **User** reviews the returned fee and sends a transaction creating the PrTLC on the Smart chain using the signed **LP** authorization to fund the PrTLC with **LP**'s balance, while the **User** also deposits the slashable bond and watchtower reward. The PrTLC has the following spend conditions:
   1. Pays the funds to the **User**, upon verifying a Bitcoin transaction (via the light client) that sends the exact pre-agreed amount of BTC to the **LP**'s Bitcoin address, the slashable bond is returned back to the **User** and watchtower reward is paid to the caller (an entity that sent the transaction to settle the PrTLC)
   2. Returns the funds back to the **LP** after a timeout, along with the slashable bond from the user - as this implies the user didn't execute the swap
   
:::info
The **LP** needs to make sure to not use the same Bitcoin address for multiple swaps, as this might lead to the **User** using the same transaction to claim funds from multiple PrTLC escrows. Therefore, the **LP** has to generate a new unique Bitcoin address for every swap (e.g. via Hierarchical Deterministic - HD wallets).
:::

### a) Successful swap

> ...the initiation transaction confirms on the smart chain

4. **User** sends the Bitcoin transaction, sending an exact amount of BTC to the **LP**'s bitcoin address

> ...the transaction confirms on the bitcoin network and gets required number of confirmations

5. A **User** or **Watchtower** submits the Bitcoin transaction data to smart chain, where it's verified and the output amount along with the slashable bond is paid out from the PrTLC escrow to the **User**. Whoever submits the data gets the watchtower reward (initially deposited by the **User** on the smart chain)

### b) Failed swap

4. No payment arrived in **LP**'s bitcoin address until the timeout, therefore **LP** refunds its funds back from the PrTLC escrow, keeping the slashable bond originally deposited by the **User**

## Swap sequence diagram

![Legacy Bitcoin on-chain -> Solana swap process](/img/frombtc-diagram.svg)