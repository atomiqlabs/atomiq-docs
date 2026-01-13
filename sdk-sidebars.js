// @ts-check

/**
 * Fix paths in TypeDoc-generated sidebar items
 * Removes '../sdk/' prefix from doc IDs
 */
function fixPaths(items) {
  return items.map(item => {
    const fixed = { ...item };

    // Fix direct doc id
    if (fixed.type === 'doc' && fixed.id) {
      fixed.id = fixed.id.replace(/^\.\.\/sdk\//, '');
    }

    // Fix link id
    if (fixed.link && fixed.link.type === 'doc' && fixed.link.id) {
      fixed.link = {
        ...fixed.link,
        id: fixed.link.id.replace(/^\.\.\/sdk\//, ''),
      };
    }

    // Recursively fix nested items
    if (fixed.items && Array.isArray(fixed.items)) {
      fixed.items = fixPaths(fixed.items);
    }

    return fixed;
  });
}

// Load and immediately transform the TypeDoc sidebar
const typedocSidebar = require('./sdk/typedoc-sidebar.cjs');
const fixedItems = fixPaths(typedocSidebar);

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  sdkSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Overview',
    },
    ...fixedItems,
  ],
};

module.exports = sidebars;
