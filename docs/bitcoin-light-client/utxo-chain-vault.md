# UTXO-chain vault

A primitive that is used in the new swap design for Bitcoin -> Smart chain swaps & eliminates the drawbacks of the legacy PrTLC-based Bitcoin -> Smart chain swaps. UTXO-chain vaults enable atomic cross-chain swaps without the LP having to pre-lock liquidity.

The concept is based on a vault on top of the smart chains, where withdrawals from the vault are authorized by bitcoin transactions (as verified through the on-chain bitcoin light client).

### Deposit only vault

As the name implies, the owner of the vault can only deposit tokens to it directly on the smart chain. Withdrawals from the vault are handled purely with bitcoin transactions of a specific format.

A trivial (but insecure) solution would be to design a vault in such a way that it requires BTC sent to a specific wallet address (a specific locking script) on bitcoin. The user will then be able to get the same amount of the asset on the smart chain. This is however insecure, since the user cannot be sure that when his transaction confirms on BTC there still are enough funds available in the vault (i.e. someone else can front-run his bitcoin transaction, with one draining all the funds from the vault).

### Sequencing with UTXO chaining

To prevent front-running there is a need to have a well-defined ordering of transactions withdrawing funds from the vault, such that users can be sure that there is still enough funds in the vault to make them whole. We accomplish this by referencing a specific bitcoin UTXO in the vault, such that the next transaction withdrawing funds from the vault needs to include this UTXO in its transaction inputs - this ensures there could only ever be a single update to the vault's state. The vault also specifies how many bitcoin confirmations are considered final and only accepts state updates from those transactions.

<figure><img src="https://3413090771-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQKYJLT6LdI5sTgcaMspD%2Fuploads%2Fy4zeRu3MYp0nTjDFi863%2Fnew%20swap%20design%20double%20spend%20try.drawio.png?alt=media&#x26;token=e49692b6-8f0b-430e-83fd-8219b451ebfa" alt=""><figcaption><p>Diagram showing that double-spending of UTXO is impossible</p></figcaption></figure>

To make sure this construction can be used multiple times we make the bitcoin UTXO of the vault dynamic, such that it always updates to the first output of the withdrawal transaction. This allows us to chain the UTXOs indefinitely, ensuring a clear order of swaps.

<figure><img src="https://3413090771-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQKYJLT6LdI5sTgcaMspD%2Fuploads%2FqsFHC34H0e3mdK5MmjtU%2Fnew%20swap%20design.drawio.png?alt=media&#x26;token=7a327867-efc7-41e9-8e57-1874dd432cc6" alt=""><figcaption><p>Diagram showcasing updating of vault UTXO</p></figcaption></figure>