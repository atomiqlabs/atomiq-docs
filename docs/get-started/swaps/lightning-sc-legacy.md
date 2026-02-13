# Lightning → Solana (legacy)

:::info
This is the legacy protocol, superseded by the [new Lightning → Smart chain swap](./lightning-sc-new.md) which eliminates the need for users to hold smart chain tokens upfront.
:::

This swap uses an [HTLC](../core-primitives/htlc.md) to receive Solana tokens via a Lightning payment. The user generates a secret and payment hash, the LP creates a Lightning invoice with that hash, and the payer sends the Lightning payment. The LP then locks an HTLC on Solana, and the user claims it by revealing the secret — which also allows the LP to settle the Lightning payment. Unlike the current protocol, users must have SOL in their wallet to pay for the claim transaction, creating a "cold start" barrier for new users.

## Requirements

* lightning invoice has to have a fixed amount
* payee needs to have some SOL in their wallet upfront to cover Solana transaction fees

## Parties

* **payee** - recipient of the Solana token, using the LP to do the swap
* **LP node** - handling the swap, sends the Solana token and receives lightning network payment
* **payer** - the one paying on bitcoin lightning network

## Process

1. **Payee** creates a *secret S* and *payment hash P* that is produced by *hash of secret H(S)*
2. **Payee** queries the **LP node** off-chain, with *payment hash P* and an amount he wishes the receive, **LP node** creates a bitcoin lightning invoice using *payment hash P*, with the amount specified and returns it to **payee**
3. **Payee** sends this lightning invoice to the **payer**
4. **LP node** receives an incoming lightning network payment from **payer**, but cannot settle it because **LP node** doesn't know *secret S* yet.
5. **Payee** queries the **LP node** off-chain to obtain a specific message *Mi (initialize)* signed by **LP node** allowing payee to create an HTLC on Solana with funds pulled from **LP node's** vault, an HTLC is constructed:

    * paying the funds to **payee** if he can supply a valid *secret S*, such that *hash of secret H(S)* is equal to *payment hash P*, but only until a specific time in the future - *locktime T*
    * refunding the **payer**, but only after *locktime T*

   **NOTE:** *locktime T* is determined by **LP node** based on lightning invoice's *min\_cltv\_delta* - the minimal timeout delta for last lightning network HTLC in chain (last hop of the lightning network payment) as **LP node** needs to have a knowledge of *secret S* before then to successfully receive a payment

### **Successful payment**

6. Upon confirmation of HTLC creation's transaction on Solana, **payee** submits a second transaction revealing the *secret S* and claiming the funds from HTLC
7. **LP node** observes this transaction on Solana and uses the revealed *secret S* to settle the lightning network payment.

### **Payee went offline**

6. **LP node** waits till the expiry of *locktime T* and then refunds his funds back from the HTLC

## Diagram

![Bitcoin Lightning -> Smart chain swap process (Intermediary = LP Node, Smart chain = Solana)](/img/frombtcln-diagram.svg)