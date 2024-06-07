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
    applyFocusVisiblePolyfill: any;
    ajaxErrorParserTranslateFunction: any;
    EtoolsLanguage: string;
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

export const SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY = 'etoolsAppSmallMenuIsActive';
export const AP_DOMAIN = '/ap/';

export const tokenStorageKeys = {
  prp: 'etoolsPrpToken'
};

export const getTokenEndpoints = {
  prp: 'prpToken'
};
