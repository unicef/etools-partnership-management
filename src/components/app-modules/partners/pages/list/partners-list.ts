import {connect} from 'pwa-helpers/connect-mixin';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {store, RootState} from "../../../../../store";
import { PolymerElement, html } from '@polymer/polymer';

import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-icon-item';
import '@polymer/paper-item/paper-item-body';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-styles/element-styles/paper-material-styles';
import 'etools-data-table/etools-data-table.js';
import 'etools-dropdown/etools-dropdown-multi.js';

import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import {EtoolsCurrency} from 'etools-currency-amount-input/mixins/etools-currency-mixin.js';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin.js';
import EventHelperMixin from '../../../../mixins/event-helper-mixin.js';
import PaginationMixin from '../../../../mixins/pagination-mixin.js';
import CommonMixin from '../../../../mixins/common-mixin.js';
import ListsCommonMixin from '../../../../mixins/lists-common-mixin.js';
import ListFiltersMixin from '../../../../mixins/list-filters-mixin.js';

import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';

import {SharedStyles} from '../../../../styles/shared-styles.js';
import {listFilterStyles} from '../../../../styles/list-filter-styles.js';
import {partnerStatusStyles} from '../../../../styles/partner-status-styles.js';
import {appMixins} from '../../../../styles/app-mixins.js';

import '../../data/partners-list-data.js';
import { isJsonStrMatch } from '../../../../utils/utils';



/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin EndpointsMixin
 * @appliesMixin ListFiltersMixin
 * @appliesMixin CommonMixin
 * @appliesMixin ListsCommonMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin EventHelperMixin
 */
const PartnersListRequiredMixins = EtoolsMixinFactory.combineMixins([
  EtoolsCurrency,
  EndpointsMixin,
  EventHelperMixin,
  PaginationMixin,
  CommonMixin,
  ListsCommonMixin,
  ListFiltersMixin
],PolymerElement);

let _partnersLastNavigated: string = '';

/**
 * @polymer
 * @customElement
 * @appliesMixin PartnersListRequiredMixins
 */
class PartnersList extends connect(store)(PartnersListRequiredMixins){

