# EVM & Starknet Contracts

The EVM and Starknet contract deployments share a **modular architecture** — the protocol logic is decomposed into small, composable contract modules that can be combined and upgraded independently. The same architectural design is implemented on both platforms, with each module fulfilling an identical role.

![EVM & Starknet smart contract architecture](/img/EVM-starknet-smart-contracts.svg)

## BTC Relay (Bitcoin Light Client)

A permissionless, trustless Bitcoin SPV light client deployed on-chain. It verifies and stores Bitcoin block headers using proof-of-work validation, serving as a **trustless oracle of Bitcoin state**. Anyone can submit block headers — the contract verifies their validity regardless of who submits them.

The relay validates consensus rules (PoW difficulty, difficulty adjustments, previous block hash, timestamps) and handles forks automatically by adopting the chain with the greatest cumulative chainwork. Block header data is stored efficiently — on EVM as calldata with only a hash fingerprint on-chain, and on Starknet as events with Poseidon hash fingerprints in storage.

Bitcoin relay contract is used for all Bitcoin on-chain claim handlers (PrTLCs) and the UTXO-controlled vault contract.

## Escrow Manager

The central contract for escrow based swaps (HTLCs & PrTLCs). It handles initialization, claiming, refunding, and cooperative closing of escrows. Each escrow specifies a claim handler contract address with committed claim data and a refund handler contract address with committed refund data.
All claim handlers implement a common `IClaimHandler` interface and all refund handlers implement `IRefundHandler`. These are then used as a predicate to verify validity of the claim and refund. Concretely, the caller calls the escrow claim function with the `witness` (a data to satisfy the claim condition), internally the escrow manager calls a claim handler's `claim` function with the: a) claim data committed during escrow initialization & b) caller provided `witness`. The claim handler than asserts the validity of the `witness` - the can range from a simple hashing (for hashlocks), to parsing a bitcoin transaction and verifying it through the BTC Relay contract.

### Claim handlers

#### Hashlock Claim Handler

Validates claims based on knowledge of a SHA-256 preimage, asserts that the hash of the `witness` equals to the committed claim data. Used for **Lightning Network swaps** (both directions), where the preimage links the on-chain escrow to the off-chain Lightning payment.

#### Bitcoin Output Claim Handler

Verifies that a specific Bitcoin transaction output exists and is confirmed on the canonical chain. The `witness` contains the full bitcoin transaction, the handler parses it, verifies the transaction's output script & amount matches the committed claim data, and verifies transaction's inclusion Merkle proof via the BTC relay. Used for **Legacy Bitcoin on-chain → Smart chain** swaps.

#### Bitcoin Nonced Output Claim Handler

Same as the output claim handler, but additionally verifies a nonce encoded in the Bitcoin transaction's `locktime` and `nSequence` fields. The nonce uniquely identifies each swap and prevents replay attacks. Used for **Smart chain → Bitcoin on-chain** swaps.

#### Bitcoin TxID Claim Handler

Verifies that a specific Bitcoin transaction ID is confirmed on the canonical chain. Currently unused — reserved for future swap types such as Ordinals, Runes, or RGB.

### Refund Handlers

#### Timelock Refund Handler

Validates refunds after a specified expiry timestamp. This is the universal refund handler used by **all current swap types** — it ensures the offerer can reclaim funds if the counterparty fails to claim within the timeout period.

### Reputation Tracking

The escrow contract records swap outcomes (success, failed, cooperative refund) per LP per token, enabling users to identify reliable liquidity providers.

### LP vault

To prevent LP always having to deposit funds into the contract (and incurring the ERC20 transfer gas cost) the contract allows the LP to hold balance inside the contract—the contracts tracks this balance in a single mapping. This way when an escrow is created using LP's funds no ERC20 transfer occurs and funds are instead taken from the internal balance of the LP.

## SPV Swap Vault

Implements the [UTXO-controlled vault](/overview/core-primitives/utxo-controlled-vault/) primitive for **Bitcoin on-chain → Smart chain** swaps. The vault holds LP liquidity on the smart chain, and withdrawals are authorized solely by verified Bitcoin transactions using the BTC relay.

