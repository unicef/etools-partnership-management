import Dexie from 'dexie';
/**
 * PMP app Dexie DB configuration.
 * For db versioning check: http://dexie.org/docs/Tutorial/Design
 */
declare global {
  interface Window { EtoolsPmpApp: any; EtoolsRequestCacheDb: any; EtoolsLogsLevel: any; }
}

window.EtoolsLogsLevel = 'INFO';
window.EtoolsPmpApp = window.EtoolsPmpApp || {};

window.EtoolsPmpApp.DexieDb = new Dexie('pmpApp');
window.EtoolsPmpApp.DexieDb.version(1).stores({
  partners: 'id, name, rating, vendor_number',
  agreements: 'id, agreement_number, agreement_type, partner_name, start, end, status',
  interventions: 'id, number, partner_name, document_type, ' +
      'cp_outputs, status, title, start, end, sections, unicef_focal_points, offices',

  // etools-ajax v2.0.0 requirements
  listsExpireMapTable: '&name, expire',
  ajaxDefaultDataTable: '&cacheKey, data, expire'
});

// configure app dexie db to be used for caching
window.EtoolsRequestCacheDb = window.EtoolsRequestCacheDb || window.EtoolsPmpApp.DexieDb;


const PROD_DOMAIN: string = 'etools.unicef.org';
const STAGING_DOMAIN: string = 'etools-staging.unicef.org';
const DEV_DOMAIN: string = 'etools-dev.unicef.org';
const DEMO_DOMAIN: string = 'etools-demo.unicef.org';

export const isProductionServer = () => {
  let location = window.location.href;
  return location.indexOf(PROD_DOMAIN) > -1;
};

export const isStagingServer = () => {
  let location = window.location.href;
  return location.indexOf(STAGING_DOMAIN) > -1;
};

export const isDevServer = () => {
  return window.location.href.indexOf(DEV_DOMAIN) > -1;
};
export const isDemoServer = () => {
  return window.location.href.indexOf(DEMO_DOMAIN) > -1;
};

export const tokenEndpointsHost = (host: string) => {
  if (host === 'prp') {
    if (window.location.port === '8082') {
      return 'http://127.0.0.1:8080';
    }
    if (isStagingServer()) {
      return 'https://demo.partnerreportingportal.org';
    }
    if (isDevServer()) {
      return 'https://dev.partnerreportingportal.org';
    }
    if (isDemoServer()) {
      return 'https://demo.partnerreportingportal.org';
    }
    if (isProductionServer()) {
      return 'https://www.partnerreportingportal.org';
    }
    return 'https://dev.partnerreportingportal.org';
  }
  return null;
};

export const tokenStorageKeys = {
  prp: 'etoolsPrpToken'
};

export const getTokenEndpoints = {
  prp: 'prpToken'
};
