// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  sdkSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Overview',
    },
    {
      type: 'category',
      label: 'Core',
      collapsed: false,
      items: [
        { type: 'doc', id: 'classes/SwapperFactory', label: 'SwapperFactory' },
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        { type: 'doc', id: 'type-aliases/TypedSwapperOptions', label: 'TypedSwapperOptions' },
      ],
    },
    {
      type: 'category',
      label: 'Storage',
      items: [
        { type: 'doc', id: 'classes/LocalStorageManager', label: 'LocalStorageManager' },
      ],
    },
    {
      type: 'category',
      label: 'Utilities',
      items: [
        { type: 'doc', id: 'functions/toHumanReadableString', label: 'toHumanReadableString()' },
        { type: 'doc', id: 'functions/fromHumanReadableString', label: 'fromHumanReadableString()' },
        { type: 'doc', id: 'functions/timeoutSignal', label: 'timeoutSignal()' },
      ],
    },
    {
      type: 'category',
      label: 'Types',
      collapsed: true,
      items: [
        { type: 'doc', id: 'type-aliases/TypedSwapper', label: 'TypedSwapper' },
        { type: 'doc', id: 'type-aliases/TypedTokens', label: 'TypedTokens' },
        { type: 'doc', id: 'type-aliases/TypedChainTokens', label: 'TypedChainTokens' },
        { type: 'doc', id: 'type-aliases/TypedChainTokenResolver', label: 'TypedChainTokenResolver' },
        { type: 'doc', id: 'type-aliases/TypedTokenResolvers', label: 'TypedTokenResolvers' },
        { type: 'doc', id: 'type-aliases/TypedSwap', label: 'TypedSwap' },
      ],
    },
  ],
};

module.exports = sidebars;
