# Bitcoin → Smart chains

This is the current protocol for swapping on-chain Bitcoin to smart chain tokens. It uses the [UTXO-controlled vault](../core-primitives/utxo-controlled-vault.md) primitive, where the LP deposits liquidity into a vault on the smart chain whose withdrawals are controlled by Bitcoin transactions (verified through the [Bitcoin light client](../core-primitives/bitcoin-light-client.md)). The user and LP cooperatively sign a single Bitcoin transaction that atomically sends BTC to the LP and authorizes the smart chain payout to the user. Unlike the [legacy PrTLC-based approach](./bitcoind-sc-legacy.md), users don't need any smart chain balance upfront, the LP doesn't lock funds per-swap, and watchtowers are a UX convenience rather than a security requirement.

The LP (liquidity provider) creates a UTXO-controlled vault on the smart chain, and uses a small (dust) UTXO that he owns as the initial UTXO. It's important to note that setting up the UTXO-controlled vault is not done on a per-swap basis and is instead done just once when the LP sets up their LP node.

User and LP can then cooperatively construct and sign a single Bitcoin transaction (PSBT) that atomically (in a single transaction):

- **Spends** the vault's current UTXO
- **Sends** BTC from the user's inputs to the LP's wallet
- **Encodes** the withdrawal data (recipient, amount, watchtower reward) in an `OP_RETURN` output

Both parties sign with `SIGHASH_ALL`, committing to the full transaction — so it either confirms as-is (both sides get their assets) or doesn't confirm at all (nothing happens). This makes the swap atomic at the Bitcoin protocol level, without requiring any escrow contract or timelock.

Once the transaction gets enough confirmations, anyone (a [watchtower](/overview/actors#watchtower), the LP, or the user themselves) can submit the transaction data to the smart chain, where the vault verifies it through the light client and pays out the tokens to the user. Watchtowers earn a small reward for this service, but they are purely a UX convenience — the user can always claim independently.

![Diagram showcasing a UTXO-controlled vault based Bitcoin -> Smart chain swap](/img/utxo-swap-diagram.svg)

## Liquidity fronting

In case users want to get their funds sooner than the confirmations required in the vault, they can specify a fronting fee/tip in the additional transaction data. The liquidity fronters can then process the swaps sooner (sending the assets to the user) - e.g. with the btc transaction having just 1 confirmation, and later reclaim the value they fronted (+ fronting fee) from the vault - e.g. when the bitcoin transaction gains 3 confirmations.

:::info
Liquidity fronting is not yet available on mainnet nor testnet
:::

## Parties

- **User** - has bitcoin and smart chain wallets and wants to swap bitcoin to smart chain asset
- **LP** - handling the swap and providing the liquidity, needs to have a deposit only vault set up on the smart chain
- **Watchtower** - submitting the bitcoin transaction data on the smart chain on behalf of the user
- **Liquidity fronter** - fronting the liquidity for swaps

## Process

1. **User** sends an RFQ (request for quote) to the **LP** indicating the requested input (or output) amount of assets
2. **LP** constructs a PSBT (not signed yet) spending the latest vault UTXO, and adds 3 outputs:
    1. Small (dust) output as a next vault UTXO
    2. OP\_RETURN data specifying the output amount and recipient
    3. Output to LP's wallet with the swap's input amount
3. **User** verifies the returned PSBT:
    1. Validly spends latest vault UTXO and that UTXO is unspent
    2. Specifies the correct (i.e. requested) output amount and recipient in the OP\_RETURN data
    3. Sends the expected BTC amount to the LP's wallet
    4. There is still enough balance in the vault on the smart chain to honor this swap
4. **User** then adds his own input UTXOs to fund the transaction (user is also expected to cover the transaction fee), and optionally also adds a change output
5. **User** signs this adjusted PSBT and sends it to the **LP**
6. **LP** re-verifies that the user hasn't changed any of the **LP** specified outputs and inputs
7. **LP** signs the transaction and broadcasts it to the bitcoin network&#x20;

#### a) With liquidity fronting

> ...the transaction confirms on the bitcoin network, but doesn't get enough confirmations to be eligible for vault withdrawal yet (i.e. gets 1 confirmation)

8. A **Liquidity fronter** fronts the liquidity (minus the fronting fee) through the smart contract to the **User**, the smart contract saves this fact and later redirects the claim to the **Liquidity fronter**

> ...the transaction now gets enough confirmations to be eligible for vault withdrawal (i.e. gets 3 confirmations)

9. A **Liquidity fronter** submits the bitcoin transaction data to smart chain, where it's verified and the output amount is paid out to the **Liquidity fronter**

#### b) Without liquidity fronting

> ...the transaction confirms on the bitcoin network and gets required number of confirmations

9. A **User**, **LP** or **Watchtower** submits the bitcoin transaction data to smart chain, where it's verified and the output amount is paid out from the vault to the **User**. Whoever submits the data gets the watchtower reward - if specified in the transaction data (i.e. can also be set to 0).

## Swap sequence diagram

![UTXO-controlled vault based Bitcoin -> Smart chain flow diagram](/img/frombtc-new-swap-flow-diagram.svg)