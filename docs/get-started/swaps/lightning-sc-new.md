# Lightning → Smart chain

The new swap protocol addresses the drawback of the legacy one, mainly around user UX and the "cold start" problem - inability to onboard users onto the smart chain without them holding smart chain tokens first. This is accomplished by letting the LP node create the HTLC and offloading the HTLC claiming to external incentivized watchtowers, which listen to swap secrets over [Nostr](https://nostr.com/).

## Requirements

* lightning invoice has to have a fixed amount

## Parties

* **payee** - recipient of the smart chain token (e.g. WBTC on Starknet, BTC on Botanix), using the LP to do the swap
* **LP node** - handling the swap, sends the smart chain token and receives lightning network payment
* **payer** - the one paying on bitcoin lightning network
* **watchtower** - registers swaps, listens to swap secrets over **Nostr** and claims the swap on behalf of the user, while earning the watchtower fee

## Process

1. **Payee** creates a *secret S* and *payment hash P* that is produced by *hash of secret H(S)*
2. **Payee** queries the **LP node** off-chain, with *payment hash P* and an amount he wishes the receive + his desired watchtower fee, **LP node** creates a bitcoin lightning invoice using *payment hash P*, with the amount specified and returns it to **payee**
3. **Payee** sends this lightning invoice to the **payer**
4. **LP node** receives an incoming lightning network payment from **payer**, but cannot settle it because **LP node** doesn't know *secret S* yet.
5. **LP node** funds an HTLC on the Smart chain, the HTLC is constructed such that:
    * paying the funds to **payee** if a valid *secret S* is provided, such that *hash of secret H(S)* is equal to *payment hash P* & pays out the watchtower fee to whoever executes the claim transaction
    * refunding the **payer**, but only after *locktime T*

:::info
*locktime T* is determined by **LP node** based on lightning invoice's *min\_cltv\_delta* - the minimal timeout delta for last lightning network HTLC in chain (last hop of the lightning network payment) as **LP node** needs to have a knowledge of *secret S* before then to successfully receive a payment
:::

6. **Watchtower** observes the HTLC created on the Smart chain and registers it internally for claiming

### **Successful payment**

7. Upon confirmation of HTLC creation's transaction on the Smart chain, **payee** first verifies that it fits the agreed-to conditions (amount, watchtower fees, etc.) and then broadcasts the *secret S* over **Nostr**
8. **Watchtower** will observe the **Nostr** message, construct an HTLC claim transaction, broadcasts it, claiming the funds from the HTLC to the **payee** & claiming the watchtower fee

:::info
If no watchtower claims on behalf of the user, the user can always claim by himself!
:::

9. **LP node** observes this transaction on the Smart chain and uses the revealed *secret S* to settle the lightning network payment.

### **Payee went offline**

7. **LP node** waits till the expiry of *locktime T* and then refunds his funds back from the HTLC

## Diagram

![Bitcoin Lightning -> Smart chain swap process (Intermediary = LP Node)](https://3413090771-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQKYJLT6LdI5sTgcaMspD%2Fuploads%2FdvZRcSxefJ0stELFmsn5%2Fnostr-frombtcln-diagram.drawio.png?alt=media&token=d267eabd-97d4-4d74-88f4-f1a4e1e0cc80)