# Introduction

atomiq.exchange is a fully trustless cross-chain decentralized exchange (DEX) allowing you to swap between Smart chain (Solana, Starknet, EVM, etc.) assets and Bitcoin, without having to trust any intermediary in the process.

All transactions are processed atomically with strong security guarantees based on [bitcoin light client ](https://docs.atomiq.exchange/bitcoin-light-client-on-chain)(leveraging bitcoin's proof-of-work security) & [submarine swaps](https://docs.atomiq.exchange/submarine-swaps-lightning) (leveraging HTLCs - hash-time locked contracts over bitcoin's lightning network). With this approach atomiq.exchange is able to offer security guarantees far exceeding those of existing bridging or cross-chain swapping solutions.

atomiq.exchange uses a network of Liquidity Provider nodes (LP) to process the swaps via request for quote (RFQ) trading model - anyone can [run the LP node](https://docs.atomiq.exchange/liquidity-provider-nodes-lps/running-lp-node). The LPs are not trusted, the swap only happens if both sides of  the trade cooperate, this is ensured by the smart contract escrows.