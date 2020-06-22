import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import '@polymer/iron-media-query/iron-media-query.js';

import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip.js';
import '@unicef-polymer/etools-date-time/datepicker-lite.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../store.js';
import CONSTANTS from '../../../../../config/app-constants';
import CommonMixin from '../../../../mixins/common-mixin';
import ListFiltersMixin from '../../../../mixins/list-filters-mixin';
import ListsCommonMixin from '../../../../mixins/lists-common-mixin';
import FrNumbersConsistencyMixin from '../../mixins/fr-numbers-consistency-mixin';
import PaginationMixin from '../../../../mixins/pagination-mixin';
import {SharedStyles} from '../../../../styles/shared-styles';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';
import {listFilterStyles} from '../../../../styles/list-filter-styles';
import {frWarningsStyles} from '../../styles/fr-warnings-styles';
import '../../data/interventions-list-data.js';
import {InterventionsListData} from '../../data/interventions-list-data.js';
import {isEmptyObject, isJsonStrMatch} from '../../../../utils/utils.js';
import {pmpCustomIcons} from '../../../../styles/custom-iconsets/pmp-icons.js';
import {fireEvent} from '../../../../utils/fire-custom-event.js';
import {LabelAndValue, CpStructure, MinimalUser} from '../../../../../typings/globals.types.js';
import {CpOutput, ListItemIntervention} from '../../../../../typings/intervention.types.js';
import {ListFilterOption} from '../../../../../typings/filter.types.js';
import {partnersDropdownDataSelector} from '../../../../../reducers/partners.js';

let _interventionsLastNavigated = '';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin ListFiltersMixin
 * @appliesMixin ListsCommonMixin
 * @appliesMixin FrNumbersConsistencyMixin
 * @appliesMixin PaginationMixin
 */

