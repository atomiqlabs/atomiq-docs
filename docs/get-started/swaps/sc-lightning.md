# Smart chain → Lightning

This swap enables paying a Lightning Network invoice using smart chain tokens. It works by linking a Lightning payment to an on-chain [HTLC](../core-primitives/htlc.md): the user locks tokens in an HTLC on the smart chain using the Lightning invoice's payment hash, and the LP attempts to route the Lightning payment. When the payee settles the invoice they reveal the hash preimage (secret), which the LP then uses to claim the locked tokens from the HTLC. If the payment fails, the LP can cooperatively refund the user immediately, or the user can self-refund after the timelock expires.

## Requirements

* lightning invoice's payment *hash P* needs to be known upfront
* lightning invoice has to have a fixed amount
* payee needs to be online at the time of payment

## Parties

* **payer** - the one paying in the smart chain token (e.g. SOL on Solana, WBTC on Starknet) and using the LP to do the swap
* **LP node** - handling the swap, receives the smart chain token and sends lightning network payment
* **payee** - recipient of the lightning network payment

## Process

1. **Payee** creates a regular bitcoin lightning invoice with fixed amount and sends it to the **payer** (this invoice contains the payment hash P)
2. **Payer** queries the **LP node** off-chain, sending the lightning invoice and desired locktime T, **LP node** tries to probe for the route of the payment and returns its confidence score (how likely **LP node** thinks that the payment will succeed) along with its fee and details the **payer** needs to construct a HTLC on-chain
3. **Payer** reviews the returned confidence score + fee and sends a transaction to construct an HTLC on the Smart chain:

    * paying the funds to **LP node** if he can supply a valid *secret S*, such that *hash of secret H(S)* is equal to *payment hash P*, but only until a specific time in the future - *locktime T*
    * refunding the **payer**, but only after *locktime T*
    * refunding the **payer**, but only with a specific message *Mr (refund)* signed by **LP node** (for co-operative close, when payment fails)

   **NOTE:** *locktime T* is determined by the **payer** and is a trade-off between likelihood of payment being successful and locking the funds for shorter periods in case of **LP node's** non-cooperativeness.

    * Larger locktime means more payment paths can be considered (more hops on the lightning network), increases the likelihood of payment being successfully routed, but will also lead to longer lock periods when **intermediary** is non-cooperative.
    * Smaller locktime means less payment paths can be considered (less hops on the lightning network) and increases the likelihood of payment routing failures, but will also lead to shorter lock periods when **intermediary** is non-cooperative
4. **LP node** observes the creation of HTLC on the Smart chain and proceeds to attempt a payment of the lightning invoice.

### **Successful payment**

5. **Payee** reveals a *secret S* to intermediary in order to accept the payment of the lighting invoice.
6. **LP node** uses the knowledge of *secret S* to obtain the funds from the HTLC on the Smart chain and swap is finished.

### **Failed payment**

5. The payment was unsuccessful, so **payee** did not reveal a *secret S* to the **LP node**.
6. Upon request by **payer**, **LP node** creates a specific signed message *Mr (refund)*, allowing the **payer** to refund his funds from the HTLC

### **LP node went offline**

5. **Payer** waits till the expiry of *locktime T* and then refunds his funds back from the HTLC

## Diagram

![Smart chain-> Bitcoin Lightning swap process (Intermediary = LP Node)](/img/tobtcln-diagram.svg)