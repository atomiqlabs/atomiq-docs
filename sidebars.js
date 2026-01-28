// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Protocol documentation (non-developer technical docs)
  getStartedSidebar: [
    'introduction',
    {
      type: 'category',
      label: 'Liquidity Provider Nodes',
      link: { type: 'doc', id: 'lps/index' },
      items: [
        'lps/running-lp-node',
        'lps/pinggy-tunnel',
      ],
    },
    'security',
    {
      type: 'category',
      label: 'Bitcoin Light Client',
      link: { type: 'doc', id: 'bitcoin-light-client/index' },
      items: [
        'bitcoin-light-client/sc-bitcoin',
        'bitcoin-light-client/bitcoin-sc-new',
        'bitcoin-light-client/bitcoind-sc-legacy',
        'bitcoin-light-client/prtlc',
        'bitcoin-light-client/utxo-chain-vault',
      ],
    },
    {
      type: 'category',
      label: 'Submarine Swaps',
      link: { type: 'doc', id: 'submarine-swaps/index' },
      items: [
        'submarine-swaps/htlc',
        'submarine-swaps/sc-lightning',
        'submarine-swaps/lightning-sc-new',
        'submarine-swaps/lightning-sc-legacy',
      ],
    },
  ],

  // SDK Tutorials (developer-focused)
  developersSidebar: [
    {
      type: 'category',
      label: 'Developers',
      link: { type: 'doc', id: 'sdk-guide/index' },
      items: [
        'sdk-guide/installation',
        'sdk-guide/quick-start',
        {
          type: 'category',
          label: 'Swap Tutorials',
          link: { type: 'doc', id: 'sdk-guide/swaps/index' },
          items: [
            'sdk-guide/swaps/btc-to-smart-chain',
            'sdk-guide/swaps/smart-chain-to-btc',
            'sdk-guide/swaps/lightning-to-smart-chain',
            'sdk-guide/swaps/smart-chain-to-lightning',
            'sdk-guide/swaps/lnurl-swaps',
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
          ],
        },
        {
          type: 'category',
          label: 'Swap Management',
          link: { type: 'doc', id: 'sdk-guide/swap-management/index' },
          items: [
            'sdk-guide/swap-management/swap-states',
            'sdk-guide/swap-management/historical-swaps',
            'sdk-guide/swap-management/refunds',
            'sdk-guide/swap-management/claiming',
          ],
        },
        {
          type: 'category',
          label: 'Advanced',
          link: { type: 'doc', id: 'sdk-guide/advanced/index' },
          items: [
            'sdk-guide/advanced/manual-transactions',
            'sdk-guide/advanced/configuration',
            'sdk-guide/advanced/events',
            'sdk-guide/advanced/swap-limits',
          ],
        },
        {
          type: 'category',
          label: 'Integrations',
          link: { type: 'doc', id: 'sdk-guide/integrations/index' },
          items: [
            'sdk-guide/integrations/solana-pay',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
