# Running LP node

LP node runs in docker containers & it is fully separated from your other programs, there is also no need to install anything other than docker on the main system.

## Pre-requisites

* A linux based machine (preferrably ubuntu 20.04 or 22.04) and SSH (command line) access
    * Testnet requirements: 4GB of RAM, 200GB SSD storage
    * Mainnet requirements: 6GB of RAM, 1TB SSD storage
* Machine either needs to have a public IP address and be accessible from the public internet or you need to use the [Pinggy tunnel](https://docs.atomiq.exchange/liquidity-provider-nodes-lps/pinggy-tunnel) to forward traffic to your local machine

:::info
We can recommend using [Contabo](https://contabo.com/en/vps) for VPS hosting, the following instances are recommended:

* Testnet: [Storage VPS 1](https://contabo.com/en/storage-vps/storage-vps-10) (€4.50 per month w/o VAT)
* Mainnet: [Storage VPS 3](https://contabo.com/en/storage-vps/storage-vps-30) (€14.00 per month w/o VAT)
:::

## Preparations

### Installing docker & docker-compose

Install docker

```bash
sudo apt update
sudo apt install -y docker.io
```

Install docker-compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Setup firewall

Open ports 22 (SSH), 80 (HTTP), 443 (REST for mainnet) & 8443 (REST for testnet) in the firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8443
sudo ufw enable
```

## Installation

Download the latest atomiq node archive

```bash
wget https://atomiqbeta.blob.core.windows.net/node/atomiq-node.tar.gz
```

Unpack the archive

```bash
sudo tar -xvzf atomiq-node.tar.gz
```

:::warning
If you don't have a server with public ip address you need to [setup the Pinggy tunnel](https://docs.atomiq.exchange/liquidity-provider-nodes-lps/pinggy-tunnel) now. This creates a secure tunnel and allows your server to be accessible from the public internet - this is required such that your node is able to accept and respond to RFQ swap requests from clients.
:::

Run the setup script - this will walk you through setting an environment (mainnet/testnet) and node's wallet

```bash
sudo ./setup.bash
```

Once this completes, it runs all the required software inside docker containers, you can check that all of them are running with

```bash
sudo docker container list
```

## Interacting with the node

### CLI

You can interact with the atomiq node through a CLI (command line interface), this uses a simple TCP connection over netcat to communicate with the LP node:

```bash
./lp-cli ## Or ./lp-cli-testnet for testnet
```

### Stop and start

The full atomiq stack will run automatically on machine boot after installation, should you need to stop or start it you can use the following commands

Stop the atomiq stack with (will stop the containers):

```bash
sudo ./stop-mainnet.bash ## Or ./stop-testnet.bash for testnet
```

Start the atomiq stack back up with (will reset the containers, if they are still running)

```bash
sudo ./start-mainnet.bash ## Or ./start-testnet.bash for testnet
```

## Using CLI

CLI is the way to send command to your running atomiq node. To get an overview of all the available command type in 'help'

```
> help
Available commands:
    status : Fetches the current status of the bitcoin RPC, LND gRPC & intermediary application
    getaddress : Gets the SmartChains & Bitcoin address of the node
    getbalance : Gets the balances of the node
    transfer : Transfer wallet balance to an external address
    deposit : Deposits smartchain wallet balance to an LP Vault
    withdraw : Withdraw LP Vault balance to node's SmartChain wallet
    getreputation : Checks the LP node's reputation stats
    plugins : Shows the list of loaded plugins
    geturl : Returns the URL of the node (only works when SSL_AUTO mode is used)
    register : Registers the URL of the node to the public LP node registry (only works when SSL_AUTO mode is used)
    listswaps : Lists all swaps in progress
    splitutxos : Splits funds to a bunch of smaller utxos
    consolidateutxos : Consolidates small UTXOs
    listvaults : Lists created spv vaults
    createvaults : Creates new spv vaults
    depositvault : Deposits funds to the specific spv vault
    withdrawvault : Withdraw funds from the specific spv vault
    airdrop : Requests an airdrop of SOL tokens (only works on devnet!)
Use 'help <command name>' for usage examples, description & help around a specific command!
```

### Monitoring synchronization status

We need to wait for the bitcoin node to sync up to the network (download whole bitcoin blockchain, this takes few hours on testnet & up to a day on mainnet).

We can monitor the status of the sync progress with the status command

```json
> status
{
  "smartChains": {
    "SOLANA": {
      "rpcStatus": "ready",
      "funds": "0.000000000",
      "ticker": "SOL",
      "hasEnoughFunds": true
    },
    "STARKNET": {
      "rpcStatus": "ready",
      "funds": "0.000000000000000000",
      "ticker": "STRK",
      "hasEnoughFunds": true
    }
  },
  "bitcoinRpc": {
    "status": "verifying blockchain",
    "verificationProgress": "6.8971%",    // <---- We can see the sync up/verification progress here
    "syncedHeaders": 2812116,
    "syncedBlocks": 549068
  },
  "bitcoinWallet": {
    "status": "offline"
  },
  "lightningWallet": null,
  "lpNodeStatus": "wait_btc_rpc"          // <---- We can see LP node status here, once it's "ready" the node is synced and ready to roll
}
```

### Depositing funds

While the node is syncing we can already deposit funds to the node, using ‘getaddress’ command we get the Smart chains (Solana, Starknet, EVM, etc.) & Bitcoin deposit addresses

```json
> getaddress
{
  "addresses": {
    "SOLANA": "3X8UXqRF1sUQrkmtmdH2gHCuwgn1eVJpyiXAnPQzdcmy",
    "STARKNET": "0x07616a5e3dc18e97b3310d8aba0bacb14ab389a4078442d9658be9616feeff3f",
    "bitcoin": "tb1qz3wac0jz0u4muz0egzf986pukgp69ej3ftn2ck"
  }
}
```

After funds are deposited to the wallets we can track the balance with the ‘getbalance’ command **(BTC balances only show up after bitcoin node is synced)**

:::info
The balances on the smart chains (Solana, Starknet, EVM, etc.) are split across wallet balances (these are not used for trading) - 'nonTradingWalletBalances' & trading vault balances (these are actively used for processing swaps) - 'tradingVaultBalances'
:::

```json
> getbalance
{
  "nonTradingWalletBalances": {
    "SOLANA": {
      "SOL": {
        "balance": "1.494565198",
        "decimals": 9
      }
    },
    "STARKNET": {
      "ETH": {
        "balance": "0.000000000000000000",
        "decimals": 18
      },
      "STRK": {
        "balance": "1120.053239098453593203",
        "decimals": 18
      }
    }
  },
  "tradingVaultBalances": {
    "SOLANA": {
      "SOL": {
        "balance": "0.000000000",
        "decimals": 9
      }
    },
    "STARKNET": {
      "ETH": {
        "balance": "0.000000000000000000",
        "decimals": 18
      },
      "STRK": {
        "balance": "0.000000000000000000",
        "decimals": 18
      }
    }
  },
  "tradingBitcoinBalance": {
    "error": "bitcoin wallet not ready"
  }
}
```

To make the smart chains funds available for processing swaps we have to deposit them to the LP vault (this doesn’t have to be done with bitcoin assets) - repeat this for all the assets you want to be traded ‘deposit \<asset> \<amount>’. The assets are always specified in the following format: '\<chain>-\<asset ticker>', e.g. STARKNET-STRK or SOLANA-SOL

```json
> deposit SOLANA-SOL 1
Transaction sent, signature: 4PxwU42k2xocYtspd8uAjNZahjU1YZSv6E4dXMziJRq9Ajd8ecjY8GQn8XXqGoJn6vxZ7F8W6qexMcTci3EuMda6 waiting for confirmation...
{
  "success": true,
  "message": "Deposit transaction confirmed",
  "txId": "4PxwU42k2xocYtspd8uAjNZahjU1YZSv6E4dXMziJRq9Ajd8ecjY8GQn8XXqGoJn6vxZ7F8W6qexMcTci3EuMda6"
}
```

Now we can check that the assets are really deposited and used for trading

```json
> getbalance
{
  "nonTradingWalletBalances": {
    "SOLANA": {
      "SOL": {
        "balance": "0.494565198",
        "decimals": 9
      }
    },
    "STARKNET": {
      "ETH": {
        "balance": "0.000000000000000000",
        "decimals": 18
      },
      "STRK": {
        "balance": "620.053239098453593203",
        "decimals": 18
      }
    }
  },
  "tradingVaultBalances": {
    "SOLANA": {
      "SOL": {
        "balance": "1.000000000",
        "decimals": 9
      }
    },
    "STARKNET": {
      "ETH": {
        "balance": "0.000000000000000000",
        "decimals": 18
      },
      "STRK": {
        "balance": "500.000000000000000000",
        "decimals": 18
      }
    }
  },
  "tradingBitcoinBalance": {
    "error": "bitcoin wallet not ready"
  }
}
```

:::danger
**It is important that you always keep some balance of native chain token (SOL for Solana, STRK for Starknet) in your wallet (non-trading) - this is used to cover the transaction fees for executing the swaps. Keeping at least 0.2 SOL and 200 STRK is recommended.**
:::

### Waiting for sync

For the LP node to start being operational you will have to wait till the underlying bitcoin node finishes synchronizing the bitcoin blockchain. You can check see the synchronization progress in the verification progress field. Once your node is synced up and ready the LP node status should show `"ready"`

```json
> status
{
  "smartChains": {
    "SOLANA": {
      "rpcStatus": "ready",
      "funds": "0.494565198",
      "ticker": "SOL",
      "hasEnoughFunds": true
    },
    "STARKNET": {
      "rpcStatus": "ready",
      "funds": "620.053239098453593203",
      "ticker": "STRK",
      "hasEnoughFunds": true
    }
  },
  "bitcoinRpc": {
    "status": "ready",
    "verificationProgress": "99.9994%",  // <---- Synchronization progress
    "syncedHeaders": 2812116,
    "syncedBlocks": 2812116
  },
  "bitcoinWallet": {
    "status": "ready"
  },
  "lightningWallet": null,
  "lpNodeStatus": "ready"          // <---- We can see that our node is ready now!
}
```

### Testing the LP node

After the node is synced up we can test the node via the atomiq frontend, to do this you first need to get the URL of your LP node

```json
> geturl
{
    "url": "https://83-32-155-32.nodes.atomiq.exchange:443"
}
```

To make the atomiq frontend access your node you can use the following frontend URL and replace `<your node URL>` with the URL obtained by executing the `geturl` command:

```
https://app.atomiq.exchange/?UNSAFE_LP_URL=<your node URL>
```

[^1]

This will force the frontend to connect only to your LP node

### Registering LP node

To be able to process swaps of other atomiq users your node needs to be registered in the atomiq LP node registry.

After confirming the swaps through the LP node work in the previous step, we can now send a request to register our node in the central LP registry with the `register` command. Please be sure to include an e-mail where we can contact you in case there is something wrong with your node

```bash
> register atomiq@example.com
{
    "success": true,
    "status": "created",
    "message": "LP registration request created",
    "url": "https://github.com/adambor/SolLightning-registry/pull/3"
}
```

We will now review your node (check if it is reachable & try swapping through it), you can monitor your node's approval/disapproval status by issuing the `register` command again

```json
> register atomiq@example.com
{
    "success": true,
    "status": "checking",
    "message": "LP registration status: pending",
    "githubPR": "https://github.com/adambor/SolLightning-registry/pull/3"
}
```

:::tip
Once your node is approved to be listed in the LP registry you will start processing user's swaps!
:::

## Updating

To update the node to the latest version of the docker images you can run the following

Download the latest atomiq node archive

```bash
wget https://atomiqbeta.blob.core.windows.net/node/atomiq-node.tar.gz
```

Unpack & run the update script (this will automatically install the new package versions and restart all the docker containers)

```bash
tar -zxvf atomiq-node.tar.gz update.bash && sudo ./update.bash
```

## Configuration

Your atomiq node comes pre-configured with reasonable default, but in case you want to change the configuration you can find in `config/intermediary/config.yaml` (for mainnet) or `config-testnet/intermediary/config.yaml` (for testnet) folders.

:::info
You might want to change the RPC URLs, and use dedicated ones (from e.g. [Helius](https://www.helius.dev/) (Solana)- reasonable free tier, or [Alchemy](https://www.alchemy.com/rpc-api) (Starknet, EVM) - a reasonable pay-as-you go tier) - see the `SOLANA` and `STARKNET` section. Or change the minimums/maximums or fees charged for the swaps - see the `ONCHAIN` and `ONCHAIN_SPV` section.
:::

Default mainnet configuration:

```yaml title="config.yaml"
#Solana RPC
SOLANA:
  #Solana RPC URL to use, it is recommended to use a dedicated RPC endpoint from e.g. Helius (recommended), Quicknode, etc.
  RPC_URL: "https://api.mainnet-beta.solana.com"
  #Maximum fee in micro lamport/CU to use for transactions
  MAX_FEE_MICRO_LAMPORTS: 250000
  #File with the wallet mnemonic seed
  MNEMONIC_FILE: "/mnt/share/wallet/mnemonic.txt"
  #Static tip (in lamports) to add to every transaction
  STATIC_TIP: 50000
  #Jito transaction relayer configuration
  JITO:
    PUBKEY: "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL"
    ENDPOINT: "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions"

#Starknet RPC
STARKNET:
  #Starknet RPC URL
  RPC_URL: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8"
  #Gas price limits (higher bound)
  MAX_L1_FEE_GWEI: 20000000
  MAX_L2_FEE_GWEI: 4000000
  MAX_L1_DATA_FEE_GWEI: 10000000
  #Starknet chain
  CHAIN: "MAIN"

  #File with wallet mnemonic seed
  MNEMONIC_FILE: "/mnt/share/wallet/mnemonic.txt"

  #Starknet quotes timeout
  AUTHORIZATION_TIMEOUT: 60

#Required APY option premium to be paid by the users as security deposit with BTC -> SOL swaps
SECURITY_DEPOSIT_APY: 20

#Bitcoin RPC
BITCOIND:
  PROTOCOL: "http"
  PORT: 8332
  HOST: "bitcoind"
  RPC_USERNAME: "user1"
  RPC_PASSWORD: "ThisIsAPassword"
  NETWORK: "mainnet"

#LND RPC
LND:
  MNEMONIC_FILE: "/mnt/share/wallet/mnemonic.txt"
  WALLET_PASSWORD_FILE: "/mnt/share/wallet/password.txt"
  CERT_FILE: "/mnt/share/lnd/tls.cert"
  MACAROON_FILE: "/mnt/share/lnd/admin.macaroon"
  HOST: "lnd"
  PORT: 10009

#LN setup (disabled by default)
# LN:
#   BASE_FEE: 0.00000010
#   FEE_PERCENTAGE: 0.3
#   MIN: 0.00001000
#   MAX: 0.01000000

#   ALLOW_NON_PROBABLE_SWAPS: false
#   ALLOW_LN_SHORT_EXPIRY: false

#On-chain setup Starknet/Solana -> BTC
#On-chain setup
ONCHAIN:
  #Total swap fee is calculated as BASE_FEE + {SWAP_VALUE}*FEE_PERCENTAGE
  #Base fee (in BTC) to be paid by every swap
  BASE_FEE: 0.00000150
  #Fee (in %) to be charged on the swaps
  FEE_PERCENTAGE: 0.3

  #Minimum swappable amount in BTC (for on-chain swaps)
  MIN: 0.00010000
  #Maximum swappable amount in BTC (for on-chain swaps)
  MAX: 0.05000000

  #Network fee buffer (in %), we charge the client this much more on the network
  # fee to accomodate for the possible fee rate increases in the near future 
  NETWORK_FEE_ADD_PERCENTAGE: 25

#On-chain setup BTC -> Starknet
ONCHAIN_SPV:
  MNEMONIC_FILE: "/mnt/share/wallet/mnemonic.txt"

  #Total swap fee is calculated as BASE_FEE + {SWAP_VALUE}*FEE_PERCENTAGE
  #Base fee (in BTC) to be paid by every swap
  BASE_FEE: 0.00000150
  #Fee (in %) to be charged on the swaps
  FEE_PERCENTAGE: 0.3

  #Minimum swappable amount in BTC (for on-chain swaps)
  MIN: 0.00010000
  #Maximum swappable amount in BTC (for on-chain swaps)
  MAX: 0.05000000

  #Maximum "gas drop" for different chains
  GAS_MAX:
    STARKNET: 5
    SOLANA: 0.05

#Tradable assets setup
ASSETS:
  WBTC:
    chains:
      SOLANA:
        #Address of the token
        address: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"
        #Decimal places
        decimals: 8
      STARKNET:
        address: "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac"
        decimals: 8
        spvVaultMultiplier: 1
    #Pricing source (using Binance), you can invert the pair by prepending "!"
    pricing: "WBTCBTC"
  USDC:
    chains:
      SOLANA:
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        decimals: 6
    pricing: "!BTCUSDC"
  USDT:
    chains:
      SOLANA:
        address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
        decimals: 6
    pricing: "!BTCUSDT"
  SOL:
    chains:
      SOLANA:
        address: "So11111111111111111111111111111111111111112"
        decimals: 9
        securityDepositAllowed: true
    pricing: "SOLBTC"
  ETH:
    chains:
      STARKNET:
        address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
        decimals: 18
        securityDepositAllowed: true
        spvVaultMultiplier: 1000000000
    pricing: "ETHBTC"
  STRK:
    chains:
      STARKNET:
        address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
        decimals: 18
        securityDepositAllowed: true
        spvVaultMultiplier: 1000000000
    pricing: "STRKUSDT;!BTCUSDT"

#CLI - command line interface config
CLI:
  #CLI bind address
  ADDRESS: "0.0.0.0"
  #CLI TCP port
  PORT: 40221

#REST RFQ API config
REST:
  #REST API bind address
  ADDRESS: "0.0.0.0"
  #REST API port
  PORT: 443
  
#Automatic SSL certificate provisioning config
SSL_AUTO:
  #HTTP listen port to list for ACME challenges
  HTTP_LISTEN_PORT: 80
  #DNS proxy to use - mapping the server's IP address to a domain
  DNS_PROXY: "nodes.atomiq.exchange"

#Node extensions/plugins
PLUGINS:
  atomiq-archiver: "atomiq-archiver@latest"
  spv-vault-manager: "spv-vault-manager@latest"
```

[^1]: Replace with your node URL obtained from the geturl command on the LP node.