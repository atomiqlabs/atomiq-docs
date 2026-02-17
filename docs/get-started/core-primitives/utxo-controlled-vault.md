# UTXO-controlled vault

A UTXO-controlled vault is a smart contract on the smart chain that holds LP liquidity and authorizes withdrawals solely based on verified Bitcoin transactions, using the on-chain [Bitcoin light client](/get-started/core-primitives/bitcoin-light-client/) to confirm UTXO states and prevent front-running. By importing Bitcoin's deterministic UTXO ordering to the smart chain, the vault ensures a tamper-proof withdrawal queue, where each update spends the previous vault UTXO and creates a new one, chaining transactions in a linear, verifiable sequence enforced by Bitcoin consensus.

UTXO-controlled vaults are a novel primitive introduced by Atomiq to enable trustless Bitcoin → smart chain swaps, overcoming limitations of using PrTLCs in the [legacy Bitcoin -> Smart chain](/get-started/swaps/bitcoind-sc-legacy/) direction, such as the "cold start" problem (users needing smart chain tokens upfront), timeout dependencies, and—most critically—the need for LPs to pre-lock liquidity into per-swap escrows. This primitive is central to Atomiq's core protocol for the [Bitcoin → smart chain](/get-started/swaps/bitcoin-sc-new/) direction, complementing PrTLCs for the reverse flow.

## Mechanism

The vault operates by tracking a specific Bitcoin UTXO as its ownership reference, ensuring that only transactions spending this UTXO can update its state and withdraw funds from the vault.

To guarantee orderly withdrawals, the vault requires that each withdrawal transaction includes the current vault UTXO as an input. This makes double-spending impossible under Bitcoin rules, enforcing a single, linear chain of updates. Each valid transaction produces a new UTXO as its first output, which becomes the vault's next reference. The smart contract verifies this via the Bitcoin light client, checking the raw transaction, Merkle proof, and required confirmations before executing the encoded action (e.g., releasing funds to a user) and advancing the UTXO pointer. The vault specifies the number of Bitcoin confirmations needed for finality. Submitted transactions are parsed on-chain to validate structures, outputs, and data-carrier payloads before light client confirmation.

LPs deposit assets into the vault on the smart chain, providing pooled liquidity for multiple swaps. Withdrawals are triggered by Bitcoin transactions carrying data instructions (e.g., "transfer X tokens to Y address"), verified on-chain. This decouples liquidity from individual swaps, allowing LPs to serve unlimited users without per-swap locks.

The primitive requires no timeouts or cooperative refund paths, if the Bitcoin transaction is not confirmed (e.g., due to a double-spend or replacement in the mempool), the funds never leave the user's wallet, and no swap occurs on the smart chain side.

## Example

![Diagram showcasing updating of vault UTXO](/img/utxo-vault-state.svg)

The diagram above illustrates how the UTXO-controlled vault maintains state synchronization between Bitcoin and the smart chain vault through UTXO chaining. Starting from the left, Vault **State 0** on the smart chain references ownership **UTXO U<sub>0</sub>** on Bitcoin with a balance of 10 WBTC.

**Bitcoin TX<sub>A</sub>** consumes **UTXO U<sub>0</sub>** as input and produces **UTXO U<sub>A,0</sub>** as its first output, while including a data-carrier opcode specifying the action: *1 WBTC to Carol*. This transaction is verified by the light client on the smart chain, authorizing the action. As a result, the vault updates to **State 1**: ownership now references **UTXO U<sub>A,0</sub>**, and the balance reduces to 9 WBTC after releasing 1 WBTC to Carol.

Next, **Bitcoin TX<sub>B</sub>** consumes **UTXO U<sub>A,0</sub>** as input and produces **UTXO U<sub>B,0</sub>** as output, with a data-carrier action: *2 WBTC to Dave*. Again, verified via the light client, this advances the vault to **State 2**: ownership shifts to UTXO **UTXO U<sub>B,0</sub>**, and the balance drops to 7 WBTC after the withdrawal to Dave.

This chaining ensures only one valid update can occur at a time, as double-spending the current UTXO is impossible under Bitcoin rules.

![Diagram showing that double-spending of UTXO is impossible](/img/utxo-chain.svg)

## Swap Mechanism

In Atomiq swaps using UTXO-controlled vaults, the LP's vault holds the destination chain assets, while the user and LP collaboratively construct a Bitcoin transaction (via PSBT) that simultaneously transfers BTC from the user to the LP and encodes a withdrawal instruction for the user's assets from the vault. Once broadcast and confirmed on Bitcoin, the transaction is submitted to the smart chain vault for verification via the light client. If valid, the vault releases the funds atomically; if not (e.g., due to non-broadcast or double-spend), no funds move on either side. This achieves atomicity at the Bitcoin protocol level, with watchtowers able to submit proofs permissionlessly for fees, removing any liveness needs.

![Diagram showcasing a UTXO-controlled vault based Bitcoin -> Smart chain swap](/img/utxo-swap-diagram.svg)

---

UTXO-controlled vaults bind smart chain state directly to Bitcoin UTXOs and consensus (via the light client) and deliver fully trustless and non-custodial execution: LPs retain efficient liquidity management, users face no upfront costs or risks, and outcomes are enforced by verifiable proofs and contract logic.
