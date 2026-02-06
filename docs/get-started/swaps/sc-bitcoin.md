# Smart chain → Bitcoin

This swap uses a [PrTLC (proof-time locked contract)](../core-primitives/prtlc.md) to enable trustless swaps from smart chain tokens to on-chain Bitcoin. The user locks tokens in a PrTLC on the smart chain, and the LP claims them by proving — through the [Bitcoin light client](../core-primitives/bitcoin-light-client.md) — that it sent the agreed BTC amount to the recipient's Bitcoin address. If the LP fails to deliver, the user can unilaterally refund after the timelock expires. A cooperative refund path also allows the LP to release the user's funds immediately if the payment cannot be completed, without waiting for the timeout.

## Parties

* **payer** - the one paying in the smart chain token (e.g. SOL on Solana, WBTC on Starknet) and using the LP to do the swap
* **LP node** - handling the swap receives the smart chain token and sends on-chain bitcoin
* **payee** - recipient of the bitcoin on-chain payment

## Process

1. **Payer** queries the **LP node** off-chain, sending the payee's bitcoin address and an amount he wishes to send, **LP node** returns the network fee along with his swap fee needed for the swap and random *nonce N*
2. **Payer** reviews the returned fees and sends a transaction to construct a PrTLC on the Smart chain:

    * paying the funds to **LP node** if he can prove that he sent a pre-agreed amount to payee's address in a bitcoin transaction (tagged with *nonce N* to prevent replay attacks) that has >=3 confirmations
    * refunding the **payer**, but only after *locktime T*
    * refunding the **payer**, but only with a specific message *Mr (refund)* signed by **LP node** (for co-operative close, when payment fails for any reason)

   **NOTE:** If **payer** tries to send same amount to same address twice, even though bitcoin addresses should not be reused this can't be avoided as **payee's** wallet implementation is out of our influence, in this case **LP node** could use the same transaction proof to claim both of the PrTLCs and paying bitcoin transaction just once. To prevent this, it is required that each transaction is tagged with the 7-byte *nonce N* with least significant 3 bytes prefixed with 0xFF being written as *nSequence* field for ALL inputs and rest - 4 most significant bytes being treated as integer, adding 500,000,000 to that integer and writing it as *locktime* field for the transaction.
3. **LP node** observes the creation of PrTLC on the Smart chain and proceeds to send a bitcoin transaction.

### **Successful payment**

4. Transaction confirms on bitcoin chain (has >=6 confirmations) **LP node** proves this via bitcoin relay and claims the funds from the PrTLC

### **Failed payment**

4. The payment was unsuccessful, maybe **LP node** ran out of funds in the meantime, or **LP node** thinks it's not possible to safely send the transaction with pre-agreed fee and have it confirm in under *locktime T*.
5. Upon request by **payer**, **LP node** creates a specific signed message *Mr (refund)*, allowing the **payer** to refund his funds from the PTLC (cooperative close)

### **LP node went offline**

4. **Payer** waits till the expiry of *locktime T* and then refunds his funds back from the PrTLC

## Swap Flow Diagram

![Smart chain -> Bitcoin on-chain swap process (Intermediary = LP Node)](https://github.com/adambor/SolLightning-readme/raw/main/flows/tobtc-diagram.drawio.png)