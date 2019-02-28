import { PolymerElement, html } from '@polymer/polymer';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';

import 'etools-dropdown/etools-dropdown-multi.js';
import 'etools-data-table/etools-data-table.js';
import 'etools-info-tooltip/etools-info-tooltip.js';
import 'etools-date-time/datepicker-lite.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
// @ts-ignore
import {EtoolsCurrency} from 'etools-currency-amount-input/mixins/etools-currency-mixin.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../store.js';
import CONSTANTS from '../../../../../config/app-constants';
import CommonMixin from '../../../../mixins/common-mixin';
import ListFiltersMixin from '../../../../mixins/list-filters-mixin';
import ListsCommonMixin from '../../../../mixins/lists-common-mixin';
import FrNumbersConsistencyMixin from '../../mixins/fr-numbers-consistency-mixin';
import PaginationMixin from '../../../../mixins/pagination-mixin';
import { SharedStyles } from '../../../../styles/shared-styles';
import { gridLayoutStyles } from '../../../../styles/grid-layout-styles';
import { listFilterStyles } from '../../../../styles/list-filter-styles';
import { frWarningsStyles } from '../../styles/fr-warnings-styles';
import '../../data/interventions-list-data.js';
import { isEmptyObject, isJsonStrMatch } from '../../../../utils/utils.js';
import { pmpCustomIcons } from '../../../../styles/custom-iconsets/pmp-icons.js';
import { fireEvent } from '../../../../utils/fire-custom-event.js';


let _interventionsLastNavigated: string = '';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsCurrency
 * @appliesMixin CommonMixin
 * @appliesMixin ListFiltersMixin
 * @appliesMixin ListsCommonMixin
 * @appliesMixin FrNumbersConsistencyMixin
 * @appliesMixin PaginationMixin
 */
