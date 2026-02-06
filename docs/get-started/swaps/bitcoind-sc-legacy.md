# Bitcoin → Solana (legacy)

## Requirements

* amount of BTC to receive must be known upfront

## Parties

* **payee** - recipient of the solana/spl token, using intermediary to do the swap
* **LP node** - handling the swap, sends solana or spl token and receives bitcoin on-chain payment
* **payer** - the one paying bitcoin on-chain
* **watchtower** - claiming the tokens to claimer's account, on claimer's behalf and earning a small fee for their service

## Process

1. **Payee** queries the **LP node** off-chain, with an amount he wishes the receive and *locktime T* he wishes to use, **LP node** returns his swap fee needed for a swap along with a specific message *Mi (initialize)* signed by **LP node** allowing payee to create a PTLC on Solana with funds pulled from **LP node's** vault. **LP node** is also charging a non-refundable fee based on *locktime T* to disincetivize spamming.
2. **Payee** reviews the returned fee and sends a transaction creating PTLC on Solana using message *Mi (initialize)* signed by **LP node** to pull funds from his vault:

    * paying the funds to **payee** if he can prove that a pre-agreed amount was sent to **LP node's** address in a bitcoin transaction that has >=6 confirmations
    * refunding the **LP node**, but only after *locktime T*

   **NOTE:** Here the replay protection needs to be handled by the **LP node** who needs to make sure to generate a new address for every swap (if he doesn't, he is the one losing money), as we cannot possibly influence fields such as *nSequence* and *locktime* in bitcoin transaction sent by payer because his wallet implementation is outside our influence.

### **Successful payment**

3. Transaction confirms on bitcoin chain (has >=6 confirmations) **payee/watchtower** proves this via bitcoin relay and claims the funds from the PTLC to **payee's** account

### **Failed payment**

3. No payment arrived in **LP node's** wallet address until the *locktime T*, therefore **LP node** can refund his funds back from the PTLC, keeping the non-refundable fee

## Diagram

![Bitcoin on-chain -> Solana swap process (Intermediary = LP Node, Smart chain = Solana)](https://github.com/adambor/SolLightning-readme/raw/main/flows/frombtc-diagram.drawio.png)