import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';

import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import ListsCommonMixin from '../../../../common/mixins/lists-common-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import {EtoolsCurrency} from '@unicef-polymer/etools-unicef/src/mixins/currency.js';

import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query';
import '../../data/partners-list-data.js';

import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip.js';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {partnerStatusStyles} from '../../../../styles/partner-status-styles-lit';
import {listFilterStyles} from '../../../../styles/list-filter-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';

import {translate} from 'lit-translate';
import {Partner} from '../../../../../models/partners.models';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsFilter} from '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import {RouteDetails, RouteQueryParams} from '@unicef-polymer/etools-types/dist/router.types';
import {PartnersListData} from '../../data/partners-list-data';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import omit from 'lodash-es/omit';
import {buildUrlQueryString, cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {getTranslatedValue, translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import pick from 'lodash-es/pick';
import debounce from 'lodash-es/debounce';
import {GenericObject} from '@unicef-polymer/etools-types';
import {PartnerFilterKeys} from './partners-filters';
import {CommonDataState} from '../../../../../redux/reducers/common-data';
import {RootState, store} from '../../../../../redux/store';
import get from 'lodash-es/get';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../../../endpoints/endpoints';
import {FiltersHelper} from '@unicef-polymer/etools-unicef/src/etools-filters/filters-helper.class';
import {setShouldReloadPartners} from '../../../../../redux/actions/partners';

export class PartnersListBase extends CommonMixin(
  ListsCommonMixin(PaginationMixin(EndpointsLitMixin(EtoolsCurrency(LitElement))))
) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    // language=HTML
    return html`
      ${listFilterStyles} ${partnerStatusStyles}${sharedStyles}
      <style>
        ${elevationStyles} ${dataTableStylesLit} .sm-status-wrapper {
          padding-inline-end: 10px;
        }
        :host {
          box-sizing: border-box;
          background-color: #eeeeee;
          position: relative;
        }

        .vendor-nr {
          text-transform: none;
        }

        .page-content {
          margin: 0 0 24px 0;
        }
        #list {
          position: inherit;
        }

        section.page-content.filters {
          padding: 8px 24px;
          z-index: 56;
        }

        .filters {
          position: relative;
          z-index: 1;
        }
        .no-overflow {
          overflow-wrap: anywhere;
          background: yellow;
        }

        @media (max-width: 576px) {
          section.page-content.filters {
            margin: 5px 0;
          }
          .page-content {
            margin: 5px;
          }
        }

        etools-info-tooltip::part(eit-trigger-icon) {
          margin-inline-start: 0;
        }
      </style>

      <etools-media-query
        query="(max-width: 767px)"
        .queryMatches="${this.lowResolutionLayout}"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>

      <partners-list-data
        id="partners-${this.localName}"
        @filtered-partners-changed="${(e: CustomEvent) => {
          this.filteredPartners = e.detail;
        }}"
        @total-results-changed="${(e: CustomEvent) => {
          this.paginator = {...this.paginator, count: e.detail};
          // etools-data-table-footer is not displayed without this:
          setTimeout(() => this.requestUpdate());
        }}"
        @list-loading="${({detail}: CustomEvent) => (this.listLoadingActive = detail.active)}"
        list-data-path="filteredPartners"
        fireDataLoaded
        no-get-request
      >
      </partners-list-data>

      <section class="elevation page-content filters" elevation="1">
        <etools-filters
          .filters="${this.allFilters}"
          @filter-change="${this.filtersChange}"
          .textFilters="${translate('GENERAL.FILTERS')}"
          .textClearAll="${translate('GENERAL.CLEAR_ALL')}"
        ></etools-filters>
      </section>

      <div id="list" elevation="1" class="paper-material elevation">
        <etools-loading ?active="${this.listLoadingActive}"></etools-loading>
        <etools-data-table-header
          .lowResolutionLayout="${this.lowResolutionLayout}"
          id="listHeader"
          label="${translate('RESULTS_TO_SHOW', {
            from: this.paginator.visible_range[0],
            to: this.paginator.visible_range[1],
            count: this.paginator.count || 0
          })}"
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
                  class="text-btn-style vendor-nr truncate"
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
                  <etools-info-tooltip class="marked-for-deletion" custom-icon ?hidden="${!partner.deleted_flag}">
                    <etools-icon name="delete" slot="custom-icon"></etools-icon>
                    <span slot="message">${translate('MARKED_FOR_DELETION')}</span>
                  </etools-info-tooltip>
                </span>

                <span class="sm-status-wrapper" ?hidden="${!partner.blocked}">
                  <etools-info-tooltip class="blocked" custom-icon ?hidden="${!partner.blocked}">
                    <etools-icon name="block" slot="custom-icon"></etools-icon>
                    <span slot="message">${translate('BLOCKED')}</span>
                  </etools-info-tooltip>
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
                ${translateValue(
                  this.getDisplayValue(partner.rating, ',', false) as string,
                  'COMMON_DATA.PARTNERRISKRATINGS'
                )}
              </span>
              <span
                class="col-data flex-c"
                data-col-header-label="${translate('SEA_RISK_RATING')}"
                style="text-transform: capitalize"
              >
                ${translateValue(
                  this.getDisplayValue(partner.sea_risk_rating_name, ',', false) as string,
                  'COMMON_DATA.SEARISKRATINGS'
                )}
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
          @page-size-changed="${this.pageSizeChanged}"
          @page-number-changed="${this.pageNumberChanged}"
        >
        </etools-data-table-footer>
      </div>
    `;
  }

  @property({type: String})
  currentModule = '';

  @property({type: Array})
  filteredPartners: any[] = [];

  @property({type: Boolean})
  lowResolutionLayout = false;

  @property({type: Array})
  allFilters!: EtoolsFilter[];

  @property({type: Object})
  routeDetails!: RouteDetails | null;

  @property({type: Boolean})
  listLoadingActive = false;

  /**
   * Used to preserve previously selected filters and pagination when navigating away from the list and comming back
   * & to initialize pagination
   */
  @property({type: Object})
  prevQueryStringObj: GenericObject = {size: 10, page: 1, sort: 'name.asc'};

  connectedCallback(): void {
    this.loadFilteredPartners = debounce(this.loadFilteredPartners.bind(this), 600);

    super.connectedCallback();
  }

  baseStateChanged(state: RootState): void {
    const stateRouteDetails = get(state, 'app.routeDetails');
    if (
      !(
        this.localName.indexOf(stateRouteDetails?.routeName.split('-')[0] as any) > -1 &&
        stateRouteDetails?.subRouteName === 'list'
      )
    ) {
      // this.routeDetails = null;
      return;
    }

    if (!this.dataRequiredByFiltersHasBeenLoaded(state) || !state.partners?.listIsLoaded) {
      this.listLoadingActive = true;
      return;
    }

    if (this.filteringParamsHaveChanged(stateRouteDetails) || this.shouldReGetListBecauseOfEditsOnItems(state)) {
      if (this.hadToinitializeUrlWithPrevQueryString(stateRouteDetails)) {
        return;
      }
      this.listLoadingActive = true;
      this.routeDetails = cloneDeep(stateRouteDetails);
      this.commonDataLoadedTimestamp = state.commonData!.loadedTimestamp;
      this.initFiltersForDisplay(state.commonData!);
      this.initializePaginatorFromUrl(this.routeDetails?.queryParams);
      this.loadListData();
      if (state.partners.shouldReloadList) {
        store.dispatch(setShouldReloadPartners(false));
      }
    }

    if (this.commonDataLoadedTimestamp !== state.commonData!.loadedTimestamp && this.allFilters) {
      // static data reloaded (because of language change), need to update filters
      this.commonDataLoadedTimestamp = state.commonData!.loadedTimestamp;
      this.translateFilters(this.allFilters);
      this.populateDropdownFilterOptionsFromCommonData(state.commonData!, this.allFilters);
      this.allFilters = [...this.allFilters];
    }
  }

  initFiltersForDisplay(commonData: CommonDataState) {
    let availableFilters = [];
    if (!this.allFilters) {
      availableFilters = JSON.parse(JSON.stringify(this.getAllFilters()));
      this.populateDropdownFilterOptionsFromCommonData(commonData, availableFilters);
    } else {
      // Avoid setting this.allFilters twice, as the already selected filters will be reset
      availableFilters = this.allFilters;
    }

    const currentParams: RouteQueryParams = this.routeDetails!.queryParams || {};
    this.allFilters = this.getFiltersHelper().updateFiltersSelectedValues(
      omit(currentParams, ['page', 'size', 'sort']),
      availableFilters
    );
  }

  protected getSelectedPartnerTypes(_selectedPartnerTypes: string): string[] {
    console.log('getSelectedPartnerTypes / To be implemented in derived class');
    return [];
  }

  protected getAllFilters() {
    console.log('getAllFilters / To be implemented in derived class');
    return [];
  }

  protected getFiltersHelper(): FiltersHelper {
    console.log('getSelectedValueTypeByFilterKey / To be implemented in derived class');
    return new FiltersHelper({});
  }

  loadListData() {
    this.loadFilteredPartners();
  }

  loadFilteredPartners() {
    const partners = this.shadowRoot!.querySelector('#partners-' + this.localName) as PartnersListData;
    if (!partners) {
      console.warn('<partners-list-data> component is null');
      return;
    }
    const queryParams = this.routeDetails?.queryParams;

    const sortOrder = queryParams?.sort ? queryParams?.sort?.split('.') : [];

    partners.query(
      sortOrder[0],
      sortOrder[1],
      queryParams?.search?.toLowerCase() || '',
      this.getSelectedPartnerTypes(queryParams?.partner_types || ''),
      this.getFilterUrlValuesAsArray(queryParams?.cso_types || ''),
      this.getFilterUrlValuesAsArray(queryParams?.risk_ratings || ''),
      this.getFilterUrlValuesAsArray(queryParams?.sea_risk_ratings || ''),
      queryParams?.psea_assessment_date_before || '',
      queryParams?.psea_assessment_date_after || '',
      queryParams?.page ? Number(queryParams.page) : 1,
      queryParams?.size ? Number(queryParams.size) : 10,
      Boolean(queryParams?.hidden || false),
      false
    );
  }

  getFilterUrlValuesAsArray(types: string) {
    return types ? types.split(',') : [];
  }
  private updateCurrentParams(paramsToUpdate: GenericObject<any>, reset = false): void {
    let currentParams = this.routeDetails ? this.routeDetails.queryParams : this.prevQueryStringObj;
    if (reset) {
      currentParams = pick(currentParams, ['sort', 'size', 'page']);
    }
    this.prevQueryStringObj = cloneDeep({...currentParams, ...paramsToUpdate});

    fireEvent(this, 'csvDownloadUrl-changed', this.buildCsvDownloadUrl(this.prevQueryStringObj) as any);

    const stringParams: string = buildUrlQueryString(this.prevQueryStringObj);
    EtoolsRouter.replaceAppLocation(`${this.currentModule}/list?${stringParams}`);
  }

  // Override from lists-common-mixin
  _sortOrderChanged(e: CustomEvent) {
    const sort = e.detail.field + '.' + e.detail.direction;
    this.updateCurrentParams({sort: sort});
  }

  paginatorChanged() {
    this.updateCurrentParams({page: this.paginator.page, size: this.paginator.page_size});
  }

  /**
   *  On first page access/page refresh
   */
  initializePaginatorFromUrl(queryParams: any) {
    if (queryParams.page) {
      this.paginator.page = Number(queryParams.page);
    } else {
      this.paginator.page = 1;
    }

    if (queryParams.size) {
      this.paginator.page_size = Number(queryParams.size);
    }
  }
  filteringParamsHaveChanged(stateRouteDetails: any) {
    return JSON.stringify(stateRouteDetails) !== JSON.stringify(this.routeDetails);
  }

  /**
   * Or because of IndexedDb Refresh
   */
  shouldReGetListBecauseOfEditsOnItems(state: RootState) {
    return state.partners?.shouldReloadList;
  }

  /**
   * - When the page hasn't been visited before (or on page refresh),
   *  the url is initialized with prevQueryStringObj's default value
   * - When you apply a set of filters , then go to the details page, then come back to list,
   * you should have the same set of filters applied on the list
   */
  hadToinitializeUrlWithPrevQueryString(stateRouteDetails: any) {
    if (
      (!stateRouteDetails.queryParams || Object.keys(stateRouteDetails.queryParams).length === 0) &&
      this.prevQueryStringObj
    ) {
      this.updateCurrentParams(this.prevQueryStringObj);
      return true;
    }
    return false;
  }

  populateDropdownFilterOptionsFromCommonData(commonData: CommonDataState, allFilters: EtoolsFilter[]) {
    this.getFiltersHelper().updateFilterSelectionOptions(
      allFilters,
      PartnerFilterKeys.partner_types,
      commonData!.partnerTypes
    );
    this.getFiltersHelper().updateFilterSelectionOptions(allFilters, PartnerFilterKeys.cso_types, commonData!.csoTypes);
    this.getFiltersHelper().updateFilterSelectionOptions(
      allFilters,
      PartnerFilterKeys.risk_ratings,
      commonData!.partnerRiskRatings
    );
    this.getFiltersHelper().updateFilterSelectionOptions(
      allFilters,
      PartnerFilterKeys.sea_risk_ratings,
      commonData!.seaRiskRatings
    );
  }

  dataRequiredByFiltersHasBeenLoaded(state: RootState): boolean {
    return Boolean(state.commonData?.loadedTimestamp);
  }

  public buildCsvDownloadUrl(queryStringObj: GenericObject<any>) {
    const exportParams = {
      search: queryStringObj.search,
      partner_type: queryStringObj.partner_types,
      cso_type: queryStringObj.cso_types,
      rating: queryStringObj.risk_ratings,
      sea_risk_rating: queryStringObj.sea_risk_ratings,
      psea_assessment_date_before: queryStringObj.psea_assessment_date_before,
      psea_assessment_date_after: queryStringObj.psea_assessment_date_after,
      hidden: queryStringObj.hidden ? 'true' : 'false'
    };
    return this._buildCsvExportUrl(exportParams, this.getEndpoint(pmpEdpoints, 'partners').url);
  }

  filtersChange(e: CustomEvent) {
    this.updateCurrentParams({...e.detail, page: 1}, true);
  }

  public _triggerPartnerLoadingMsg() {
    fireEvent(this, 'trigger-partner-loading-msg');
  }

  public _computeName(name: string, shortName: string) {
    return this.getDisplayValue([shortName, name], ' / ', true);
  }

  public _computeType(csoType: any, partnerType: any) {
    if (!csoType) {
      return getTranslatedValue(partnerType, 'COMMON_DATA.PARTNERTYPES');
    } else if (csoType === 'Community Based Organization') {
      return `${getTranslatedValue('CSO')} / ${getTranslatedValue('Community Based', 'COMMON_DATA.CSOTYPES')}`;
    } else {
      return `${getTranslatedValue('CSO')} / ${getTranslatedValue(csoType, 'COMMON_DATA.CSOTYPES')}`;
    }
  }
}
