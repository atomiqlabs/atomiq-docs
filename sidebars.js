// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Protocol documentation (non-developer technical docs)
  getStartedSidebar: [
    'get-started/introduction',
    {
      type: 'category',
      label: 'Liquidity Provider Nodes',
      link: { type: 'doc', id: 'get-started/lps/index' },
      items: [
        'get-started/lps/running-lp-node',
        'get-started/lps/pinggy-tunnel',
      ],
    },
    'get-started/security',
    {
      type: 'category',
      label: 'Bitcoin Light Client',
      link: { type: 'doc', id: 'get-started/bitcoin-light-client/index' },
      items: [
        'get-started/bitcoin-light-client/sc-bitcoin',
        'get-started/bitcoin-light-client/bitcoin-sc-new',
        'get-started/bitcoin-light-client/bitcoind-sc-legacy',
        'get-started/bitcoin-light-client/prtlc',
        'get-started/bitcoin-light-client/utxo-chain-vault',
      ],
    },
    {
      type: 'category',
      label: 'Submarine Swaps',
      link: { type: 'doc', id: 'get-started/submarine-swaps/index' },
      items: [
        'get-started/submarine-swaps/htlc',
        'get-started/submarine-swaps/sc-lightning',
        'get-started/submarine-swaps/lightning-sc-new',
        'get-started/submarine-swaps/lightning-sc-legacy',
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
    'developers/installation',
    'developers/quick-start',
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