class InterventionsList extends connect(store)(
  ListFiltersMixin(ListsCommonMixin(CommonMixin(PaginationMixin(FrNumbersConsistencyMixin(PolymerElement)))))
) {
  static get template() {
    return html`
      ${SharedStyles} ${gridLayoutStyles} ${listFilterStyles} ${frWarningsStyles}
      <style include="data-table-styles paper-material-styles">
        :host {
          @apply --layout-flex;
          width: 100%;
        }

        .pd-ref {
          @apply --text-btn-style;
          text-transform: none;
        }
      </style>
      <iron-media-query query="(max-width: 767px)" query-matches="{{lowResolutionLayout}}"></iron-media-query>
      ${pmpCustomIcons}
      <template is="dom-if" if="[[stampListData]]">
        <interventions-list-data
          id="interventions"
          filtered-interventions="{{filteredInterventions}}"
          total-results="{{paginator.count}}"
          on-interventions-loaded="_requiredDataHasBeenLoaded"
          list-data-path="filteredInterventions"
          fire-data-loaded
        >
        </interventions-list-data>
      </template>

      <div id="filters" class="paper-material" elevation="1">
        <div id="filters-fields">
          <paper-input id="query" class="filter" type="search" placeholder="Search" autocomplete="off" value="{{q}}">
            <iron-icon icon="search" slot="prefix"></iron-icon>
          </paper-input>

          <template is="dom-repeat" items="[[selectedFilters]]" as="filter">
            <template is="dom-if" if="[[filterTypeIs('etools-dropdown-multi', filter.type)]]">
              <etools-dropdown-multi
                class="filter"
                label="[[filter.filterName]]"
                placeholder="&#8212;"
                disabled$="[[!filter.selectionOptions.length]]"
                options="[[filter.selectionOptions]]"
                option-value="[[filter.optionValue]]"
                option-label="[[filter.optionLabel]]"
                selected-values="{{filter.selectedValue}}"
                trigger-value-change-event
                on-etools-selected-items-changed="esmmValueChanged"
                data-filter-path$="[[filter.path]]"
                hide-search="[[filter.hideSearch]]"
                min-width="[[filter.minWidth]]"
                horizontal-align="left"
                no-dynamic-align
              >
              </etools-dropdown-multi>
            </template>

            <template is="dom-if" if="[[filterTypeIs('datepicker', filter.type)]]">
              <datepicker-lite
                id$="datepicker_[[filter.path]]"
                class="filter date"
                label="[[filter.filterName]]"
                placeholder="&#8212;"
                value="{{filter.selectedValue}}"
                on-date-has-changed="_filterDateHasChanged"
                data-filter-path$="[[filter.path]]"
                fire-date-has-changed
                selected-date-display-format="D MMM YYYY"
              >
              </datepicker-lite>
            </template>

            <template is="dom-if" if="[[filterTypeIs('paper-toggle', filter.type)]]">
              <div id="hiddenToggle" class="filter">
                [[filter.filterName]]
                <paper-toggle-button
                  id="toggleFilter"
                  checked="{{filter.selectedValue}}"
                  data-filter-path$="[[filter.path]]"
                  on-iron-change="toggleValueChanged"
                ></paper-toggle-button>
              </div>
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
              <paper-button on-tap="clearAllFilterValues" class="secondary-btn">
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
          low-resolution-layout="[[lowResolutionLayout]]"
          id="listHeader"
          label="[[paginator.visible_range.0]]-[[paginator.visible_range.1]] of [[paginator.count]] results to show"
        >
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

        <template
          id="rows"
          is="dom-repeat"
          notify-dom-change
          items="[[filteredInterventions]]"
          as="intervention"
          initial-count="10"
          on-dom-change="_listDataChanged"
        >
          <etools-data-table-row low-resolution-layout="[[lowResolutionLayout]]" details-opened="[[detailsOpened]]">
            <div slot="row-data" class="p-relative">
              <span class="col-data col-2" data-col-header-label="Reference #">
                <a
                  class="pd-ref truncate"
                  href="interventions/[[intervention.id]]/details"
                  title="[[getDisplayValue(intervention.number)]]"
                  on-click="_triggerInterventionLoadingMsg"
                >
                  [[getDisplayValue(intervention.number)]]
                </a>
              </span>
              <span
                class="col-data col-3"
                data-col-header-label="Partner Name"
                title="[[getDisplayValue(intervention.partner_name)]]"
              >
                <span>[[getDisplayValue(intervention.partner_name)]]</span>
              </span>
              <span class="col-data flex-c" data-col-header-label="Document Type">
                [[getDisplayValue(intervention.document_type)]]
              </span>
              <span class="col-data flex-c capitalize" data-col-header-label="Status">
                [[getDisplayValue(intervention.status)]]
              </span>
              <span
                class="col-data col-2"
                data-col-header-label="Title"
                title="[[getDisplayValue(intervention.title)]]"
              >
                [[getDisplayValue(intervention.title)]]
              </span>
              <span class="col-data flex-c" data-col-header-label="Start Date">
                <etools-info-tooltip
                  class="fr-nr-warn"
                  custom-icon
                  icon-first
                  hide-tooltip$="[[_hideDateFrsWarningTooltip(intervention.start,
                                                  intervention.frs_earliest_start_date, intervention.status)]]"
                >
                  <span slot="field">[[getDateDisplayValue(intervention.start)]]</span>
                  <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                  <span slot="message">[[getFrsStartDateValidationMsg()]]</span>
                </etools-info-tooltip>
              </span>
              <span class="col-data flex-c" data-col-header-label="End Date">
                <etools-info-tooltip
                  class="fr-nr-warn"
                  custom-icon
                  icon-first
                  hide-tooltip$="[[_hideDateFrsWarningTooltip(intervention.end,
                                                    intervention.frs_latest_end_date, intervention.status)]]"
                >
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
                  hide-tooltip="[[hideIntListUnicefCashAmountTooltip(intervention.all_currencies_are_consistent,
                                  intervention.unicef_cash, intervention.frs_total_frs_amt, intervention, 'interventionsList')]]"
                >
                  <span slot="field">
                    <span class="amount-currency">[[intervention.budget_currency]]</span>
                    <span>[[displayCurrencyAmount(intervention.unicef_cash, '0.00')]]</span>
                  </span>
                  <iron-icon
                    icon="[[getFrsCurrencyTooltipIcon(intervention.fr_currencies_are_consistent)]]"
                    slot="custom-icon"
                  ></iron-icon>
                  <span slot="message">
                    <span
                      >[[getIntListUnicefCashAmountTooltipMsg(intervention.all_currencies_are_consistent,
                      intervention.fr_currencies_are_consistent)]]</span
                    >
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
          low-resolution-layout="[[lowResolutionLayout]]"
          page-size="{{paginator.page_size}}"
          page-number="{{paginator.page}}"
          total-results="[[paginator.count]]"
          visible-range="{{paginator.visible_range}}"
        >
        </etools-data-table-footer>
      </div>
    `;
  }

  @property({
    type: Array,
    notify: true,
    observer: InterventionsList.prototype._listChanged
  })
  filteredInterventions!: ListItemIntervention[];

  @property({type: Array})
  documentTypes!: LabelAndValue[];

  @property({type: Array})
  selectedDocumentTypes: string[] = [];

  @property({type: Array})
  interventionStatuses!: LabelAndValue[];

  @property({type: Array})
  selectedStatuses: string[] = [];

  @property({
    type: Array,
    observer: InterventionsList.prototype._filtersChanged
  })
  startDate!: string;

  @property({
    type: Array,
    observer: InterventionsList.prototype._filtersChanged
  })
  endDate!: string;

  @property({
    type: Array,
    observer: InterventionsList.prototype._filtersChanged
  })
  endAfter!: string;

  @property({
    type: Boolean,
    observer: InterventionsList.prototype._filtersChanged
  })
  contingency_pd!: boolean;

  @property({
    type: Array,
    observer: InterventionsList.prototype._arrayFilterChanged
  })
  cpOutputs: CpOutput[] = [];

  @property({type: Array})
  selectedCpOutputs: number[] = [];

  @property({type: Array})
  countryProgrammes!: CpStructure[];

  @property({type: Array})
  sections!: object[];

  @property({type: Array})
  selectedSections: number[] = [];

  @property({type: Array})
  unicefUsersData!: MinimalUser[];

  @property({
    type: Array,
    observer: InterventionsList.prototype._arrayFilterChanged
  })
  selectedUnicefFocalPoints: number[] = [];

  @property({type: Array})
  offices!: object[];

  @property({type: Array})
  selectedOffices: number[] = [];

  @property({type: Array})
  donors!: object[];

  @property({
    type: Array,
    observer: InterventionsList.prototype._arrayFilterChanged
  })
  selectedDonors: string[] = [];

  @property({type: Array})
  partners: [] = [];

  @property({
    type: Array,
    observer: InterventionsList.prototype._filtersChanged
  })
  selectedPartners: [] = [];

  @property({type: Array})
  grants!: object[];

  @property({
    type: Array,
    observer: InterventionsList.prototype._arrayFilterChanged
  })
  selectedGrants: string[] = [];

  @property({type: String, notify: true})
  csvDownloadQs!: string;

  @property({type: Boolean})
  lowResolutionLayout = false;

  @property({type: String})
  _sortableFieldNames: string[] = ['number', 'partner_name', 'start', 'end'];

  @property({
    type: String,
    observer: InterventionsList.prototype._arrayFilterChanged
  })
  selectedCPStructures: string[] = [];

  _updateFiltersValsDebouncer!: Debouncer | null;
  _queryDebouncer!: Debouncer | null;

  static get observers() {
    return [
      '_filtersChanged(q, selectedStatuses.length, selectedDocumentTypes.length, ' +
        'selectedSections.length, selectedOffices.length, contingency_pd' +
        'selectedCPStructures.length)', // used for non removable filters
      '_initFiltersMenuList(cpOutputs, unicefUsersData, donors, partners, grants, countryProgrammes, offices, ' +
        'documentTypes, sections, interventionStatuses)',
      '_updateUrlAndData(q, selectedDocumentTypes.length, selectedCpOutputs.length, selectedStatuses.length, ' +
        'selectedSections.length, selectedUnicefFocalPoints.length, selectedOffices.length, ' +
        'selectedDonors.length, selectedPartners.length, selectedGrants.length, startDate, endDate, endAfter, selectedCPStructures.length, ' +
        'contingency_pd, paginator.page, paginator.page_size, sortOrder, requiredDataLoaded, initComplete)',
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
    this.partners = partnersDropdownDataSelector(state);
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
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });

    this.listAttachedCallback(this.active, 'Loading...', 'pd-ssfa-list');
  }

  _initFiltersMenuList(
    cpOutputs: number[],
    unicefUsersData: number[],
    donors: number[],
    partners: number[],
    grants: number[],
    countryProgrammes: number[],
    offices: number[],
    documentTypes: string[],
    sections: number[],
    interventionStatuses: string[]
  ) {
    if (
      !cpOutputs ||
      !unicefUsersData ||
      !donors ||
      !partners ||
      !grants ||
      !countryProgrammes ||
      !offices ||
      !documentTypes ||
      !sections ||
      !interventionStatuses
    ) {
      // this is just to be safe, the method should only get triggered once when redux data is loaded
      return;
    }

    // init list filter options
    // IMPORTANT!!!
    // If you change filterName make sure you update it as well in _updateSelectedFiltersValues method
    // IMPORTANT!!!
    this.initListFiltersData([
      new ListFilterOption({
        filterName: 'CP Structure',
        type: 'etools-dropdown-multi',
        selectionOptions: countryProgrammes,
        optionValue: 'id',
        optionLabel: 'name',
        selectedValue: [],
        path: 'selectedCPStructures',
        selected: true,
        minWidth: '400px',
        hideSearch: true
      }),
      new ListFilterOption({
        filterName: 'Country Programme Output',
        type: 'etools-dropdown-multi',
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: cpOutputs,
        selectedValue: [],
        path: 'selectedCpOutputs',
        selected: false,
        minWidth: '400px'
      }),
      new ListFilterOption({
        filterName: 'Donors',
        type: 'etools-dropdown-multi',
        optionValue: 'value',
        optionLabel: 'label',
        selectionOptions: donors,
        selectedValue: [],
        path: 'selectedDonors',
        selected: false,
        minWidth: '400px'
      }),
      new ListFilterOption({
        filterName: 'Partners',
        type: 'etools-dropdown-multi',
        selectionOptions: partners,
        optionValue: 'value',
        optionLabel: 'label',
        selectedValue: [],
        path: 'selectedPartners',
        selected: false,
        minWidth: '400px',
        hideSearch: false
      }),
      new ListFilterOption({
        filterName: 'Ends Before',
        type: 'datepicker', // datepicker-lite
        path: 'endDate',
        selectedValue: '',
        selected: false
      }),
      new ListFilterOption({
        filterName: 'Grants',
        type: 'etools-dropdown-multi',
        optionValue: 'value',
        optionLabel: 'label',
        selectionOptions: grants,
        selectedValue: [],
        path: 'selectedGrants',
        selected: false,
        minWidth: '400px'
      }),
      new ListFilterOption({
        filterName: 'Offices',
        type: 'etools-dropdown-multi',
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: offices,
        selectedValue: [],
        path: 'selectedOffices',
        selected: true,
        minWidth: '250px',
        hideSearch: true
      }),
      new ListFilterOption({
        filterName: 'PD/SSFA Type',
        type: 'etools-dropdown-multi',
        optionValue: 'value',
        optionLabel: 'label',
        selectionOptions: documentTypes,
        selectedValue: [],
        path: 'selectedDocumentTypes',
        selected: true,
        minWidth: '400px',
        hideSearch: true
      }),
      new ListFilterOption({
        filterName: 'Sections',
        type: 'etools-dropdown-multi',
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: sections,
        selectedValue: [],
        path: 'selectedSections',
        selected: true,
        minWidth: '350px',
        hideSearch: true
      }),
      new ListFilterOption({
        filterName: 'Starts After',
        type: 'datepicker', // datepicker-lite
        path: 'startDate',
        selectedValue: '',
        selected: false
      }),
      new ListFilterOption({
        filterName: 'Ends After',
        type: 'datepicker',
        selectedValue: '',
        path: 'endAfter',
        selected: false
      }),
      new ListFilterOption({
        filterName: 'Status',
        type: 'etools-dropdown-multi',
        optionValue: 'value',
        optionLabel: 'label',
        selectionOptions: interventionStatuses,
        selectedValue: [],
        path: 'selectedStatuses',
        selected: true,
        minWidth: '160px',
        hideSearch: true
      }),
      new ListFilterOption({
        filterName: 'UNICEF focal point',
        type: 'etools-dropdown-multi',
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: unicefUsersData,
        selectedValue: [],
        path: 'selectedUnicefFocalPoints',
        selected: false,
        minWidth: '400px'
      }),
      new ListFilterOption({
        filterName: 'Contingency PD',
        type: 'paper-toggle',
        selectedValue: this.contingency_pd,
        path: 'contingency_pd',
        selected: true
      })
    ]);
    this._updateSelectedFiltersValues();
  }

  // Input: URL query params
  // Initializes the properties of the list at page load
  // to the params interpretted from the URL string.
  _init(active: boolean) {
    const urlQueryParams = this.urlParams;
    if (!active || !urlQueryParams) {
      return;
    }
    if (isEmptyObject(urlQueryParams)) {
      urlQueryParams.status = 'draft|signed|active|ended|suspended';
    }

    this.set('initComplete', false);
    this.setProperties({
      q: urlQueryParams.q ? urlQueryParams.q : '',
      selectedDocumentTypes: this._getFilterUrlValuesAsArray(urlQueryParams.type),
      selectedStatuses: this._getFilterUrlValuesAsArray(urlQueryParams.status),
      selectedCpOutputs: this._getFilterUrlValuesAsArray(urlQueryParams.cp_outputs),
      selectedSections: this._getFilterUrlValuesAsArray(urlQueryParams.section),
      selectedDonors: this._getFilterUrlValuesAsArray(urlQueryParams.donors),
      selectedPartners: this._getFilterUrlValuesAsArray(urlQueryParams.partners),
      selectedGrants: this._getFilterUrlValuesAsArray(urlQueryParams.grants),
      selectedUnicefFocalPoints: this._getFilterUrlValuesAsArray(urlQueryParams.unicef_focal_points),
      selectedOffices: this._getFilterUrlValuesAsArray(urlQueryParams.offices),
      selectedCPStructures: this._getFilterUrlValuesAsArray(urlQueryParams.cpStructures),
      startDate: urlQueryParams.start ? urlQueryParams.start : '',
      endDate: urlQueryParams.end ? urlQueryParams.end : '',
      endAfter: urlQueryParams.endAfter ? urlQueryParams.endAfter : '',
      contingency_pd: urlQueryParams.contingency_pd ? true : false
    });

    this.setPaginationDataFromUrlParams(urlQueryParams);

    // format of sort param is sort=field.order ex: sort=partner_name.asc
    const result = this.initSortFieldsValues({field: 'partner_name', direction: 'asc'}, urlQueryParams.sort);
    this.set('sortOrder', result);
    this.set('initComplete', true);

    this._updateSelectedFiltersValues();
  }

  // update selected filters(present in URL) at page refresh
  _updateSelectedFiltersValues() {
    this._updateFiltersValsDebouncer = Debouncer.debounce(this._updateFiltersValsDebouncer, timeOut.after(100), () => {
      const filtersValues = [
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
          filterName: 'Partners',
          selectedValue: this.selectedPartners
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
        },
        {
          filterName: 'Contingency PD',
          selectedValue: this.contingency_pd
        }
      ];
      this.updateShownFilters(filtersValues);
    });
  }

  // Updates URL state with new query string, and launches query
  _updateUrlAndData() {
    if (this._canFilterData()) {
      this.set('csvDownloadQs', this._buildCsvDownloadQueryString());
      const qs = this._buildQueryString();
      this._updateUrlAndDislayedData(
        'interventions/list',
        _interventionsLastNavigated,
        qs,
        this._filterListData.bind(this)
      );
      _interventionsLastNavigated = qs || _interventionsLastNavigated;
    }
  }

  _filterListData(forceNoLoading?: boolean) {
    // Query is debounced with a debounce time
    // set depending on what action the user takes
    this._queryDebouncer = Debouncer.debounce(this._queryDebouncer, timeOut.after(this.debounceTime), () => {
      const interventions = this.shadowRoot!.querySelector('#interventions') as InterventionsListData;
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
        this.getFilterValuesByProperty(this.partners, 'label', this.selectedPartners, 'value'),
        this.selectedGrants,
        this.selectedStatuses,
        this.selectedSections.map((s: number) => String(s)),
        this.selectedUnicefFocalPoints.map((ufc: number) => String(ufc)),
        this.selectedOffices.map((o: number) => String(o)),
        this.selectedCPStructures,
        this.contingency_pd,
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
      partners: this.selectedPartners.join('|'),
      grants: this.selectedGrants.join('|'),
      unicef_focal_points: this.selectedUnicefFocalPoints.join('|'),
      cpStructures: this.selectedCPStructures.join('|'),
      start: this.startDate,
      end: this.endDate,
      endAfter: this.endAfter,
      contingency_pd: this.contingency_pd,
      sort: this.sortOrder
    });
  }

  _buildCsvDownloadQueryString() {
    const params = {
      status: this.selectedStatuses,
      document_type: this.selectedDocumentTypes,
      sections: this.selectedSections,
      office: this.selectedOffices,
      donors: this.selectedDonors,
      partners: this.selectedPartners,
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
    return status !== CONSTANTS.STATUSES.Draft.toLowerCase() && status !== CONSTANTS.STATUSES.Closed.toLowerCase();
  }

  _hideDateFrsWarningTooltip(pdDate: string, frsDate: string, status: string) {
    return !(this._canShowListDatesFrsWarnings(status) && !this.validateFrsVsInterventionDates(pdDate, frsDate));
  }

  _triggerInterventionLoadingMsg() {
    fireEvent(this, 'trigger-intervention-loading-msg');
  }
}

window.customElements.define('interventions-list', InterventionsList);
