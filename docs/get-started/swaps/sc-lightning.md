# Smart chain → Lightning

This swap enables paying a Lightning Network invoice using smart chain (Solana, Starknet, EVM) tokens. It works by linking a Lightning payment to an on-chain [HTLC](../core-primitives/htlc.md) escrow: the user locks tokens in an HTLC on the smart chain using the Lightning invoice's payment hash, and the LP attempts to route and pay the Lightning payment. When the recipient settles the invoice they reveal the hash preimage (secret), which the LP then uses to claim the funds from the HTLC escrow. If the payment fails, the LP can cooperatively refund the user immediately, or the user can self-refund after the timelock expires.

## Requirements

* Lightning network invoice (BOLT11) has to have a fixed amount
* Lightning network payment recipient needs to be online at the time of payment

## Parties

* **User** - has smart chain wallet and wants to swap smart chain token (e.g. SOL on Solana, WBTC on Starknet) to lightning
* **LP** - handling the swap and providing the liquidity, sends the lightning network payment and receives funds from the HTLC escrow
* **Recipient** - recipient of the lightning network payment, can be the **User**, but also any other party which the **User** wishes to pay over the lightning network, only needs to provide a standard BOLT11 lightning network invoice

## Process

1. **Recipient** creates a standard lightning network invoice with fixed amount—generated a secret preimage and used its hash to generate the BOLT11 invoice
2. **User** sends an RFQ (request for quote) to the **LP** indicating the to be paid lightning network invoice
3. **LP** checks whether the lightning network invoice is payable by probing its destination and returns the swap fee and lightning network routing fee along with the signed authorization allowing the **User** to initiate the HTLC escrow on the smart chain
4. **User** reviews the returned fees and sends a transaction to construct an HTLC on the Smart chain with the same payment hash as the lightning network invoice. The HTLC has the following spend conditions:
   1. Pays the funds to the **LP**, if it's able to provide a valid secret that, when hashed produces HTLC payment hash—i.e. payment hash = sha256(secret)
   2. Returns the funds back to the **User** after a timeout
   3. Returns the funds back to the **User**, upon verifying a refund authorization signed by the **LP**—this allows an instant co-operative refund

:::info
HTLC timeout is determined by the **User** and is a trade-off between likelihood of payment being successful and locking the funds for shorter periods in case the **LP** becomes unresponsive.

- Larger timeout means more payment paths can be considered (more hops on the lightning network), increases the likelihood of payment being successfully routed, but will also lead to longer lock periods when **LP** is unresponsive
- Smaller timeout means less payment paths can be considered (less hops on the lightning network) and increases the likelihood of payment routing failures, but will also lead to shorter lock periods when **LP** is unresponsive
:::

5. **LP** observes the creation of the HTLC on the Smart chain and proceeds to attempt a payment of the lightning network invoice

### a) Successful swap

6. **Recipient** receives the lightning network payment and settles it by revealing the secret preimage
7. **LP** claims the escrowed funds from the HTLC using the secret preimage

### b) Failed swap

6. The payment was unsuccessful—**Recipient** did not reveal the secret preimage
7. **User** sends a request to the **LP**, the **LP** returns a signed refund message, that allows the **User** to refund the HTLC before a timeout (cooperative close)
8. **User** uses the signed refund message to refund its funds from the HTLC before a timeout

### c) LP went offline

6. **User** waits until the timeout and then refunds its funds back from the HTLC

## Swap sequence diagram

![Smart chain-> Bitcoin Lightning swap process](/img/tobtcln-diagram.svg)