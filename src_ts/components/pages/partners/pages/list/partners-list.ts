/* eslint-disable lit-a11y/anchor-is-valid */
import {connect} from 'pwa-helpers/connect-mixin';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {store, RootState} from '../../../../../redux/store';
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-media-query/iron-media-query.js';

import '@unicef-polymer/etools-date-time/datepicker-lite.js';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-icon-item';
import '@polymer/paper-item/paper-item-body';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-styles/element-styles/paper-material-styles';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';

import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin.js';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin.js';
import PaginationMixin from '../../../../mixins/pagination-mixin.js';
import CommonMixin from '../../../../mixins/common-mixin.js';
import ListsCommonMixin from '../../../../mixins/lists-common-mixin.js';
import ListFiltersMixin from '../../../../mixins/list-filters-mixin.js';

import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';

import {SharedStyles} from '../../../../styles/shared-styles';
import {listFilterStyles} from '../../../../styles/list-filter-styles';
import {partnerStatusStyles} from '../../../../styles/partner-status-styles';

import '../../data/partners-list-data.js';
import {isJsonStrMatch} from '../../../../utils/utils';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {PartnersListDataEl} from '../../data/partners-list-data.js';
import {LabelAndValue} from '@unicef-polymer/etools-types';

let _partnersLastNavigated = '';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin EndpointsMixin
 * @appliesMixin ListFiltersMixin
 * @appliesMixin CommonMixin
 * @appliesMixin ListsCommonMixin
 * @appliesMixin PaginationMixin
 */
