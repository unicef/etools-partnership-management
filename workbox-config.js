export const workboxConfig = {
  globDirectory: "src/",
  globPatterns: [
    'manifest.json',
    'src/**/*',
    'node_modules/**/*',
    'assets/**/*',
    'images/**/*'
  ],
  swDest: "src/service-worker.js",
  runtimeCaching: [
    {
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: 'StaleWhileRevalidate'
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts-stylesheets",
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        cacheableResponse: {
          statuses: [0, 200]
        },
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30
        }
      }
    }
  ]
};
