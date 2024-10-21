import {html, LitElement, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import ListsCommonMixin from '../../../../common/mixins/lists-common-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../../../redux/store';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {listFilterStyles} from '../../../../styles/list-filter-styles-lit';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {EtoolsFilter} from '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import {AnyObject, GenericObject, GDDListItem} from '@unicef-polymer/etools-types';
import pick from 'lodash-es/pick';
import cloneDeep from 'lodash-es/cloneDeep';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {buildUrlQueryString} from '@unicef-polymer/etools-utils/dist/general.util';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import {translate} from 'lit-translate';
import CommonMixinLit from '../../../../common/mixins/common-mixin-lit';
import CONSTANTS from '../../../../../config/app-constants';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip.js';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import debounce from 'lodash-es/debounce';
import get from 'lodash-es/get';
import omit from 'lodash-es/omit';
import {
  getGDDInterventionFilters,
  GDDInterventionFilterKeys,
  GDDInterventionsFiltersHelper
} from './gdd-interventions-filters';
import {partnersDropdownDataSelector} from '../../../../../redux/reducers/partners';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {ListFilterOption} from '../../../../../typings/filter.types';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
// TODO change this import after intervention tab pages location is changed
import {setShouldReGetList} from '../../pages/intervention-tab-pages/common/actions/gddInterventions';
import pmpEdpoints from '../../../../endpoints/endpoints';
import {
  EtoolsRouteDetails,
  EtoolsRouteQueryParams
} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';

@customElement('gdd-interventions-list')
export class GddInterventionsList extends connect(store)(
  ListsCommonMixin(CommonMixinLit(PaginationMixin(EndpointsLitMixin(FrNumbersConsistencyMixin(LitElement)))))
) {
  static get styles() {
    return [layoutStyles, frWarningsStyles];
  }

  render() {
    return html`
      ${listFilterStyles}
      <style>
        ${sharedStyles} ${elevationStyles} ${dataTableStylesLit} :host {
          box-sizing: border-box;
          width: 100%;
          background-color: #eeeeee;
        }

        .pd-ref {
          text-transform: none;
        }

        .col_type {
          justify-content: center;
        }
        .page-content {
          margin: 0 0 24px 0;
        }
        .capitalize {
          text-transform: capitalize;
        }
        #list {
          position: relative;
        }
        .break-word {
          word-break: break-all;
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
      </style>

      <etools-media-query
        query="(max-width: 767px)"
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

      <div id="list" elevation="1" class="paper-material elevation">
        <etools-loading source="list" ?active="${this.listLoadingActive}"></etools-loading>
        <etools-data-table-header
          .lowResolutionLayout="${this.lowResolutionLayout}"
          id="listHeader"
          label="${translate('RESULTS_TO_SHOW', {
            from: this.paginator.visible_range[0],
            to: this.paginator.visible_range[1],
            count: this.paginator.count || 0
          })}"
        >
          <etools-data-table-column class="col-2" field="number" sortable>
            ${translate('INTERVENTIONS_LIST.REFERENCE_NO')}
          </etools-data-table-column>
          <etools-data-table-column class="col-4" field="partner_name" sortable>
            ${translate('GDD_LIST.GOVERNMENT_ORG_NAME')}
          </etools-data-table-column>
          <etools-data-table-column class="col-2" field="status">
            ${translate('GENERAL.STATUS')}
          </etools-data-table-column>
          <etools-data-table-column class="col-2" field="title">
            ${translate('INTERVENTIONS_LIST.TITLE')}
          </etools-data-table-column>
          <etools-data-table-column class="col-1" field="start" sortable>
            ${translate('INTERVENTIONS_LIST.START_DATE')}
          </etools-data-table-column>
          <etools-data-table-column class="col-1" field="end" sortable>
            ${translate('INTERVENTIONS_LIST.END_DATE')}
          </etools-data-table-column>
        </etools-data-table-header>

        ${(this.filteredInterventions || []).map(
          (intervention: GDDListItem) => html` <etools-data-table-row
            .lowResolutionLayout="${this.lowResolutionLayout}"
            .detailsOpened="${this.detailsOpened}"
          >
            <div slot="row-data" class="p-relative">
              <span class="col-data col-2" data-col-header-label="${translate('INTERVENTIONS_LIST.REFERENCE_NO')}">
                <a
                  class="text-btn-style pd-ref truncate"
                  href="gdd-interventions/${intervention.id}/metadata"
                  title="${this.getDisplayValue(intervention.number)}"
                >
                  ${this.getDisplayValue(intervention.number)}
                </a>
              </span>
              <span
                class="col-data col-4"
                data-col-header-label="${translate('GDD_LIST.GOVERNMENT_ORG_NAME')}"
                title="${this.getDisplayValue(intervention.partner_name)}"
              >
                <span>${this.getDisplayValue(intervention.partner_name)}</span>
              </span>
              <div class="col-data col-2 capitalize" data-col-header-label="${translate('GENERAL.STATUS')}">
                <div>${this.getStatusCellText(intervention)}</div>
              </div>
              <span
                class="col-data col-2 break-word"
                data-col-header-label="${translate('INTERVENTIONS_LIST.TITLE')}"
                title="${this.getDisplayValue(intervention.title)}"
              >
                ${this.getDisplayValue(intervention.title)}
              </span>
              <span class="col-data col-1" data-col-header-label="${translate('INTERVENTIONS_LIST.START_DATE')}">
                <etools-info-tooltip
                  class="fr-nr-warn"
                  custom-icon
                  icon-first
                  ?hide-tooltip="${this._hideDateFrsWarningTooltip(
                    intervention.start,
                    intervention.frs_earliest_start_date!,
                    intervention.status
                  )}"
                >
                  <span slot="field">${this.getDateDisplayValue(intervention.start)}</span>
                  <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
                  <span slot="message">${this.getFrsStartDateValidationMsg()}</span>
                </etools-info-tooltip>
              </span>
              <span class="col-data col-1" data-col-header-label="${translate('INTERVENTIONS_LIST.END_DATE')}">
                <etools-info-tooltip
                  class="fr-nr-warn"
                  custom-icon
                  icon-first
                  ?hide-tooltip="${this._hideDateFrsWarningTooltip(
                    intervention.end,
                    intervention.frs_latest_end_date!,
                    intervention.status
                  )}"
                >
                  <span slot="field">${this.getDateDisplayValue(intervention.end)}</span>
                  <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
                  <span slot="message">${this.getFrsEndDateValidationMsg()}</span>
                </etools-info-tooltip>
              </span>
            </div>

            <div slot="row-data-details" class="p-relative">
              <div class="row-details-content col-2">
                <span class="rdc-title">${translate('OFFICES')}</span>
                <span>${this.getDisplayValue(intervention.offices_names)}</span>
              </div>
              <div class="row-details-content col-2">
                <span class="rdc-title">${translate('SECTION')}</span>
                <span
                  >${this.getDisplayValue(
                    intervention.section_names?.map((x) => getTranslatedValue(x, 'COMMON_DATA.SECTIONS'))
                  )}</span
                >
              </div>
              <div class="row-details-content col-2">
                <span class="rdc-title">${translate('UNICEF_CASH_CONTRIBUTION')}</span>
                <etools-info-tooltip
                  class="fr-nr-warn
                            ${this.getCurrencyMismatchClass(
                    intervention.all_currencies_are_consistent
                  )} interventions-list"
                  icon-first
                  custom-icon
                  ?hide-tooltip="${this.hideIntListUnicefCashAmountTooltip(
                    intervention.all_currencies_are_consistent,
                    intervention.unicef_cash,
                    intervention.frs_total_frs_amt,
                    intervention as any
                  )}"
                >
                  <span slot="field">
                    <span class="amount-currency">${intervention.budget_currency}</span>
                    <span>${displayCurrencyAmount(intervention.unicef_cash, '0.00')}</span>
                  </span>
                  <etools-icon
                    name="${this.getFrsCurrencyTooltipIcon(intervention.fr_currencies_are_consistent)}"
                    slot="custom-icon"
                  ></etools-icon>
                  <span slot="message">
                    <span
                      >${this.getIntListUnicefCashAmountTooltipMsg(
                        intervention.all_currencies_are_consistent,
                        intervention.fr_currencies_are_consistent
                      )}</span
                    >
                  </span>
                </etools-info-tooltip>
              </div>
              <div class="row-details-content col-2">
                <span class="rdc-title">${translate('TOTAL_BUDGET')}</span>
                <span>
                  <span class="amount-currency">${intervention.budget_currency}</span>
                  <span>${displayCurrencyAmount(intervention.total_budget, '0.00')}</span>
                </span>
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

  @property({type: Boolean})
  lowResolutionLayout = false;

  @property({type: Array})
  allFilters!: EtoolsFilter[];

  @property({type: Object})
  prevQueryStringObj: GenericObject = {
    page_size: 10,
    page: 1,
    ordering: '-start'
  };

  @property({type: Object})
  routeDetails!: EtoolsRouteDetails | null;

  @property({type: Array})
  filteredInterventions: GDDListItem[] = [];

  @property({type: Array})
  partners = [];

  @property({type: Boolean})
  listLoadingActive = false;

  connectedCallback(): void {
    this.loadFilteredInterventions = debounce(this.loadFilteredInterventions.bind(this), 600);

    super.connectedCallback();

    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'gdd-interv-page'
    });
  }

  stateChanged(state: RootState): void {
    const stateRouteDetails = get(state, 'app.routeDetails');

    if (
      !(
        stateRouteDetails &&
        stateRouteDetails.routeName === 'gdd-interventions' &&
        stateRouteDetails?.subRouteName === 'list'
      )
    ) {
      return;
    }

    if (!this.dataRequiredByFiltersHasBeenLoaded(state)) {
      this.listLoadingActive = true;
      return;
    }

    if (this.filteringParamsHaveChanged(stateRouteDetails) || this.shouldReGetListBecauseOfEditsOnItems(state)) {
      if (this.hadToinitializeUrlWithPrevQueryString(stateRouteDetails)) {
        return;
      }

      // this.listLoadingActive = true;
      this.routeDetails = cloneDeep(stateRouteDetails);
      this.commonDataLoadedTimestamp = state.commonData!.loadedTimestamp;
      this.initFiltersForDisplay(state);
      this.initializePaginatorFromUrl(this.routeDetails?.queryParams);
      this.loadFilteredInterventions();
    }

    if (this.commonDataLoadedTimestamp !== state.commonData!.loadedTimestamp && this.allFilters) {
      // static data reloaded (because of language change), need to update filters
      this.commonDataLoadedTimestamp = state.commonData!.loadedTimestamp;
      this.translateFilters(this.allFilters);
      this.populateDropdownFilterOptionsFromCommonData(state, this.allFilters);
      this.allFilters = [...this.allFilters];
    }
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('listLoadingActive')) {
      fireEvent(this, 'list-loading-active', {value: this.listLoadingActive});
    }
  }

  filteringParamsHaveChanged(stateRouteDetails: any) {
    return JSON.stringify(stateRouteDetails) !== JSON.stringify(this.routeDetails);
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

    if (queryParams.page_size) {
      this.paginator.page_size = Number(queryParams.page_size);
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

  shouldReGetListBecauseOfEditsOnItems(state: RootState) {
    return state.gddInterventions?.shouldReGetList;
  }

  dataRequiredByFiltersHasBeenLoaded(state: RootState) {
    return Boolean(state.commonData?.loadedTimestamp) && state.partners?.listIsLoaded;
  }

  protected initFiltersForDisplay(state: RootState): void {
    let availableFilters = [];

    if (!this.allFilters) {
      availableFilters = JSON.parse(JSON.stringify(getGDDInterventionFilters()));
      this.populateDropdownFilterOptionsFromCommonData(state, availableFilters);
    } else {
      // Avoid setting this.allFilters twice, as the already selected filters will be reset
      availableFilters = this.allFilters;
    }

    // update filter selection and assign the result to etools-filters(trigger render)
    const currentParams: EtoolsRouteQueryParams = this.routeDetails!.queryParams || {};
    this.allFilters = GDDInterventionsFiltersHelper.updateFiltersSelectedValues(
      omit(currentParams, ['page', 'page_size', 'ordering']),
      availableFilters
    );
  }

  populateDropdownFilterOptionsFromCommonData(state: RootState, allFilters: EtoolsFilter[]) {
    [
      [GDDInterventionFilterKeys.status, state.commonData!.interventionStatuses],
      [GDDInterventionFilterKeys.section, state.commonData!.sections],
      [GDDInterventionFilterKeys.offices, state.commonData!.offices],
      [GDDInterventionFilterKeys.cp_outputs, state.commonData!.cpOutputs],
      [GDDInterventionFilterKeys.donors, state.commonData!.donors],
      [GDDInterventionFilterKeys.partners, partnersDropdownDataSelector(state)],
      [GDDInterventionFilterKeys.grants, state.commonData!.grants],
      [GDDInterventionFilterKeys.unicef_focal_points, state.commonData!.unicefUsersData],
      [GDDInterventionFilterKeys.budget_owner, state.commonData!.unicefUsersData],
      [GDDInterventionFilterKeys.cpStructures, state.commonData!.countryProgrammes],
      [
        GDDInterventionFilterKeys.editable_by,
        [
          {label: 'UNICEF', value: 'unicef'},
          {label: this._getTranslation('PARTNER'), value: 'partner'}
        ]
      ]
    ].forEach(([key, data]) => GDDInterventionsFiltersHelper.updateFilterSelectionOptions(allFilters, key, data));
    this.partners = partnersDropdownDataSelector(state);
  }

  protected getSelectedPartnerTypes(_selectedPartnerTypes: string): string[] {
    console.log('getSelectedPartnerTypes / To be implemented in derived class');
    return [];
  }

  loadFilteredInterventions() {
    this.listLoadingActive = true;

    sendRequest({
      endpoint: {
        url: pmpEdpoints.gddInterventions.url + this.getFilteringQueryParams()
      },
      method: 'GET'
    })
      .then((response) => {
        this.filteredInterventions = response.results;
        this.paginator = {...this.paginator, count: response.count};
        getStore().dispatch(setShouldReGetList(false));
      })
      .finally(() => {
        this.listLoadingActive = false;
      });
  }

  getFilteringQueryParams() {
    const queryParams = this.routeDetails?.queryParams!;

    let qs = this.getListQueryString(queryParams as any, false);
    if (qs) {
      qs = pmpEdpoints.gddInterventions.url.includes('?') ? '&' + qs : '?' + qs;
    }
    if (queryParams.ordering) {
      qs =
        qs +
        (qs.includes('?') || pmpEdpoints.gddInterventions.url.includes('?') ? '&' : '?') +
        'ordering=' +
        queryParams.ordering;
    }
    if (!qs.includes('page=')) {
      qs += '&page=1';
    }

    return qs;
  }

  public getListQueryString(queryStringObj: GenericObject<any>, forExport: boolean) {
    const exportParams: AnyObject = {
      status: queryStringObj.status,
      sections: queryStringObj.section,
      office: queryStringObj.offices,
      donors: queryStringObj.donors,
      partners: queryStringObj.partners,
      grants: queryStringObj.grants,
      unicef_focal_points: queryStringObj.unicef_focal_points,
      budget_owner__in: queryStringObj.budget_owner__in,
      country_programme: queryStringObj.country_programme,
      cp_outputs: queryStringObj.cp_outputs,
      start: queryStringObj.start,
      end: queryStringObj.end,
      end_after: queryStringObj.endAfter,
      editable_by: queryStringObj.editable_by,
      search: queryStringObj.search
    };
    if (!forExport) {
      exportParams.page = queryStringObj.page;
      exportParams.page_size = queryStringObj.page_size;
    }
    return this._buildListRetrivalQueryString(exportParams, forExport);
  }

  getFilterUrlValuesAsArray(types: string | number) {
    return types ? types.toString().split(',') : [];
  }

  filtersChange(e: CustomEvent) {
    this.updateCurrentParams({...e.detail, page: 1}, true);
  }

  // Override from lists-common-mixin
  _sortOrderChanged(e: CustomEvent) {
    const ordering = (e.detail.direction === 'asc' ? '' : '-') + e.detail.field;
    this.updateCurrentParams({ordering: ordering});
  }

  paginatorChanged() {
    this.updateCurrentParams({page: this.paginator.page, page_size: this.paginator.page_size});
  }

  private updateCurrentParams(paramsToUpdate: GenericObject<any>, reset = false): void {
    let currentParams = this.routeDetails ? this.routeDetails.queryParams : this.prevQueryStringObj;
    if (reset) {
      currentParams = pick(currentParams, ['ordering', 'page_size', 'page']);
    }
    this.prevQueryStringObj = cloneDeep({...currentParams, ...paramsToUpdate});

    fireEvent(this, 'csv-download-url-changed', this.getListQueryString(this.prevQueryStringObj, true) as any);

    const stringParams: string = buildUrlQueryString(this.prevQueryStringObj);
    EtoolsRouter.replaceAppLocation(`gdd-interventions/list?${stringParams}`);
  }

  _triggerInterventionLoadingMsg() {
    fireEvent(this, 'trigger-intervention-loading-msg');
  }

  _canShowListDatesFrsWarnings(status: string) {
    return status !== CONSTANTS.STATUSES.Draft.toLowerCase() && status !== CONSTANTS.STATUSES.Closed.toLowerCase();
  }

  _hideDateFrsWarningTooltip(pdDate: string, frsDate: string, status: string) {
    return !(this._canShowListDatesFrsWarnings(status) && !this.validateFrsVsInterventionDates(pdDate, frsDate));
  }

  getFilterValuesByProperty(filterOptions: ListFilterOption[], prop: string, selected: any, selectedProp: string) {
    if (!filterOptions || !selected) {
      return [];
    }
    let selectedValues = selected.indexOf(',') > -1 ? selected.split(',') : [selected];
    selectedValues = this._convertToInt(selectedValues);

    selectedProp = selectedProp || 'id';
    return filterOptions.filter((opt) => selectedValues.indexOf(opt[selectedProp]) > -1).map((opt) => opt[prop]);
  }

  _convertToInt(data: []) {
    return data instanceof Array ? data.map((d) => parseInt(d, 10)) : [];
  }

  getStatusCellText(intervention: GDDListItem) {
    return `${this.mapStatus(intervention)} ${this.getDevelopementStatusDetails(intervention)}`;
  }
}
