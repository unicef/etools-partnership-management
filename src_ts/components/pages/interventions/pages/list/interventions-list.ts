import {customElement, html, LitElement, property} from 'lit-element';
import ListsCommonMixin from '../../../../common/mixins/lists-common-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../../redux/store';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {listFilterStyles} from '../../../../styles/list-filter-styles-lit';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {customIcons} from '@unicef-polymer/etools-modules-common/dist/styles/custom-icons';
import {EtoolsFilter} from '@unicef-polymer/etools-filters/src/etools-filters';
import {GenericObject, ListItemIntervention, RouteDetails, RouteQueryParams} from '@unicef-polymer/etools-types';
import pick from 'lodash-es/pick';
import cloneDeep from 'lodash-es/cloneDeep';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {EtoolsRouter} from '../../../../utils/routes';
import {buildUrlQueryString} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import '@unicef-polymer/etools-filters/src/etools-filters';
import {translate} from 'lit-translate';
import CommonMixinLit from '../../../../common/mixins/common-mixin-lit';
import CONSTANTS from '../../../../../config/app-constants';
import '../../data/interventions-list-data.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip.js';
import {InterventionsListData} from '../../data/interventions-list-data.js';
import debounce from 'lodash-es/debounce';
import get from 'lodash-es/get';
import omit from 'lodash-es/omit';
import {getInterventionFilters, InterventionFilterKeys, InterventionsFiltersHelper} from './interventions-filters';
import {partnersDropdownDataSelector} from '../../../../../redux/reducers/partners';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {ListFilterOption} from '../../../../../typings/filter.types';