class PartnersList extends connect(store)(
  CommonMixin(ListFiltersMixin(ListsCommonMixin(PaginationMixin(EndpointsMixin(EtoolsCurrency(PolymerElement))))))
) {
  static get template() {
    // language=HTML
    return html`
      ${SharedStyles} ${listFilterStyles} ${partnerStatusStyles}
      <style include="data-table-styles iron-flex iron-flex-factors paper-material-styles">
        .sm-status-wrapper {
          padding-left: 10px;
        }

        .vendor-nr {
          @apply --text-btn-style;
          text-transform: none;
        }
      </style>

      <iron-media-query query="(max-width: 767px)" query-matches="{{lowResolutionLayout}}"></iron-media-query>

      <template is="dom-if" if="[[stampListData]]">
        <partners-list-data
          id="partners"
          filtered-partners="{{filteredPartners}}"
          total-results="{{paginator.count}}"
          on-partners-loaded="_requiredDataHasBeenLoaded"
          list-data-path="filteredPartners"
          fire-data-loaded
        >
        </partners-list-data>
      </template>

      <div id="filters" class="paper-material" elevation="1">
        <div id="filters-fields">
          <paper-input
            id="query"
            class="filter"
            type="search"
            autocomplete="off"
            value="{{q}}"
            placeholder="[[_getTranslation('GENERAL.SEARCH')]]"
          >
            <iron-icon icon="search" slot="prefix"></iron-icon>
          </paper-input>

          <template is="dom-repeat" items="[[selectedFilters]]" as="filter">
            <template is="dom-if" if="[[filterTypeIs('etools-dropdown-multi', filter.type)]]">
              <!-- esmm multi -->
              <etools-dropdown-multi
                class="filter"
                label="[[filter.filterName]]"
                placeholder="Select"
                disabled$="[[filter.disabled]]"
                options="[[filter.selectionOptions]]"
                selected-values="{{filter.selectedValue}}"
                data-filter-path$="[[filter.path]]"
                on-etools-selected-items-changed="esmmValueChanged"
                trigger-value-change-event
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
          <paper-menu-button id="filterMenu" ignore-select horizontal-align="right">
            <paper-button class="button" slot="dropdown-trigger">
              <iron-icon icon="filter-list"></iron-icon>
              [[_getTranslation('GENERAL.FILTERS')]]
            </paper-button>
            <div slot="dropdown-content" class="clear-all-filters">
              <paper-button on-tap="clearAllFilters" class="secondary-btn">
                [[_getTranslation('GENERAL.CLEAR_ALL')]]
              </paper-button>
            </div>
            <paper-listbox slot="dropdown-content" multi>
              <template is="dom-repeat" items="[[listFilterOptions]]">
                <paper-icon-item on-tap="selectFilter" disabled$="[[item.disabled]]" selected$="[[item.selected]]">
                  <iron-icon icon="check" slot="item-icon" hidden$="[[!item.selected]]"></iron-icon>
                  <paper-item-body>[[item.filterName]]</paper-item-body>
                </paper-icon-item>
              </template>
            </paper-listbox>
          </paper-menu-button>
        </div>
      </div>

      <div id="list" elevation="1" class="paper-material hidden">
        <etools-data-table-header
          low-resolution-layout="[[lowResolutionLayout]]"
          id="listHeader"
          label="[[paginator.visible_range.0]]-[[paginator.visible_range.1]] of [[paginator.count]] results to show"
        >
          <etools-data-table-column class="flex" field="vendor_number" sortable>
            [[_getTranslation('VENDOR_NO')]]
          </etools-data-table-column>
          <etools-data-table-column class="flex-3" field="name" sortable>
            [[_getTranslation('NAME_SHORT_FULL')]]
          </etools-data-table-column>
          <etools-data-table-column class="flex-2" field="partner_type">
            [[_getTranslation('PARTNER_TYPE')]]
          </etools-data-table-column>
          <etools-data-table-column class="flex" field="hact_rating">
            [[_getTranslation('HACT_RISK_RATING')]]
          </etools-data-table-column>
          <etools-data-table-column class="flex" field="sea_rating">
            [[_getTranslation('SEA_RISK_RATING')]]
          </etools-data-table-column>
          <etools-data-table-column class="flex" field="psea_date">
            [[_getTranslation('LAST_PSEA_ASSESS_DATE')]]
          </etools-data-table-column>
        </etools-data-table-header>

        <template
          id="rows"
          is="dom-repeat"
          items="[[filteredPartners]]"
          as="partner"
          initial-count="10"
          on-dom-change="_listDataChanged"
        >
          <etools-data-table-row low-resolution-layout="[[lowResolutionLayout]]" details-opened="[[detailsOpened]]">
            <div slot="row-data">
              <span class="col-data flex" data-col-header-label$="[[_getTranslation('VENDOR_NO')]]">
                <a
                  class="vendor-nr truncate"
                  href$="[[currentModule]]/[[partner.id]]/details"
                  title$="[[getDisplayValue(partner.vendor_number)]]"
                  on-click="_triggerPartnerLoadingMsg"
                >
                  [[getDisplayValue(partner.vendor_number)]]
                </a>
              </span>
              <span class="col-data flex-3" data-col-header-label$="[[_getTranslation('NAME_SHORT_FULL')]]">
                <span>[[_computeName(partner.name, partner.short_name)]]</span>

                <span class="sm-status-wrapper" hidden$="[[!partner.deleted_flag]]">
                  <span class="marked-for-deletion">
                    <iron-icon icon="delete"></iron-icon>
                  </span>
                </span>

                <span class="sm-status-wrapper" hidden$="[[!partner.blocked]]">
                  <span class="blocked">
                    <iron-icon icon="block"></iron-icon>
                  </span>
                </span>
              </span>
              <span class="col-data flex-2" data-col-header-label$="[[_getTranslation('PARTNER_TYPE')]]">
                [[_computeType(partner.cso_type, partner.partner_type)]]
              </span>
              <span
                class="col-data flex"
                data-col-header-label$="[[_getTranslation('HACT_RISK_RATING')]]"
                style="text-transform: capitalize"
              >
                [[getDisplayValue(partner.rating)]]
              </span>
              <span
                class="col-data flex"
                data-col-header-label$="[[_getTranslation('SEA_RISK_RATING')]]"
                style="text-transform: capitalize"
              >
                [[getDisplayValue(partner.sea_risk_rating_name)]]
              </span>
              <span class="col-data flex" data-col-header-label$="[[_getTranslation('LAST_PSEA_ASSESS_DATE')]]">
                [[getDateDisplayValue(partner.psea_assessment_date)]]
              </span>
            </div>
            <div slot="row-data-details">
              <div class="row-details-content flex">
                <span class="rdc-title">[[_getTranslation('SHARED_PARTNER')]]</span>
                <span>[[getDisplayValue(partner.shared_with)]]</span>
              </div>
              <div class="row-details-content flex">
                <span class="rdc-title">[[_getTranslation('EMAIL')]]</span>
                <span>[[getDisplayValue(partner.email)]]</span>
              </div>
              <div class="row-details-content flex">
                <span class="rdc-title">[[_getTranslation('PHONE_NUMBER')]]</span>
                <span>[[getDisplayValue(partner.phone_number)]]</span>
              </div>
              <div class="row-details-content flex">
                <span class="rdc-title">[[_getTranslation('ACTUAL_CASH_TRANSFER_FOR_CP')]]</span>
                <span>$ [[displayCurrencyAmount(partner.total_ct_cp, '0')]]</span>
              </div>
              <div class="row-details-content flex">
                <span class="rdc-title">[[_getTranslation('ACTUAL_CASH_TRANSFER_FOR_CURRENT_YEAR')]]</span>
                <span>$ [[displayCurrencyAmount(partner.total_ct_ytd, '0')]]</span>
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

  @property({type: Array, notify: true, observer: '_listChanged'})
  filteredPartners: any[] = [];

  @property({type: Array})
  csoTypes: LabelAndValue[] = [];

  @property({type: Array})
  partnerTypes: LabelAndValue[] = [];

  @property({type: Array})
  riskRatings: LabelAndValue[] = [];

  @property({type: Array})
  seaRiskRatings: LabelAndValue[] = [];

  @property({type: Array})
  selectedPartnerTypes: any[] = [];

  @property({type: Array})
  selectedCsoTypes: any[] = [];

  @property({type: Array})
  selectedRiskRatings: any[] = [];

  @property({type: Array})
  selectedSEARiskRatings: any[] = [];

  @property({type: String})
  selectedPseaDateBefore = '';

  @property({type: String})
  selectedPseaDateAfter = '';

  @property({type: Boolean})
  showHidden = false;

  @property({type: Boolean, observer: '_showOnlyGovernmentTypeFlagChanged'})
  showOnlyGovernmentType = false;

  @property({type: String})
  currentModule = '';

  @property({type: Array})
  _sortableFieldNames: string[] = ['vendor_number', 'name'];

  @property({type: Array})
  _governmentLockedPartnerTypes: string[] = ['Government'];

  @property({type: Boolean})
  lowResolutionLayout = false;

  private _updateShownFilterDebouncer!: Debouncer;
  private _actionsChangedDebouncer!: Debouncer;

  public static get observers() {
    return [
      '_initFiltersMenuList(partnerTypes, csoTypes, riskRatings, seaRiskRatings, showOnlyGovernmentType)',
      'resetPageNumber(q, selectedPartnerTypes.length, selectedCsoTypes.length, selectedRiskRatings.length,' +
        'selectedSEARiskRatings.length, selectedPseaDateBefore, selectedPseaDateAfter, showHidden)',
      '_updateUrlAndData(q, selectedPartnerTypes.length, selectedCsoTypes.length, selectedRiskRatings.length, ' +
        'selectedSEARiskRatings.length, selectedPseaDateBefore, selectedPseaDateAfter, paginator.page, ' +
        'paginator.page_size, sortOrder, showHidden, requiredDataLoaded, initComplete)',
      '_init(active)'
    ];
  }

  stateChanged(state: RootState) {
    if (!state.commonData) {
      return;
    }
    if (!isJsonStrMatch(this.partnerTypes, state.commonData!.partnerTypes)) {
      this.partnerTypes = [...state.commonData!.partnerTypes];
    }
    if (!isJsonStrMatch(this.csoTypes, state.commonData!.csoTypes)) {
      this.csoTypes = [...state.commonData!.csoTypes];
    }
    if (!isJsonStrMatch(this.riskRatings, state.commonData!.partnerRiskRatings)) {
      this.riskRatings = [...state.commonData!.partnerRiskRatings];
    }

    if (!isJsonStrMatch(this.seaRiskRatings, state.commonData!.seaRiskRatings)) {
      this.seaRiskRatings = [...state.commonData!.seaRiskRatings];
    }
  }

  public connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'partners-page'
    });
    this.listAttachedCallback(this.active, 'Loading...', 'partners-list');
  }

  public _initFiltersMenuList(partnerTypes: any, csoTypes: any, riskRatings: any, seaRiskRatings: any) {
    if (!partnerTypes || !csoTypes || !riskRatings || !seaRiskRatings) {
      // this is just to be safe, the method should only get triggered once when redux data is loaded
      return;
    }
    // init list filter options
    this.initListFiltersData([
      {
        filterName: this._getTranslation('PARTNER_TYPE'),
        type: 'etools-dropdown-multi',
        selectionOptions: partnerTypes,
        selectedValue: [],
        path: 'selectedPartnerTypes',
        selected: true,
        minWidth: '350px',
        hideSearch: true,
        disabled: this.showOnlyGovernmentType || partnerTypes.length === 0
      },
      {
        filterName: this._getTranslation('CSO_TYPE'),
        type: 'etools-dropdown-multi',
        selectionOptions: csoTypes,
        selectedValue: [],
        path: 'selectedCsoTypes',
        selected: true,
        minWidth: '350px',
        hideSearch: false,
        disabled: this.showOnlyGovernmentType || csoTypes.length === 0
      },
      {
        filterName: this._getTranslation('HACT_RISK_RATING'),
        type: 'etools-dropdown-multi',
        selectionOptions: riskRatings,
        selectedValue: [],
        path: 'selectedRiskRatings',
        selected: true,
        minWidth: '160px',
        hideSearch: false,
        disabled: riskRatings.length === 0
      },
      {
        filterName: this._getTranslation('SEA_RISK_RATING'),
        type: 'etools-dropdown-multi',
        selectionOptions: seaRiskRatings,
        selectedValue: [],
        path: 'selectedSEARiskRatings',
        selected: false,
        minWidth: '160px',
        hideSearch: true,
        disabled: seaRiskRatings.length === 0
      },
      {
        filterName: this._getTranslation('PSEA_ASSESSMENT_DATE_BEFORE'),
        type: 'datepicker',
        selectedValue: '',
        path: 'selectedPseaDateBefore',
        selected: false,
        disabled: false
      },
      {
        filterName: this._getTranslation('PSEA_ASSESSMENT_DATE_AFTER'),
        type: 'datepicker',
        selectedValue: '',
        path: 'selectedPseaDateAfter',
        selected: false,
        disabled: false
      },
      {
        filterName: this._getTranslation('SHOW_HIDDEN'),
        type: 'paper-toggle',
        selectedValue: this.showHidden,
        path: 'showHidden',
        selected: true
      }
    ]);
    this._updateSelectedFiltersValues();
  }

  public _updateSelectedFiltersValues() {
    this._updateShownFilterDebouncer = Debouncer.debounce(this._updateShownFilterDebouncer, timeOut.after(20), () => {
      const filtersValues = [
        {
          filterName: this._getTranslation('PARTNER_TYPE'),
          selectedValue: this.selectedPartnerTypes,
          disabled: this.showOnlyGovernmentType,
          allowEmpty: true,
          disableMenuOption: this.showOnlyGovernmentType
        },
        {
          filterName: this._getTranslation('CSO_TYPE'),
          selectedValue: this.selectedCsoTypes,
          allowEmpty: true
        },
        {
          filterName: this._getTranslation('HACT_RISK_RATING'),
          selectedValue: this.selectedRiskRatings,
          allowEmpty: true
        },
        {
          filterName: this._getTranslation('SEA_RISK_RATING'),
          selectedValue: this.selectedSEARiskRatings,
          allowEmpty: true
        },
        {
          filterName: this._getTranslation('PSEA_ASSESSMENT_DATE_BEFORE'),
          selectedValue: this.selectedPseaDateBefore,
          allowEmpty: true
        },
        {
          filterName: this._getTranslation('PSEA_ASSESSMENT_DATE_AFTER'),
          selectedValue: this.selectedPseaDateAfter,
          allowEmpty: true
        },
        {
          filterName: this._getTranslation('SHOW_HIDDEN'),
          selectedValue: this.showHidden,
          allowEmpty: true
        }
      ];
      this.updateShownFilters(filtersValues);
    });
  }

  public _getSelectedPartnerTypes(selectedPartnerTypes: any) {
    return this.showOnlyGovernmentType
      ? this._governmentLockedPartnerTypes
      : this._getFilterUrlValuesAsArray(selectedPartnerTypes);
  }

  // Input: URL query params
  // Initializes the properties of the list at page load
  // to the params interpretted from the URL string.
  public _init(active: any) {
    const urlQueryParams = this.urlParams;
    if (!active || !urlQueryParams) {
      return;
    }
    this.setProperties({
      initComplete: false,
      q: urlQueryParams.q ? urlQueryParams.q : '',
      selectedPartnerTypes: this._getSelectedPartnerTypes(urlQueryParams.partner_types),
      selectedCsoTypes: this._getFilterUrlValuesAsArray(urlQueryParams.cso_types),
      selectedRiskRatings: this._getFilterUrlValuesAsArray(urlQueryParams.risk_ratings),
      selectedSEARiskRatings: this._getFilterUrlValuesAsArray(urlQueryParams.sea_risk_ratings),
      selectedPseaDateBefore: urlQueryParams.psea_assessment_date_before
        ? urlQueryParams.psea_assessment_date_before
        : '',
      selectedPseaDateAfter: urlQueryParams.psea_assessment_date_after ? urlQueryParams.psea_assessment_date_after : '',
      showHidden: urlQueryParams.hidden ? true : false
    });

    this.setPaginationDataFromUrlParams(urlQueryParams);

    // format of sort param is sort=field.order ex: sort=name.asc
    const result = this.initSortFieldsValues({field: 'name', direction: 'asc'}, urlQueryParams.sort);
    this.set('sortOrder', result);
    this.set('initComplete', true);
    this._updateSelectedFiltersValues();
  }

  // Updates URL state with new query string, and launches query
  public _updateUrlAndData() {
    if (this._canFilterData()) {
      this.set('csvDownloadUrl', this._buildCsvDownloadUrl());
      const qs = this._buildQueryString();

      this._updateUrlAndDislayedData(
        this.currentModule + '/list',
        _partnersLastNavigated,
        qs,
        this._filterListData.bind(this)
      );

      _partnersLastNavigated = qs || _partnersLastNavigated;
    }
  }

  public _filterListData(forceNoLoading?: any) {
    // Query is debounced with a debounce time
    // set depending on what action the user takes
    this._actionsChangedDebouncer = Debouncer.debounce(
      this._actionsChangedDebouncer,
      timeOut.after(this.debounceTime),
      () => {
        this._handleFilterPartnersData(forceNoLoading);
      }
    );
  }

  public _handleFilterPartnersData(forceNoLoading: boolean) {
    const partners = this.shadowRoot!.querySelector('#partners') as PartnersListDataEl;
    if (!partners) {
      return;
    }
    partners.query(
      this.sortOrder.field,
      this.sortOrder.direction,
      this.q.toLowerCase(),
      this.selectedPartnerTypes,
      this.selectedCsoTypes,
      this.selectedRiskRatings,
      this.selectedSEARiskRatings,
      this.selectedPseaDateBefore,
      this.selectedPseaDateAfter,
      this.paginator.page,
      this.paginator.page_size,
      this.showHidden,
      forceNoLoading ? false : this.showQueryLoading
    );
  }

  // Outputs the query string for the list
  public _buildQueryString() {
    return this._buildUrlQueryString({
      page: this.paginator.page,
      size: this.paginator.page_size,
      q: this.q,
      partner_types: this.selectedPartnerTypes,
      cso_types: this.selectedCsoTypes,
      risk_ratings: this.selectedRiskRatings,
      sea_risk_ratings: this.selectedSEARiskRatings,
      psea_assessment_date_before: this.selectedPseaDateBefore,
      psea_assessment_date_after: this.selectedPseaDateAfter,
      hidden: this.showHidden ? 'true' : '',
      sort: this.sortOrder
    });
  }

  public _buildCsvDownloadUrl() {
    const endpointUrl = this.getEndpoint('partners').url;
    const params = {
      search: this.q,
      partner_type: this.selectedPartnerTypes,
      cso_type: this.selectedCsoTypes,
      rating: this.selectedRiskRatings,
      sea_risk_rating: this.selectedSEARiskRatings,
      psea_assessment_date_before: this.selectedPseaDateBefore,
      psea_assessment_date_after: this.selectedPseaDateAfter,
      hidden: this.showHidden ? 'true' : 'false'
    };
    return this._buildCsvExportUrl(params, endpointUrl);
  }

  public _computeName(name: string, shortName: string) {
    return this.getDisplayValue([shortName, name], ' / ', true);
  }

  public _computeType(csoType: any, partnerType: any) {
    if (!csoType) {
      return partnerType;
    } else if (csoType === 'Community Based Organization') {
      return 'CSO / Community Based';
    } else {
      return 'CSO / ' + csoType;
    }
  }

  public _showOnlyGovernmentTypeFlagChanged(showOnlyGovernmentType: boolean) {
    if (showOnlyGovernmentType) {
      // lock list to government partners only
      this.set('selectedPartnerTypes', this._governmentLockedPartnerTypes);
    } else {
      // unlock list from government partners only
      this.set('selectedPartnerTypes', []);
    }
    this.set('selectedCsoTypes', []);
    this.set('selectedRiskRatings', []);
    this.set('selectedSEARiskRatings', []);
    this.set('selectedPseaDateBefore', '');
    this.set('selectedPseaDateAfter', '');
    this.set('q', '');
    this.resetPageNumber();
    this.set('showHidden', false);
    this._updateSelectedFiltersValues();
  }

  public _triggerPartnerLoadingMsg() {
    fireEvent(this, 'trigger-partner-loading-msg');
  }
}

window.customElements.define('partners-list', PartnersList);
