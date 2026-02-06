# UTXO-controlled vault

A smart contract vault on the smart chain whose state is controlled by Bitcoin transactions. The LP deposits liquidity into the vault, and withdrawals are authorized exclusively by Bitcoin transactions — verified through the on-chain [Bitcoin light client](./bitcoin-light-client.md). The vault imports Bitcoin's deterministic UTXO ordering onto the smart chain, preventing front-running and guaranteeing each user's position in the withdrawal queue.

This primitive is used for [Bitcoin → Smart chain swaps](../swaps/bitcoin-sc-new.md) and eliminates the key drawbacks of the legacy [PrTLC](./prtlc.md)-based approach: users don't need smart chain tokens upfront (no "cold start" problem), LPs don't lock funds per-swap, and there is no timeout or watchtower dependency for security.

### Sequencing with UTXO chaining

To prevent front-running there is a need to have a well-defined ordering of transactions withdrawing funds from the vault, such that users can be sure that there is still enough funds in the vault to make them whole. We accomplish this by referencing a specific bitcoin UTXO in the vault, such that the next transaction withdrawing funds from the vault needs to include this UTXO in its transaction inputs - this ensures there could only ever be a single update to the vault's state. The vault also specifies how many bitcoin confirmations are considered final and only accepts state updates from those transactions.

![Diagram showing that double-spending of UTXO is impossible](/img/utxo-chain.svg)

Each withdrawal transaction produces a new UTXO as its first output, which becomes the vault's next ownership reference. This creates a deterministic chain: TX<sub>A</sub> spends UTXO U<sub>0</sub> and creates U<sub>A,0</sub>, then TX<sub>B</sub> must spend U<sub>A,0</sub> and creates U<sub>B,0</sub>, and so on. The smart chain vault tracks this — it verifies that each submitted withdrawal transaction spends the current vault UTXO, executes the action encoded in the data-carrier (e.g. "1 WBTC to Carol"), updates the balance, and advances the ownership reference to the newly created UTXO. This chains swaps indefinitely in a clear, tamper-proof order enforced by Bitcoin itself.

![Diagram showcasing updating of vault UTXO](/img/utxo-vault-state.svg)

### Enabling atomic swaps

To enable atomic swaps, the user and LP cooperatively construct and sign a single Bitcoin transaction (PSBT) that atomically:

- **Spends** the vault's current UTXO (advancing the chain)
- **Sends** BTC from the user's inputs to the LP's wallet
- **Encodes** the withdrawal data (recipient, amount, watchtower reward) in an `OP_RETURN` output

Both parties sign with `SIGHASH_ALL`, committing to the full transaction — so it either confirms as-is (both sides get their assets) or doesn't confirm at all (nothing happens). This makes the swap atomic at the Bitcoin protocol level, without requiring any escrow contract or timelock.

Once the transaction gets enough confirmations, anyone (a watchtower, the LP, or the user themselves) can submit the transaction data to the smart chain, where the vault verifies it through the light client and pays out the tokens to the user. Watchtowers earn a small reward for this service, but they are purely a UX convenience — the user can always claim independently.

![Diagram showcasing an atomic swap](/img/utxo-swap-diagram.svg)