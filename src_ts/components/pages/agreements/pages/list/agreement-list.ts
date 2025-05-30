import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {store, RootState} from '../../../../../redux/store';
import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query';

import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../../../endpoints/endpoints';

import ListsCommonMixin from '../../../../common/mixins/lists-common-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-unicef/src/mixins/pagination-mixin';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {listFilterStyles} from '../../../../styles/list-filter-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';

import {RouteDetails, RouteQueryParams} from '@unicef-polymer/etools-types/dist/router.types';
import {EtoolsFilter} from '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import '../../data/agreements-list-data.js';
import {partnersDropdownDataSelector} from '../../../../../redux/reducers/partners';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AgreementsListData} from '../../data/agreements-list-data';
import {GenericObject} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {AgreementsFilterKeys, getAgreementFilters, AgreementsFiltersHelper} from './agreement-filters.js';
import {CommonDataState} from '../../../../../redux/reducers/common-data';
import get from 'lodash-es/get';
import {buildUrlQueryString, cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import pick from 'lodash-es/pick';
import omit from 'lodash-es/omit';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {setShouldReloadAgreements} from '../../../../../redux/actions/agreements';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin CommonMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin ListsCommonMixin
 * @appliesMixin PaginationMixin
 */
@customElement('agreements-list')
export class AgreementsList extends connect(store)(
  CommonMixin(ListsCommonMixin(PaginationMixin(EndpointsLitMixin(LitElement))))
) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    return html`
      ${listFilterStyles}
      <style>
        ${sharedStyles} ${elevationStyles} ${dataTableStylesLit} .ag-ref {
          text-transform: none;
        }
        .page-content {
          margin: 0 0 24px 0;
        }
        #list {
          position: relative;
        }

        section.page-content.filters {
          padding: 8px 24px;
        }

        .filters {
          position: relative;
        }

        @media (max-width: 576px) {
          section.page-content.filters {
            margin: 5px 0;
          }
          .page-content {
            margin: 5px;
          }
        }

        .capitalize {
          text-transform: capitalize;
        }
      </style>

      <etools-media-query
        query="(max-width: 1100px)"
        .queryMatches="${this.lowResolutionLayout}"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>

      <agreements-list-data
        id="agreements"
        @filtered-agreements-changed="${(e: CustomEvent) => {
          this.filteredAgreements = e.detail;
        }}"
        @total-results-changed="${(e: CustomEvent) => {
          this.paginator = {...this.paginator, count: e.detail};
          // etools-data-table-footer is not displayed without this:
          setTimeout(() => this.requestUpdate());
        }}"
        @list-loading="${({detail}: CustomEvent) => (this.listLoadingActive = detail.active)}"
        list-data-path="filteredAgreements"
        fireDataLoaded
        no-get-request
      >
      </agreements-list-data>

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
          <etools-data-table-column class="col-2" field="agreement_number" sortable>
            ${translate('AGREEMENT_REFERENCE_NUMBER')}
          </etools-data-table-column>
          <etools-data-table-column class="col-6" field="partner_name" sortable>
            ${translate('PARTNER_FULL_NAME')}
          </etools-data-table-column>
          <etools-data-table-column class="col-1" field="partner_type">${translate('TYPE')}</etools-data-table-column>
          <etools-data-table-column class="col-1" field="partner_status"
            >${translate('STATUS')}</etools-data-table-column
          >
          <etools-data-table-column class="col-1" field="start" sortable
            >${translate('START_DATE')}</etools-data-table-column
          >
          <etools-data-table-column class="col-1" field="end" sortable
            >${translate('END_DATE')}</etools-data-table-column
          >
        </etools-data-table-header>

        ${this.filteredAgreements.map(
          (agreement: any) =>
            html` <etools-data-table-row
              .lowResolutionLayout="${this.lowResolutionLayout}"
              .detailsOpened="${this.detailsOpened}"
            >
              <div slot="row-data">
                <span class="col-data col-2" data-col-header-label="${translate('AGREEMENT_REFERENCE_NUMBER')}">
                  <a
                    class="text-btn-style ag-ref truncate"
                    href="agreements/${agreement.id}/details"
                    title="${this.getDisplayValue(agreement.agreement_number, ',', false)}"
                    @click="${this._triggerAgreementLoadingMsg}"
                  >
                    ${this.getDisplayValue(agreement.agreement_number, ',', false)}
                  </a>
                </span>
                <span
                  class="col-data col-6"
                  data-col-header-label="${translate('PARTNER_FULL_NAME')}"
                  title="${this.getDisplayValue(agreement.partner_name, ',', false)}"
                >
                  <span> ${this.getDisplayValue(agreement.partner_name, ',', false)} </span>
                </span>
                <span class="col-data col-1" data-col-header-label="${translate('TYPE')}">
                  ${translateValue(
                    this.getDisplayValue(agreement.agreement_type, ',', false) as string,
                    'AGREEMENT_TYPES'
                  )}
                </span>
                <span class="col-data col-1 capitalize" data-col-header-label="${translate('STATUS')}">
                  ${translateValue(
                    this.getDisplayValue(agreement.status, ',', false) as string,
                    'COMMON_DATA.AGREEMENTSTATUSES'
                  )}
                </span>
                <span class="col-data col-1" data-col-header-label="${translate('START_DATE')}">
                  ${this._checkAndShowAgreementDate(agreement.start)}
                </span>
                <span class="col-data col-1" data-col-header-label="${translate('END_DATE')}">
                  ${this._checkAndShowAgreementDate(agreement.end)}
                </span>
              </div>
              <div slot="row-data-details">
                <div class="row-details-content col-2">
                  <span class="rdc-title">${translate('SIGNED_BY_PARTNER_DATE')}</span>
                  <span>${this._checkAndShowAgreementDate(agreement.signed_by_partner_date)}</span>
                </div>
                <div class="row-details-content col-2">
                  <span class="rdc-title">${translate('SIGNED_BY_UNICEF_DATE')}</span>
                  <span>${this._checkAndShowAgreementDate(agreement.signed_by_unicef_date)}</span>
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

  @property({type: Array})
  filteredAgreements: [] = [];

  @property({type: Array})
  partnersDropdownData: [] = [];

  @property({type: Boolean})
  lowResolutionLayout = false;

  @property({type: Array})
  allFilters!: EtoolsFilter[];

  @property({type: Object})
  routeDetails!: RouteDetails | null;

  @property({type: Boolean})
  listLoadingActive = false;

  @property({type: Object})
  prevQueryStringObj: GenericObject = {size: 10, sort: 'partner_name.asc', status: 'draft,signed,suspended'};

  connectedCallback() {
    super.connectedCallback();

    this.loadFilteredAgreements = debounce(this.loadFilteredAgreements.bind(this), 600) as any;
  }

  stateChanged(state: RootState) {
    if (state.app?.routeDetails?.routeName !== 'agreements') {
      return;
    }

    if (!this.dataRequiredByFiltersHasBeenLoaded(state) || !state.agreements?.listIsLoaded) {
      this.listLoadingActive = true;
      return;
    }

    const stateRouteDetails = get(state, 'app.routeDetails');
    if (
      !(
        this.localName.indexOf(stateRouteDetails?.routeName.split('-')[0] as any) > -1 &&
        stateRouteDetails?.subRouteName === 'list'
      )
    ) {
      return;
    }

    this.partnersDropdownData = partnersDropdownDataSelector(state);

    if (!this.allFilters) {
      this.commonDataLoadedTimestamp = state.commonData!.loadedTimestamp;
      this.initFiltersForDisplay(state.commonData!);
    }

    if (this.commonDataLoadedTimestamp !== state.commonData!.loadedTimestamp && this.allFilters) {
      // static data reloaded (because of language change), need to update filters
      this.commonDataLoadedTimestamp = state.commonData!.loadedTimestamp;
      this.translateFilters(this.allFilters);
      this.populateDropdownFilterOptionsFromCommonData(state.commonData!, this.allFilters);
      this.allFilters = [...this.allFilters];
    }

    if (this.filteringParamsHaveChanged(stateRouteDetails) || state.agreements.shouldReloadList) {
      if (this.hadToinitializeUrlWithPrevQueryString(stateRouteDetails)) {
        return;
      }
      this.listLoadingActive = true;
      this.routeDetails = cloneDeep(stateRouteDetails);
      this.setSelectedValuesInFilters();
      this.initializePaginatorFromUrl(this.routeDetails?.queryParams);
      this.loadListData();

      if (state.agreements.shouldReloadList) {
        store.dispatch(setShouldReloadAgreements(false));
      }
    }
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

  loadListData() {
    this.loadFilteredAgreements();
  }

  async loadFilteredAgreements() {
    this.waitForAgreementsListDataToLoad().then(async () => {
      const agreements = this.shadowRoot!.querySelector('#agreements') as AgreementsListData;
      const queryParams = this.routeDetails?.queryParams || {};
      const sortOrder = queryParams?.sort ? queryParams?.sort?.split('.') : [];

      agreements.query(
        sortOrder[0],
        sortOrder[1],
        queryParams?.search?.toLowerCase() || '',
        this.getFilterUrlValuesAsArray(queryParams?.type || ''),
        this.getFilterUrlValuesAsArray(queryParams?.status || ''),
        this.getFilterValuesByProperty(
          this.partnersDropdownData,
          'label',
          this.getFilterUrlValuesAsArray(queryParams?.partners || ''),
          'value'
        ),
        queryParams?.start || '',
        queryParams?.end || '',
        this.getFilterUrlValuesAsArray(queryParams?.cpStructures || ''),
        queryParams?.special_conditions_pca,
        queryParams?.page ? Number(queryParams.page) : 1,
        queryParams?.size ? Number(queryParams.size) : 10,
        false
      );
    });
  }

  waitForAgreementsListDataToLoad() {
    return new Promise((resolve) => {
      const agreementListDataCheck = setInterval(() => {
        if (this.shadowRoot!.querySelector('#agreements')) {
          clearInterval(agreementListDataCheck);
          resolve(true);
        }
      }, 50);
    });
  }

  getFilterUrlValuesAsArray(types: string | []) {
    if (!types) {
      return [];
    }
    return typeof types === 'string' ? types.split(',') : types;
  }

  filteringParamsHaveChanged(stateRouteDetails: any) {
    return JSON.stringify(stateRouteDetails) !== JSON.stringify(this.routeDetails);
  }

  dataRequiredByFiltersHasBeenLoaded(state: RootState): boolean {
    return Boolean(state.commonData?.loadedTimestamp) && Boolean(state.partners?.listIsLoaded);
  }

  initFiltersForDisplay(commonData: CommonDataState) {
    const availableFilters = JSON.parse(JSON.stringify(getAgreementFilters()));
    this.populateDropdownFilterOptionsFromCommonData(commonData, availableFilters);
    this.allFilters = availableFilters;
  }

  populateDropdownFilterOptionsFromCommonData(commonData: CommonDataState, allFilters: EtoolsFilter[]) {
    AgreementsFiltersHelper.updateFilterSelectionOptions(
      allFilters,
      AgreementsFilterKeys.cpStructures,
      commonData!.countryProgrammes
    );
    AgreementsFiltersHelper.updateFilterSelectionOptions(
      allFilters,
      AgreementsFilterKeys.partners,
      this.partnersDropdownData
    );
    AgreementsFiltersHelper.updateFilterSelectionOptions(
      allFilters,
      AgreementsFilterKeys.type,
      commonData!.agreementTypes
    );
    AgreementsFiltersHelper.updateFilterSelectionOptions(
      allFilters,
      AgreementsFilterKeys.status,
      commonData!.agreementStatuses
    );
    AgreementsFiltersHelper.updateFilterSelectionOptions(allFilters, AgreementsFilterKeys.special_conditions_pca, [
      {value: 'true', label: getTranslation('GENERAL.YES')},
      {value: 'false', label: getTranslation('GENERAL.NO')}
    ]);
  }

  filtersChange(e: CustomEvent) {
    this.updateCurrentParams({...e.detail, page: 1}, true);
  }

  private updateCurrentParams(paramsToUpdate: GenericObject<any>, reset = false): void {
    let currentParams = this.routeDetails ? this.routeDetails.queryParams : this.prevQueryStringObj;
    if (reset) {
      currentParams = pick(currentParams, ['sort', 'size', 'page']);
    }

    const newParams = cloneDeep({...currentParams, ...paramsToUpdate});

    if (this.prevQueryStringObj.sort !== newParams.sort) {
      // if sorting changed, reset to first page because we can get a different number of records from Dexie
      newParams.page = '1';
    }

    this.prevQueryStringObj = newParams;

    fireEvent(this, 'csvDownloadUrl-changed', this.buildCsvDownloadUrl(this.prevQueryStringObj));

    const stringParams: string = buildUrlQueryString(this.prevQueryStringObj);
    EtoolsRouter.replaceAppLocation(`agreements/list?${stringParams}`);
  }

  private setSelectedValuesInFilters() {
    if (this.allFilters) {
      // update filter selection and assign the result to etools-filters(trigger render)
      const currentParams: RouteQueryParams = this.routeDetails!.queryParams || {};
      this.allFilters = AgreementsFiltersHelper.updateFiltersSelectedValues(
        omit(currentParams, ['page', 'size', 'sort']),
        this.allFilters
      );
    }
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

  _sortOrderChanged(e: CustomEvent) {
    const sort = e.detail.field + '.' + e.detail.direction;
    this.updateCurrentParams({sort: sort});
  }

  paginatorChanged() {
    this.updateCurrentParams({page: this.paginator.page, size: this.paginator.page_size});
  }

  buildCsvDownloadUrl(queryStringObj: GenericObject<any>) {
    const partnerNames = this.getFilterValuesByProperty(
      this.partnersDropdownData,
      'label',
      this.getFilterUrlValuesAsArray(queryStringObj.partners),
      'value'
    );
    const exportParams = {
      search: queryStringObj.search,
      agreement_type: queryStringObj.type,
      status: queryStringObj.status,
      partner_name: partnerNames,
      start: queryStringObj.start,
      end: queryStringObj.end,
      cpStructures: queryStringObj.cpStructures,
      special_conditions_pca: queryStringObj.special_conditions_pca ? queryStringObj.special_conditions_pca : ''
    };
    return this._buildCsvExportUrl(exportParams, this.getEndpoint(pmpEdpoints, 'agreements').url);
  }

  // verify date and prettify or not
  _checkAndShowAgreementDate(dateString: string) {
    return this.getDateDisplayValue(dateString);
  }

  _triggerAgreementLoadingMsg() {
    fireEvent(this, 'trigger-agreement-loading-msg');
  }
}
