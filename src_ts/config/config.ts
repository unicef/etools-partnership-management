import Dexie from 'dexie';
/**
 * PMP app Dexie DB configuration.
 * For db versioning check: http://dexie.org/docs/Tutorial/Design
 */
declare global {
  interface Window {
    EtoolsPmpApp: any;
    EtoolsRequestCacheDb: any;
    EtoolsSharedDb: any;
    EtoolsLogsLevel: any;
    EtoolsEsmmFitIntoEl: any;
  }
}

window.EtoolsLogsLevel = 'INFO';
window.EtoolsPmpApp = window.EtoolsPmpApp || {};

window.EtoolsPmpApp.DexieDb = new Dexie('pmpApp');
window.EtoolsPmpApp.DexieDb.version(1).stores({
  partners: 'id, name, rating, vendor_number',
  agreements: 'id, agreement_number, agreement_type, partner_name, start, end, status',
  interventions:
    'id, number, partner_name, document_type, ' +
    'cp_outputs, status, title, start, end, sections, unicef_focal_points, offices',

  // etools-ajax v2.0.0 requirements
  listsExpireMapTable: '&name, expire',
  ajaxDefaultDataTable: '&cacheKey, data, expire'
});

// configure app dexie db to be used for caching
window.EtoolsRequestCacheDb = window.EtoolsRequestCacheDb || window.EtoolsPmpApp.DexieDb;

export const BASE_URL = '/pmp/';

const PROD_DOMAIN = 'etools.unicef.org';
const STAGING_DOMAIN = 'etools-staging.unicef.org';
const DEV_DOMAIN = 'etools-dev.unicef.org';
const DEMO_DOMAIN = 'etools-demo.unicef.org';
const LOCAL_DOMAIN = 'localhost:8082';
export const AP_DOMAIN = '/ap/';

export const isProductionServer = () => {
  const location = window.location.href;
  return location.indexOf(PROD_DOMAIN) > -1;
};

export const isStagingServer = () => {
  const location = window.location.href;
  return location.indexOf(STAGING_DOMAIN) > -1;
};

export const isDevServer = () => {
  return window.location.href.indexOf(DEV_DOMAIN) > -1;
};
export const isDemoServer = () => {
  return window.location.href.indexOf(DEMO_DOMAIN) > -1;
};

export const _checkEnvironment = () => {
  const location = window.location.href;
  if (location.indexOf(STAGING_DOMAIN) > -1) {
    return 'STAGING';
  }
  if (location.indexOf(DEMO_DOMAIN) > -1) {
    return 'DEMO';
  }
  if (location.indexOf(DEV_DOMAIN) > -1) {
    return 'DEVELOPMENT';
  }
  if (location.indexOf(LOCAL_DOMAIN) > -1) {
    return 'LOCAL';
  }
  return null;
};

export const tokenEndpointsHost = (host: string) => {
  if (host === 'prp') {
    switch (_checkEnvironment()) {
      case 'LOCAL':
        return 'http://127.0.0.1:8081';
      case 'DEVELOPMENT':
        return 'https://dev.partnerreportingportal.org';
      case 'DEMO':
        return 'https://demo.partnerreportingportal.org';
      case 'STAGING':
        return 'https://demo.partnerreportingportal.org';
      case null:
        return 'https://www.partnerreportingportal.org';
      default:
        return 'https://dev.partnerreportingportal.org';
    }
  }
  return null;
};

export const getDomainByEnv = () => {
  if (window.location.port === '8082') {
    return 'http://localhost:8082/pmp';
  }
  if (isStagingServer()) {
    return 'https://etools-staging.unicef.org/pmp';
  }
  if (isDevServer()) {
    return 'https://etools-dev.unicef.org/pmp';
  }
  if (isDemoServer()) {
    return 'https://etools-demo.unicef.org/pmp';
  }
  if (isProductionServer()) {
    return 'https://etools.unicef.org/pmp';
  }
  return 'https://etools-dev.unicef.org/pmp';
};

export const tokenStorageKeys = {
  prp: 'etoolsPrpToken'
};

export const getTokenEndpoints = {
  prp: 'prpToken'
};
