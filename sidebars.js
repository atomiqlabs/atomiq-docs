// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Protocol documentation (non-developer technical docs)
  overviewSidebar: [
    'overview/introduction',
    'overview/protocol-overview',
    'overview/actors',
    {
      type: 'category',
      label: 'Core Primitives',
      link: { type: 'doc', id: 'overview/core-primitives/index' },
      items: [
        'overview/core-primitives/htlc',
        'overview/core-primitives/bitcoin-light-client',
        'overview/core-primitives/prtlc',
        'overview/core-primitives/utxo-controlled-vault',
      ],
    },
    {
      type: 'category',
      label: 'Swaps',
      link: { type: 'doc', id: 'overview/swaps/index' },
      items: [
        {
          type: 'category',
          label: 'Bitcoin On-chain (L1)',
          items: [
            'overview/swaps/sc-bitcoin',
            'overview/swaps/bitcoin-sc-new',
            'overview/swaps/bitcoind-sc-legacy',
          ],
        },
        {
          type: 'category',
          label: 'Bitcoin Lightning (L2)',
          items: [
            'overview/swaps/sc-lightning',
            'overview/swaps/lightning-sc-new',
            'overview/swaps/lightning-sc-legacy',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Contracts',
      link: { type: 'doc', id: 'overview/contracts/index' },
      items: [
        'overview/contracts/evm-starknet/index',
        'overview/contracts/solana/index',
        'overview/contracts/contract-addresses',
      ],
    },
  ],

  // Guides (practical how-to guides)
  guidesSidebar: [
    'guides/webapp',
    {
      type: 'category',
      label: 'Liquidity Provider Nodes',
      link: { type: 'doc', id: 'guides/lps/index' },
      items: [
        'guides/lps/running-lp-node',
        'guides/lps/pinggy-tunnel',
      ],
    },
  ],
  
  // SDK Tutorials (developer-focused)
  developersSidebar: [
    {
      type: 'doc',
      id: 'developers/index',
      label: 'Overview',
    },
    {
      type: 'category',
      label: 'Quick Start',
      link: { type: 'doc', id: 'developers/quick-start/index' },
      items: [
        'developers/quick-start/quick-start-browser',
        'developers/quick-start/quick-start-nodejs',
        'developers/quick-start/creating-quotes',
        'developers/quick-start/executing-swaps',
      ],
    },
    {
      type: 'category',
      label: 'Swap Guides',
      link: { type: 'doc', id: 'developers/swaps/index' },
      items: [
        'developers/swaps/smart-chain-to-btc',
        'developers/swaps/btc-to-smart-chain',
        'developers/swaps/lightning-to-smart-chain',
        {
          type: 'category',
          label: 'Legacy (Solana)',
          items: [
            'developers/swaps/solana/btc-to-solana',
            'developers/swaps/solana/lightning-to-solana',
          ],
        },
      ],
    },

    {
      type: 'category',
      label: 'Swap Management',
      link: { type: 'doc', id: 'developers/swap-management/index' },
      items: [
        'developers/swap-management/historical-swaps',
        'developers/swap-management/refunds',
        'developers/swap-management/claiming',
      ],
    },
    {
      type: 'category',
      label: 'Utilities',
      link: { type: 'doc', id: 'developers/utilities/index' },
      items: [
        'developers/utilities/address-parser',
        'developers/utilities/wallet-balance',
        'developers/utilities/supported-tokens',
        'developers/utilities/swap-types',
        'developers/utilities/swap-limits',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      link: { type: 'doc', id: 'developers/advanced/index' },
      items: [
        'developers/advanced/manual-transactions',
        'developers/advanced/events',
        'developers/advanced/configuration',
        'developers/advanced/storage'
      ],
    }
  ],
};

export default sidebars;
