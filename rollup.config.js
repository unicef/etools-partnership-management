/**
 * Code changed to use Static paths for dynamic imports => rollup should do the code splitting automatically
 * Time: 14s; Size 2.86 MB
 */
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import copy from 'rollup-plugin-copy';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';

const copyConfig = {
  targets: [
    {src: 'manifest.json', dest: 'build'},
    {src: 'version.json', dest: 'build'},
    {src: 'upgrade-browser.html', dest: 'build'},
    {src: 'node_modules/@webcomponents/webcomponentsjs/**', dest: 'build/node_modules/@webcomponents/webcomponentsjs'},
    {src: 'node_modules/@webcomponents/shadycss', dest: 'build/node_modules/@webcomponents'},
    {
      src: 'node_modules/web-animations-js/web-animations-next-lite.min.js',
      dest: 'build/node_modules/web-animations-js'
    },
    {src: 'node_modules/leaflet/dist/leaflet.js', dest: 'build/node_modules/leaflet/dist'},
    {src: 'node_modules/esri-leaflet/dist/esri-leaflet.js', dest: 'build/node_modules/esri-leaflet/dist'},
    {
      src: 'node_modules/@mapbox/leaflet-omnivore/leaflet-omnivore.min.js',
      dest: 'build/node_modules/@mapbox/leaflet-omnivore/'
    },
    {src: 'node_modules/leaflet/dist/leaflet.css', dest: 'build/node_modules/leaflet/dist'},
    {src: 'node_modules/leaflet/dist/images/marker-icon.png', dest: 'build/node_modules/leaflet/dist/images'},
    {
      src: 'node_modules/leaflet.markercluster/dist/leaflet.markercluster.js',
      dest: 'build/node_modules/leaflet.markercluster/dist'
    },
    {
      src: 'node_modules/focus-visible/dist/focus-visible.min.js',
      dest: 'build/node_modules/focus-visible/dist'
    },
    {src: 'node_modules/dayjs/dayjs.min.js', dest: 'build/node_modules/dayjs'},
    {src: 'node_modules/dayjs/plugin/utc.js', dest: 'build/node_modules/dayjs/plugin'},
    {src: 'node_modules/dayjs/plugin/isBetween.js', dest: 'build/node_modules/dayjs/plugin'},
    {src: 'node_modules/dayjs/plugin/isSameOrBefore.js', dest: 'build/node_modules/dayjs/plugin'},
    {src: 'node_modules/dayjs/plugin/isSameOrAfter.js', dest: 'build/node_modules/dayjs/plugin'},
    {
      src: 'src/components/pages/interventions/intervention-tab-pages/assets/i18n',
      dest: 'build/src/components/pages/interventions/intervention-tab-pages/assets'
    },
    {
      src: 'node_modules/@unicef-polymer/etools-unicef/src/etools-icons/icons/**',
      dest: 'build/src/icons'
    },
    {src: 'images', dest: 'build'},
    {src: 'assets', dest: 'build'},
    {src: 'index.html', dest: 'build'}
  ]
};

const config = {
  input: 'src/app-shell.js',
  output: {
    dir: 'build/src',
    format: 'es'
  },
  plugins: [
    dynamicImportVars({
      include: [
        'src/components/pages/partners/partners-module.js',
        'src/components/pages/partners/pages/list/partners-list.js',
        'src/components/pages/partners/pages/list/governments-list.js',
        'src/components/pages/partners/pages/overview/partner-overview.js',
        'src/components/pages/partners/pages/details/partner-details.js',
        'src/components/pages/partners/pages/financial-assurance/partner-financial-assurance.js',
        'src/components/pages/agreements/agreements-module.js',
        'src/components/pages/agreements/pages/list/agreements-list.js',
        'src/components/pages/agreements/pages/details/agreement-details.js',
        'src/components/pages/interventions/interventions-module.js',
        'src/components/pages/interventions/pages/list/interventions-list.js',
        'src/components/pages/interventions/pages/new/intervention-new.js',
        // eslint-disable-next-line max-len
        'src/components/pages/interventions/pages/intervention-tab-pages/intervention-metadata/intervention-metadata.js',
        // eslint-disable-next-line max-len
        'src/components/pages/interventions/pages/intervention-tab-pages/intervention-strategy/intervention-strategy.js',
        // eslint-disable-next-line max-len
        'src/components/pages/interventions/pages/intervention-tab-pages/intervention-workplan/intervention-workplan.js',
        // eslint-disable-next-line max-len
        'src/components/pages/interventions/pages/intervention-tab-pages/intervention-workplan-editor/intervention-workplan-editor.js',
        // eslint-disable-next-line max-len
        'src/components/pages/interventions/pages/intervention-tab-pages/intervention-attachments/intervention-attachments.js',
        'src/components/pages/interventions/pages/intervention-tab-pages/intervention-timing/intervention-timing.js',
        // eslint-disable-next-line max-len
        'src/components/pages/interventions/pages/intervention-tab-pages/intervention-progress/intervention-progress.js',
        'src/components/pages/interventions/pages/intervention-tab-pages/intervention-review/intervention-review.js',
        'src/components/pages/reports/reports-module.js',
        'src/components/pages/reports/pages/list/reports-list.js',
        'src/components/pages/reports/pages/progress/report-progress.js',
        'src/components/pages/reports/pages/summary/report-summary.js',
        'src/components/pages/settings/settings-module.js',
        'src/components/pages/not-found/not-found.js'
      ]
    }),
    minifyHTML(),
    copy(copyConfig),
    resolve()
  ],
  preserveEntrySignatures: false
};

if (process.env.NODE_ENV !== 'development') {
  config.plugins.push(terser());
}

export default config;
