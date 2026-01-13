// @ts-check

/**
 * Fix paths in TypeDoc-generated sidebar items
 * Removes prefix from doc IDs to work with unified structure
 */
function fixPaths(items, prefix) {
  return items.map(item => {
    const fixed = { ...item };

    // Fix direct doc id
    if (fixed.type === 'doc' && fixed.id) {
      fixed.id = fixed.id.replace(new RegExp(`^\\.\\.\\/sdk-reference\\/${prefix}\\/`), `${prefix}/`);
    }

    // Fix link id
    if (fixed.link && fixed.link.type === 'doc' && fixed.link.id) {
      fixed.link = {
        ...fixed.link,
        id: fixed.link.id.replace(new RegExp(`^\\.\\.\\/sdk-reference\\/${prefix}\\/`), `${prefix}/`),
      };
    }

    // Recursively fix nested items
    if (fixed.items && Array.isArray(fixed.items)) {
      fixed.items = fixPaths(fixed.items, prefix);
    }

    return fixed;
  });
}

/**
 * Flatten the "src" level from chain modules
 * atomiq-chain-solana > src > classes → atomiq-chain-solana > classes
 */
function flattenSrcLevel(items) {
  return items.map(item => {
    if (item.type === 'category' && item.items) {
      // Check if this category only contains a "src" subcategory
      if (item.items.length === 1 && item.items[0].type === 'category' && item.items[0].label === 'src') {
        // Flatten: use src's items directly
        return {
          ...item,
          items: item.items[0].items || [],
          link: item.items[0].link, // Preserve the link if any
        };
      }
      // Recursively process nested items
      return {
        ...item,
        items: flattenSrcLevel(item.items),
      };
    }
    return item;
  });
}

/**
 * Rename chain package labels to cleaner names
 */
function renameChainLabels(items) {
  const labelMap = {
    'atomiq-chain-solana': 'Solana',
    'atomiq-chain-starknet': 'Starknet',
    'atomiq-chain-evm': 'EVM',
  };

  return items.map(item => {
    const fixed = { ...item };
    if (fixed.label && labelMap[fixed.label]) {
      fixed.label = labelMap[fixed.label];
    }
    if (fixed.items && Array.isArray(fixed.items)) {
      fixed.items = renameChainLabels(fixed.items);
    }
    return fixed;
  });
}

// Load TypeDoc sidebars
let sdkSidebar = [];
let chainsSidebar = [];
let storageSidebar = [];

try {
  sdkSidebar = require('./sdk-reference/sdk/typedoc-sidebar.cjs');
} catch (e) { /* not generated yet */ }

try {
  chainsSidebar = require('./sdk-reference/chains/typedoc-sidebar.cjs');
} catch (e) { /* not generated yet */ }

try {
  storageSidebar = require('./sdk-reference/storage/typedoc-sidebar.cjs');
} catch (e) { /* not generated yet */ }

// Fix paths for each section
const fixedSdk = fixPaths(sdkSidebar, 'sdk');
const fixedChains = renameChainLabels(flattenSrcLevel(fixPaths(chainsSidebar, 'chains')));
const fixedStorage = fixPaths(storageSidebar, 'storage');

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  sdkReferenceSidebar: [
    // SDK Section
    {
      type: 'category',
      label: 'SDK',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'sdk/index',
      },
      items: fixedSdk,
    },

    // Chains Section
    {
      type: 'category',
      label: 'Chains',
      collapsed: true,
      items: fixedChains,
    },

    // Storage Section
    {
      type: 'category',
      label: 'Storage',
      collapsed: true,
      items: fixedStorage,
    },
  ],
};

module.exports = sidebars;
