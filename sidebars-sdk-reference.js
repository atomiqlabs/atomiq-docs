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
    'atomiq-storage-sqlite': 'SQLite',
    'atomiq-storage-rn-async': 'React Native Async',
    'atomiq-storage-memory-indexed-kv': 'Memory Indexed KV',
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

/**
 * Convert flat category names with "/" into nested category structures
 * e.g., "EVM/Networks/Alpen" becomes EVM > Networks > Alpen
 */
function nestCategories(items) {
  // Build a tree structure from flat categories
  const result = [];
  const categoryMap = new Map(); // Track created categories by path

  for (const item of items) {
    if (item.type === 'category' && item.label && item.label.includes('/')) {
      // Split the path: "EVM/Networks/Alpen" -> ["EVM", "Networks", "Alpen"]
      const parts = item.label.split('/');
      const leafLabel = parts.pop(); // "Alpen"

      // Find or create parent categories
      let currentLevel = result;
      let currentPath = '';

      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        // Check if this category already exists at current level
        let existingCategory = currentLevel.find(
          c => c.type === 'category' && c.label === part
        );

        if (!existingCategory) {
          existingCategory = {
            type: 'category',
            label: part,
            collapsed: true,
            items: [],
          };
          currentLevel.push(existingCategory);
          categoryMap.set(currentPath, existingCategory);
        }

        currentLevel = existingCategory.items;
      }

      // Add the leaf category with its items
      currentLevel.push({
        ...item,
        label: leafLabel,
      });
    } else if (item.type === 'category' && item.items) {
      // Recursively process nested items
      result.push({
        ...item,
        items: nestCategories(item.items),
      });
    } else {
      // Keep non-category items as-is
      result.push(item);
    }
  }

  return result;
}

// Module names for classification
const sdkModules = ['atomiq-sdk'];
const chainModules = ['atomiq-chain-solana', 'atomiq-chain-starknet', 'atomiq-chain-evm'];
const storageModules = ['atomiq-storage-sqlite', 'atomiq-storage-rn-async', 'atomiq-storage-memory-indexed-kv'];

// Load unified TypeDoc sidebar
let allSidebar = [];
try {
  allSidebar = require('./sdk-reference/api/typedoc-sidebar.cjs');
} catch (e) { /* not generated yet */ }

// Fix paths for the unified output
const fixedAll = fixPaths(allSidebar, 'api');

// Classify top-level items into SDK, Chains, and Storage
let sdkItems = [];
let chainItems = [];
let storageItems = [];

for (const item of fixedAll) {
  const label = item.label || '';
  if (sdkModules.includes(label)) {
    // For SDK, use the module's inner items directly (flatten module wrapper)
    sdkItems = sdkItems.concat(item.items || []);
  } else if (chainModules.includes(label)) {
    chainItems.push(item);
  } else if (storageModules.includes(label)) {
    storageItems.push(item);
  } else {
    // Unknown modules go to SDK by default
    sdkItems.push(item);
  }
}

// Unwrap "src" level from SDK items if it's the only top-level category
if (sdkItems.length === 1 && sdkItems[0].type === 'category' && sdkItems[0].label === 'src') {
  sdkItems = sdkItems[0].items || [];
}

// Apply transforms to chains and storage
const fixedChains = renameChainLabels(
  flattenSrcLevel(chainItems).map(chain => {
    // Apply nestCategories to each chain's items
    if (chain.type === 'category' && chain.items) {
      return {
        ...chain,
        items: nestCategories(chain.items),
      };
    }
    return chain;
  })
);

const fixedStorage = renameChainLabels(
  flattenSrcLevel(storageItems)
);

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  sdkReferenceSidebar: [
    // SDK Section
    {
      type: 'category',
      label: 'SDK',
      collapsed: false,
      items: sdkItems,
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
