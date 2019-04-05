import {connect} from 'pwa-helpers/connect-mixin.js';
import {store, RootState} from '../../../../../store.js';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-icon-item';
import '@polymer/paper-item/paper-item-body';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-styles/element-styles/paper-material-styles';
import 'etools-data-table/etools-data-table.js';
import 'etools-date-time/datepicker-lite.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import 'etools-dropdown/etools-dropdown.js';

import ListsCommonMixin from '../../../../mixins/lists-common-mixin.js';
import ListFiltersMixin from '../../../../mixins/list-filters-mixin';
import PaginationMixin from '../../../../mixins/pagination-mixin.js';
import CommonMixin from '../../../../mixins/common-mixin';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin';
import { isEmptyObject, isJsonStrMatch } from '../../../../utils/utils.js';

import {SharedStyles} from '../../../../styles/shared-styles.js';
import {listFilterStyles} from '../../../../styles/list-filter-styles.js';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles.js';
import '../../data/agreements-list-data.js';
import { partnersDropdownDataSelector } from '../../../../../reducers/partners.js';
import { fireEvent } from '../../../../utils/fire-custom-event.js';
import {AgreementsListData} from '../../data/agreements-list-data';
import {property} from '@polymer/decorators';


 let _agreementsLastNavigated: string = '';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin CommonMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin ListFiltersMixin
 * @appliesMixin ListsCommonMixin
 * @appliesMixin PaginationMixin
 */
