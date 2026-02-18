# Smart chain → Bitcoin

This swap uses a [PrTLC (proof-time locked contract)](../core-primitives/prtlc.md) to enable trustless swaps from smart chain tokens to on-chain Bitcoin. The user locks tokens in a PrTLC on the smart chain, and the LP claims them by proving — through the [Bitcoin light client](../core-primitives/bitcoin-light-client.md) — that it sent the agreed BTC amount to the recipient's Bitcoin address. If the LP fails to deliver, the user can unilaterally refund after the timelock expires. A cooperative refund path also allows the LP to release the user's funds immediately if the payment cannot be completed, without waiting for the timeout.

## Parties

* **User** - has smart chain and bitcoin wallets and wants to swap smart chain token (e.g. SOL on Solana, WBTC on Starknet) to bitcoin
* **LP** - handling the swap and providing the liquidity, sends a Bitcoin on-chain payment and receives funds from the PrTLC escrow

## Process

1. **User** sends an RFQ (request for quote) to the **LP** indicating the requested input (or output) amount of assets, and the bitcoin address to receive the BTC at. Also sends a unique nonce that will be used to tag the bitcoin transaction and prevent replay attacks
2. **LP** returns the swap fee and Bitcoin network fee along with the signed authorization allowing the **User** to initiate the PrTLC escrow
3. **User** reviews the returned fees and sends a transaction to construct a PrTLC on the Smart chain. The PrTLC has the following spend conditions:
    1. Pays the funds to the **LP**, upon verifying a Bitcoin transaction (via the light client) that sends the exact pre-agreed amount of BTC to the **User**'s bitcoin address and is tagged with the nonce provided by the **User** to prevent replay attacks
    2. Returns the funds back to the **User** after a timeout
    3. Returns the funds back to the **User**, upon verifying a refund authorization signed by the **LP**—this allows an instant co-operative refund

:::info
The **User** needs to make sure that the **LP** cannot use an already existing bitcoin transaction to claim funds from the PrTLC escrow—i.e. if the user already received 1 BTC to its address, and initiates the swap of 1 BTC, the LP could use the already existing Bitcoin transaction to claim the funds from the PrTLC escrow. To prevent this, it is required that each Bitcoin transaction is tagged with a random 7-byte nonce (provided by the **User**), where:
- 3 least significant bytes prefixed with 0xFF are being used as the *nSequence* field for ALL transaction inputs
- 4 most significant bytes being treated as integer, adding `500,000,000` to that integer and using it as *locktime* field for the transaction.

The PrTLC escrow asserts that the Bitcoin transaction uses the pre-agreed to nonce by parsing the *nSequence* and *locktime* fields.
:::

### c) Successful swap

4. **LP** observes the creation of PrTLC on the Smart chain and proceeds to send a Bitcoin transaction, paying out BTC funds to the **User**

> ...the transaction confirms on the bitcoin network and gets required number of confirmations

5. **LP** submits the Bitcoin transaction data to smart chain, where it's verified and the escrowed funds are paid out to the **LP**

### b) Failed swap

4. **LP** is unable to send the Bitcoin transaction to the **User**—e.g. **LP** ran out of funds in the meantime
5. **User** sends a request to the **LP**, the **LP** returns a signed refund message, that allows the **User** to refund the PrTLC before a timeout (cooperative close)
6. **User** uses the signed refund message to refund its funds from the PrTLC before a timeout

### c) LP went offline

> ...LP is unresponsive

4. **User** waits until the timeout and then refunds its funds back from the PrTLC

## Swap sequence diagram

![Smart chain -> Bitcoin on-chain swap process](/img/tobtc-diagram.svg)