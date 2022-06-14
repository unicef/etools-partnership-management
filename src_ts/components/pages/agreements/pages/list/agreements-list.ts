import {connect} from 'pwa-helpers/connect-mixin.js';
import {store, RootState} from '../../../../../redux/store';
import {html, LitElement, property, customElement} from 'lit-element';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-icon-item';
import '@polymer/paper-item/paper-item-body';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-styles/element-styles/paper-material-styles';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-date-time/datepicker-lite.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/iron-media-query/iron-media-query.js';

import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../../../endpoints/endpoints';

import ListsCommonMixin from '../../../../common/mixins/lists-common-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {listFilterStyles} from '../../../../styles/list-filter-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';

import {RouteDetails, RouteQueryParams} from '@unicef-polymer/etools-types/dist/router.types';
import {EtoolsFilter} from '@unicef-polymer/etools-filters/src/etools-filters';
import '../../data/agreements-list-data.js';
import {partnersDropdownDataSelector} from '../../../../../redux/reducers/partners';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {AgreementsListData} from '../../data/agreements-list-data';
import {GenericObject} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {AgreementsFilterKeys, getAgreementFilters, AgreementsFiltersHelper} from './agreements-filters';
import {CommonDataState} from '../../../../../redux/reducers/common-data';
import get from 'lodash-es/get';
import {buildUrlQueryString, cloneDeep} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {debounce} from '@unicef-polymer/etools-modules-common/dist/utils/debouncer';
import pick from 'lodash-es/pick';
import omit from 'lodash-es/omit';
import {EtoolsRouter} from '../../../../utils/routes';

/**
 * @polymer
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
    return [gridLayoutStylesLit];
  }

  render() {
    return html`
      ${listFilterStyles}
      <style>
        ${sharedStyles} ${elevationStyles} ${dataTableStylesLit} .ag-ref {
          @apply --text-btn-style;
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

      <iron-media-query
        query="(max-width: 767px)"
        .queryMatches="${this.lowResolutionLayout}"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></iron-media-query>

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
          label="${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} of ${this.paginator.count ||
          0} results to show"
        >
          <etools-data-table-column class="col-2" field="agreement_number" sortable>
            ${translate('AGREEMENT_REFERENCE_NUMBER')}
          </etools-data-table-column>
          <etools-data-table-column class="col-4" field="partner_name" sortable>
            ${translate('PARTNER_FULL_NAME')}
          </etools-data-table-column>
          <etools-data-table-column class="col-2" field="partner_type">${translate('TYPE')}</etools-data-table-column>
          <etools-data-table-column class="col-2" field="partner_status"
            >${translate('STATUS')}</etools-data-table-column
          >
          <etools-data-table-column class="flex-c" field="start" sortable
            >${translate('START_DATE')}</etools-data-table-column
          >
          <etools-data-table-column class="flex-c" field="end" sortable
            >${translate('END_DATE')}</etools-data-table-column
          >
        </etools-data-table-header>

        ${this.filteredAgreements.map(
          (agreement: any) => html` <etools-data-table-row
            .lowResolutionLayout="${this.lowResolutionLayout}"
            .detailsOpened="${this.detailsOpened}"
          >
            <div slot="row-data">
              <span class="col-data col-2" data-col-header-label="${translate('AGREEMENT_REFERENCE_NUMBER')}">
                <a
                  class="ag-ref truncate"
                  href="agreements/${agreement.id}/details"
                  title="${this.getDisplayValue(agreement.agreement_number, ',', false)}"
                  @click="${this._triggerAgreementLoadingMsg}"
                >
                  ${this.getDisplayValue(agreement.agreement_number, ',', false)}
                </a>
              </span>
              <span
                class="col-data col-4"
                data-col-header-label="${translate('PARTNER_FULL_NAME')}"
                title="${this.getDisplayValue(agreement.partner_name, ',', false)}"
              >
                <span> ${this.getDisplayValue(agreement.partner_name, ',', false)} </span>
              </span>
              <span class="col-data col-2" data-col-header-label="${translate('TYPE')}">
                ${this.getDisplayValue(agreement.agreement_type, ',', false)}
              </span>
              <span class="col-data col-2 capitalize" data-col-header-label="${translate('STATUS')}">
                ${this.getDisplayValue(agreement.status, ',', false)}
              </span>
              <span class="col-data flex-c" data-col-header-label="${translate('START_DATE')}">
                ${this._checkAndShowAgreementDate(agreement.start)}
              </span>
              <span class="col-data flex-c" data-col-header-label="${translate('END_DATE')}">
                ${this._checkAndShowAgreementDate(agreement.end)}
              </span>
            </div>
            <div slot="row-data-details">
              <div class="row-details-content col-2">
                <span class="rdc-title">Signed By Partner Date</span>
                <span>${this._checkAndShowAgreementDate(agreement.signed_by_partner_date)}</span>
              </div>
              <div class="row-details-content col-2">
                <span class="rdc-title">Signed By UNICEF Date</span>
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
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    setTimeout(() => {
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: 'ag-page'
      });
    });
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
        this.localName.indexOf(stateRouteDetails.routeName.split('-')[0]) > -1 &&
        stateRouteDetails.subRouteName === 'list'
      )
    ) {
      return;
    }

    this.partnersDropdownData = partnersDropdownDataSelector(state);

    if (!this.allFilters) {
      this.initFiltersForDisplay(state.commonData!);
    }

    if (this.filteringParamsHaveChanged(stateRouteDetails)) {
      this.listLoadingActive = true;
      if (this.hadToinitializeUrlWithPrevQueryString(stateRouteDetails)) {
        return;
      }
      this.routeDetails = cloneDeep(stateRouteDetails);
      this.setSelectedValuesInFilters();
      this.initializePaginatorFromUrl(this.routeDetails?.queryParams);
      this.loadListData();
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
      this.routeDetails = cloneDeep(stateRouteDetails);
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
    return Boolean(state.commonData?.commonDataIsLoaded) && Boolean(state.partners?.listIsLoaded);
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
  }

  filtersChange(e: CustomEvent) {
    this.updateCurrentParams({...e.detail, page: 1}, true);
  }

  private updateCurrentParams(paramsToUpdate: GenericObject<any>, reset = false): void {
    let currentParams: RouteQueryParams = this.routeDetails!.queryParams || {};
    if (reset) {
      currentParams = pick(currentParams, ['sort', 'size', 'page']);
    }
    const newParams: RouteQueryParams = cloneDeep({...currentParams, ...paramsToUpdate});
    if (this.prevQueryStringObj.sort !== newParams.sort) {
      // if sorting changed, reset to first page because we can get a different number of records from Dexie
      newParams.page = '1';
    }
    this.prevQueryStringObj = newParams;

    fireEvent(this, 'csvDownloadUrl-changed', this.buildCsvDownloadUrl(newParams));

    const stringParams: string = buildUrlQueryString(newParams);
    EtoolsRouter.replaceAppLocation(`${this.routeDetails!.path}?${stringParams}`);
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
