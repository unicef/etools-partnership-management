import Dexie from "dexie";

/**
 * PMP app Dexie DB configuration.
 * For db versioning check: http://dexie.org/docs/Tutorial/Design
 */

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
