// @ts-check
import fs from 'node:fs';
import {themes as prismThemes} from 'prism-react-renderer';

const apiReferenceDir = new URL('./rest-api-reference', import.meta.url);

if (!fs.existsSync(apiReferenceDir)) {
  fs.mkdirSync(apiReferenceDir, {recursive: true});
}

// Copy the canonical OpenAPI spec from the SDK repo into the static dir so it
// ships in the build at /rest-api-reference/openapi.json (next to the generated
// reference pages). Source of truth lives in the SDK repo.
const openapiSrc = new URL('./repos/atomiq-sdk/openapi.json', import.meta.url);
const openapiStaticDir = new URL('./static/rest-api-reference/', import.meta.url);
const openapiDest = new URL('./openapi.json', openapiStaticDir);
if (fs.existsSync(openapiSrc)) {
  fs.mkdirSync(openapiStaticDir, {recursive: true});
  fs.copyFileSync(openapiSrc, openapiDest);
}

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
    // Use git history for sitemap <lastmod> dates and per-page freshness signals.
    experimental_vcs: true,
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
        showLastUpdateTime: true,
      },
    ],

    // ============================================
    // REST API Reference docs instance (OpenAPI)
    // ============================================
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'rest-api-reference',
        path: 'rest-api-reference',
        routeBasePath: 'rest-api-reference',
        sidebarPath: './sidebars-rest-api-reference.js',
        docItemComponent: '@theme/ApiItem',
        showLastUpdateTime: true,
      },
    ],

    // ============================================
    // OpenAPI docs generator
    // ============================================
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'rest-api-reference',
        config: {
          swapperApi: {
            specPath: 'repos/atomiq-sdk/openapi.json',
            outputDir: 'rest-api-reference',
            showSchemas: true,
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

    // ============================================
    // llms.txt + per-page markdown mirrors for AI agents
    // - /llms.txt          → hierarchical index of every page
    // - /llms-full.txt     → all docs concatenated (single fetch)
    // - /<route>.md        → markdown mirror of every HTML page
    // ============================================
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        siteTitle: 'Atomiq Docs',
        siteDescription:
          'Atomiq is a fully trustless cross-chain DEX enabling swaps between ' +
          'Bitcoin/Lightning and smart chains (Solana, Starknet, EVM) using a ' +
          'Bitcoin light client, submarine swaps (HTLCs), and a Request-for-Quote ' +
          'Liquidity Provider network. Two integration surfaces exist: the ' +
          'TypeScript SDK (preferred for JavaScript/TypeScript environments) and ' +
          'a self-hostable REST API (use when the SDK cannot run — non-JS runtimes ' +
          'or environments without local persistence).',
        depth: 2,
        enableDescriptions: true,
        content: {
          enableMarkdownFiles: true,
          enableLlmsFullTxt: true,
          relativePaths: false,
          includeBlog: false,
          includePages: true,
          includeDocs: true,
          // Skip search, redirect aliases, and the unrelated `superpowers/`
          // build artefact so the index stays focused on canonical routes.
          excludeRoutes: [
            '/search',
            '/search/**',
            '/superpowers/**',
            '/developers/**',
          ],
        },
        optionalLinks: [
          {
            title: 'Atomiq REST API — OpenAPI 3.1 spec (JSON)',
            url: 'https://docs.atomiq.exchange/rest-api-reference/openapi.json',
            description:
              'Machine-readable OpenAPI specification for the Atomiq REST API. ' +
              'Use this as the source of truth for endpoint shapes, parameters, ' +
              'and error responses when generating client code.',
          },
          {
            title: 'Atomiq SDK on npm',
            url: 'https://www.npmjs.com/package/@atomiqlabs/sdk',
            description: 'TypeScript SDK package for integrating Atomiq swaps.',
          },
          {
            title: 'Atomiq GitHub organization',
            url: 'https://github.com/atomiqlabs',
            description: 'All Atomiq protocol, SDK, and contract repositories.',
          },
        ],
        // Top-level prioritisation: getting-started → guides → SDK → REST API.
        includeOrder: [
          '/',
          '/overview/**',
          '/guides/**',
          '/sdk-guide/**',
          '/sdk-reference/**',
          '/rest-api-guide/**',
          '/rest-api-reference/**',
        ],
      },
    ],

    // ============================================
    // Backward-compatibility redirects for renamed paths
    // ============================================
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Generates a legacy-path alias for every real page.
        // Every /sdk-guide/* page also serves at the old /developers/* URL.
        createRedirects(existingPath) {
          if (existingPath.startsWith('/sdk-guide')) {
            return [existingPath.replace(/^\/sdk-guide/, '/developers')];
          }
          return undefined;
        },
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
        searchContextByPaths: ['sdk-reference', 'sdk-guide'],
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
          // Surface git-based last-updated timestamps for AI agents and humans
          // alike. Feeds <lastmod> in sitemap.xml and the per-page footer.
          showLastUpdateTime: true,
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
        // Emit <lastmod> for AI agents and search engines so they can
        // prioritise fresh content. ignorePatterns excludes search and
        // tag pages from the sitemap.
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          lastmod: 'date',
          ignorePatterns: ['/tags/**', '/search'],
          filename: 'sitemap.xml',
          // Fall back to today's build date for routes without git history
          // (auto-generated TypeDoc + OpenAPI pages live in gitignored
          // folders and would otherwise be emitted without a <lastmod>).
          createSitemapItems: async ({defaultCreateSitemapItems, ...rest}) => {
            const items = await defaultCreateSitemapItems(rest);
            const today = new Date().toISOString().split('T')[0];
            return items.map((item) =>
              item.lastmod ? item : {...item, lastmod: today},
            );
          },
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
                sidebarId: 'sdkGuideSidebar',
                label: 'SDK Guide',
              },
              {
                to: '/sdk-reference/',
                label: 'SDK Reference',
              },
              {
                type: 'docSidebar',
                sidebarId: 'restApiGuideSidebar',
                label: 'REST API Guide',
              },
              {
                to: '/rest-api-reference/atomiq-rest-api',
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
