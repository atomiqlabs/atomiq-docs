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
    'developers/quick-start-browser',
    'developers/quick-start-nodejs',
    {
      type: 'category',
      label: 'Swap Tutorials',
      link: { type: 'doc', id: 'developers/swaps/index' },
      items: [
        'developers/swaps/btc-to-smart-chain',
        'developers/swaps/smart-chain-to-btc',
        'developers/swaps/lightning-to-smart-chain',
        'developers/swaps/smart-chain-to-lightning',
        'developers/swaps/lnurl-swaps',
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
      ],
    },
    {
      type: 'category',
      label: 'Swap Management',
      link: { type: 'doc', id: 'developers/swap-management/index' },
      items: [
        'developers/swap-management/swap-states',
        'developers/swap-management/historical-swaps',
        'developers/swap-management/refunds',
        'developers/swap-management/claiming',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      link: { type: 'doc', id: 'developers/advanced/index' },
      items: [
        'developers/advanced/manual-transactions',
        'developers/advanced/configuration',
        'developers/advanced/events',
        'developers/advanced/swap-limits',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      link: { type: 'doc', id: 'developers/integrations/index' },
      items: [
        'developers/integrations/solana-pay',
      ],
    },
  ],
};

export default sidebars;
