// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

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
    // Second docs instance for SDK Reference (TypeDoc generated)
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'sdk-reference',
        path: 'sdk',
        routeBasePath: 'sdk-reference',
        sidebarPath: './sdk-sidebars.js',
      },
    ],
    // TypeDoc plugin generates SDK docs
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'sdk',
        entryPoints: ['repos/atomiq-sdk/src/index.ts', 'repos/atomiq-sdk-lib/src/index.ts'],
        tsconfig: './typedoc.tsconfig.json',
        out: 'sdk',
        readme: './repos/atomiq-sdk/README.md',  // Use SDK README for overview page
        skipErrorChecking: true,
        sanitizeComments: true,

        // Merge modules plugin - flattens both SDK repos into single namespace
        plugin: ['typedoc-plugin-merge-modules'],
        mergeModulesMergeMode: 'project',  // Merge all modules into root

        // Hide internal/private
        excludeInternal: true,
        excludePrivate: true,

        // Flatten structure - show categories, not Classes/Functions/Type Aliases
        categorizeByGroup: false,  // KEY: Categories at top level, not nested in groups
        navigation: {
          includeCategories: true,
          includeGroups: false,  // Remove Classes/Functions/Type Aliases grouping
        },

        // Clean up page headers
        hideGroupHeadings: true,   // Remove "Classes", "Functions" headings
        hideBreadcrumbs: true,     // Simpler navigation

        // Formatting
        useCodeBlocks: true,
        parametersFormat: 'table',
        typeDeclarationFormat: 'table',
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
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            to: '/sdk-reference',
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