class InterventionsList extends connect(store)(EtoolsMixinFactory.combineMixins([
  EtoolsCurrency,
  CommonMixin,
  ListFiltersMixin,
  ListsCommonMixin,
  FrNumbersConsistencyMixin,
  PaginationMixin
], PolymerElement)) {

  static get template() {
    return html`
    ${SharedStyles} ${gridLayoutStyles} ${listFilterStyles} ${frWarningsStyles}
    <style
        include="data-table-styles paper-material-styles">
      :host {
        @apply --layout-flex;
        width: 100%;
      }

      .pd-ref {
        @apply --text-btn-style;
        text-transform: none;
      }
    </style>
    ${pmpCustomIcons}
    <template is="dom-if" if="[[stampListData]]">
      <interventions-list-data id="interventions"
                              filtered-interventions="{{filteredInterventions}}"
                              total-results="{{paginator.count}}"
                              on-interventions-loaded="_requiredDataHasBeenLoaded"
                              list-data-path="filteredInterventions"
                              fire-data-loaded>
      </interventions-list-data>
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
            <etools-dropdown-multi
                class="filter"
                label="[[filter.filterName]]"
                placeholder="&#8212;"
                disabled$="[[!filter.selectionOptions.length]]"
                options="[[filter.selectionOptions]]"
                option-value="[[filter.optionValue]]"
                option-label="[[filter.optionLabel]]"
                selected-values="{{filter.alreadySelected}}"
                trigger-value-change-event
                on-etools-selected-items-changed="esmmValueChanged"
                data-filter-path$="[[filter.path]]"
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
                              placeholder="&#8212;"
                              value="{{filter.dateSelected}}"
                              on-date-has-changed="_filterDateHasChanged"
                              data-filter-path$="[[filter.path]]"
                              fire-date-has-changed>
            </datepicker-lite>
          </template>

        </template>
      </div>

      <div class="fixed-controls">

        <paper-menu-button id="filterMenu" ignore-select horizontal-align="right" allow-outside-scroll>
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

    <div id="list" class="paper-material" elevation="1">

      <etools-data-table-header
          id="listHeader"
          label="[[paginator.visible_range.0]]-[[paginator.visible_range.1]] of [[paginator.count]] results to show">
        <etools-data-table-column class="col-2" field="number" sortable>
          Reference #
        </etools-data-table-column>
        <etools-data-table-column class="col-3" field="partner_name" sortable>
          Partner Name
        </etools-data-table-column>
        <etools-data-table-column class="flex-c" field="document_type">
          Document Type
        </etools-data-table-column>
        <etools-data-table-column class="flex-c" field="status">
          Status
        </etools-data-table-column>
        <etools-data-table-column class="col-2" field="title">
          Title
        </etools-data-table-column>
        <etools-data-table-column class="flex-c" field="start" sortable>
          Start Date
        </etools-data-table-column>
        <etools-data-table-column class="flex-c" field="end" sortable>
          End Date
        </etools-data-table-column>
      </etools-data-table-header>

      <template id="rows" is="dom-repeat" notify-dom-change items="[[filteredInterventions]]"
                as="intervention" initial-count="10" on-dom-change="_listDataChanged">
        <etools-data-table-row details-opened="[[detailsOpened]]">
          <div slot="row-data" class="p-relative">
            <span class="col-data col-2">
              <a class="pd-ref truncate"
                href="interventions/[[intervention.id]]/details"
                title="[[getDisplayValue(intervention.number)]]"
                on-tap="_triggerInterventionLoadingMsg">
                [[getDisplayValue(intervention.number)]]
              </a>
            </span>
            <span class="col-data col-3" title="[[getDisplayValue(intervention.partner_name)]]">
                <span class="truncate">[[getDisplayValue(intervention.partner_name)]]</span>
            </span>
            <span class="col-data flex-c">
                [[getDisplayValue(intervention.document_type)]]
            </span>
            <span class="col-data flex-c capitalize">
                [[getDisplayValue(intervention.status)]]
            </span>
            <span class="col-data col-2" title="[[getDisplayValue(intervention.title)]]">
                [[getDisplayValue(intervention.title)]]
            </span>
            <span class="col-data flex-c">
              <etools-info-tooltip class="fr-nr-warn"
                                  custom-icon
                                  icon-first
                                  hide-tooltip$="[[_hideDateFrsWarningTooltip(intervention.start, intervention.frs_earliest_start_date, intervention.status)]]">
                <span slot="field">[[getDateDisplayValue(intervention.start)]]</span>
                <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                <span slot="message">[[getFrsStartDateValidationMsg()]]</span>
              </etools-info-tooltip>
            </span>
            <span class="col-data flex-c">
              <etools-info-tooltip class="fr-nr-warn"
                                    custom-icon
                                    icon-first
                                    hide-tooltip$="[[_hideDateFrsWarningTooltip(intervention.end, intervention.frs_latest_end_date, intervention.status)]]">
                <span slot="field">[[getDateDisplayValue(intervention.end)]]</span>
                <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                <span slot="message">[[getFrsEndDateValidationMsg()]]</span>
              </etools-info-tooltip>
            </span>
          </div>

          <div slot="row-data-details" class="p-relative">

            <div class="row-details-content col-2">
              <span class="rdc-title">Offices</span>
              <span>[[getDisplayValue(intervention.offices_names)]]</span>
            </div>
            <div class="row-details-content col-2">
              <span class="rdc-title">Section</span>
              <span>[[getDisplayValue(intervention.section_names)]]</span>
            </div>
            <div class="row-details-content col-2">
              <span class="rdc-title">UNICEF Cash Contribution</span>
              <etools-info-tooltip
                  class$="fr-nr-warn [[getCurrencyMismatchClass(intervention.all_currencies_are_consistent)]] interventions-list"
                  icon-first
                  custom-icon
                  hide-tooltip="[[hideIntListUnicefCashAmountTooltip(intervention.all_currencies_are_consistent, intervention.unicef_cash, intervention.frs_total_frs_amt, intervention, 'interventionsList')]]">
                <span slot="field">
                  <span class="amount-currency">[[intervention.budget_currency]]</span>
                  <span>[[displayCurrencyAmount(intervention.unicef_cash, '0.00')]]</span>
                </span>
                <iron-icon icon="[[getFrsCurrencyTooltipIcon(intervention.fr_currencies_are_consistent)]]"
                          slot="custom-icon"></iron-icon>
                <span slot="message">
                  <span>[[getIntListUnicefCashAmountTooltipMsg(intervention.all_currencies_are_consistent, intervention.fr_currencies_are_consistent)]]</span>
                </span>
              </etools-info-tooltip>
            </div>
            <div class="row-details-content col-2">
              <span class="rdc-title">Total Budget</span>
              <span>
                <span class="amount-currency">[[intervention.budget_currency]]</span>
                <span>[[displayCurrencyAmount(intervention.total_budget, '0.00')]]</span>
              </span>
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

  static get properties() {
    return {
      filteredInterventions: {
        type: Array,
        notify: true,
        observer: '_listChanged'
      },

      documentTypes: {
        type: Array,
        statePath: 'interventionDocTypes'
      },

      selectedDocumentTypes: {
        type: Array,
        value: []
      },

      interventionStatuses: {
        type: Array,
        statePath: 'interventionStatuses'
      },

      selectedStatuses: {
        type: Array,
        value: []
      },

      startDate: {
        type: String,
        observer: '_filtersChanged'
      },

      endDate: {
        type: String,
        observer: '_filtersChanged'
      },

      endAfter: {
        type: String,
        observer: '_filtersChanged'
      },

      cpOutputs: {
        type: Array,
        statePath: 'cpOutputs'
      },
      selectedCpOutputs: {
        type: Array,
        value: [],
        observer: '_arrayFilterChanged'
      },

      countryProgrammes: {
        type: Array,
        statePath: 'countryProgrammes'
      },
      sections: {
        type: Array,
        statePath: 'sections'
      },

      selectedSections: {
        type: Array,
        value: []
      },

      unicefUsersData: {
        type: Array,
        statePath: 'unicefUsersData'
      },

      selectedUnicefFocalPoints: {
        type: Array,
        value: [],
        observer: '_arrayFilterChanged'
      },

      offices: {
        type: Array,
        statePath: 'offices'
      },

      selectedOffices: {
        type: Array,
        value: []
      },

      donors: {
        type: Array,
        statePath: 'donors'
      },

      selectedDonors: {
        type: Array,
        value: [],
        observer: '_arrayFilterChanged'
      },

      grants: {
        type: Array,
        statePath: 'grants'
      },

      selectedGrants: {
        type: Array,
        value: [],
        observer: '_arrayFilterChanged'
      },

      csvDownloadQs: {
        type: String,
        notify: true
      },

      _sortableFieldNames: {
        type: Array,
        value: ['number', 'partner_name', 'start', 'end']
      },

      selectedCPStructures: {
        type: Array,
        value: [],
        observer: '_arrayFilterChanged'
      }
    };
  }

  static get observers() {
    return [
      '_filtersChanged(q, selectedStatuses.length, selectedDocumentTypes.length, ' +
          'selectedSections.length, selectedOffices.length, ' +
          'selectedCPStructures.length)', // used for non removable filters
      '_initFiltersMenuList(cpOutputs, unicefUsersData, donors, grants, countryProgrammes, offices, ' +
          'documentTypes, sections, interventionStatuses)',
      '_updateUrlAndData(q, selectedDocumentTypes.length, selectedCpOutputs.length, selectedStatuses.length, ' +
          'selectedSections.length, selectedUnicefFocalPoints.length, selectedOffices.length, ' +
          'selectedDonors.length, selectedGrants.length, startDate, endDate, endAfter, selectedCPStructures.length, ' +
          'paginator.page, paginator.page_size, sortOrder, requiredDataLoaded, initComplete)',
      '_init(active)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.cpOutputs, state.commonData!.cpOutputs)) {
      this.cpOutputs = [...state.commonData!.cpOutputs];
    }
    if (!isJsonStrMatch(this.documentTypes, state.commonData!.interventionDocTypes)) {
      this.documentTypes = [...state.commonData!.interventionDocTypes];
    }
    if (!isJsonStrMatch(this.interventionStatuses, state.commonData!.interventionStatuses)) {
      this.interventionStatuses = [...state.commonData!.interventionStatuses];
    }
    if (!isJsonStrMatch(this.countryProgrammes, state.commonData!.countryProgrammes)) {
      this.countryProgrammes = [...state.commonData!.countryProgrammes];
    }
    if (!isJsonStrMatch(this.sections, state.commonData!.sections)) {
      this.sections = [...state.commonData!.sections];
    }
    if (!isJsonStrMatch(this.unicefUsersData, state.commonData!.unicefUsersData)) {
      this.unicefUsersData = [...state.commonData!.unicefUsersData];
    }
    if (!isJsonStrMatch(this.offices, state.commonData!.offices)) {
      this.offices = [...state.commonData!.offices];
    }
    if (!isJsonStrMatch(this.donors, state.commonData!.donors)) {
      this.donors = [...state.commonData!.donors];
    }
    if (!isJsonStrMatch(this.grants, state.commonData!.grants)) {
      this.grants = [...state.commonData!.grants];
    }

  }

  ready() {
    super.ready();
    this.$.list.classList.add('hidden');
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'interv-page'});

    this.listAttachedCallback(this.active, 'Loading...', 'pd-ssfa-list');
  }

  _initFiltersMenuList(cpOutputs: number[], unicefUsersData: number[], donors: number[],
                      grants: number[], countryProgrammes: number[], offices: number[],
                      documentTypes: string[], sections: number[], interventionStatuses: string[]) {

    if (!cpOutputs || !unicefUsersData || !donors || !grants || !countryProgrammes || !offices ||
        !documentTypes || !sections || !interventionStatuses) {
      // this is just to be safe, the method should only get triggered once when redux data is loaded
      return;
    }

    // init list filter options
    // IMPORTANT!!!
    // If you change filterName make sure you update it as well in _updateSelectedFiltersValues method
    // IMPORTANT!!!
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
        filterName: 'Country Programme Output',
        type: 'esmm', // etools-dropdown-multi
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: cpOutputs,
        alreadySelected: [],
        path: 'selectedCpOutputs',
        selected: false,
        minWidth: '400px'
      },
      {
        filterName: 'Donors',
        type: 'esmm', // etools-dropdown-multi
        optionValue: 'value',
        optionLabel: 'label',
        selectionOptions: donors,
        alreadySelected: [],
        path: 'selectedDonors',
        selected: false,
        minWidth: '400px'
      },
      {
        filterName: 'Ends Before',
        type: 'datepicker', // datepicker-lite
        path: 'endDate',
        dateSelected: '',
        selected: false
      },
      {
        filterName: 'Grants',
        type: 'esmm', // etools-dropdown-multi
        optionValue: 'value',
        optionLabel: 'label',
        selectionOptions: grants,
        alreadySelected: [],
        path: 'selectedGrants',
        selected: false,
        minWidth: '400px'
      },
      {
        filterName: 'Offices',
        type: 'esmm', // etools-dropdown-multi
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: offices,
        alreadySelected: [],
        path: 'selectedOffices',
        selected: true,
        minWidth: '250px',
        hideSearch: true
      },
      {
        filterName: 'PD/SSFA Type',
        type: 'esmm', // etools-dropdown-multi
        optionValue: 'value',
        optionLabel: 'label',
        selectionOptions: documentTypes,
        alreadySelected: [],
        path: 'selectedDocumentTypes',
        selected: true,
        minWidth: '400px',
        hideSearch: true
      },
      {
        filterName: 'Sections',
        type: 'esmm', // etools-dropdown-multi
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: sections,
        alreadySelected: [],
        path: 'selectedSections',
        selected: true,
        minWidth: '350px',
        hideSearch: true
      },
      {
        filterName: 'Starts After',
        type: 'datepicker', // datepicker-lite
        path: 'startDate',
        dateSelected: '',
        selected: false
      },
      {
        filterName: 'Ends After',
        type: 'datepicker',
        dateSelected: '',
        path: 'endAfter',
        selected: false
      },
      {
        filterName: 'Status',
        type: 'esmm', // etools-dropdown-multi
        optionValue: 'value',
        optionLabel: 'label',
        selectionOptions: interventionStatuses,
        alreadySelected: [],
        path: 'selectedStatuses',
        selected: true,
        minWidth: '160px',
        hideSearch: true
      },
      {
        filterName: 'UNICEF focal point',
        type: 'esmm', // etools-dropdown-multi
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: unicefUsersData,
        alreadySelected: [],
        path: 'selectedUnicefFocalPoints',
        selected: false,
        minWidth: '400px'
      }
    ]);
    this._updateSelectedFiltersValues();
  }

  // Input: URL query params
  // Initializes the properties of the list at page load
  // to the params interpretted from the URL string.
  _init(active: boolean) {
    let urlQueryParams = this.urlParams;
    if (!active || !urlQueryParams) {
      return;
    }
    if(isEmptyObject(urlQueryParams)) {
      urlQueryParams.status = 'draft|signed|active|ended|suspended';
    }

    this.set('initComplete', false);
    this.setProperties(
      {
        q: urlQueryParams.q ? urlQueryParams.q : '',
        selectedDocumentTypes: this._getFilterUrlValuesAsArray(urlQueryParams.type),
        selectedStatuses: this._getFilterUrlValuesAsArray(urlQueryParams.status),
        selectedCpOutputs: this._getFilterUrlValuesAsArray(urlQueryParams.cp_outputs),
        selectedSections: this._getFilterUrlValuesAsArray(urlQueryParams.section),
        selectedDonors: this._getFilterUrlValuesAsArray(urlQueryParams.donors),
        selectedGrants: this._getFilterUrlValuesAsArray(urlQueryParams.grants),
        selectedUnicefFocalPoints: this._getFilterUrlValuesAsArray(urlQueryParams.unicef_focal_points),
        selectedOffices: this._getFilterUrlValuesAsArray(urlQueryParams.offices),
        selectedCPStructures: this._getFilterUrlValuesAsArray(urlQueryParams.cpStructures),
        startDate: urlQueryParams.start ? urlQueryParams.start : '',
        endDate: urlQueryParams.end ? urlQueryParams.end : '',
        endAfter: urlQueryParams.endAfter ? urlQueryParams.endAfter: ''
      }
    );

    this.setPaginationDataFromUrlParams(urlQueryParams);

    // format of sort param is sort=field.order ex: sort=partner_name.asc
    let result = this.initSortFieldsValues({field: 'partner_name', direction: 'asc'}, urlQueryParams.sort);
    this.set('sortOrder', result);
    this.set('initComplete', true);

    this._updateSelectedFiltersValues();
  }

  // update selected filters(present in URL) at page refresh
  _updateSelectedFiltersValues() {
    this._updateFiltersValsDebouncer = Debouncer.debounce(this._updateFiltersValsDebouncer,
        timeOut.after(100),
        () => {
          let filtersValues = [
            {
              filterName: 'Status',
              selectedValue: this.selectedStatuses
            },
            {
              filterName: 'PD/SSFA Type',
              selectedValue: this.selectedDocumentTypes
            },
            {
              filterName: 'Sections',
              selectedValue: this.selectedSections
            },
            {
              filterName: 'Offices',
              selectedValue: this.selectedOffices
            },
            {
              filterName: 'CP Structure',
              selectedValue: this.selectedCPStructures
            },
            {
              filterName: 'Country Programme Output',
              selectedValue: this.selectedCpOutputs
            },
            {
              filterName: 'Donors',
              selectedValue: this.selectedDonors
            },
            {
              filterName: 'Grants',
              selectedValue: this.selectedGrants
            },
            {
              filterName: 'UNICEF focal point',
              selectedValue: this.selectedUnicefFocalPoints
            },
            {
              filterName: 'Starts After',
              selectedValue: this.startDate
            },
            {
              filterName: 'Ends After',
              selectedValue: this.endAfter
            },
            {
              filterName: 'Ends Before',
              selectedValue: this.endDate
            }
          ];
          this.updateShownFilters(filtersValues);
        });
  }

  // Updates URL state with new query string, and launches query
  _updateUrlAndData() {
    if (this._canFilterData()) {
      this.set('csvDownloadQs', this._buildCsvDownloadQueryString());
      let qs = this._buildQueryString();
      this._updateUrlAndDislayedData('interventions/list', _interventionsLastNavigated, qs,
          this._filterListData.bind(this));
      _interventionsLastNavigated = qs || _interventionsLastNavigated;
    }
  }

  _filterListData(forceNoLoading: boolean) {
    // Query is debounced with a debounce time
    // set depending on what action the user takes
    this._queryDebouncer = Debouncer.debounce(this._queryDebouncer,
        timeOut.after(this.debounceTime),
        () => {
          let interventions = this.shadowRoot.querySelector('#interventions');
          if (!interventions) {
            return;
          }
          interventions.query(
              this.sortOrder.field,
              this.sortOrder.direction,
              this.q.toLowerCase(),
              this.selectedDocumentTypes,
              this.selectedCpOutputs.map((cpo: number) => String(cpo)),
              this.selectedDonors,
              this.selectedGrants,
              this.selectedStatuses,
              this.selectedSections.map((s: number) => String(s)),
              this.selectedUnicefFocalPoints.map((ufc: number) => String(ufc)),
              this.selectedOffices.map((o: number) => String(o)),
              this.selectedCPStructures,
              this.startDate,
              this.endDate,
              this.endAfter,
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
      type: this.selectedDocumentTypes.join('|'),
      status: this.selectedStatuses.join('|'),
      section: this.selectedSections.join('|'),
      offices: this.selectedOffices.join('|'),
      cp_outputs: this.selectedCpOutputs.join('|'),
      donors: this.selectedDonors.join('|'),
      grants: this.selectedGrants.join('|'),
      unicef_focal_points: this.selectedUnicefFocalPoints.join('|'),
      cpStructures: this.selectedCPStructures.join('|'),
      start: this.startDate,
      end: this.endDate,
      endAfter: this.endAfter,
      sort: this.sortOrder
    });
  }

  _buildCsvDownloadQueryString() {
    let params = {
      status: this.selectedStatuses,
      document_type: this.selectedDocumentTypes,
      sections: this.selectedSections,
      office: this.selectedOffices,
      donors: this.selectedDonors,
      grants: this.selectedGrants,
      unicef_focal_points: this.selectedUnicefFocalPoints,
      country_programme: this.selectedCPStructures,
      cp_outputs: this.selectedCpOutputs,
      start: this.startDate,
      end: this.endDate,
      endAfter: this.endAfter,
      search: this.q
    };
    return this._buildExportQueryString(params);
  }

  _filtersChanged() {
    this.set('debounceTime', 150);
    this.resetPageNumber();
  }

  _arrayFilterChanged(filterVal: any, oldFilterVals: any) {
    if (typeof oldFilterVals !== 'undefined' && filterVal.length !== oldFilterVals.length) {
      this._filtersChanged();
    }
  }

  _canShowListDatesFrsWarnings(status: string) {
    return (status !== CONSTANTS.STATUSES.Draft.toLowerCase() &&
            status !== CONSTANTS.STATUSES.Closed.toLowerCase());
  }

  _hideDateFrsWarningTooltip(pdDate: string, frsDate: string, status: string) {
    return !(this._canShowListDatesFrsWarnings(status) && !this.validateFrsVsInterventionDates(pdDate, frsDate));
  }

  _triggerInterventionLoadingMsg() {
    fireEvent(this, 'trigger-intervention-loading-msg');
  }

}

window.customElements.define('interventions-list', InterventionsList);
