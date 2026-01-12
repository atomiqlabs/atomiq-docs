// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
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
};

export default sidebars;
