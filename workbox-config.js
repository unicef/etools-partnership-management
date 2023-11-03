export const workboxConfig = {
  globDirectory: "src/",
  globIgnores: [
    'index.html',
  ],
  globPatterns: [
    'manifest.json',
    'version.json',
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
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'StaleWhileRevalidate'
    }
  ]
};
