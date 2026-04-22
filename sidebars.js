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
  
  // SDK Guide (developer-focused tutorials)
  sdkGuideSidebar: [
    {
      type: 'doc',
      id: 'sdk-guide/index',
      label: 'Overview',
    },
    {
      type: 'category',
      label: 'Quick Start',
      link: { type: 'doc', id: 'sdk-guide/quick-start/index' },
      items: [
        'sdk-guide/quick-start/quick-start-browser',
        'sdk-guide/quick-start/quick-start-nodejs',
        'sdk-guide/quick-start/creating-quotes',
        'sdk-guide/quick-start/executing-swaps',
      ],
    },
    {
      type: 'category',
      label: 'Swap Guides',
      link: { type: 'doc', id: 'sdk-guide/swaps/index' },
      items: [
        'sdk-guide/swaps/smart-chain-to-btc',
        'sdk-guide/swaps/btc-to-smart-chain',
        'sdk-guide/swaps/lightning-to-smart-chain',
        {
          type: 'category',
          label: 'Legacy (Solana)',
          items: [
            'sdk-guide/swaps/solana/btc-to-solana',
            'sdk-guide/swaps/solana/lightning-to-solana',
          ],
        },
      ],
    },

    {
      type: 'category',
      label: 'Swap Management',
      link: { type: 'doc', id: 'sdk-guide/swap-management/index' },
      items: [
        'sdk-guide/swap-management/historical-swaps',
        'sdk-guide/swap-management/refunds',
        'sdk-guide/swap-management/claiming',
      ],
    },
    {
      type: 'category',
      label: 'Utilities',
      link: { type: 'doc', id: 'sdk-guide/utilities/index' },
      items: [
        'sdk-guide/utilities/address-parser',
        'sdk-guide/utilities/wallet-balance',
        'sdk-guide/utilities/supported-tokens',
        'sdk-guide/utilities/swap-types',
        'sdk-guide/utilities/swap-limits',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      link: { type: 'doc', id: 'sdk-guide/advanced/index' },
      items: [
        'sdk-guide/advanced/manual-transactions',
        'sdk-guide/advanced/events',
        'sdk-guide/advanced/configuration',
        'sdk-guide/advanced/storage'
      ],
    }
  ],

  // REST API Guide
  restApiGuideSidebar: [
    {
      type: 'doc',
      id: 'rest-api-guide/index',
      label: 'Overview',
    },
    'rest-api-guide/concepts',
    'rest-api-guide/quoting',
    'rest-api-guide/creating-and-executing',
    'rest-api-guide/bitcoin-and-lightning',
    'rest-api-guide/managing-swaps',
    'rest-api-guide/utilities',
    {
      type: 'category',
      label: 'Run REST API Locally',
      link: { type: 'doc', id: 'rest-api-guide/run-locally/index' },
      collapsed: true,
      items: [
        'rest-api-guide/run-locally/quick-start',
        'rest-api-guide/run-locally/configuration',
      ],
    },
  ],
};

export default sidebars;
