import {LitElement, customElement, html, property} from 'lit-element';
import {store, RootState} from '../../../../../redux/store';
import '@polymer/iron-media-query/iron-media-query.js';
import '../../data/partners-list-data.js';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import ListsCommonMixin from '../../../../common/mixins/lists-common-mixin-lit';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin.js';

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
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';

import {fireEvent} from '../../../../utils/fire-custom-event';
import {PartnersListData} from '../../data/partners-list-data';
import {GenericObject, RouteDetails, RouteQueryParams} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {Partner} from '../../../../../models/partners.models';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import '@unicef-polymer/etools-modules-common/dist/layout/filters/etools-filters';
import pick from 'lodash-es/pick';
import {buildUrlQueryString} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import get from 'lodash-es/get';
import omit from 'lodash-es/omit';
import {PartnerFilterKeys, partnerFilters} from './partners-filters';
import {
  updateFilterSelectionOptions,
  updateFiltersSelectedValues
} from '@unicef-polymer/etools-modules-common/dist/list/filters';
import {EtoolsFilter} from '@unicef-polymer/etools-modules-common/dist/layout/filters/etools-filters';
import {EtoolsRouter} from '../../../../utils/routes';
import debounce from 'lodash-es/debounce';
import {reduxConnect} from './redux-connect';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin EndpointsMixin
 * @appliesMixin ListFiltersMixins
 * @appliesMixin CommonMixin
 * @appliesMixin ListsCommonMixin
 * @appliesMixin PaginationMixin
 */
