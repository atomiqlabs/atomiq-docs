---
sidebar_position: 2
---


# Quick Start (Browser)


This guide covers installing the Atomiq SDK in a browser and its chain-specific connectors and walks you through setting up and initializing the Atomiq SDK.

## Core SDK

Install the main SDK package:

```bash
npm install @atomiqlabs/sdk@latest
```

### Chain Connectors

The SDK supports multiple chains. Install only the chain connectors your project needs, and mix and match them as required: 

```bash
npm install @atomiqlabs/chain-solana@latest
npm install @atomiqlabs/chain-starknet@latest
npm install @atomiqlabs/chain-evm@latest
```

### Browser Importing Example

For example, for a browser project with Solana and Starknet you need to install the following packages:

```bash
npm install @atomiqlabs/sdk@latest \
  @atomiqlabs/chain-solana@latest \
  @atomiqlabs/chain-starknet@latest
```


## Setup

Set your RPC URLs:

```typescript
const solanaRpc = "https://api.mainnet-beta.solana.com";
const starknetRpc = "https://api.zan.top/public/starknet-mainnet/rpc/v0_9";
const citreaRpc = "https://rpc.mainnet.citrea.xyz";
```

Create a swapper factory with your desired chain support. Use `as const` so TypeScript can properly infer the types:

```typescript
import {SolanaInitializer, SolanaInitializerType} from "@atomiqlabs/chain-solana";
import {StarknetInitializer, StarknetInitializerType} from "@atomiqlabs/chain-starknet";
import {CitreaInitializer, CitreaInitializerType} from "@atomiqlabs/chain-evm";
import {BitcoinNetwork, TypedSwapper, SwapperFactory, TypedTokens} from "@atomiqlabs/sdk";

// Define chains you want to support
const chains = [SolanaInitializer, StarknetInitializer, CitreaInitializer] as const;
type SupportedChains = typeof chains;

// Create the swapper factory
const Factory = new SwapperFactory<SupportedChains>(chains);

// Get the tokens for the supported chains
const Tokens: TypedTokens<SupportedChains> = Factory.Tokens;

// Create one swapper instance for your entire app, and use that instance for all your swaps.
const swapper: TypedSwapper<SupportedChains> = Factory.newSwapper({
  chains: {
    SOLANA: {
      rpcUrl: solanaRpc // Can also pass Connection object
    },
    STARKNET: {
      rpcUrl: starknetRpc // Can also pass Provider object
    },
    CITREA: {
      rpcUrl: citreaRpc // Can also pass JsonApiProvider object
    }
  },
  // The `bitcoinNetwork` setting also determines the network for Solana (devnet for testnet) and Starknet (sepolia for testnet).
  bitcoinNetwork: BitcoinNetwork.MAINNET // or TESTNET, TESTNET4
});

// Initialize the swapper
await swapper.init();
```

:::info
Initialize the swapper with `await swapper.init();` shown above once when your app starts. Ideally, you should create only one swapper instance for your entire app, and use that instance for all your swaps. This checks existing in-progress swaps and does initial LP discovery.
:::


## Setting Up Signers

### Solana

<details>
<summary>Using Solana wallet adapter</summary>

