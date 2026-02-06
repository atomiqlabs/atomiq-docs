# Bitcoin light client (on-chain)

Bitcoin light client is an on-chain smart contract deployed on the smart chains (Solana, Starknet, EVM, etc.) used to verify and store bitcoin blockheaders. This program is completely permissionless and trustless, anyone can write blockheaders as their validity is verified on-chain.

Bitcoin blockheaders contain a merkle root of all the transactions executed in it. The merkle root can be used to easily prove that any Bitcoin transaction was actually confirmed/included in a block, by providing a short merkle proof. This is utilized in PrTLCs (proof-time locked contracts) and UTXO-controlled vaults - these are the main primitives upon which the Bitcoin on-chain swaps are built.

Here are more technical explanations about inner workings of our bitcoin light client contracts:

* [Solana bitcoin light client program](https://github.com/atomiqlabs/atomiq-contracts-solana/tree/main/btcrelay)
* [Starknet bitcoin light client contract](https://github.com/atomiqlabs/atomiq-contracts-starknet/tree/main/packages/btc_relay)
* [EVM bitcoin light client contract](https://github.com/atomiqlabs/atomiq-contracts-evm/tree/main/contracts/btc_relay)

## Relayers & Watchtowers

### Relayers

Bitcoin light client cannot work all by itself, there needs to be some party submitting the latest bitcoin blockheaders to the bitcoin light clients running on the smart chains, so they can be verified, stored and later used for transaction verification. For this purpose atomiq.exchange uses a permissionless network of relayers (which also double-down as watchtowers). The relayer & watchtower software is available in the atomiq LP node package.

### Watchtowers

Being a watchtower is a profit motive for running a relayer, so these two are inseparable. Watchtowers are tasked with claiming swaps (specifically Bitcoin on-chain -> Smart chains) on behalf of users, to improve UX & security for those swaps, for this they are compensated by a small fee paid for by the users. To do this they need to make sure the bitcoin light clients on smart chains are synced to latest bitcoin blockheader (so they are able to verify the to-be-claimed transactions).

#### Process

1. **Watchtower** observes an event of creation of the swap on-chain (**creator/claimer** must explicitly opt-in for this feature)
2. **Watchtower** starts checking if subsequent bitcoin blocks contain the required transaction
3. If the any bitcoin swap transaction was found, the **watchtower** waits till that transaction gets required number of confirmations on bitcoin blockchain
4. Once the transaction got the required number of confirmations **watchtower** claims the swap funds to the claimer's account, and receives a fee (which was initially paid by the **creator/claimer**).