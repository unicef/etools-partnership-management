import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EventHelperMixin from './event-helper-mixin';
import { PolymerElEvent, GenericObject } from '../../typings/globals.types';

const ListsCommonMixin =  dedupingMixin(
  (baseClass: any) => class extends EtoolsMixinFactory.combineMixins([
    //AppNavigationHelper,
    EventHelperMixin], baseClass) {
    [x: string]: any;

static get properties() {
  return {
    urlParams: {
      type: Object
    },

    q: {
      type: String,
      notify: true
    },

    sortOrder: Object,

    debounceTime: {
      type: Number,
      value: 50
    },

    active: Boolean,

    detailsOpened: Boolean,

    forceDataRefresh: {
      type: Boolean,
      value: false
    },

    requiredDataLoaded: {
      type: Boolean,
      value: false
    },

    initComplete: {
      type: Boolean,
      value: false
    },

    showQueryLoading: {
      type: Boolean,
      value: false
    },

    csvDownloadUrl: {
      type: String,
      notify: true
    },

    stampListData: Boolean
  };
}

connectedCallback() {
  super.connectedCallback();
  this._sortOrderChanged = this._sortOrderChanged.bind(this);
  this.addEventListener('sort-changed', this._sortOrderChanged);
}

disconnectedCallback() {
  super.disconnectedCallback();
  this.removeEventListener('sort-changed', this._sortOrderChanged);
}

// When the list data rows are changing check and close any details opened
_listDataChanged() {
  let rows = this.$.list.querySelectorAll('etools-data-table-row');
  if (rows && rows.length) {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].detailsOpened) {
        rows[i].set('detailsOpened', false);
      }
    }
  }
}

_sortOrderChanged(e: CustomEvent) {
  this.set('debounceTime', 150);
  this.set('sortOrder', e.detail);
}

// List fade in fade out effect
_listChanged(filteredList: any, oldFilteredList: any) {
  let classList = this.$.list.classList;
  if (filteredList instanceof Array && classList.contains('hidden')) {
    classList.remove('hidden');
  }
  if (typeof oldFilteredList === 'undefined') {
    this.set('showQueryLoading', true);
  }
}

/**
 * At page refresh Dexie DBs might be wiped out and the list
 *(filteredPartners,filteredAgreements etc) will be empty.
 * Because of this we need to refilter after list data is saved locally.
 * list-data-path holds the name of the list : filteredAgreements,filteredPartners, etc
 */
_requiredDataHasBeenLoaded(event: PolymerElEvent) {
  event.stopImmediatePropagation();

  let listDataPath = event.target.getAttribute('list-data-path');
  let list = this.get(listDataPath);

  if (typeof list === 'undefined' ||
      (Array.isArray(list) && list.length === 0)) {
    this.set('forceDataRefresh', true);
  }
  // recheck params to trigger agreements filtering
  this.set('initComplete', false); // TODO : 2 flags that seem very similar..great..
  this.set('requiredDataLoaded', true);
  this._init(this.active);
}

listAttachedCallback(active: boolean, loadingMsg: string, loadingSource: any) {
  this.set('stampListData', true);
  if (active) {
    this.fireEvent('global-loading', {
      message: loadingMsg,
      active: true,
      loadingSource: loadingSource
    });
  } else {
    this.set('showQueryLoading', true);
  }
}

/**
 * Make sure you define _sortableFieldNames on *-list element properties level.
 * Ex for partners:
 * _sortableFieldNames: {
 *    type: Array,
 *    value: ['vendor_number', 'name']
 *  }
 */
_isValidSortField(fieldName: string) {
  return this._sortableFieldNames instanceof Array && this._sortableFieldNames.indexOf(fieldName) > -1;
}

initSortFieldsValues(defaultSortData: any, urlQueryParamsSortData: any) {
  if (urlQueryParamsSortData) {
    let p = urlQueryParamsSortData.split('.');
    if (this._isValidSortField(p[0])) {
      return {field: p[0], direction: p[1]};
    }
  }
  return defaultSortData;
}

_getFilterUrlValuesAsArray(types: string) {
  return types ? types.split('|') : [];
}

// Outputs the query string for the list
_buildUrlQueryString(filters: GenericObject) {
  let queryParams = [];

  for (let field in filters) {
    if (filters[field]) {
      let filterValue = filters[field];
      let filterUrlValue;

      let filterValType = filterValue instanceof Array ? 'array' : typeof filterValue;
      switch (filterValType) {
        case 'array':
          if (filterValue instanceof Array && filterValue.length) {
            filterUrlValue = filterValue.join('|');
          }
          break;
        case 'object':
          if (field === 'sort' && filterValue.field && filterValue.direction) {
            filterUrlValue = filterValue.field + '.' + filterValue.direction;
          }
          break;
        default:
          if (!(field === 'page' && filterValue === 1)) { // do not include page if page=1
            filterUrlValue = String(filterValue).trim();
          }
      }

      if (filterUrlValue) {
        queryParams.push(field + '=' + filterUrlValue);
      }
    }
  }

  return queryParams.join('&');
}

_buildExportQueryString(params: GenericObject) {
  let qsParams = [];
  for (let pKey in params) {
    if (params[pKey]) {
      if (params[pKey] instanceof Array && !params[pKey]) {
        qsParams.push(pKey + '=' + params[pKey].join(','));
      }
      if (['string', 'number'].indexOf(typeof params[pKey]) > -1) {
        let filterStrVal = String(params[pKey]).trim();
        qsParams.push(pKey + '=' + filterStrVal);
      }
    }
  }
  qsParams.push('format=csv');
  return qsParams.join('&');
}

_buildCsvExportUrl(params: GenericObject, endpointUrl: string) {
  return endpointUrl + '?' + this._buildExportQueryString(params);
}

_canFilterData() {
  return this.requiredDataLoaded && this.initComplete;
}

// Updates URL state with new query string, and launches query
_updateUrlAndDislayedData(currentPageUrlPath: string, lastUrlQueryStr: string, qs: string, filterData: () => void) {
  if (qs !== lastUrlQueryStr) {
    // update URL
    this.updateAppState(currentPageUrlPath, qs, true);
    // filter agreements
    if (this.requiredDataLoaded) {
      filterData();
    }
  } else {
    if (location.search === '') {
      // only update URL query string, without location change event being fired(no page refresh)
      // used to keep prev list filters values when navigating from details to list page
      this.updateAppState(currentPageUrlPath, qs, false);
    }
    if (this.forceDataRefresh && this.requiredDataLoaded) {
      // re-filter list data
      // this will only execute when [list-data]-loaded event is received
      filterData();
      this.set('forceDataRefresh', false);
    }
  }
}

});

export default ListsCommonMixin;
