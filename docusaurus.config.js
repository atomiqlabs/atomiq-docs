// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

// Shared TypeDoc options for consistent formatting
const sharedTypedocOptions = {
  skipErrorChecking: true,
  sanitizeComments: true,
  plugin: [
    'typedoc-plugin-merge-modules',
    './scripts/typedoc-search-keywords.mjs',
  ],
  pageTitleTemplates: {
    member: '{name}',
  },
  excludeInternal: true,
  excludePrivate: true,
  excludeExternals: true,
  categorizeByGroup: false,
  navigation: {
    includeCategories: true,
    includeGroups: false,
  },
  hideGroupHeadings: true,
  hideBreadcrumbs: true,
  useCodeBlocks: true,
  useCustomAnchors: true,
  parametersFormat: 'table',
  typeDeclarationFormat: 'table',
  propertyMembersFormat: 'list',
  classPropertiesFormat: 'list',
  sort: ['visibility', 'enum-member-source-order', 'alphabetical'],
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Atomiq Docs',
  tagline: 'Trustless cross-chain swaps between Bitcoin and smart chains',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.atomiq.exchange',
  baseUrl: '/',

  organizationName: 'atomiqlabs',
  projectName: 'atomiq-docs',

  onBrokenLinks: 'warn',

  markdown: {
    format: 'detect',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    // ============================================
    // Single SDK Reference docs instance
    // ============================================
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'sdk-reference',
        path: 'sdk-reference',
        routeBasePath: 'sdk-reference',
        sidebarPath: './sidebars-sdk-reference.js',
      },
    ],

    // ============================================
    // API Reference docs instance (OpenAPI)
    // ============================================
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api-reference',
        path: 'api-reference',
        routeBasePath: 'api-reference',
        sidebarPath: './sidebars-api-reference.js',
        docItemComponent: '@theme/ApiItem',
      },
    ],

    // ============================================
    // OpenAPI docs generator
    // ============================================
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'api-reference',
        config: {
          swapperApi: {
            specPath: 'repos/atomiq-sdk/openapi.json',
            outputDir: 'api-reference',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          },
        },
      },
    ],

    // ============================================
    // TypeDoc: All (SDK + Chains + Storage)
    // ============================================
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'typedoc-all',
        entryPoints: [
          'repos/atomiq-sdk/src/index.ts',
          'repos/atomiq-chain-solana/src/index.ts',
          'repos/atomiq-chain-solana/src/node/index.ts',
          'repos/atomiq-chain-starknet/src/index.ts',
          'repos/atomiq-chain-starknet/src/node/index.ts',
          'repos/atomiq-chain-evm/src/index.ts',
          'repos/atomiq-chain-evm/src/node/index.ts',
          'repos/atomiq-storage-sqlite/src/index.ts',
          'repos/atomiq-storage-rn-async/src/index.ts',
          'repos/atomiq-storage-memory-indexed-kv/src/index.ts',
        ],
        tsconfig: './typedoc.tsconfig.json',
        out: 'sdk-reference/api',
        readme: 'none',
        ...sharedTypedocOptions,
        mergeModulesMergeMode: 'module',
      },
    ],
  ],

  themes: [
    'docusaurus-theme-openapi-docs',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: ['/', 'sdk-reference', 'docs'],
        docsDir: ['sdk-reference', 'docs'],
        searchContextByPaths: ['sdk-reference', 'developers'],
        hashed: true,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        useAllContextsWithNoSearchContext: true
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/', // Docs at root
          editUrl: 'https://github.com/atomiqlabs/atomiq-docs/tree/main/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/atomiq-social-card.jpg',
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Atomiq',
        logo: {
          alt: 'Atomiq Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'overviewSidebar',
            position: 'left',
            label: 'Overview',
          },
          {
            type: 'docSidebar',
            sidebarId: 'guidesSidebar',
            position: 'left',
            label: 'Guides',
          },
          {
            type: 'dropdown',
            label: 'Developers',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'developersSidebar',
                label: 'SDK Guide',
              },
              {
                to: '/sdk-reference/',
                label: 'SDK Reference',
              },
              {
                type: 'docSidebar',
                sidebarId: 'restApiSidebar',
                label: 'REST API Guide',
              },
              {
                to: '/api-reference/atomiq-sdk-swapper-api',
                label: 'REST API Reference',
              },
            ],
          },
          {
            href: 'https://atomiq.exchange',
            label: 'App',
            position: 'right',
          },
          {
            href: 'https://github.com/atomiqlabs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Introduction',
                to: '/',
              }
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/atomiq',
              },
              {
                label: 'Twitter',
                href: 'https://x.com/atomiqlabs',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/atomiqlabs',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Atomiq Labs.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