The vault tracks a specific Bitcoin UTXO as its ownership reference. Each withdrawal must spend the current UTXO and produce a new one, enforcing a strict linear sequence of operations via Bitcoin's consensus rules. Withdrawal parameters (recipient, amounts, fees) are encoded in the Bitcoin transaction's `OP_RETURN` output and `nSequence` fields.

The vault supports **liquidity fronting** (third parties can front funds before Bitcoin confirmation for a fee) and **caller fees** (watchtower incentives for submitting proofs).

## Execution Contract

Allows scheduling and executing arbitrary smart contract calls as part of a swap. When a swap includes an execution action, the claimed funds are transferred to the execution contract instead of directly to the recipient. Any third party can then execute the scheduled action and earn an execution fee.

An execution action contains only a hash of the actual to-be-executed contract calls. Hence, the contract calls have to be kept and transferred off-chain to the watchtower network, which then provide these contract calls to the execution contract when executing the action.

This enables use cases like swapping Bitcoin directly into a DeFi position — e.g., the swap output can be routed into an AMM swap or a lending deposit in a single flow. If the execution fails or the execution action data is lost, funds can always be refunded by the original recipient and anyone can refund after an expiry period.

## Utilities

### Bitcoin Utilities

Low-level Bitcoin protocol utilities used by claim handlers and the SPV vault: transaction parsing, Merkle proof verification, endianness conversion, and compact size encoding.

### Token Utilities

Unified interface for ERC20 and native token transfers, used by the escrow manager, SPV vault, and execution contract.

## Source Code

| Module | EVM | Starknet |
|---|---|---|
| BTC Relay | [contracts/btc_relay](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/btc_relay) | [packages/btc_relay](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/btc_relay) |
| Bitcoin Utilities | [contracts/btc_utils](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/btc_utils) | [packages/btc_utils](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/btc_utils) |
| Token Utilities | [contracts/transfer_utils](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/transfer_utils) | [packages/erc20_utils](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/erc20_utils) |
| Escrow Manager | [contracts/escrow_manager](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/escrow_manager) | [packages/escrow_manager](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/escrow_manager) |
| SPV Swap Vault | [contracts/spv_swap_vault](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/spv_swap_vault) | [packages/spv_swap_vault](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/spv_swap_vault) |
| Execution Contract | [contracts/execution_contract](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/execution_contract) | [packages/execution_contract](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/execution_contract) |
| Hashlock Claim Handler | [contracts/hashlock_claim_handler](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/hashlock_claim_handler) | [packages/hashlock_claim_handler](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/hashlock_claim_handler) |
| Output Claim Handler | [contracts/btc_output_claim_handler](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/btc_output_claim_handler) | [packages/btc_output_claim_handler](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/btc_output_claim_handler) |
| Nonced Output Claim Handler | [contracts/btc_nonced_output_claim_handler](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/btc_nonced_output_claim_handler) | [packages/btc_nonced_output_claim_handler](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/btc_nonced_output_claim_handler) |
| TxID Claim Handler | [contracts/btc_txid_claim_handler](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/btc_txid_claim_handler) | [packages/btc_txid_claim_handler](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/btc_txid_claim_handler) |
| Timelock Refund Handler | [contracts/timelock_refund_handler](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/timelock_refund_handler) | [packages/timelock_refund_handler](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/timelock_refund_handler) |

---

## Swap Type Routing

Different swap directions use different combinations of handlers and vault types:

| Swap Direction | Claim Handler | Refund Handler | Vault |
|---|---|---|---|
| Lightning → Smart chain | Hashlock | Timelock | Escrow Manager |
| Smart chain → Lightning | Hashlock | Timelock | Escrow Manager |
| Bitcoin on-chain → Smart chain | — | — | SPV Swap Vault |
| Smart chain → Bitcoin on-chain | Nonced Output | Timelock | Escrow Manager |