Install the [Solana wallet adapter](https://github.com/anza-xyz/wallet-adapter):

```bash
npm install --save \
    @solana/wallet-adapter-base \
    @solana/wallet-adapter-react \
    @solana/wallet-adapter-react-ui \
    @solana/wallet-adapter-wallets \
    @solana/web3.js \
    react
```

Wrap your app with the wallet adapter providers:

```tsx
import { ConnectionProvider, WalletProvider, useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolanaSigner } from "@atomiqlabs/chain-solana";

// In your component, create the signer from the connected wallet:
function YourApp() {
  const anchorWallet = useAnchorWallet();
  const wallet = new SolanaSigner(anchorWallet);
  
  return (
    <div>
      <h1>Your App</h1>
      {/* Place a wallet button in your app to allow the user to connect their wallet */}
      <WalletMultiButton />
    </div>
  );
}

function App() {
  return (
    // Use the same solanaRpc that was used to create the swapper earlier
    <ConnectionProvider endpoint={solanaRpc}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <YourApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```


</details>

### Starknet

<details>
<summary>Using get-starknet</summary>

Install [get-starknet](https://github.com/starknet-io/get-starknet) and the Starknet SDK:

```bash
npm install --save \
    @starknet-io/get-starknet-core \
    starknet
```

Connect the wallet and create a signer:

```tsx
import { getStarknet } from "@starknet-io/get-starknet-core";
import { WalletAccount } from "starknet";
import { StarknetBrowserSigner } from "@atomiqlabs/chain-starknet";

const starknet = getStarknet();

async function connectStarknetWallet() {
  // Get available wallets (Argent, Braavos, etc.)
  const availableWallets = await starknet.getAvailableWallets();

  // Enable the first available wallet (or let the user choose)
  const swo = await starknet.enable(availableWallets[0], { silent_mode: false });

  // Use the same starknetRpc that was used to create the swapper earlier
  const walletAccount = await WalletAccount.connect(starknetRpc, swo);
  const wallet = new StarknetBrowserSigner(walletAccount);
}
```

</details>

### EVM (Citrea, etc.)

<details>
<summary>Using Wagmi + ethers</summary>

Install [Wagmi](https://wagmi.sh/) and ethers:

```bash
npm install --save \
    wagmi \
    @tanstack/react-query \
    ethers
```

Set up Wagmi with your EVM chain and wrap your app:

```tsx
import { createConfig, WagmiProvider, useAccount, useConnectors } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserProvider } from "ethers";
import { EVMBrowserSigner } from "@atomiqlabs/chain-evm";

// Define your chain (example: Citrea)
const citreaChain = {
  id: 5115,
  name: "Citrea",
  nativeCurrency: { name: "cBTC", symbol: "cBTC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.citrea.xyz"] } },
};

const config = createConfig({
  chains: [citreaChain],
  multiInjectedProviderDiscovery: true, // Auto-discovers MetaMask, Rabby, etc.
});
const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <YourApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

Then in your component, connect the wallet and create a signer:

```tsx
function YourApp() {
  const connectors = useConnectors();
  const { connector, isConnected } = useAccount();

  async function connect(walletName: string) {
    const found = connectors.find((c) => c.name === walletName);
    await found.connect({ chainId: citreaChain.id });
  }

  async function createSigner() {
    const provider = await connector.getProvider({ chainId: citreaChain.id });
    const signer = await new BrowserProvider(provider).getSigner();
    const wallet = new EVMBrowserSigner(signer, signer.address);
  }
}
```

</details>

<details>
<summary>Using private key (Node.js)</summary>

```typescript
import { BaseWallet, SigningKey } from "ethers";
import { EVMSigner } from "@atomiqlabs/chain-evm";

const wallet = new BaseWallet(new SigningKey(evmKey));
const evmWallet = new EVMSigner(wallet, wallet.address);
```

</details>

## Your First Swap

Here's a complete example of a Smart Chain to Lightning swap:

```typescript
import {SwapAmountType} from "@atomiqlabs/sdk";

// Create a swap: SOL to Lightning
const swap = await swapper.swap(
  Tokens.SOLANA.SOL,              // From token
  Tokens.BITCOIN.BTC,             // To Bitcoin on-chain
  undefined,                      // Amount from invoice
  SwapAmountType.EXACT_OUT,       // Invoice has fixed amount
  solanaSigner.getAddress(),      // Source address
  "bc1q..."                       // Bitcoin on-chain address
);

// Check quote details
console.log("Input:", swap.getInput().toString());
console.log("Output:", swap.getOutput().toString());
console.log("Expires:", new Date(swap.getQuoteExpiry()));

// Execute the swap
const success = await swap.execute(solanaSigner, {
  onSourceTransactionSent: (txId) => console.log("Tx sent:", txId),
  onSwapSettled: (hash) => console.log("Payment sent!")
});

// Handle failure
if (!success) {
  await swap.refund(solanaSigner);
}
```

## Next Steps

Now you're ready to explore specific swap types:
- [Node.js Quick Start](./quick-start-nodejs) - Node.js Quick Start
- [BTC to Smart Chain](./swaps/btc-to-smart-chain) - Bitcoin on-chain to Solana/Starknet/EVM
- [Smart Chain to BTC](./swaps/smart-chain-to-btc) - Solana/Starknet/EVM to Bitcoin on-chain
- [Lightning to Smart Chain](./swaps/lightning-to-smart-chain) - Lightning to smart chains
- [Smart Chain to Lightning](./swaps/smart-chain-to-lightning) - Smart chains to Lightning
- [LNURL Swaps](./swaps/lnurl-swaps) - Reusable payment addresses
