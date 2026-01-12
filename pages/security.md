# Security

Security of atomiq.exchange is based on the concept of atomic swaps.

Atomic swaps are implemented in the form of smart contract vaults on the Smart chains (Solana, Starknet, EVM, etc.), such that they only pay out the escrowed funds when the counterparty proves that they really sent a bitcoin/lightning transaction. In case of non-cooperation the funds are returned to their original owner in a few days.

Atomicity of the swaps is ensured by [submarine swaps](https://docs.atomiq.exchange/submarine-swaps-lightning) (for lightning network swaps) & [bitcoin light client](https://docs.atomiq.exchange/bitcoin-light-client-on-chain) (for bitcoin on-chain swaps).

## Example

In the following example we have a **wallet #1** swapping *SOL* to *BTC* received by **wallet #2**. **Liquidity provider node** acts as a counterparty for this swap, receiving *SOL* from **wallet #1** and paying out to **wallet #2** in *BTC*. Smart contract vault makes sure that Liquidity provider node can take the *SOL* from the vault only and only if it successfully pays out the *BTC* to **wallet #2**.

<figure><img src="https://3413090771-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQKYJLT6LdI5sTgcaMspD%2Fuploads%2Ff4CMVF65VxFjkrPzw4DD%2Fatomiq%20working%20principle.png?alt=media&#x26;token=7c932e13-d04d-4f15-bd2f-3971856cf3ae" alt=""><figcaption><p>Successful SOL -> BTC swap via atomiq.exchange</p></figcaption></figure>

In case **Liquidity provider node** doesn't cooperate the funds will be returned back to the **wallet #1** after a timeout, and **Liquidity provider node's** reputation will decrease.

<figure><img src="https://3413090771-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQKYJLT6LdI5sTgcaMspD%2Fuploads%2FtAqoSKmpGRIRA8kCMjnL%2Fatomiq%20notworking%20principle.png?alt=media&#x26;token=91b2ad08-87df-4b8b-8a62-77330a7c3aa0" alt=""><figcaption><p>Failed SOL -> BTC swap via atomiq.exchange</p></figcaption></figure>