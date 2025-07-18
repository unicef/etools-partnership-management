import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import {EtoolsFilter} from '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import '../../components/report-status';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-unicef/src/mixins/pagination-mixin';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import ListsCommonMixin from '../../../../common/mixins/lists-common-mixin-lit';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {listFilterStyles} from '../../../../styles/list-filter-styles-lit';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {store, RootState} from '../../../../../redux/store';
import {CommonDataState} from '../../../../../redux/reducers/common-data';
import {partnersDropdownDataSelector} from '../../../../../redux/reducers/partners';
import {ReportsFilterKeys, getReportFilters, ReportsFiltersHelper} from './report-filters';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {abortRequestByKey} from '@unicef-polymer/etools-utils/dist/etools-ajax/request';
import {AnyObject, EtoolsUser, GenericObject} from '@unicef-polymer/etools-types';
import {RouteDetails, RouteQueryParams} from '@unicef-polymer/etools-types/dist/router.types';
import CONSTANTS from '../../../../../config/app-constants';
import get from 'lodash-es/get';
import {buildUrlQueryString, cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import pick from 'lodash-es/pick';
import omit from 'lodash-es/omit';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {langChanged, translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import pmpEdpoints from '../../../../endpoints/endpoints';
import {formatDateLocalized} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import dayjs from 'dayjs';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin CommonMixin
 * @appliesMixin PaginationMixin
 */
@customElement('reports-list')
class ReportsList extends connect(store)(
  ListsCommonMixin(PaginationMixin(CommonMixin(EndpointsLitMixin(LitElement))))
) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      ${listFilterStyles}
      <style>
        ${sharedStyles} ${elevationStyles} ${dataTableStylesLit} :host {
          box-sizing: border-box;
          background-color: #eeeeee;
          --paper-tooltip: {
            text-align: center;
            line-height: 1.4;
            font-size: var(--etools-font-size-12, 12px);
          };
        }

        .pd-ref,
        .view-report {
          color: var(--primary-color);
          font-weight: 500;
          text-decoration: none;
          outline: inherit;
          text-transform: uppercase;
        }

        .pd-ref {
          text-transform: none;
        }

        .final-badge {
          display: inline-block;
          border-radius: 1px;
          padding: 1px 6px;
          font-size: var(--etools-font-size-10, 10px);
          text-transform: uppercase;
          background-color: var(--sl-color-gray-200);
          margin-inline-start: 5px;
          font-weight: bold;
        }

        .tooltip-trigger {
          position: relative;
        }
        .page-content {
          margin: 0 0 24px 0;
        }

        section.page-content.filters {
          padding: 8px 24px;
        }

        .filters {
          position: relative;
        }

        @media (max-width: 576px) {
          section.page-content.filters {
            padding: 5px;
          }
          .page-content {
            margin: 5px;
          }
        }
        #list {
          position: relative;
        }
        etools-filters::part(filter-dropdown) {
          width: 240px !important;
        }
      </style>

      <etools-media-query
        query="(max-width: 1167px)"
        .queryMatches="${this.lowResolutionLayout}"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>

      <section class="elevation page-content filters" elevation="1">
        <etools-filters
          .filters="${this.allFilters}"
          @filter-change="${this.filtersChange}"
          .textFilters="${translate('GENERAL.FILTERS')}"
          .textClearAll="${translate('GENERAL.CLEAR_ALL')}"
        ></etools-filters>
      </section>

      <div id="list" class="paper-material elevation" elevation="1">
        <etools-loading ?active="${this.listLoadingActive}"></etools-loading>
        ${!(this.reports || []).length
          ? html` <div class="row-h">
              <p>${translate('NO_REPORTS_YET')}</p>
            </div>`
          : html`
              <etools-data-table-header
                id="listHeader"
                .lowResolutionLayout="${this.lowResolutionLayout}"
                label="${translate('RESULTS_TO_SHOW', {
                  from: this.paginator.visible_range[0],
                  to: this.paginator.visible_range[1],
                  count: this.paginator.count || 0
                })}"
              >
                <etools-data-table-column class="col-2">${translate('REPORT_NUM')}</etools-data-table-column>
                <etools-data-table-column class="col-2">${translate('PARTNER')}</etools-data-table-column>
                <etools-data-table-column class="col-1">${translate('REPORT_STATUS')}</etools-data-table-column>
                <etools-data-table-column class="col-1">${translate('DOCUMENT_TYPE')}</etools-data-table-column>
                <etools-data-table-column class="col-1">${translate('DUE_DATE')}</etools-data-table-column>
                <etools-data-table-column class="col-2">${translate('REPORTING_PERIOD')}</etools-data-table-column>
                ${!this.noPdSsfaRef
                  ? html`<etools-data-table-column class="col-3"
                      >${translate('PD_SPD_REF_NUM')}</etools-data-table-column
                    >`
                  : ''}
              </etools-data-table-header>

              ${this.reports.map(
                (report: any) =>
                  html` <etools-data-table-row .lowResolutionLayout="${this.lowResolutionLayout}">
                    <div slot="row-data">
                      <span class="col-data col-2" data-col-header-label="${translate('REPORT_NUM')}">
                        <sl-tooltip content="${report.programme_document.title}" placement="right">
                          <span id="tooltip-trigger-${report.id}" class="tooltip-trigger">
                            <a
                              class="view-report"
                              href="reports/${report.id}/progress"
                              ?hidden="${!this._canViewReport(report.status)}"
                            >
                              ${this._getReportTitle(report)}
                            </a>
                            <span ?hidden="${this._canViewReport(report.status)}">${this._getReportTitle(report)}</span>
                            ${report.is_final ? html`<span class="final-badge">${translate('FINAL')}</span>` : ``}
                          </span>
                        </sl-tooltip>
                      </span>
                      <span class="col-data col-2" data-col-header-label="${translate('PARTNER')}">
                        <sl-tooltip content="${report.partner_vendor_number}" placement="right">
                          <span id="tooltip-partner-${report.id}" class="tooltip-trigger">
                            ${this._displayOrDefault(report.partner_name)}
                          </span>
                        </sl-tooltip>
                      </span>
                      <span class="col-data col-1" data-col-header-label="${translate('REPORT_STATUS')}">
                        <report-status .status="${report.status}" .final="${report.is_final}"></report-status>
                      </span>
                      <span class="col-data col-1" data-col-header-label="${translate('DOCUMENT_TYPE')}">
                        ${this._getDocTitle(report.is_gpd)}
                      </span>
                      <span class="col-data col-1" data-col-header-label="${translate('DUE_DATE')}">
                        ${this._displayOrDefault(formatDateLocalized(report.due_date))}
                      </span>
                      <span class="col-data col-2" data-col-header-label="${translate('REPORTING_PERIOD')}">
                        ${this.displayLocalizedReportingPeriod(report.reporting_period)}
                      </span>

                      ${!this.noPdSsfaRef
                        ? html` <span class="col-data col-3" data-col-header-label="${translate('PD_SPD_REF_NUM')}">
                            <a
                              class="pd-ref truncate"
                              href="${this.getRefLink(report)}"
                              title="${this.getDisplayValue(report.programme_document.reference_number, ',', false)}"
                            >
                              ${this.getDisplayValue(report.programme_document.reference_number, ',', false)}
                            </a>
                          </span>`
                        : ``}
                    </div>

                    <div slot="row-data-details">
                      <div class="row-details-content">
                        <span class="rdc-title flex-c">${translate('NEW_INTERVENTION.UNICEF_FOCAL_POINTS')}</span>
                        <span>${this.getDisplayValue(report.unicef_focal_points, ', ', false)}</span>
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
            `}
      </div>
    `;
  }

  @property({type: Array})
  reports: [] = [];

  @property({type: Array})
  partners: [] = [];

  @property({type: Boolean})
  noPdSsfaRef = false;

  @property({type: String})
  _endpointName = 'reports';

  @property({type: Boolean})
  lowResolutionLayout = false;

  @property({type: Array})
  allFilters!: EtoolsFilter[];

  @property({type: Object})
  user!: EtoolsUser;

  @property({type: Object})
  routeDetails!: RouteDetails | null;

  @property({type: Boolean})
  listLoadingActive = false;

  @property({type: Object})
  prevQueryStringObj: GenericObject = {size: 10, sort: 'partner_name.asc', status: 'Sen,Sub,Ove'};

  connectedCallback() {
    super.connectedCallback();

    this._loadReportsData = debounce(this._loadReportsData.bind(this), 400) as any;
  }

  stateChanged(state: RootState) {
    if (state.app?.routeDetails?.routeName !== 'reports') {
      return;
    }
    if (!isJsonStrMatch(this.user, state.user?.data)) {
      this.user = cloneDeep(state.user?.data);
    }
    if (!this.dataRequiredByFiltersHasBeenLoaded(state)) {
      this.listLoadingActive = true;
      return;
    }

    const stateRouteDetails = get(state, 'app.routeDetails');
    if (
      !(
        stateRouteDetails &&
        this.localName.indexOf(stateRouteDetails.routeName.split('-')[0]) > -1 &&
        stateRouteDetails.subRouteName === 'list'
      )
    ) {
      return;
    }

    this.partners = partnersDropdownDataSelector(state);

    if (!this.allFilters && this.user) {
      this.commonDataLoadedTimestamp = state.commonData!.loadedTimestamp;
      this.initFiltersForDisplay(state.commonData!, this.user);
    }

    if (this.commonDataLoadedTimestamp !== state.commonData!.loadedTimestamp && this.allFilters) {
      // static data reloaded (because of language change), need to update filters
      this.commonDataLoadedTimestamp = state.commonData!.loadedTimestamp;
      this.translateFilters(this.allFilters);
      this.populateDropdownFilterOptionsFromCommonData(state.commonData!, this.allFilters);
      this.allFilters = [...this.allFilters];
    }

    this.endStateChanged(state);

    if (this.filteringParamsHaveChanged(stateRouteDetails)) {
      if (this.hadToinitializeUrlWithPrevQueryString(stateRouteDetails)) {
        return;
      }
      this.listLoadingActive = true;
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
      this.updateCurrentParams(this.prevQueryStringObj);
      return true;
    }
    return false;
  }

  dataRequiredByFiltersHasBeenLoaded(state: RootState): boolean {
    return Boolean(state.commonData?.loadedTimestamp && state.user?.data && state.partners?.listIsLoaded);
  }

  initFiltersForDisplay(commonData: CommonDataState, user: EtoolsUser) {
    const filters = user?.show_gpd
      ? getReportFilters()
      : getReportFilters().filter((x) => x.filterKey !== ReportsFilterKeys.is_gpd);

    const availableFilters = JSON.parse(JSON.stringify(filters));
    this.populateDropdownFilterOptionsFromCommonData(commonData, availableFilters);
    this.allFilters = availableFilters;
  }

  populateDropdownFilterOptionsFromCommonData(commonData: CommonDataState, allFilters: EtoolsFilter[]) {
    ReportsFiltersHelper.updateFilterSelectionOptions(allFilters, ReportsFilterKeys.external_partner_id, this.partners);
    ReportsFiltersHelper.updateFilterSelectionOptions(allFilters, ReportsFilterKeys.cp_output, commonData!.cpOutputs);
    ReportsFiltersHelper.updateFilterSelectionOptions(allFilters, ReportsFilterKeys.section, commonData!.sections);
    ReportsFiltersHelper.updateFilterSelectionOptions(allFilters, ReportsFilterKeys.is_gpd, [
      {id: 'false', name: getTranslation('PD_SPD')},
      {id: 'true', name: getTranslation('GPD')}
    ]);
    ReportsFiltersHelper.updateFilterSelectionOptions(
      allFilters,
      ReportsFilterKeys.report_type,
      commonData!.reportTypes
    );
    ReportsFiltersHelper.updateFilterSelectionOptions(allFilters, ReportsFilterKeys.status, commonData!.reportStatuses);
    ReportsFiltersHelper.updateFilterSelectionOptions(
      allFilters,
      ReportsFilterKeys.unicef_focal_points,
      commonData!.unicefUsersData
    );
  }

  filtersChange(e: CustomEvent) {
    this.updateCurrentParams({...e.detail, page: 1}, true);
  }

  filteringParamsHaveChanged(stateRouteDetails: any) {
    return JSON.stringify(stateRouteDetails) !== JSON.stringify(this.routeDetails);
  }

  private updateCurrentParams(paramsToUpdate: GenericObject<any>, reset = false): void {
    let currentParams = this.routeDetails ? this.routeDetails.queryParams : this.prevQueryStringObj;
    if (reset) {
      currentParams = pick(currentParams, ['sort', 'size', 'page']);
    }
    const newParams: RouteQueryParams = cloneDeep({...currentParams, ...paramsToUpdate});
    this.prevQueryStringObj = newParams;

    const stringParams: string = buildUrlQueryString(newParams);
    EtoolsRouter.replaceAppLocation(`reports/list?${stringParams}`);
  }

  private setSelectedValuesInFilters() {
    if (this.allFilters) {
      // update filter selection and assign the result to etools-filters(trigger render)
      const currentParams: RouteQueryParams = this.routeDetails!.queryParams || {};
      this.allFilters = ReportsFiltersHelper.updateFiltersSelectedValues(
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

  loadListData() {
    this.waitForPrpCountriesToLoad().then(() => this._loadReportsData());
  }

  getRefLink(report: any) {
    const path = report.is_gpd ? 'gpd-interventions' : 'interventions';
    return `${path}/${report.programme_document?.external_id}/reports`;
  }

  public waitForPrpCountriesToLoad() {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (this.prpCountries && this.prpCountries.length) {
          clearInterval(check);
          resolve(true);
        }
        setTimeout(() => {
          clearInterval(check);
          this.listLoadingActive = false;
        }, 30000);
      }, 50);
    });
  }

  _loadReportsData() {
    // abort previous req and then fire a new one with updated params
    abortRequestByKey(this._endpointName);

    this.fireRequest(pmpEdpoints, 'reports', {}, {params: this.getFilterValues()}, this._endpointName)
      .then((response: any) => {
        if (response) {
          this.reports = response.results;
          this.updatePaginatorTotalResults(response);
        }
        this.listLoadingActive = false;
      })
      .catch((error: any) => {
        if (error.status === 0) {
          // req aborted
          return;
        }
        EtoolsLogger.error('Reports list data request failed!', 'reports-list', error);

        parseRequestErrorsAndShowAsToastMsgs(error, this);
        this.listLoadingActive = false;
      });
  }

  getFilterValues() {
    const queryParams = this.routeDetails?.queryParams || {};
    const filterValues: AnyObject = {
      pd_ref_title: queryParams.pd_ref_title,
      external_partner_id: queryParams.external_partner_id,
      cp_output: queryParams.cp_output,
      section: queryParams.section,
      status: queryParams.status,
      year: queryParams.year,
      is_gpd: queryParams.is_gpd,
      unicef_focal_points: queryParams.unicef_focal_points,
      report_type: queryParams.report_type,
      page: queryParams.page ? Number(queryParams.page) : 1,
      page_size: queryParams.size ? Number(queryParams.size) : CONSTANTS.DEFAULT_LIST_SIZE
    };
    Object.keys(filterValues).forEach((key) => {
      if (!filterValues[key]) {
        delete filterValues[key];
      }
    });
    return filterValues;
  }

  _canViewReport(status: string) {
    return ['Acc', 'Sen', 'Sub'].indexOf(status) > -1;
  }

  _displayOrDefault(val: any) {
    if (!val) {
      return '-';
    }
    return val;
  }

  _getReportTitle(report: any) {
    return (report.is_gpd ? 'PR' : report.report_type) + report.report_number;
  }

  _getDocTitle(isGpd: boolean) {
    return getTranslation(isGpd ? 'GPD' : 'PD_SPD');
  }

  // TODO: this is the same function from lists common mixin, but we do not need that entire functionality here
  // refactor in near future
  _listDataChanged() {
    const rows = this.shadowRoot!.querySelectorAll('etools-data-table-row') as any; // TODO: etools-data-table typings
    if (rows && rows.length) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].detailsOpened) {
          rows[i]['detailsOpened'] = false;
        }
      }
    }
  }

  displayLocalizedReportingPeriod(repPer: string) {
    return langChanged(() => {
      if (!repPer || !repPer.includes(' - ')) {
        return repPer;
      }
      let date1 = '';
      let date2 = '';
      [date1, date2] = repPer.split(' - ');

      return dayjs(date1).format('DD MMM YYYY') + ' - ' + dayjs(date2).format('DD MMM YYYY');
    });
  }
}

export {ReportsList as ReportsListEl};
