// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  apiSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Getting Started',
    },
    {
      type: 'category',
      label: 'Core',
      collapsed: false,
      items: [
        { type: 'doc', id: 'sdk/classes/SwapperFactory', label: 'SwapperFactory' },
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        { type: 'doc', id: 'sdk/type-aliases/TypedSwapperOptions', label: 'TypedSwapperOptions' },
      ],
    },
    {
      type: 'category',
      label: 'Storage',
      items: [
        { type: 'doc', id: 'sdk/classes/LocalStorageManager', label: 'LocalStorageManager' },
      ],
    },
    {
      type: 'category',
      label: 'Utilities',
      items: [
        { type: 'doc', id: 'sdk/functions/toHumanReadableString', label: 'toHumanReadableString()' },
        { type: 'doc', id: 'sdk/functions/fromHumanReadableString', label: 'fromHumanReadableString()' },
        { type: 'doc', id: 'sdk/functions/timeoutSignal', label: 'timeoutSignal()' },
      ],
    },
    {
      type: 'category',
      label: 'Types',
      collapsed: true,
      items: [
        { type: 'doc', id: 'sdk/type-aliases/TypedSwapper', label: 'TypedSwapper' },
        { type: 'doc', id: 'sdk/type-aliases/TypedTokens', label: 'TypedTokens' },
        { type: 'doc', id: 'sdk/type-aliases/TypedChainTokens', label: 'TypedChainTokens' },
        { type: 'doc', id: 'sdk/type-aliases/TypedChainTokenResolver', label: 'TypedChainTokenResolver' },
        { type: 'doc', id: 'sdk/type-aliases/TypedTokenResolvers', label: 'TypedTokenResolvers' },
        { type: 'doc', id: 'sdk/type-aliases/TypedSwap', label: 'TypedSwap' },
      ],
    },
  ],
};

module.exports = sidebars;
