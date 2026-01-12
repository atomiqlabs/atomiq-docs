# Liquidity provider nodes (LPs)

LP nodes provide liquidity for the swaps, handle cross-chain swaps, determine prices & earn swap fees. Reputation is also tracked for every LP and increases with every successfully processed swap and decreases for failed swaps (ones which resulted in the client having to refund after a timeout).

Anyone can become an LP in atomiq.exchange protocol by running the atomiq LP node software, creating a network of LPs. All LP nodes are included in the central LP node registry.

## Request for quote (RFQ)

atomiq.exchange operates on the request for quote (RFQ) order model. This works by sending an order request (e.g. I want to swap 100USDC to BTC) to the network of LPs, for which client gets quotes from multiple LPs able to process the swap, client then goes through the quotes and selects the best fitting one (this can be based on price, LP node's reputation or liquidity).

{% hint style="success" %}
This selection process is abstracted away from the end user and automated in our SDK and dApp.
{% endhint %}

Once client is happy with the quote, he commits to it by signing it and sending it as a Solana transaction, initiating the swap.

{% hint style="info" %}
Quotes are signed by the LP, such that they are binding and the user can readily execute them.
{% endhint %}

## Requirements for running an LP node

LP node needs to provide liquidity on the Smart chains (Solana, Starknet, EVM, etc.) and/or Bitcoin side to be able to facilitate swaps. It is recommended to deposit assets on both sides so the LP node can process swaps going both ways (Bitcoin -> Smart chain & Smart chain -> Bitcoin).

{% hint style="info" %}
Note that if an LP node provides liquidity e.g. only in SOL it is only possible for it to only process BTC -> SOL swaps at first (since it has no BTC to payout for SOL -> BTC swaps).
{% endhint %}

{% hint style="info" %}
The liquidity of the node will be redistributed based on swaps it processes (if LP node executes BTC -> SOL swap, the LP will end up with more BTC and less SOL, since for the swap it receives BTC and has to pay out SOL).
{% endhint %}

### Software

LP node needs to have access to Smart chain blockchains (via RPC), Bitcoin blockchain and Lightning network to be able to process swaps.

* Bitcoin node (bitcoind) - to provide access to Bitcoin blockchain
* Lightning network node (lnd) - to provide access to Bitcoin Lightning network
* BTC Relayer/Watchtower - to make sure bitcoin light client on the Smart chain is synchronized so atomiq node is able to claim on-chain swaps
* atomiq node - main software processing swaps