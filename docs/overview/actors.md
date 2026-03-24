# Actors in the Atomiq Protocol

Atomiq is designed as a permissionless system where multiple independent parties interact to enable trustless cross-chain swaps. The main participants are the User, Liquidity Provider (LP), and Watchtower (also referred to as a relayer). Each plays a distinct role across both Bitcoin L1 and Lightning swaps, while all operations remain non-custodial and verifiable through smart contracts, cryptography, and Bitcoin consensus.

![Protocol Overview](/img/atomiq-overview-diagrams.svg)

## User

The User is initiating a cross-chain swap. They request quotes off-chain directly from Liquidity Providers (LPs) via the RFQ system through the Atomiq SDK, which automatically selects and accepts the best available offer on the client-side. The user then signs and broadcasts the necessary transaction(s) on the source chain to commit funds for the swap. This involves depositing funds into a smart contract [PrTLC](/overview/core-primitives/prtlc/) or [HTLC](/overview/core-primitives/htlc/) escrow on the smart chain (for **Smart chain → Bitcoin/Lightning** swaps), co-signing a Bitcoin transaction with the LP to move funds to the LP's address on Bitcoin (for **Bitcoin → Smart chain** swaps), or paying a Lightning invoice invoice (for **Lightning → Smart chain**). In every case, the user retains custody unless the agreed cryptographic settlement conditions are met.

Users do not need to remain online for the full duration of the swap—watchtowers can handle settlement if required. In case of any failure or non-cooperation, the user's funds can be refunded, with refund mechanics depending on swap direction:

- In **Smart chain → Bitcoin/Lightning** swaps, if the counterparty fails to deliver Bitcoin, the user (or a watchtower) can manually trigger a refund from the smart chain escrow after the timeout period.  
- In **Bitcoin → Smart chain** swaps, there is no refund mechanism needed—if the Bitcoin transaction is not confirmed (e.g., due to a double-spend or replacement in the mempool), the funds never leave the user's wallet, and no swap occurs on the smart chain side.
- In **Lightning → Smart chain** swaps, if the counterparty fails to create an HTLC on the destination side, the Lightning network payment eventually times out and funds are automatically returned to the user.

This ensures users retain full control and never risk permanent loss from non-cooperation.

[//]: # (A simple diagram: RFQ → Send funds, Send funds → Settlement, Send funds → Refund)

## Liquidity Provider (LP)

Liquidity Providers are market makers who give out quotes and facilitate swaps. Anyone can permissionlessly run an LP node and join the LP network. LPs compete in the off-chain RFQ system to offer the best prices to users. They provide the necessary liquidity on the destination chain to fulfill the swap. For Bitcoin L1 swaps, they leverage the Atomiq protocol's novel [PrTLCs](/overview/core-primitives/prtlc/) and [UTXO-controlled vaults](/overview/core-primitives/utxo-controlled-vault/) primitives. These protect LPs by solving the free option problem—ensuring they are not exposed to one-sided risk if the user chooses not to complete the swap in a timely manner and instead exploits the optionality provided by the swap timeouts. For Lightning L2 swaps, the established [HTLC](/overview/core-primitives/htlc/) mechanism is used. In both cases, settlement between the user and LP is enforced by the protocol's smart contracts and cryptographic conditions, such that it only occurs when both sides fulfill their obligations.

## Watchtower

Watchtowers are optional, permissionless helpers that monitor swaps and perform settlements on behalf of users when conditions are met. They improve user experience by removing the need for constant online presence (eliminating user liveness requirements) in Bitcoin L1 swaps. When a watchtower successfully settles a swap (e.g., by submitting the required bitcoin transaction proof to the smart contract), it earns a small fee from the swap proceeds. On a high level the watchtowers:

1. Observe the creation of a swap on-chain (the user must explicitly opt-in)
2. Monitor subsequent Bitcoin blocks for the required transaction
3. Once the Bitcoin transaction is found, they wait for the required number of confirmations
4. After sufficient confirmations, they claim the swap funds to the user's account and receive the settlement fees

Because settlement logic is fully on-chain and verifiable, users remain in full control and face no additional trust assumptions: watchtowers simply accelerate execution and improve swap UX without custody or decision-making power.

:::info
Watchtowers are also used for [**Lightning → Smart chain**](/overview/swaps/lightning-sc-new) swaps, where users broadcast the HTLC swap secret over **Nostr** and let the watchtowers claim the funds on their behalf. This delegates the settlement transaction fee payment to the watchtowers, allowing users with no Smart chain balance to execute swaps.
:::

---

These three roles work together in a decentralized, open manner: no single party is trusted, and atomicity is enforced purely through cryptography, consensus verification, and smart contract escrows. Whether the swap uses Bitcoin L1 [PrTLCs](/overview/core-primitives/prtlc/) and [UTXO-controlled vaults](/overview/core-primitives/utxo-controlled-vault/) swap primitives, or the established Lightning L2 [HTLCs](/overview/core-primitives/htlc/) swap primitive, the structure preserves Atomiq's strong security guarantees while reducing the need for constant online presence and making the protocol accessible for everyday users.
