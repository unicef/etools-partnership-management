/** Use Hot Module replacement by adding --hmr to the start command */
// const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  nodeResolve: true,
  port: 8080,
  /** Doesn't work because of basePath https://github.com/modernweb-dev/web/pull/1790 */
  watch: false,
  /** Set appIndex to enable SPA routing */
  appIndex: 'index.html',
  basePath: '/epd'
});
