import {property} from '@polymer/decorators';
//import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin';
import { PolymerElEvent, GenericObject, Constructor } from '../../typings/globals.types';
import { fireEvent } from '../utils/fire-custom-event';
import { PolymerElement } from '@polymer/polymer';
import { updateAppState } from '../utils/navigation-helper';
import { PolymerElement } from '@polymer/polymer';

function ListsCommonMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
 class listCommonMixin extends baseClass {

    @property({type: Object})
    urlParams!: GenericObject;

    @property({type: String, notify: true})
    q!: string;

    @property({type: Object})
    sortOrder!: {field: string, direction: string};

    @property({type: Number})
    debounceTime: number = 50;

    @property({type: Boolean})
    active: boolean = false;

    @property({type: Boolean})
    detailsOpened!: boolean;

    @property({type: Boolean})
    forceDataRefresh: boolean = false;

    @property({type: Boolean})
    requiredDataLoaded: boolean = false;

    @property({type: Boolean})
    initComplete: boolean = false;

    @property({type: Boolean})
    showQueryLoading: boolean = false;

    @property({type: String, notify: true})
    csvDownloadUrl!: string;

    @property({type: Boolean})
    stampListData!: boolean;


connectedCallback() {
  super.connectedCallback();
  this._sortOrderChanged = this._sortOrderChanged.bind(this);
  this.addEventListener('sort-changed', this._sortOrderChanged as EventListenerOrEventListenerObject);
}

disconnectedCallback() {
  super.disconnectedCallback();
  this.removeEventListener('sort-changed', this._sortOrderChanged as EventListenerOrEventListenerObject);
}

// When the list data rows are changing check and close any details opened
_listDataChanged() {
  let rows = this.$.list.querySelectorAll('etools-data-table-row') as NodeListOf<PolymerElement>;
  if (rows && rows.length) {
    for (let i = 0; i < rows.length; i++) {
      // @ts-ignore
      if (rows[i].detailsOpened) {
        rows[i].set('detailsOpened', false);
      }
    }

    _sortOrderChanged(e: CustomEvent) {
      this.set('debounceTime', 150);
      this.set('sortOrder', e.detail);
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
  // @ts-ignore
  this._init(this.active);
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
 * Make sure you define _sortableFieldNames on *-list element properties level.
 * Ex for partners:
 * _sortableFieldNames: {
 *    type: Array,
 *    value: ['vendor_number', 'name']
 *  }
 */
_isValidSortField(fieldName: string) {
  // @ts-ignore
  return this._sortableFieldNames instanceof Array && this._sortableFieldNames.indexOf(fieldName) > -1;
}

    listAttachedCallback(active: boolean, loadingMsg: string, loadingSource: any) {
      this.set('stampListData', true);
      if (active) {
        fireEvent(this, 'global-loading', {
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
        updateAppState(currentPageUrlPath, qs, true);
        // filter agreements
        if (this.requiredDataLoaded) {
          filterData();
        }
      } else {
        if (location.search === '') {
          // only update URL query string, without location change event being fired(no page refresh)
          // used to keep prev list filters values when navigating from details to list page
          updateAppState(currentPageUrlPath, qs, false);
        }
        if (this.forceDataRefresh && this.requiredDataLoaded) {
          // re-filter list data
          // this will only execute when [list-data]-loaded event is received
          filterData();
          this.set('forceDataRefresh', false);
        }
      }
    }

};
return listsCommonClass;
}


_canFilterData() {
  return this.requiredDataLoaded && this.initComplete;
}

// Updates URL state with new query string, and launches query
_updateUrlAndDislayedData(currentPageUrlPath: string, lastUrlQueryStr: string, qs: string, filterData: () => void) {
  if (qs !== lastUrlQueryStr) {
    // update URL
    updateAppState(currentPageUrlPath, qs, true);
    // filter agreements
    if (this.requiredDataLoaded) {
      filterData();
    }
  } else {
    if (location.search === '') {
      // only update URL query string, without location change event being fired(no page refresh)
      // used to keep prev list filters values when navigating from details to list page
      updateAppState(currentPageUrlPath, qs, false);
    }
    if (this.forceDataRefresh && this.requiredDataLoaded) {
      // re-filter list data
      // this will only execute when [list-data]-loaded event is received
      filterData();
      this.set('forceDataRefresh', false);
    }
  }
}

};
 return listCommonMixin;
}

export default ListsCommonMixin;