@customElement('partners-list')
export class PartnersList extends reduxConnect(store)(
  CommonMixin(ListsCommonMixin(PaginationMixin(EndpointsMixin(EtoolsCurrency(LitElement)))))
) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    // language=HTML
    return html`
      ${listFilterStyles} ${partnerStatusStyles}
      <style>
        ${sharedStyles} ${elevationStyles} ${dataTableStylesLit} .sm-status-wrapper {
          padding-left: 10px;
        }
        :host {
          box-sizing: border-box;
        }

        .vendor-nr {
          @apply --text-btn-style;
          text-transform: none;
        }

        .page-content {
          margin: 0 0 24px 0;
        }

        section.page-content.filters {
          padding: 8px 24px;
        }

        @media (max-width: 576px) {
          section.page-content.filters {
            padding: 5px;
          }
          .page-content {
            margin: 5px;
          }
        }
      </style>

      <iron-media-query
        query="(max-width: 767px)"
        .queryMatches="${this.lowResolutionLayout}"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></iron-media-query>

      <partners-list-data
        id="partners"
        @filtered-partners-changed="${(e: CustomEvent) => {
          this.filteredPartners = e.detail.data;
          this.paginator = {...this.paginator, count: e.detail.totalLength};
          // etools-data-table-footer is not displayed without this:
          setTimeout(() => this.requestUpdate());
        }}"
        list-data-path="filteredPartners"
        fireDataLoaded
      >
      </partners-list-data>

      <section class="elevation page-content filters" elevation="1">
        <etools-filters .filters="${this.allFilters}" @filter-change="${this.filtersChange}"></etools-filters>
      </section>

      <div id="list" elevation="1" class="paper-material elevation">
        <etools-data-table-header
          .lowResolutionLayout="${this.lowResolutionLayout}"
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
            .lowResolutionLayout="${this.lowResolutionLayout}"
            .detailsOpened="${this.detailsOpened}"
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

  @property({type: String})
  currentModule = '';

  @property({type: Boolean})
  lowResolutionLayout = false;

  @property({type: Object})
  routeDetails!: RouteDetails;

  /**
   * Used to preserve previously selected filters and pagination when navigating away from the list and comming back
   * & to initialize pagination
   */
  @property({type: Object})
  prevQueryStringObj: GenericObject = {size: 20, page: 1, sort: 'name.asc'};

  @property({type: Array})
  allFilters!: EtoolsFilter[];

  @property({type: Boolean})
  showOnlyGovernmentType = false;

  @property({type: Array})
  _governmentLockedPartnerTypes: string[] = ['Government'];

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'partners-page'
    });

    this.onParamsChange = debounce(this.onParamsChange.bind(this), 600);
    this.subscribeToReduxStore();
  }

  stateChanged(state: RootState): void {
    const stateRouteDetails = get(state, 'app.routeDetails');
    if (!(stateRouteDetails.routeName === 'partners' && stateRouteDetails.subRouteName === 'list')) {
      return;
    }
    if (
      JSON.stringify(stateRouteDetails) !== JSON.stringify(this.routeDetails) ||
      state.interventions?.shouldReGetList
    ) {
      if (
        (!stateRouteDetails.queryParams || Object.keys(stateRouteDetails.queryParams).length === 0) &&
        this.prevQueryStringObj
      ) {
        this.routeDetails = stateRouteDetails;
        this.updateCurrentParams(this.prevQueryStringObj);
        return;
      }
      this.routeDetails = stateRouteDetails;
      this.onParamsChange();
    }

    this.initFiltersForDisplay(state);
  }

  // Override from lists-common-mixin
  _sortOrderChanged(e: CustomEvent) {
    const sort = e.detail.field + '.' + e.detail.direction;
    this.updateCurrentParams({sort: sort});
  }

  paginatorChanged() {
    this.updateCurrentParams({page: this.paginator.page, size: this.paginator.page_size});
  }

  private initFiltersForDisplay(state: RootState) {
    if (!this.allFilters && this.dataRequiredByFiltersHasBeenLoaded(state)) {
      const availableFilters = [...partnerFilters];
      this.populateDropdownFilterOptionsFromCommonData(state, availableFilters);

      // update filter selection and assign the result to etools-filters(trigger render)
      const currentParams: RouteQueryParams = state.app!.routeDetails.queryParams || {};
      this.allFilters = updateFiltersSelectedValues(currentParams, availableFilters);
    }
  }
  private populateDropdownFilterOptionsFromCommonData(state: RootState, allFilters: EtoolsFilter[]) {
    updateFilterSelectionOptions(allFilters, PartnerFilterKeys.partner_types, state.commonData!.partnerTypes);
    updateFilterSelectionOptions(allFilters, PartnerFilterKeys.cso_types, state.commonData!.csoTypes);
    updateFilterSelectionOptions(allFilters, PartnerFilterKeys.risk_ratings, state.commonData!.partnerRiskRatings);
    updateFilterSelectionOptions(allFilters, PartnerFilterKeys.sea_risk_ratings, state.commonData!.seaRiskRatings);
  }

  private dataRequiredByFiltersHasBeenLoaded(state: RootState): boolean {
    return !!(
      state.commonData?.commonDataIsLoaded &&
      this.routeDetails?.queryParams &&
      Object.keys(this.routeDetails?.queryParams).length > 0
    );
  }

  onParamsChange(): void {
    // const currentParams: GenericObject<any> = this.routeDetails?.queryParams || {};
    // const paramsValid: boolean = this.paramsInitialized || this.initializeAndValidateParams(currentParams);

    // if (paramsValid) {
    // get data as params are valid
    //   this.showLoading = true;
    // ----TODO----------- this.getListData(forceReGet); ------
    //   }

    this.loadFilteredPartners(this.routeDetails);
  }

  loadFilteredPartners(routeDetails: RouteDetails) {
    const partners = this.shadowRoot!.querySelector('#partners') as PartnersListData;
    if (!partners) {
      return;
    }

    const sortOrder = routeDetails.queryParams?.sort ? routeDetails.queryParams?.sort?.split('.') : [];

    partners.query(
      sortOrder[0],
      sortOrder[1],
      routeDetails.queryParams?.q?.toLowerCase() || '',
      this.getSelectedPartnerTypes(routeDetails.queryParams?.partner_types || ''),
      this.getFilterUrlValuesAsArray(routeDetails.queryParams?.cso_types || ''),
      this.getFilterUrlValuesAsArray(routeDetails.queryParams?.risk_ratings || ''),
      this.getFilterUrlValuesAsArray(routeDetails.queryParams?.sea_risk_ratings || ''),
      routeDetails.queryParams?.psea_assessment_date_before || '',
      routeDetails.queryParams?.psea_assessment_date_after || '',
      this.paginator.page,
      this.paginator.page_size,
      Boolean(routeDetails.queryParams?.showHidden || false),
      true
    );
  }

  public _triggerPartnerLoadingMsg() {
    fireEvent(this, 'trigger-partner-loading-msg');
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

  private getSelectedPartnerTypes(selectedPartnerTypes: any) {
    return this.showOnlyGovernmentType
      ? this._governmentLockedPartnerTypes
      : this._getFilterUrlValuesAsArray(selectedPartnerTypes);
  }

  getFilterUrlValuesAsArray(types: string) {
    return types ? types.split('|') : [];
  }

  private updateCurrentParams(paramsToUpdate: GenericObject<any>, reset = false): void {
    let currentParams: RouteQueryParams = this.routeDetails!.queryParams || {};
    if (reset) {
      currentParams = pick(currentParams, ['sort', 'size', 'page']);
    }
    const newParams: RouteQueryParams = {...currentParams, ...paramsToUpdate};
    this.prevQueryStringObj = newParams;

    fireEvent(this, 'csvDownloadUrl-changed', this.buildCsvDownloadUrl(newParams));

    const stringParams: string = buildUrlQueryString(newParams);
    EtoolsRouter.replaceAppLocation(`${this.routeDetails!.path}?${stringParams}`);
  }

  public buildCsvDownloadUrl(queryStringObj: GenericObject<any>) {
    const exportParams = omit(queryStringObj, ['page', 'size']);
    return this._buildCsvExportUrl(exportParams, this.getEndpoint('partners').url);
  }

  filtersChange(e: CustomEvent) {
    this.updateCurrentParams({...e.detail, page: 1}, true);
  }
}