@customElement('interventions-list')
export class InterventionsList extends connect(store)(
  ListsCommonMixin(CommonMixinLit(PaginationMixin(EndpointsLitMixin(FrNumbersConsistencyMixin(LitElement)))))
) {
  static get styles() {
    return [gridLayoutStylesLit, frWarningsStyles];
  }

  render() {
    return html`
      ${customIcons} ${listFilterStyles}
      <style>
        ${sharedStyles} ${elevationStyles} ${dataTableStylesLit} :host {
          box-sizing: border-box;
          width: 100%;
          background-color: #eeeeee;
        }

        .pd-ref {
          @apply --text-btn-style;
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

        section.page-content.filters {
          padding: 8px 24px;
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

      <iron-media-query
        query="(max-width: 767px)"
        .queryMatches="${this.lowResolutionLayout}"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></iron-media-query>
      <interventions-list-data
        id="interventions"
        @filtered-interventions-changed="${(e: CustomEvent) => {
          this.filteredInterventions = e.detail;
        }}"
        @total-results-changed="${(e: CustomEvent) => {
          this.paginator = {...this.paginator, count: e.detail};
          // etools-data-table-footer is not displayed without this:
          setTimeout(() => this.requestUpdate());
        }}"
        list-data-path="filteredInterventions"
        fire-data-loaded
      >
      </interventions-list-data>

      <section class="elevation page-content filters" elevation="1">
        <etools-filters
          .filterLoadingAbsolute="${true}"
          .filters="${this.allFilters}"
          @filter-change="${this.filtersChange}"
        ></etools-filters>
      </section>

      <div id="list" elevation="1" class="paper-material elevation">
        <etools-data-table-header
          .lowResolutionLayout="${this.lowResolutionLayout}"
          id="listHeader"
          label="${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} of ${this.paginator.count ||
          0} results to show"
        >
          <etools-data-table-column class="col-2" field="number" sortable>
            ${translate('INTERVENTIONS_LIST.REFERENCE_NO')}
          </etools-data-table-column>
          <etools-data-table-column class="col-3" field="partner_name" sortable>
            ${translate('INTERVENTIONS_LIST.PARTNER_ORG_NAME')}
          </etools-data-table-column>
          <etools-data-table-column class="col-1" field="document_type">
            ${translate('INTERVENTIONS_LIST.DOC_TYPE')}
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

        ${this.filteredInterventions.map(
          (intervention: ListItemIntervention) => html` <etools-data-table-row
            .lowResolutionLayout="${this.lowResolutionLayout}"
            .detailsOpened="${this.detailsOpened}"
          >
            <div slot="row-data" class="p-relative">
              <span class="col-data col-2" data-col-header-label="${translate('INTERVENTIONS_LIST.REFERENCE_NO')}">
                <a
                  class="pd-ref truncate"
                  href="interventions/${intervention.id}/metadata"
                  title="${this.getDisplayValue(intervention.number)}"
                >
                  ${this.getDisplayValue(intervention.number)}
                </a>
              </span>
              <span
                class="col-data col-3"
                data-col-header-label="${translate('INTERVENTIONS_LIST.PARTNER_ORG_NAME')}"
                title="${this.getDisplayValue(intervention.partner_name)}"
              >
                <span>${this.getDisplayValue(intervention.partner_name)}</span>
              </span>
              <span class="col-data col-1" data-col-header-label="${translate('INTERVENTIONS_LIST.DOC_TYPE')}">
                ${this.getDisplayValue(intervention.document_type)}
              </span>
              <div class="col-data col-2 capitalize" data-col-header-label="${translate('GENERAL.STATUS')}">
                <div>${this.getStatusCellText(intervention)}</div>
              </div>
              <span
                class="col-data col-2"
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
                  <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
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
                  <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                  <span slot="message">${this.getFrsEndDateValidationMsg()}</span>
                </etools-info-tooltip>
              </span>
            </div>

            <div slot="row-data-details" class="p-relative">
              <div class="row-details-content col-2">
                <span class="rdc-title">Offices</span>
                <span>${this.getDisplayValue(intervention.offices_names)}</span>
              </div>
              <div class="row-details-content col-2">
                <span class="rdc-title">Section</span>
                <span>${this.getDisplayValue(intervention.section_names)}</span>
              </div>
              <div class="row-details-content col-2">
                <span class="rdc-title">UNICEF Cash Contribution</span>
                <etools-info-tooltip
                  class="fr-nr-warn
                            ${this.getCurrencyMismatchClass(
                    intervention.all_currencies_are_consistent
                  )} interventions-list"
                  icon-first
                  custom-icon
                  hide-tooltip="${this.hideIntListUnicefCashAmountTooltip(
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
                  <iron-icon
                    icon="${this.getFrsCurrencyTooltipIcon(intervention.fr_currencies_are_consistent)}"
                    slot="custom-icon"
                  ></iron-icon>
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
                <span class="rdc-title">Total Budget</span>
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
    size: 10,
    page: 1,
    sort: 'start.desc'
  };

  @property({type: Object})
  routeDetails!: RouteDetails | null;

  @property({type: Array})
  filteredInterventions: ListItemIntervention[] = [];

  @property({type: Array})
  partners = [];

  connectedCallback(): void {
    this.loadFilteredInterventions = debounce(this.loadFilteredInterventions.bind(this), 600);

    super.connectedCallback();

    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }

  stateChanged(state: RootState): void {
    const stateRouteDetails = get(state, 'app.routeDetails');
    if (
      !(
        this.localName.indexOf(stateRouteDetails.routeName?.split('-')[0]) > -1 &&
        stateRouteDetails?.subRouteName === 'list'
      )
    ) {
      return;
    }

    if (!this.partners || !this.partners.length) {
      this.partners = partnersDropdownDataSelector(state);
    }

    if (!this.dataRequiredByFiltersHasBeenLoaded(state)) {
      return;
    }

    if (this.filteringParamsHaveChanged(stateRouteDetails) || this.shouldReGetListBecauseOfEditsOnItems()) {
      if (this.hadToinitializeUrlWithPrevQueryString(stateRouteDetails)) {
        return;
      }
      this.routeDetails = cloneDeep(stateRouteDetails);

      fireEvent(this, 'global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: 'pd-list'
      });

      this.initFiltersForDisplay(state);
      this.initializePaginatorFromUrl(this.routeDetails?.queryParams);
      this.loadFilteredInterventions();
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

    if (queryParams.size) {
      this.paginator.page_size = Number(queryParams.size);
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

  shouldReGetListBecauseOfEditsOnItems() {
    // return state.partners.shouldReGetList;  TODO -NOT Implemented
    return false;
  }

  dataRequiredByFiltersHasBeenLoaded(state: RootState) {
    return state.commonData?.commonDataIsLoaded && this.partners.length;
  }

  protected initFiltersForDisplay(state: RootState): void {
    let availableFilters = [];
    if (!this.allFilters) {
      availableFilters = JSON.parse(JSON.stringify(getInterventionFilters()));
      this.populateDropdownFilterOptionsFromCommonData(state, availableFilters);
    } else {
      // Avoid setting this.allFilters twice, as the already selected filters will be reset
      availableFilters = this.allFilters;
    }

    // update filter selection and assign the result to etools-filters(trigger render)
    const currentParams: RouteQueryParams = this.routeDetails!.queryParams || {};
    this.allFilters = InterventionsFiltersHelper.updateFiltersSelectedValues(
      omit(currentParams, ['page', 'size', 'sort']),
      availableFilters
    );
  }

  populateDropdownFilterOptionsFromCommonData(state: RootState, allFilters: EtoolsFilter[]) {
    [
      [InterventionFilterKeys.type, state.commonData!.documentTypes],
      [InterventionFilterKeys.status, state.commonData!.interventionStatuses],
      [InterventionFilterKeys.section, state.commonData!.sections],
      [InterventionFilterKeys.offices, state.commonData!.offices],
      [InterventionFilterKeys.cp_outputs, state.commonData!.cpOutputs],
      [InterventionFilterKeys.donors, state.commonData!.donors],
      [InterventionFilterKeys.partners, [...this.partners]],
      [InterventionFilterKeys.grants, state.commonData!.grants],
      [InterventionFilterKeys.unicef_focal_points, state.commonData!.unicefUsersData],
      [InterventionFilterKeys.budget_owner, state.commonData!.unicefUsersData],
      [InterventionFilterKeys.cpStructures, state.commonData!.countryProgrammes],
      [
        InterventionFilterKeys.editable_by,
        [
          {label: 'UNICEF', value: 'unicef'},
          {label: this._getTranslation('PARTNER'), value: 'partner'}
        ]
      ]
    ].forEach(([key, data]) => InterventionsFiltersHelper.updateFilterSelectionOptions(allFilters, key, data));
  }

  protected getSelectedPartnerTypes(_selectedPartnerTypes: string): string[] {
    console.log('getSelectedPartnerTypes / To be implemented in derived class');
    return [];
  }

  loadFilteredInterventions() {
    const intervElem = this.shadowRoot!.querySelector('#interventions') as InterventionsListData;
    if (!intervElem) {
      return;
    }

    const queryParams = this.routeDetails?.queryParams;

    const sortOrder = queryParams?.sort ? queryParams?.sort?.split('.') : [];

    intervElem.query(
      sortOrder[0],
      sortOrder[1],
      queryParams?.search?.toLowerCase() || '',
      this.getFilterUrlValuesAsArray(queryParams?.type || ''),
      this.getFilterUrlValuesAsArray(queryParams?.cp_outputs || ''),
      this.getFilterUrlValuesAsArray(queryParams?.donors || ''),
      this.getFilterValuesByProperty(this.partners, 'label', queryParams?.partners, 'value'),
      this.getFilterUrlValuesAsArray(queryParams?.grants || ''),
      this.getFilterUrlValuesAsArray(queryParams?.status || ''),
      this.getFilterUrlValuesAsArray(queryParams?.section || ''),
      this.getFilterUrlValuesAsArray(queryParams?.unicef_focal_points || ''),
      this.getFilterUrlValuesAsArray(queryParams?.budget_owner || ''),
      this.getFilterUrlValuesAsArray(queryParams?.offices || ''),
      this.getFilterUrlValuesAsArray(queryParams?.cpStructures || ''),
      Boolean(queryParams?.contingency_pd || false),
      queryParams?.editable_by || '',
      queryParams?.start || '',
      queryParams?.end || '',
      queryParams?.endAfter || '',
      queryParams?.page ? Number(queryParams.page) : 1,
      queryParams?.size ? Number(queryParams.size) : 10,
      false
    );
  }
  getFilterUrlValuesAsArray(types: string) {
    return types ? types.split(',') : [];
  }

  filtersChange(e: CustomEvent) {
    this.updateCurrentParams({...e.detail, page: 1}, true);
  }

  // Override from lists-common-mixin
  _sortOrderChanged(e: CustomEvent) {
    const sort = e.detail.field + '.' + e.detail.direction;
    this.updateCurrentParams({sort: sort});
  }

  paginatorChanged() {
    this.updateCurrentParams({page: this.paginator.page, size: this.paginator.page_size});
  }

  private updateCurrentParams(paramsToUpdate: GenericObject<any>, reset = false): void {
    let currentParams: RouteQueryParams = this.routeDetails!.queryParams || {};
    if (reset) {
      currentParams = pick(currentParams, ['sort', 'size', 'page']);
    }
    const newParams: RouteQueryParams = cloneDeep({...currentParams, ...paramsToUpdate});
    this.prevQueryStringObj = newParams;

    fireEvent(this, 'csv-download-url-changed', this.buildCsvDownloadUrl(newParams) as any);

    const stringParams: string = buildUrlQueryString(newParams);
    EtoolsRouter.replaceAppLocation(`${this.routeDetails!.path}?${stringParams}`);
  }

  public buildCsvDownloadUrl(queryStringObj: GenericObject<any>) {
    const exportParams = {
      status: queryStringObj.status,
      document_type: queryStringObj.type,
      sections: queryStringObj.section,
      office: queryStringObj.offices,
      donors: queryStringObj.donors,
      partners: queryStringObj.partners,
      grants: queryStringObj.grants,
      unicef_focal_points: queryStringObj.unicef_focal_points,
      budget_owner: queryStringObj.budget_owner,
      country_programme: queryStringObj.cpStructures,
      cp_outputs: queryStringObj.cp_outputs,
      start: queryStringObj.start,
      end: queryStringObj.end,
      end_after: queryStringObj.endAfter,
      editable_by: queryStringObj.editable_by,
      contingency_pd: queryStringObj.contingency_pd,
      search: queryStringObj.search
    };
    return this._buildExportQueryString(exportParams);
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

  getStatusCellText(intervention: ListItemIntervention) {
    return `${this.mapStatus(intervention)} ${this.getDevelopementStatusDetails(intervention)}`;
  }
}
