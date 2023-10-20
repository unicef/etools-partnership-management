export const workboxConfig = {
  globDirectory: "src/",
  globPatterns: [
    'manifest.json',
    '**/*'
  ],
  swDest: "src/service-worker.js",
  runtimeCaching: [
    {
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: 'StaleWhileRevalidate'
    },
    {
      urlPattern: /^https:\/\/fonts.gstatic.com\//,
      handler: 'StaleWhileRevalidate'
    },
    {
      urlPattern: /^https:\/\/fonts.googleapis.com\//,
      handler: 'StaleWhileRevalidate'
    }

  ]
};