  static get template() {
    // language=HTML
    return html`
      ${SharedStyles} ${listFilterStyles} ${partnerStatusStyles}
      <style include="data-table-styles iron-flex iron-flex-factors paper-material-styles appMixins">
        .sm-status-wrapper {
        padding-left: 10px;
        }

        .vendor-nr {
          @apply --text-btn-style;
          text-transform: none;
        }
      </style>

      <template is="dom-if" if="[[stampListData]]">
        <partners-list-data id="partners"
                            filtered-partners="{{filteredPartners}}"
                            total-results="{{paginator.count}}"
                            on-partners-loaded="_requiredDataHasBeenLoaded"
                            list-data-path="filteredPartners"
                            fire-data-loaded>
        </partners-list-data>
      </template>

      <div id="filters" class="paper-material" elevation="1">
        <div id="filters-fields">

          <paper-input id="query"
                       class="filter"
                       type="search"
                       autocomplete="off"
                       value="{{q}}"
                       placeholder="Search">
            <iron-icon icon="search" slot="prefix"></iron-icon>
          </paper-input>

          <template is="dom-repeat" items="[[selectedFilters]]" as="filter">
            <template is="dom-if" if="[[filterTypeIs('esmm', filter.type)]]">
              <!-- esmm multi -->
              <etools-dropdown-multi
                  class="filter"
                  label="[[filter.filterName]]"
                  placeholder="Select"
                  disabled$="[[filter.disabled]]"
                  options="[[filter.selectionOptions]]"
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

            <template is="dom-if" if="[[filterTypeIs('paper-toggle', filter.type)]]">
              <div id="hiddenToggle" class="filter">
                [[filter.filterName]]
                <paper-toggle-button id="toggleFilter" checked="{{filter.selectedValue}}"
                                     data-filter-path$="[[filter.path]]"
                                     on-iron-change="toggleValueChanged"></paper-toggle-button>
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
                <paper-icon-item on-tap="selectFilter" disabled$="[[item.disabled]]"  selected$="[[item.selected]]">
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
            id="listHeader"
            label="[[paginator.visible_range.0]]-[[paginator.visible_range.1]] of [[paginator.count]] results to show">
          <etools-data-table-column class="flex" field="vendor_number" sortable>
            Vendor No.
          </etools-data-table-column>
          <etools-data-table-column class="flex-3" field="name" sortable>
            Name (Short/Full)
          </etools-data-table-column>
          <etools-data-table-column class="flex-2" field="partner_type">
            Partner Type
          </etools-data-table-column>
          <etools-data-table-column class="flex" field="rating">
            Risk Rating
          </etools-data-table-column>
        </etools-data-table-header>

        <template id="rows" is="dom-repeat"
                  items="[[filteredPartners]]" as="partner"
                  initial-count="10" on-dom-change="_listDataChanged">
          <etools-data-table-row details-opened="[[detailsOpened]]">
            <div slot="row-data">
                <span class="col-data flex">
                  <a class="vendor-nr truncate"
                     href$="[[currentModule]]/[[partner.id]]/details"
                     title$="[[getDisplayValue(partner.vendor_number)]]"
                     on-tap="_triggerPartnerLoadingMsg">
                    [[getDisplayValue(partner.vendor_number)]]
                  </a>
                </span>
              <span class="col-data flex-3">
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
              <span class="col-data flex-2">
                  [[_computeType(partner.cso_type, partner.partner_type)]]
                </span>
              <span class="col-data flex" style="text-transform: capitalize">
                  [[getDisplayValue(partner.rating)]]
                </span>
            </div>
            <div slot="row-data-details">
              <div class="row-details-content flex">
                <span class="rdc-title">Shared Partner</span>
                <span>[[getDisplayValue(partner.shared_with)]]</span>
              </div>
              <div class="row-details-content flex">
                <span class="rdc-title">Email</span>
                <span>[[getDisplayValue(partner.email)]]</span>
              </div>
              <div class="row-details-content flex">
                <span class="rdc-title">Phone Number</span>
                <span>[[getDisplayValue(partner.phone_number)]]</span>
              </div>
              <div class="row-details-content flex">
                <span class="rdc-title">Actual Cash Transfer for CP</span>
                <span>$ [[displayCurrencyAmount(partner.total_ct_cp, '0')]]</span>
              </div>
              <div class="row-details-content flex">
                <span class="rdc-title">Actual Cash Transfer for Current Year</span>
                <span>$ [[displayCurrencyAmount(partner.total_ct_ytd, '0')]]</span>
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
      filteredPartners: {
        type: Array,
        notify: true,
        observer: '_listChanged'
      },
      csoTypes: {
        type: Array,
        statePath: 'csoTypes'
      },
      partnerTypes: {
        type: Array,
        statePath: 'partnerTypes'
      },
      riskRatings: {
        type: Array,
        statePath: 'partnerRiskRatings'
      },
      selectedPartnerTypes: Array,
      selectedCsoTypes: Array,
      selectedRiskRatings: Array,
      showHidden: {
        type: Boolean
      },
      showOnlyGovernmentType: {
        type: Boolean,
        observer: '_showOnlyGovernmentTypeFlagChanged'
      },
      currentModule: String,
      _sortableFieldNames: Array,
      _governmentLockedPartnerTypes: Array
    };
  }

  public selectedPartnerTypes: any[] = [];
  public selectedCsoTypes: any[] = [];
  public selectedRiskRatings: any[] = [];
  public showOnlyGovernmentType: boolean = false;
  public _sortableFieldNames: string[] = ['vendor_number', 'name'];
  public _governmentLockedPartnerTypes: string[] = ['Government'];

  public static get observers() {
    return [
      '_initFiltersMenuList(partnerTypes, csoTypes, riskRatings, showOnlyGovernmentType)',
      'resetPageNumber(q, selectedPartnerTypes.length, selectedCsoTypes.length, ' +
      'selectedRiskRatings.length, showHidden)',
      '_updateUrlAndData(q, selectedPartnerTypes.length, selectedCsoTypes.length, selectedRiskRatings.length, ' +
      'paginator.page, paginator.page_size, sortOrder, showHidden, requiredDataLoaded, initComplete)',
      '_init(active)'
    ];
  }

  stateChanged(state: RootState) {
    if (!state.commonData) {
      return;
    }
    if (!isJsonStrMatch(this.partnerTypes, state.commonData!.partnerTypes)) {
      this.partnerTypes = state.commonData!.partnerTypes;
    }
    if (!isJsonStrMatch(this.csoTypes, state.commonData!.csoTypes)) {
      this.csoTypes = state.commonData!.csoTypes;
    }
    if (!isJsonStrMatch(this.riskRatings, state.commonData!.partnerRiskRatings)) {
      this.riskRatings = state.commonData!.partnerRiskRatings;
    }
  }

  public connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    this.fireEvent('global-loading', {
      active: false,
      loadingSource: 'partners-page'
    });
    this.listAttachedCallback(this.active, 'Loading...', 'partners-list');
  }

  public _initFiltersMenuList(partnerTypes: any, csoTypes: any, riskRatings: any) {
    if (!partnerTypes || !csoTypes || !riskRatings) {
      // this is just to be safe, the method should only get triggered once when redux data is loaded
      return;
    }
    // init list filter options
    this.initListFiltersData([
      {
        filterName: 'Partner Type',
        type: 'esmm', // etools-dropdown-multi
        selectionOptions: partnerTypes,
        alreadySelected: [],
        path: 'selectedPartnerTypes',
        selected: true,
        minWidth: '350px',
        hideSearch: true,
        disabled: this.showOnlyGovernmentType || partnerTypes.length === 0
      },
      {
        filterName: 'CSO Type',
        type: 'esmm', // etools-dropdown-multi
        selectionOptions: csoTypes,
        alreadySelected: [],
        path: 'selectedCsoTypes',
        selected: true,
        minWidth: '350px',
        hideSearch: false,
        disabled: csoTypes.length === 0
      },
      {
        filterName: 'Risk Rating',
        type: 'esmm', // etools-dropdown-multi
        selectionOptions: riskRatings,
        alreadySelected: [],
        path: 'selectedRiskRatings',
        selected: true,
        minWidth: '160px',
        hideSearch: false,
        disabled: riskRatings.length === 0
      },
      {
        filterName: 'Show hidden',
        type: 'paper-toggle',
        selectedValue: this.showHidden,
        path: 'showHidden',
        selected: true
      }
    ]);
    this._updateSelectedFiltersValues();
  }

  public _updateSelectedFiltersValues() {
    this.updateShownFilterDebouncer = Debouncer.debounce(this.updateShownFilterDebouncer,
        timeOut.after(20),
        () => {
          let filtersValues = [
            {
              filterName: 'Partner Type',
              selectedValue: this.selectedPartnerTypes,
              disabled: this.showOnlyGovernmentType,
              allowEmpty: true,
              disableMenuOption: this.showOnlyGovernmentType
            },
            {
              filterName: 'CSO Type',
              selectedValue: this.selectedCsoTypes,
              allowEmpty: true
            },
            {
              filterName: 'Risk Rating',
              selectedValue: this.selectedRiskRatings,
              allowEmpty: true
            },
            {
              filterName: 'Show hidden',
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
    let urlQueryParams = this.urlParams;
    if (!active || !urlQueryParams) {
      return;
    }
    this.set('initComplete', false);
    this.set('q', urlQueryParams.q ? urlQueryParams.q : '');
    this.set('selectedPartnerTypes', this._getSelectedPartnerTypes(urlQueryParams.partner_types));
    this.set('selectedCsoTypes', this._getFilterUrlValuesAsArray(urlQueryParams.cso_types));
    this.set('selectedRiskRatings', this._getFilterUrlValuesAsArray(urlQueryParams.risk_ratings));
    this.set('showHidden', urlQueryParams.hidden ? true : false);

    this.setPaginationDataFromUrlParams(urlQueryParams);

    // format of sort param is sort=field.order ex: sort=name.asc
    let result = this.initSortFieldsValues({field: 'name', direction: 'asc'}, urlQueryParams.sort);
    this.set('sortOrder', result);
    this.set('initComplete', true);
    this._updateSelectedFiltersValues();
  }

  // Updates URL state with new query string, and launches query
  public _updateUrlAndData() {
    if (this._canFilterData()) {
      this.set('csvDownloadUrl', this._buildCsvDownloadUrl());
      let qs = this._buildQueryString();

      this._updateUrlAndDislayedData(this.currentModule + '/list',
          _partnersLastNavigated,
          qs,
          this._filterListData.bind(this));

      _partnersLastNavigated = qs || _partnersLastNavigated;
    }
  }

  public _filterListData(forceNoLoading: any) {
    // Query is debounced with a debounce time
    // set depending on what action the user takes
    this._actionsChangedDebouncer = Debouncer.debounce(this._actionsChangedDebouncer,
        timeOut.after(this.debounceTime),
        () => {
          this._handleFilterPartnersData(forceNoLoading);
        });
  }

  public _handleFilterPartnersData(forceNoLoading: boolean) {
    let partners = this.shadowRoot.querySelector('#partners');
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
      hidden: this.showHidden ? 'true' : '',
      sort: this.sortOrder
    });
  }

  public _buildCsvDownloadUrl() {
    let endpointUrl = this.getEndpoint('partners').url;
    let params = {
      search: this.q,
      partner_type: this.selectedPartnerTypes,
      cso_type: this.selectedCsoTypes,
      rating: this.selectedRiskRatings,
      hidden: this.showHidden ? 'true' : 'false'
    };
    return this._buildCsvExportUrl(params, endpointUrl);
  }

  public _computeName(name: string, shortName: string) {
    return this.getDisplayValue([shortName, name], false, ' / ', true);
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

  public _showOnlyGovernmentTypeFlagChanged(showOnlyGovernmentType: any) {
    if (showOnlyGovernmentType) {
      // lock list to government partners only
      this.set('selectedPartnerTypes', this._governmentLockedPartnerTypes);
    } else {
      // unlock list from government partners only
      this.set('selectedPartnerTypes', []);
    }
    this.set('selectedCsoTypes', []);
    this.set('selectedRiskRatings', []);
    this.set('q', '');
    this.resetPageNumber();
    this.set('showHidden', false);
    this._updateSelectedFiltersValues();
  }

  public _triggerPartnerLoadingMsg() {
    this.fireEvent('trigger-partner-loading-msg');
  }

}

window.customElements.define('partners-list', PartnersList);
