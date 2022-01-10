import {LitElement, customElement, html, property, PropertyValues} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {store, RootState} from '../../../../../redux/store';
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

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {partnerStatusStyles} from '../../../../styles/partner-status-styles-lit';
import {listFilterStyles} from '../../../../styles/list-filter-styles-lit';

import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin.js';

import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';

import '../../data/partners-list-data.js';
import {isJsonStrMatch} from '../../../../utils/utils';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {PartnersListData} from '../../data/partners-list-data';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {Partner} from '../../../../../models/partners.models';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import ListFiltersMixin from '../../../../common/mixins/list-filters-mixin-lit';
import ListsCommonMixin from '../../../../common/mixins/lists-common-mixin-lit';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';

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
@customElement('partners-list')
export class PartnersList extends connect(store)(
  CommonMixin(ListFiltersMixin(ListsCommonMixin(PaginationMixin(EndpointsMixin(EtoolsCurrency(LitElement))))))
) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    // language=HTML
    return html`
      ${listFilterStyles} ${partnerStatusStyles}
      <style>
        ${sharedStyles} ${dataTableStylesLit} .sm-status-wrapper {
          padding-left: 10px;
        }

        .vendor-nr {
          @apply --text-btn-style;
          text-transform: none;
        }
      </style>

      <iron-media-query query="(max-width: 767px)" .query-matches="${this.lowResolutionLayout}"></iron-media-query>

      ${this.stampListData &&
      html`
        <partners-list-data
          id="partners"
          .filteredPartners="${this.filteredPartners}"
          @partners-loaded="${this._requiredDataHasBeenLoaded}"
          @filtered-partners-changed="${(e: CustomEvent) => {
            this.filteredPartners = e.detail;
          }}"
          @total-results-changed="${(e: CustomEvent) => {
            this.paginator = {...this.paginator, count: e.detail};
            // etools-data-table-footer is not displayed without this:
            setTimeout(() => this.requestUpdate());
          }}"
          list-data-path="filteredPartners"
          fireDataLoaded
        >
        </partners-list-data>
      `}

      <div id="filters" class="paper-material" elevation="1">
        <div id="filters-fields">
          <paper-input
            id="query"
            class="filter"
            type="search"
            autocomplete="off"
            .value="${this.q}"
            @value-changed="${({detail}: CustomEvent) => (this.q = detail.value)}"
            placeholder="${translate('GENERAL.SEARCH')}"
          >
            <iron-icon icon="search" slot="prefix"></iron-icon>
          </paper-input>

          ${this.selectedFilters?.map(
            (filter) => html`
              ${this.filterTypeIs('etools-dropdown-multi', filter.type)
                ? html` <etools-dropdown-multi
                    class="filter"
                    label="${filter.filterName}"
                    placeholder="Select"
                    ?disabled="${filter.disabled}"
                    .options="${filter.selectionOptions}"
                    .selectedValues="${filter.selectedValue}"
                    data-filter-path="${filter.path}"
                    @etools-selected-items-changed="${this.esmmValueChanged}"
                    trigger-value-change-event
                    hide-search="${filter.hideSearch}"
                    min-width="${filter.minWidth}"
                    horizontal-align="left"
                    no-dynamic-align
                  >
                  </etools-dropdown-multi>`
                : ''}
              ${this.filterTypeIs('datepicker', filter.type)
                ? html` <datepicker-lite
                    id="datepicker_${filter.path}"
                    class="filter date"
                    label="${filter.filterName}"
                    placeholder="&#8212;"
                    .value="${filter.selectedValue}"
                    @date-has-changed="${this._filterDateHasChanged}"
                    data-filter-path="${filter.path}"
                    fire-date-has-changed
                    selected-date-display-format="D MMM YYYY"
                  >
                  </datepicker-lite>`
                : ''}
              ${this.filterTypeIs('paper-toggle', filter.type)
                ? html` <div id="hiddenToggle" class="filter">
                    ${filter.filterName}
                    <paper-toggle-button
                      id="toggleFilter"
                      ?checked="${filter.selectedValue}"
                      data-filter-path="${filter.path}"
                      @iron-change="${this.toggleValueChanged}"
                    ></paper-toggle-button>
                  </div>`
                : ''}
            `
          )}
        </div>

        <div class="fixed-controls">
          <paper-menu-button id="filterMenu" ignore-select horizontal-align="right">
            <paper-button class="button" slot="dropdown-trigger">
              <iron-icon icon="filter-list"></iron-icon>
              ${translate('GENERAL.FILTERS')}
            </paper-button>
            <div slot="dropdown-content" class="clear-all-filters">
              <paper-button @tap="${this.clearAllFilters}" class="secondary-btn">
                ${translate('GENERAL.CLEAR_ALL')}
              </paper-button>
            </div>
            <paper-listbox slot="dropdown-content" multi>
              ${this.listFilterOptions?.map(
                (item, index) => html`
                  <paper-icon-item
                    @tap="${() => {
                      this.selectFilter(item, index);
                    }}"
                    .disabled="${item.disabled}"
                    .selected="${item.selected}"
                  >
                    <iron-icon icon="check" slot="item-icon" ?hidden="${!item.selected}"></iron-icon>
                    <paper-item-body>${item.filterName}</paper-item-body>
                  </paper-icon-item>
                `
              )}
            </paper-listbox>
          </paper-menu-button>
        </div>
      </div>
      <div id="list" elevation="1" class="paper-material hidden">
        <etools-data-table-header
          .low-resolution-layout="${this.lowResolutionLayout}"
          id="listHeader"
          label="${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} of ${this.paginator
            .count} results to show"
        >
          <etools-data-table-column class="flex-c" field="vendor_number" sortable>
            ${translate('VENDOR_NO')}
          </etools-data-table-column>
          <etools-data-table-column class="col-3" field="name" sortable>
            ${translate('NAME_SHORT_FULL')}
          </etools-data-table-column>
          <etools-data-table-column class="col-2" field="partner_type">
            ${translate('PARTNER_TYPE')}
          </etools-data-table-column>
          <etools-data-table-column class="flex-c" field="hact_rating">
            ${translate('HACT_RISK_RATING')}
          </etools-data-table-column>
          <etools-data-table-column class="flex-c" field="sea_rating">
            ${translate('SEA_RISK_RATING')}
          </etools-data-table-column>
          <etools-data-table-column class="flex-c" field="psea_date">
            ${translate('LAST_PSEA_ASSESS_DATE')}
          </etools-data-table-column>
        </etools-data-table-header>

        ${this.filteredPartners.map(
          (partner: Partner) => html` <etools-data-table-row
            .low-resolution-layout="${this.lowResolutionLayout}"
            .details-opened="${this.detailsOpened}"
          >
            <div slot="row-data">
              <span class="col-data flex-c" data-col-header-label="${translate('VENDOR_NO')}">
                <a
                  class="vendor-nr truncate"
                  href="${this.currentModule}/${partner.id}/details"
                  title="${this.getDisplayValue(partner.vendor_number, ',', false)}"
                  @click="${this._triggerPartnerLoadingMsg}"
                >
                  ${this.getDisplayValue(partner.vendor_number, ',', false)}
                </a>
              </span>
              <span class="col-data col-3" data-col-header-label="${translate('NAME_SHORT_FULL')}">
                <span>${this._computeName(partner.name, partner.short_name)}</span>

                <span class="sm-status-wrapper" ?hidden="${!partner.deleted_flag}">
                  <span class="marked-for-deletion">
                    <iron-icon icon="delete"></iron-icon>
                  </span>
                </span>

                <span class="sm-status-wrapper" ?hidden="${!partner.blocked}">
                  <span class="blocked">
                    <iron-icon icon="block"></iron-icon>
                  </span>
                </span>
              </span>
              <span class="col-data col-2" data-col-header-label="${translate('PARTNER_TYPE')}">
                ${this._computeType(partner.cso_type, partner.partner_type)}
              </span>
              <span
                class="col-data flex-c"
                data-col-header-label="${translate('HACT_RISK_RATING')}"
                style="text-transform: capitalize"
              >
                ${this.getDisplayValue(partner.rating, ',', false)}
              </span>
              <span
                class="col-data flex-c"
                data-col-header-label="${translate('SEA_RISK_RATING')}"
                style="text-transform: capitalize"
              >
                ${this.getDisplayValue(partner.sea_risk_rating_name, ',', false)}
              </span>
              <span class="col-data flex-c" data-col-header-label="${translate('LAST_PSEA_ASSESS_DATE')}">
                ${this.getDateDisplayValue(partner.psea_assessment_date)}
              </span>
            </div>
            <div slot="row-data-details">
              <div class="row-details-content flex-c">
                <span class="rdc-title">${translate('SHARED_PARTNER')}</span>
                <span>${this.getDisplayValue(partner.shared_with, ',', false)}</span>
              </div>
              <div class="row-details-content flex-c">
                <span class="rdc-title">${translate('EMAIL')}</span>
                <span>${this.getDisplayValue(partner.email, ',', false)}</span>
              </div>
              <div class="row-details-content flex-c">
                <span class="rdc-title">${translate('PHONE_NUMBER')}</span>
                <span>${this.getDisplayValue(partner.phone_number, ',', false)}</span>
              </div>
              <div class="row-details-content flex-c">
                <span class="rdc-title">${translate('ACTUAL_CASH_TRANSFER_FOR_CP')}</span>
                <span>$ ${displayCurrencyAmount(partner.total_ct_cp, '0')}</span>
              </div>
              <div class="row-details-content flex-c">
                <span class="rdc-title">${translate('ACTUAL_CASH_TRANSFER_FOR_CURRENT_YEAR')}</span>
                <span>$ ${displayCurrencyAmount(partner.total_ct_ytd, '0')}</span>
              </div>
            </div>
          </etools-data-table-row>`
        )}

        <etools-data-table-footer
          .lowResolutionLayout="${this.lowResolutionLayout}"
          .pageSize="${this.paginator.page_size}"
          .pageNumber="${this.paginator.page}"
          .totalResults="${this.paginator.count}"
          .visibleRange="${this.paginator.visible_range}"
          @visible-range-changed="${this.visibleRangeChanged}"
          @page-size-changed="${this.pageSizeChanged}"
          @page-number-changed="${this.pageNumberChanged}"
        >
        </etools-data-table-footer>
      </div>
    `;
  }

  @property({type: Array})
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

  @property({type: Boolean})
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
  private _dataChangedDebouncer!: Debouncer;

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

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('filteredPartners')) {
      this._listChanged(this.filteredPartners, changedProperties.get('filteredPartners'));
    }

    if (changedProperties.has('showOnlyGovernmentType')) {
      this._showOnlyGovernmentTypeFlagChanged(this.showOnlyGovernmentType);
    }

    if (changedProperties.has('showOnlyGovernmentType')) {
      this._initFiltersMenuList(this.partnerTypes, this.csoTypes, this.riskRatings, this.seaRiskRatings);
    }

    if (
      changedProperties.has('q') ||
      changedProperties.has('selectedPartnerTypes') ||
      changedProperties.has('selectedCsoTypes') ||
      changedProperties.has('selectedRiskRatings') ||
      changedProperties.has('selectedSEARiskRatings') ||
      changedProperties.has('selectedPseaDateBefore') ||
      changedProperties.has('selectedPseaDateAfter') ||
      changedProperties.has('showHidden')
    ) {
      this.resetPageNumber();
      return;
    }

    if (
      changedProperties.has('sortOrder') ||
      changedProperties.has('requiredDataLoaded') ||
      changedProperties.has('initComplete')
    ) {
      this._updateUrlAndData();
    }

    if (changedProperties.has('active')) {
      this._init(this.active);
    }
  }

  public connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    setTimeout(() => {
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: 'partners-page'
      });
    }, 100);
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
        filterName: this._translate('PARTNER_TYPE'),
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
        filterName: this._translate('CSO_TYPE'),
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
        filterName: this._translate('HACT_RISK_RATING'),
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
        filterName: this._translate('SEA_RISK_RATING'),
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
        filterName: this._translate('PSEA_ASSESSMENT_DATE_BEFORE'),
        type: 'datepicker',
        selectedValue: '',
        path: 'selectedPseaDateBefore',
        selected: false,
        disabled: false
      },
      {
        filterName: this._translate('PSEA_ASSESSMENT_DATE_AFTER'),
        type: 'datepicker',
        selectedValue: '',
        path: 'selectedPseaDateAfter',
        selected: false,
        disabled: false
      },
      {
        filterName: this._translate('SHOW_HIDDEN'),
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
          filterName: this._translate('PARTNER_TYPE'),
          selectedValue: this.selectedPartnerTypes,
          disabled: this.showOnlyGovernmentType,
          allowEmpty: true,
          disableMenuOption: this.showOnlyGovernmentType
        },
        {
          filterName: this._translate('CSO_TYPE'),
          selectedValue: this.selectedCsoTypes,
          allowEmpty: true
        },
        {
          filterName: this._translate('HACT_RISK_RATING'),
          selectedValue: this.selectedRiskRatings,
          allowEmpty: true
        },
        {
          filterName: this._translate('SEA_RISK_RATING'),
          selectedValue: this.selectedSEARiskRatings,
          allowEmpty: true
        },
        {
          filterName: this._translate('PSEA_ASSESSMENT_DATE_BEFORE'),
          selectedValue: this.selectedPseaDateBefore,
          allowEmpty: true
        },
        {
          filterName: this._translate('PSEA_ASSESSMENT_DATE_AFTER'),
          selectedValue: this.selectedPseaDateAfter,
          allowEmpty: true
        },
        {
          filterName: this._translate('SHOW_HIDDEN'),
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

    this.initComplete = false;
    this.q = urlQueryParams.q ? urlQueryParams.q : '';
    this.selectedPartnerTypes = this._getSelectedPartnerTypes(urlQueryParams.partner_types);
    this.selectedCsoTypes = this._getFilterUrlValuesAsArray(urlQueryParams.cso_types);
    this.selectedRiskRatings = this._getFilterUrlValuesAsArray(urlQueryParams.risk_ratings);
    this.selectedSEARiskRatings = this._getFilterUrlValuesAsArray(urlQueryParams.sea_risk_ratings);
    this.selectedPseaDateBefore = urlQueryParams.psea_assessment_date_before
      ? urlQueryParams.psea_assessment_date_before
      : '';
    this.selectedPseaDateAfter = urlQueryParams.psea_assessment_date_after
      ? urlQueryParams.psea_assessment_date_after
      : '';
    this.showHidden = urlQueryParams.hidden ? true : false;

    this.setPaginationDataFromUrlParams(urlQueryParams);

    // format of sort param is sort=field.order ex: sort=name.asc
    const result = this.initSortFieldsValues({field: 'name', direction: 'asc'}, urlQueryParams.sort);
    this.sortOrder = result;
    this.initComplete = true;
    this._updateSelectedFiltersValues();
  }

  paginatorChanged() {
    this._updateUrlAndData();
  }

  // Updates URL state with new query string, and launches query
  public _updateUrlAndData() {
    if (this._canFilterData()) {
      this._dataChangedDebouncer = Debouncer.debounce(this._dataChangedDebouncer, timeOut.after(400), () => {
        console.log('inside _updateUrlAndData....');
        const csvDownloadUrl = this._buildCsvDownloadUrl();
        fireEvent(this, 'csvDownloadUrl-changed', csvDownloadUrl);
        const qs = this._buildQueryString();

        this._updateUrlAndDislayedData(
          this.currentModule + '/list',
          _partnersLastNavigated,
          qs,
          this._filterListData.bind(this)
        );

        _partnersLastNavigated = qs || _partnersLastNavigated;
      });
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
    const partners = this.shadowRoot!.querySelector('#partners') as PartnersListData;

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
      this.selectedPartnerTypes = this._governmentLockedPartnerTypes;
    } else {
      // unlock list from government partners only
      this.selectedPartnerTypes = [];
    }
    this.selectedCsoTypes = [];
    this.selectedRiskRatings = [];
    this.selectedSEARiskRatings = [];
    this.selectedPseaDateBefore = '';
    this.selectedPseaDateAfter = '';
    this.q = '';
    this.resetPageNumber();
    this.showHidden = false;
    this._updateSelectedFiltersValues();
  }

  public _triggerPartnerLoadingMsg() {
    fireEvent(this, 'trigger-partner-loading-msg');
  }
}
