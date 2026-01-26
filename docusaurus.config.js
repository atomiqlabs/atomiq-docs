// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

// Shared TypeDoc options for consistent formatting
const sharedTypedocOptions = {
  skipErrorChecking: true,
  sanitizeComments: true,
  plugin: ['typedoc-plugin-merge-modules'],
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
  parametersFormat: 'table',
  typeDeclarationFormat: 'table',
  sort: ['visibility', 'alphabetical'],
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

  onBrokenLinks: 'throw',

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
    // TypeDoc: SDK
    // ============================================
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'typedoc-sdk',
        entryPoints: ['repos/atomiq-sdk/src/index.ts'],
        tsconfig: './typedoc.tsconfig.json',
        out: 'sdk-reference/sdk',
        readme: './repos/atomiq-sdk/README.md',
        ...sharedTypedocOptions,
        mergeModulesMergeMode: 'project',
      },
    ],

    // ============================================
    // TypeDoc: Chains
    // ============================================
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'typedoc-chains',
        entryPoints: [
          'repos/atomiq-chain-solana/src/index.ts',
          'repos/atomiq-chain-starknet/src/index.ts',
          'repos/atomiq-chain-evm/src/index.ts',
        ],
        tsconfig: './typedoc.tsconfig.json',
        out: 'sdk-reference/chains',
        readme: 'none',
        ...sharedTypedocOptions,
        mergeModulesMergeMode: 'module',
      },
    ],

    // ============================================
    // TypeDoc: Storage
    // ============================================
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'typedoc-storage',
        entryPoints: ['repos/atomiq-storage-sqlite/src/index.ts', 
                      'repos/atomiq-storage-rn-async/src/index.ts', 
                      'repos/atomiq-storage-memory-indexed-kv/src/index.ts'],
        tsconfig: './typedoc.tsconfig.json',
        out: 'sdk-reference/storage',
        readme: 'none',
        ...sharedTypedocOptions,
        mergeModulesMergeMode: 'module',
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
            sidebarId: 'protocolSidebar',
            position: 'left',
            label: 'Protocol',
          },
          {
            type: 'docSidebar',
            sidebarId: 'sdkTutorialsSidebar',
            position: 'left',
            label: 'SDK Tutorials',
          },
          {
            to: '/sdk-reference/sdk',
            label: 'SDK Reference',
            position: 'left',
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