//@ts-ignore
class AgreementsList extends connect(store)(CommonMixin(EndpointsMixin(ListFiltersMixin(ListsCommonMixin
(PaginationMixin(PolymerElement)))))) {


  static get template() {
    return html`
      ${SharedStyles} ${listFilterStyles} ${gridLayoutStyles}
      <style include="paper-material-styles data-table-styles">

        .ag-ref {
          @apply --text-btn-style;
          text-transform: none;
        }

      </style>

      <template is="dom-if" if="[[stampListData]]">
        <agreements-list-data id="agreements"
                              filtered-agreements="{{filteredAgreements}}"
                              total-results="{{paginator.count}}"
                              list-data-path="filteredAgreements"
                              on-agreements-loaded="_requiredDataHasBeenLoaded"
                              fire-data-loaded>
        </agreements-list-data>
      </template>

      <div id="filters" class="paper-material" elevation="1">

        <div id="filters-fields">
          <paper-input id="query"
                      class="filter"
                      type="search"
                      placeholder="Search"
                      autocomplete="off"
                      value="{{q}}">
            <iron-icon icon="search" slot="prefix"></iron-icon>
          </paper-input>

          <template is="dom-repeat" items="[[selectedFilters]]" as="filter">
            <template is="dom-if" if="[[filterTypeIs('esmm', filter.type)]]">
              <!-- esmm multi -->
              <etools-dropdown-multi
                  class="filter"
                  label="[[filter.filterName]]"
                  placeholder="Select"
                  disabled$="[[!filter.selectionOptions.length]]"
                  options="[[filter.selectionOptions]]"
                  option-value="[[filter.optionValue]]"
                  option-label="[[filter.optionLabel]]"
                  selected-values="{{filter.alreadySelected}}"
                  data-filter-path$="[[filter.path]]"
                  on-etools-selected-items-changed="esmmValueChanged"
                  trigger-value-change-event
                  hide-search="[[filter.hideSearch]]"
                  min-width="[[filter.minWidth]]"
                  horizontal-align="left"
                  no-dynamic-align>
              </etools-dropdown-multi>
            </template>

            <template is="dom-if" if="[[filterTypeIs('datepicker', filter.type)]]">
              <datepicker-lite id$="datepicker_[[filter.path]]"
                                class="filter date"
                                label="[[filter.filterName]]"
                                placeholder="Select"
                                value="{{filter.dateSelected}}"
                                on-date-has-changed="_filterDateHasChanged"
                                data-filter-path$="[[filter.path]]"
                                fire-date-has-changed>
              </datepicker-lite>
            </template>

            <template is="dom-if" if="[[filterTypeIs('etools-dropdown', filter.type)]]">
                <div class="filter">
                  <etools-dropdown
                    class="filter"
                    label="[[filter.filterName]]"
                    placeholder="Select"
                    disabled$="[[!filter.selectionOptions.length]]"
                    options="[[filter.selectionOptions]]"
                    option-value="[[filter.optionValue]]"
                    option-label="[[filter.optionLabel]]"
                    selected="{{filter.alreadySelected}}"
                    trigger-value-change-event
                    on-etools-selected-item-changed="filterValueChanged"
                    data-filter-path$="[[filter.path]]"
                    hide-search="[[filter.hideSearch]]"
                    min-width="[[filter.minWidth]]"
                    horizontal-align="left"
                    no-dynamic-align
                    enable-none-option>
                </etools-dropdown>
                </div>
              </template>

          </template>
        </div>

        <div class="fixed-controls">
          <paper-menu-button id="filterMenu" ignore-select horizontal-align="right">
            <paper-button class="button" slot="dropdown-trigger">
              <iron-icon icon="filter-list"></iron-icon>
              Filters
            </paper-button>
            <div slot="dropdown-content" class="clear-all-filters">
                <paper-button on-tap="clearAllFilterValues"
                      class="secondary-btn">
                        CLEAR ALL
                </paper-button>
            </div>
            <paper-listbox slot="dropdown-content" multi>
              <template is="dom-repeat" items="[[listFilterOptions]]">
                <paper-icon-item on-tap="selectFilter" selected$="[[item.selected]]">
                  <iron-icon icon="check" slot="item-icon" hidden$="[[!item.selected]]"></iron-icon>
                  <paper-item-body>[[item.filterName]]</paper-item-body>
                </paper-icon-item>
              </template>
            </paper-listbox>
          </paper-menu-button>
        </div>

      </div>

      <div id="list" class="paper-material hidden" elevation="1">

        <etools-data-table-header
            id="listHeader"
            label="[[paginator.visible_range.0]]-[[paginator.visible_range.1]] of [[paginator.count]] results to show">
          <etools-data-table-column class="col-2" field="agreement_number" sortable>
            Reference No.
          </etools-data-table-column>
          <etools-data-table-column class="col-4" field="partner_name" sortable>
            Partner Full Name
          </etools-data-table-column>
          <etools-data-table-column class="col-2" field="partner_type">
            Type
          </etools-data-table-column>
          <etools-data-table-column class="col-2" field="partner_status">
            Status
          </etools-data-table-column>
          <etools-data-table-column class="flex-c" field="start" sortable>
            Start Date
          </etools-data-table-column>
          <etools-data-table-column class="flex-c" field="end" sortable>
            End Date
          </etools-data-table-column>
        </etools-data-table-header>

        <template id="rows" is="dom-repeat"
                  items="[[filteredAgreements]]" as="agreement"
                  initial-count="10" on-dom-change="_listDataChanged">
          <etools-data-table-row details-opened="[[detailsOpened]]">
            <div slot="row-data">
              <span class="col-data col-2">
                <a class="ag-ref truncate"
                  href="agreements/[[agreement.id]]/details"
                  title="[[getDisplayValue(agreement.agreement_number)]]"
                  on-tap="_triggerAgreementLoadingMsg">
                  [[getDisplayValue(agreement.agreement_number)]]
                </a>
              </span>
              <span class="col-data col-4" title="[[getDisplayValue(agreement.partner_name)]]">
                <span class="truncate"> [[getDisplayValue(agreement.partner_name)]] </span>
              </span>
              <span class="col-data col-2">
                  [[getDisplayValue(agreement.agreement_type)]]
              </span>
              <span class="col-data col-2 capitalize">
                  [[getDisplayValue(agreement.status)]]
              </span>
              <span class="col-data flex-c">
                  [[_checkAndShowAgreementDate(agreement.start)]]
              </span>
              <span class="col-data flex-c">
                  [[_checkAndShowAgreementDate(agreement.end)]]
              </span>

            </div>
            <div slot="row-data-details">

              <div class="row-details-content col-2">
                <span class="rdc-title">Signed By Partner Date</span>
                <span>[[_checkAndShowAgreementDate(agreement.signed_by_partner_date)]]</span>
              </div>
              <div class="row-details-content col-2">
                <span class="rdc-title">Signed By UNICEF Date</span>
                <span>[[_checkAndShowAgreementDate(agreement.signed_by_unicef_date)]]</span>
              </div>

            </div>
          </etools-data-table-row>
        </template>

        <etools-data-table-footer
            page-size="{{paginator.page_size}}"
            page-number="{{paginator.page}}"
            total-results="[[paginator.count]]"
            visible-range="{{paginator.visible_range}}">
        </etools-data-table-footer>

      </div>
    `;
  }

  @property({type: Array, notify: true, observer: '_listChanged'})
  filteredAgreements: [] = [];

  @property({type: Array})
  selectedAgTypes: [] = [];

  @property({type: Array})
  selectedAgStatuses: [] = [];

  @property({type: Array, observer: '_arrayFilterChanged'})
  selectedPartners: [] = [];

  @property({type: Array, observer: '_arrayFilterChanged'})
  selectedCPStructures: [] = [];

  @property({type: String, observer: 'resetPageNumber'})
  startDate: string = '';

  @property({type: String, observer: 'resetPageNumber'})
  endDate: string = '';

  @property({type: Array})
  partnersDropdownData: [] = [];

  @property({type: Array})
  countryProgrammes: [] = [];

  @property({type: Array})
  agreementTypes: [] = [];

  @property({type: Array})
  agreementStatuses: [] = [];

  @property({type: Array})
  _sortableFieldNames: [] = ['agreement_number', 'partner_name', 'start', 'end'];

  @property({type: String})
  isSpecialConditionsPca: string | null = null;

  static get observers() {
    return [
      'resetPageNumber(q, selectedAgTypes.length, selectedAgStatuses.length, ' +
      'selectedCPStructures.length)', // used for non removable filters
      '_initFiltersMenuList(partnersDropdownData, agreementStatuses, agreementTypes, countryProgrammes)',
      '_updateUrlAndData(q, selectedAgTypes.length, selectedAgStatuses.length, ' +
      'selectedPartners, selectedCPStructures.length,' +
      'startDate, endDate, paginator.page, paginator.page_size, sortOrder, requiredDataLoaded,' +
      'initComplete, isSpecialConditionsPca)',
      '_init(active)'
    ];
  }

  stateChanged(state: RootState) {
    this.partnersDropdownData = partnersDropdownDataSelector(state);

    if (!isJsonStrMatch(state.commonData!.agreementStatuses, this.agreementStatuses)) {
      this.agreementStatuses = [...state.commonData!.agreementStatuses];
    }
    if (!isJsonStrMatch(state.commonData!.agreementTypes, this.agreementTypes)) {
      this.agreementTypes = [...state.commonData!.agreementTypes];
    }
    if (!isJsonStrMatch(state.commonData!.countryProgrammes, this.countryProgrammes)) {
      this.countryProgrammes = [...state.commonData!.countryProgrammes];
    }
  }

  _initFiltersMenuList(partnersDropdownData: [], agreementStatuses: [], agreementTypes: [], countryProgrammes: []) {
    if (!partnersDropdownData || !agreementStatuses || !agreementTypes || !countryProgrammes) {
      // this is just to be safe, the method should only get triggered once when redux data is loaded
      return;
    }
    // init list filter options
    this.initListFiltersData([
      {
        filterName: 'CP Structure',
        type: 'esmm', // etools-dropdown-multi
        selectionOptions: countryProgrammes,
        optionValue: 'id',
        optionLabel: 'name',
        alreadySelected: [],
        path: 'selectedCPStructures',
        selected: true,
        minWidth: '400px',
        hideSearch: true
      },
      {
        filterName: 'Ends Before',
        type: 'datepicker',
        dateSelected: '',
        path: 'endDate',
        selected: false
      },
      {
        filterName: 'Partner',
        type: 'esmm', // etools-dropdown-multi
        selectionOptions: partnersDropdownData,
        optionValue: 'value',
        optionLabel: 'label',
        alreadySelected: [],
        path: 'selectedPartners',
        selected: false,
        minWidth: '400px',
        hideSearch: false
      },
      {
        filterName: 'Starts After',
        type: 'datepicker',
        dateSelected: '',
        path: 'startDate',
        selected: false
      },
      {
        filterName: 'Status',
        type: 'esmm', // etools-dropdown-multi
        selectionOptions: agreementStatuses,
        optionValue: 'value',
        optionLabel: 'label',
        alreadySelected: [],
        path: 'selectedAgStatuses',
        selected: true,
        minWidth: '160px',
        hideSearch: true
      },
      {
        filterName: 'Type',
        type: 'esmm', // etools-dropdown-multi
        selectionOptions: agreementTypes,
        optionValue: 'value',
        optionLabel: 'label',
        alreadySelected: [],
        path: 'selectedAgTypes',
        selected: true,
        minWidth: '350px',
        hideSearch: true
      },
      {
        filterName: 'Special Conditions PCA',
        type: 'etools-dropdown',
        singleSelection: true,
        selectionOptions: [{value: 'true', label: 'Yes'}, {value: 'false', label: 'No'}],
        optionValue: 'value',
        optionLabel: 'label',
        alreadySelected: null,
        path: 'isSpecialConditionsPca',
        minWidth: '350px',
        hideSearch: true,
        allowEmpty: true
      }
    ]);
    this._updateSelectedFiltersValues();
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'ag-page'});
    this.listAttachedCallback(this.active, 'Loading...', 'ag-list');
  }

  // Input: URL query params
  // Initializes the properties of the list at page load
  // to the params interpretted from the URL string.
  _init(active: boolean) {
    let urlQueryParams = this.urlParams;

    if (!active || !urlQueryParams) {
      return;
    }

    if (isEmptyObject(urlQueryParams)) {
      urlQueryParams.status = 'draft|signed|suspended';
    }
    this.set('initComplete', false);
    this.setProperties(
        {
          q: urlQueryParams.q ? urlQueryParams.q : '',
          selectedAgTypes: this._getFilterUrlValuesAsArray(urlQueryParams.type),
          selectedAgStatuses: this._getFilterUrlValuesAsArray(urlQueryParams.status),
          selectedPartners: this._getFilterUrlValuesAsArray(urlQueryParams.partners),
          selectedCPStructures: this._getFilterUrlValuesAsArray(urlQueryParams.cpStructures),
          startDate: urlQueryParams.start ? urlQueryParams.start : '',
          endDate: urlQueryParams.end ? urlQueryParams.end : '',
          isSpecialConditionsPca: urlQueryParams.special_conditions_pca
        }
    );

    this.setPaginationDataFromUrlParams(urlQueryParams);

    // format of sort param is sort=field.order ex: sort=name.asc
    let result = this.initSortFieldsValues({field: 'partner_name', direction: 'asc'}, urlQueryParams.sort);
    this.set('sortOrder', result);
    this.set('initComplete', true);
    this._updateSelectedFiltersValues();
  }


  _updateSelectedFiltersValues() {
    this.updateShownFilterDebouncer = Debouncer.debounce(this.updateShownFilterDebouncer,
        timeOut.after(20),
        () => {
          let filtersValues = [
            {
              filterName: 'Type',
              selectedValue: this.selectedAgTypes
            },
            {
              filterName: 'Status',
              selectedValue: this.selectedAgStatuses
            },
            {
              filterName: 'CP Structure',
              selectedValue: this.selectedCPStructures
            },
            {
              filterName: 'Partner',
              selectedValue: this.selectedPartners
            },
            {
              filterName: 'Starts After',
              selectedValue: this.startDate
            },
            {
              filterName: 'Ends Before',
              selectedValue: this.endDate
            },
            {
              filterName: 'Special Conditions PCA',
              selectedValue: this.isSpecialConditionsPca,
              allowEmpty: true
            }
          ];
          this.updateShownFilters(filtersValues);
        });
  }

  // Updates URL state with new query string, and launches query
  _updateUrlAndData() {
    if (this._canFilterData()) {
      this.set('csvDownloadUrl', this._buildCsvDownloadUrl());

      let qs = this._buildQueryString();

      this._updateUrlAndDislayedData('agreements/list', _agreementsLastNavigated, qs,
          this._filterListData.bind(this));

      _agreementsLastNavigated = qs || _agreementsLastNavigated;//TODO -test
    }
  }

  _filterListData(forceNoLoading: boolean) {
    // Query is debounced with a debounce time
    // set depending on what action the user takes
    this.queryDebouncer = Debouncer.debounce(this.queryDebouncer,
        timeOut.after(this.debounceTime),
        () => {
          let agreements = this.shadowRoot!.querySelector('#agreements') as AgreementsListData;
          if (!agreements) {
            return;
          }
          agreements.query(
              this.sortOrder.field,
              this.sortOrder.direction,
              this.q.trim().toLowerCase(),
              this.selectedAgTypes,
              this.selectedAgStatuses,
              this.getFilterValuesByProperty(this.partnersDropdownData,
                  'label', this.selectedPartners, 'value'),
              this.startDate,
              this.endDate,
              this.selectedCPStructures,
              this._getIsSpecialConditionsPca(),
              this.paginator.page,
              this.paginator.page_size,
              forceNoLoading ? false : this.showQueryLoading
          );
        });
  }

  // Outputs the query string for the list
  _buildQueryString() {
    return this._buildUrlQueryString({
      page: this.paginator.page,
      size: this.paginator.page_size,
      q: this.q,
      type: this.selectedAgTypes,
      status: this.selectedAgStatuses,
      partners: this.selectedPartners,
      start: this.startDate,
      end: this.endDate,
      cpStructures: this.selectedCPStructures,
      sort: this.sortOrder,
      special_conditions_pca: this._getIsSpecialConditionsPca()
    });
  }

  _buildCsvDownloadUrl() {
    let endpointUrl = this.getEndpoint('agreements').url;
    let params = {
      agreement_type: this.selectedAgTypes,
      status: this.selectedAgStatuses,
      partner_name: this.getFilterValuesByProperty(this.partnersDropdownData,
          'label', this.selectedPartners, 'value'),
      start: this.startDate,
      end: this.endDate,
      cpStructures: this.selectedCPStructures,
      search: this.q,
      special_conditions_pca: this._getIsSpecialConditionsPca()
    };
    return this._buildCsvExportUrl(params, endpointUrl);
  }

  _getIsSpecialConditionsPca() {
    if (this.isSpecialConditionsPca === null || typeof this.isSpecialConditionsPca === 'undefined') {
      return '';
    }
    return this.isSpecialConditionsPca;
  }

  _arrayFilterChanged(filterVal: [], oldFilterVals: []) {
    if (typeof oldFilterVals !== 'undefined' && filterVal.length !== oldFilterVals.length) {
      this.resetPageNumber();
    }
  }

  // verify date and prettify or not
  _checkAndShowAgreementDate(dateString: string) {
    return this.getDateDisplayValue(dateString);
  }

  _triggerAgreementLoadingMsg() {
    fireEvent(this, 'trigger-agreement-loading-msg');
  }

}

window.customElements.define('agreements-list', AgreementsList);
