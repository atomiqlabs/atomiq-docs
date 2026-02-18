# Lightning → Solana (legacy)

:::info
This is the legacy protocol only used on Solana, superseded by the [new Lightning → Smart chain swap](./lightning-sc-new.md) on all the other chains, which eliminates the need for users to hold smart chain tokens upfront.
:::

This swap uses an [HTLC](../core-primitives/htlc.md) to receive smart chain tokens via a Lightning payment. The user generates a secret preimage and payment hash, the LP creates a Lightning invoice with that hash, and the payer sends the Lightning payment. The user then locks up LP funds in an HTLC on the smart chain, and subsequently claims it by revealing the secret preimage — which also allows the LP to settle the Lightning payment. Unlike the current protocol, users must have native smart chain token balance in their destination wallet to pay for the initiate and claim transaction, creating a "cold start" barrier for new users.

## Parties

- **User** - has bitcoin lightning network and smart chain wallets and wants to swap bitcoin (on Lightning) to smart chain asset, also needs to have funds on the smart chain to inititate the swap.
- **LP** - handling the swap and providing the liquidity, locks-up smart chain tokens in the HTLC escrow and receives a lightning network payment

## Process

1. **User** generates a secret preimage and uses it to generate a payment hash—i.e. payment hash = sha256(secret)
2. **User** sends an RFQ (request for quote) to the **LP** indicating the requested input (or output) amount of assets, while sending over the payment hash
3. **LP** creates a BOLT11 bitcoin lightning invoice using the **User**-provided payment hash, with the amount specified, then returns it along with the swap fee and bond amount (that the user needs to lockup on the smart chain side to guarantee the execution of the swap after the HTLC is created)
4. **User** reviews the returned fees and checks that the returned lightning invoice uses the correct payment hash, then initiates a lightning network payment to the **LP** via the invoice
5. **LP** receives an incoming lightning network payment from the **User**, but cannot settle it because it doesn't know the secret preimage, yet
6. **User** queries the **LP** to obtain the signed authorization, allowing the **User** to create an HTLC on the smart chain (with the same payment hash) by pulling funds from the **LP**'s balance.
7. **User** sends a transaction creating the HTLC on the Smart chain using the signed **LP** authorization to fund the PrTLC with **LP**'s balance, while the **User** also deposits the slashable bond. The HTLC has the following spend conditions:
   1. Pays the funds to the **User**, if it's able to provide a valid secret that, when hashed produces HTLC payment hash—i.e. payment hash = sha256(secret), the slashable bond is also returned back to the **User**
   2. Returns the funds back to the **LP** after a timeout, along with the slashable bond from the user - as this implies the user didn't execute the swap

:::info
HTLC timeout is determined by the **LP** based on lightning invoice's *min\_cltv\_delta* field - the minimal timeout delta for last lightning network HTLC (last hop of the lightning network payment) as the **LP** needs to have a knowledge of the secret preimage before then to successfully settle the lightning network payment and claim the funds.
:::

### a) Successful swap

> ...the initiation transaction confirms on the smart chain

8. **User** submits a second smart chain transaction that claims the funds from the HTLC escrow by revealing the secret preimage, the slashable bond is also returned back to the **User**
9. **LP** observes this transaction on Solana and uses the revealed *secret S* to settle the lightning network payment.

### b) Failed swap

> ...the HTLC was never claimed by User, hence no secret preimage was revealed

8. **LP** waits till the HTLC timeout and refunds its funds back from the HTLC escrow, keeping the slashable bond originally deposited by the **User**
9. **LP** cancels the incoming lightning network HTLC or lets it expire, this returns the lightning network funds back to the **User**

## Swap sequence diagram

![Legacy Bitcoin Lightning -> Smart chain swap process](/img/frombtcln-diagram.svg)