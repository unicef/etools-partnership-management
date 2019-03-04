import Dexie from 'dexie';
/**
 * PMP app Dexie DB configuration.
 * For db versioning check: http://dexie.org/docs/Tutorial/Design
 */
declare global {
  interface Window { EtoolsPmpApp: any; EtoolsRequestCacheDb: any; EtoolsLogsLevel: any; EtoolsEsmmFitIntoEl: any; }
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

export const BASE_URL: string = '/pmp_poly3/';

const PROD_DOMAIN: string = 'etools.unicef.org';
const STAGING_DOMAIN: string = 'etools-staging.unicef.org';
const DEV_DOMAIN: string = 'etools-dev.unicef.org';
const DEMO_DOMAIN: string = 'etools-demo.unicef.org';
export const AP_DOMAIN: string = '/ap/';

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

export const getDomainByEnv = () => {
  if (window.location.port === '8082') {
    return 'http://localhost:8082/pmp_poly3';
  }
  if (isStagingServer()) {
    return 'https://etools-staging.unicef.org/pmp_poly3';
  }
  if (isDevServer()) {
    return 'https://etools-dev.unicef.org/pmp_poly3';
  }
  if (isDemoServer()) {
    return 'https://etools-demo.unicef.org/pmp_poly3';
  }
  if (isProductionServer()) {
    return 'https://etools.unicef.org/pmp_poly3';
  }
  return 'https://etools-dev.unicef.org/pmp_poly3';
}

export const tokenStorageKeys = {
  prp: 'etoolsPrpToken'
};

export const getTokenEndpoints = {
  prp: 'prpToken'
};
