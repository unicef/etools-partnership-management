import {fireEvent} from '../../utils/fire-custom-event';
import {replaceAppState} from '../../utils/navigation-helper';
import {isEmptyObject} from '../../utils/utils';
import {Constructor, GenericObject} from '@unicef-polymer/etools-types';
import {ListFilterOption} from '../../../typings/filter.types';
import get from 'lodash-es/get';
import {LitElement, property} from 'lit-element';
import {EtoolsDataTableRow} from '@unicef-polymer/etools-data-table/etools-data-table-row';
import {get as getTranslation} from 'lit-translate';
import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';

function ListsCommonMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ListsCommonClass extends baseClass {
    @property({type: Object})
    urlParams!: GenericObject;

    @property({type: String})
    q!: string;

    @property({type: Object})
    sortOrder!: {field: string; direction: string};

    @property({type: Number})
    debounceTime = 50;

    @property({type: Boolean})
    active = false;

    @property({type: Boolean})
    detailsOpened!: boolean;

    @property({type: Boolean})
    forceDataRefresh = false;

    @property({type: Boolean})
    requiredDataLoaded = false;

    @property({type: Boolean})
    initComplete = false;

    @property({type: Boolean})
    showQueryLoading = false;

    @property({type: String})
    csvDownloadUrl!: string;

    @property({type: Boolean})
    stampListData!: boolean;

    @property({type: String})
    currentLanguage!: string;

    @property({type: Number})
    commonDataLoadedTimestamp = 0;

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
      const rows = this.shadowRoot!.querySelector('#list')!.querySelectorAll(
        'etools-data-table-row'
      ) as NodeListOf<EtoolsDataTableRow> as any;
      if (rows && rows.length) {
        for (let i = 0; i < rows.length; i++) {
          // @ts-ignore
          if (rows[i].detailsOpened) {
            rows[i].detailsOpened = false;
          }
        }
      }
    }

    _sortOrderChanged(e: CustomEvent) {
      this.debounceTime = 150;
      this.sortOrder = e.detail;
    }

    // List fade in fade out effect
    _listChanged(filteredList: any, oldFilteredList: any) {
      const classList = this.shadowRoot!.querySelector('#list')?.classList!;
      if (filteredList instanceof Array && classList.contains('hidden')) {
        classList.remove('hidden');
      }
      if (typeof oldFilteredList === 'undefined') {
        this.showQueryLoading = true;
      }
    }

    /**
     * At page refresh Dexie DBs might be wiped out and the list
     *(filteredPartners,filteredAgreements etc) will be empty.
     * Because of this we need to refilter after list data is saved locally.
     * list-data-path holds the name of the list : filteredAgreements,filteredPartners, etc
     */
    _requiredDataHasBeenLoaded(event: CustomEvent) {
      event.stopImmediatePropagation();

      const listDataPath = (event.target as any).getAttribute('list-data-path');
      const list = get(this, listDataPath);

      if (typeof list === 'undefined' || (Array.isArray(list) && list.length === 0)) {
        this.forceDataRefresh = true;
      }
      // recheck params to trigger agreements filtering
      this.initComplete = false; // TODO : 2 flags that seem very similar..great..
      this.requiredDataLoaded = true;
      // @ts-ignore
      this._init(this.active);
    }

    listAttachedCallback(active: boolean, loadingMsg: string, loadingSource: any) {
      this.stampListData = true;
      if (active) {
        fireEvent(this, 'global-loading', {
          message: loadingMsg,
          active: true,
          loadingSource: loadingSource
        });
      } else {
        this.showQueryLoading = true;
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

    initSortFieldsValues(defaultSortData: any, urlQueryParamsSortData: any) {
      if (urlQueryParamsSortData) {
        const p = urlQueryParamsSortData.split('.');
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
      const queryParams = [];

      for (const field in filters) {
        if (filters[field]) {
          const filterValue = filters[field];
          let filterUrlValue;

          const filterValType = filterValue instanceof Array ? 'array' : typeof filterValue;
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
              if (!(field === 'page' && filterValue === 1)) {
                // do not include page if page=1
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
      const qsParams = [];
      for (const pKey in params) {
        if (params[pKey]) {
          if (params[pKey] instanceof Array && !isEmptyObject(params[pKey])) {
            qsParams.push(pKey + '=' + params[pKey].join(','));
          }
          if (['string', 'number', 'boolean'].indexOf(typeof params[pKey]) > -1) {
            const filterStrVal = String(params[pKey]).trim();
            qsParams.push(pKey + '=' + filterStrVal);
          }
        }
      }
      qsParams.push('format=csv');
      return qsParams.join('&');
    }

    _buildCsvExportUrl(params: GenericObject, endpointUrl: string) {
      return endpointUrl + (endpointUrl.indexOf('?') > -1 ? '&' : '?') + this._buildExportQueryString(params);
    }

    _canFilterData() {
      return this.requiredDataLoaded && this.initComplete;
    }

    // Updates URL state with new query string, and launches query
    _updateUrlAndDislayedData(currentPageUrlPath: string, lastUrlQueryStr: string, qs: string, filterData: () => void) {
      if (qs !== lastUrlQueryStr) {
        // update URL
        replaceAppState(currentPageUrlPath, qs, true);
        // filter agreements
        if (this.requiredDataLoaded) {
          filterData();
        }
      } else {
        if (location.search === '') {
          // only update URL query string, without location change event being fired(no page refresh)
          // used to keep prev list filters values when navigating from details to list page
          replaceAppState(currentPageUrlPath, qs, false);
        }
        if (this.forceDataRefresh && this.requiredDataLoaded) {
          // re-filter list data
          // this will only execute when [list-data]-loaded event is received
          filterData();
          this.forceDataRefresh = false;
        }
      }
    }

    /**
     * Get filter selected options values by option property and filter selected values
     * @param filterOptions
     * @param prop
     * @param selected
     * @param selectedProp
     * @returns {Array}
     */
    getFilterValuesByProperty(filterOptions: ListFilterOption[], prop: string, selected: any, selectedProp: string) {
      const selectedValues = this._convertToInt(selected);
      selectedProp = selectedProp || 'id';
      return filterOptions && filterOptions.length && selectedValues && selectedValues.length
        ? filterOptions.filter((opt) => selectedValues.indexOf(opt[selectedProp]) > -1).map((opt) => opt[prop])
        : [];
    }

    _convertToInt(data: []) {
      return data instanceof Array ? data.map((d) => parseInt(d, 10)) : [];
    }

    translateFilters(filters: AnyObject[]) {
      (filters || []).forEach(
        (filter) =>
          (filter.filterName = filter.filterNameKey ? getTranslation(filter.filterNameKey) : filter.filterName)
      );
      return filters;
    }
  }
  return ListsCommonClass;
}

export default ListsCommonMixin;
