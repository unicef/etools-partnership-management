// export default {
//   port: 8080,
//   watch: true,
//   nodeResolve: true,
//   // appIndex: 'index.html',
//   plugins: [],
//   moduleDirs: ['node_modules']
//   // esbuildTarget: 'auto'
// };

import {hmrPlugin, presets} from '@open-wc/dev-server-hmr';

/** Use Hot Module replacement by adding --hmr to the start command */
//import proxy from 'koa-proxies';

const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  nodeResolve: true,
  port: 8080,
  watch: !hmr,

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  /** Set appIndex to enable SPA routing */
  appIndex: 'index.html',
  // middleware: [
  //   function rewrite(context, next) {
  //     if (context.url.includes('/wds')) {
  //       console.log('HERE ---', context);
  //       context.url = 'ws://localhost:8082/epd/wds';
  //     }

  //     return next();
  //   }
  // ],
  // plugins: [
  //   /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
  //   hmr && hmrPlugin({exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement]}),
  //   {
  //     name: 'resolve-base-path',
  //     transform(context) {
  //       if (context.response.is('html')) {
  //         return {
  //           body: context.body.replace(
  //             '<script type="module" src="/__web-dev-server__web-socket.js"></script>',
  //             '<script type="module" src="/epd/__web-dev-server__web-socket.js"></script>'
  //           )
  //         };
  //       }
  //     }
  //   }
  //   hmrPlugin({
  //     exclude: ['**/*/node_modules/**/*'],
  //     presets: [presets.litElement],
  //     decorators: [
  //       // any class that uses a decorator called customElement
  //       {name: 'customElement'}
  //     ]
  //   }),
  //],

  /** Confgure bare import resolve plugin */
  // nodeResolve: {
  //   exportConditions: ['browser', 'development']
  // },
  basePath: '/epd'
  // rootDir: 'epd'

  // See documentation for all available options
});
