# Lightning → Smart chain

This is the current protocol for receiving smart chain tokens via a Lightning payment. It uses an [HTLC](../core-primitives/htlc.md) created by the LP on the smart chain, solving the "cold start" problem of the [legacy approach](./lightning-sc-legacy.md) — users don't need any smart chain balance to receive funds. After the LP locks the HTLC, the user broadcasts the payment secret over [Nostr](https://github.com/nostr-protocol/nostr), and incentivized watchtowers claim the funds on the user's behalf, earning a small fee. The user can always self-claim as a fallback.

The new swap protocol addresses the drawback of the legacy one, mainly around user UX and the "cold start" problem - inability to onboard users onto the smart chain without them holding smart chain tokens first. This is accomplished by letting the LP initiate the HTLC on the smart chain side and leveraging watchtowers to settle the HTLC.

## Parties

- **User** - has bitcoin lightning network and smart chain wallets and wants to swap bitcoin (on Lightning) to smart chain asset, also needs to have funds on the smart chain to inititate the swap.
- **LP** - handling the swap and providing the liquidity, locks-up smart chain tokens in the HTLC escrow and receives a lightning network payment
- **Watchtower** - registers swaps, listens to swap secrets over **Nostr** and claims the swap on behalf of the user, while earning the watchtower reward

## Process


1. **User** generates a secret preimage and uses it to generate a payment hash—i.e. payment hash = sha256(secret)
2. **User** sends an RFQ (request for quote) to the **LP** indicating the requested input (or output) amount of assets and a watchtower reward (this will be funded by the **LP** and taken from the swap amount), while sending over the payment hash
3. **LP** creates a BOLT11 bitcoin lightning invoice using the **User**-provided payment hash, with the amount specified, then returns it along with the swap fee
4. **User** reviews the returned fees and checks that the returned lightning invoice uses the correct payment hash, then initiates a lightning network payment to the **LP** via the invoice
5. **LP** receives an incoming lightning network payment from the **User**, but cannot settle it because it doesn't know the secret preimage, yet
6. **LP** funds an HTLC on the Smart chain, the HTLC has the following spend conditions:
   1. Pays the funds to the **User**, if it's able to provide a valid secret that, when hashed produces HTLC payment hash—i.e. payment hash = sha256(secret)
   2. Returns the funds back to the **LP** after a timeout

:::info
HTLC timeout is determined by the **LP** based on lightning invoice's *min\_cltv\_delta* field - the minimal timeout delta for last lightning network HTLC (last hop of the lightning network payment) as the **LP** needs to have a knowledge of the secret preimage before then to successfully settle the lightning network payment and claim the funds.
:::

> ...the initiation transaction confirms on the smart chain

7. **Watchtower** observes the HTLC created on the Smart chain and registers it internally

### a) Successful swap

8. **User** verifies that the created HTLC on the smart chain fits the agreed-to conditions (amount, watchtower fees, etc.) and then broadcasts the secret preimage over **Nostr**
9. **Watchtower** will observe the **Nostr** message and submit an HTLC claim transaction on the smart chain, claiming the funds from the HTLC to the **User** and receiving the watchtower fee

:::info
If no watchtower claims on behalf of the user, the user can always claim by itself!
:::

10. **LP** observes the transaction settling the HTLC on the Smart chain and uses the revealed secret preimage to settle the lightning network payment

### b) Failed swap

> ...the HTLC was never claimed, hence no secret preimage was revealed

8. **LP** waits till the HTLC timeout and refunds its funds back from the HTLC escrow
9. **LP** lets the incoming lightning network HTLC expire, this returns the lightning network funds back to the **User** after a delay

## Swap sequence diagram

![Bitcoin Lightning -> Smart chain swap process](/img/nostr-frombtcln-diagram.svg)
