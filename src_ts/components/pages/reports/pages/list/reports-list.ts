import {html, LitElement, property, customElement} from 'lit-element';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-media-query/iron-media-query.js';
import {EtoolsFilter} from '@unicef-polymer/etools-filters/src/etools-filters';
import '../../components/report-status';
import {fireEvent} from '../../../../utils/fire-custom-event';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import ListsCommonMixin from '../../../../common/mixins/lists-common-mixin-lit';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {listFilterStyles} from '../../../../styles/list-filter-styles-lit';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {CommonDataState} from '../../../../../redux/reducers/common-data';
import {partnersDropdownDataSelector} from '../../../../../redux/reducers/partners';
import {ReportsFilterKeys, getReportFilters, ReportsFiltersHelper} from './reports-filters';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {abortRequestByKey} from '@unicef-polymer/etools-ajax/etools-iron-request';
import {AnyObject, GenericObject} from '@unicef-polymer/etools-types';
import {RouteDetails, RouteQueryParams} from '@unicef-polymer/etools-types/dist/router.types';
import CONSTANTS from '../../../../../config/app-constants';
import get from 'lodash-es/get';
import {buildUrlQueryString, cloneDeep} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {debounce} from '@unicef-polymer/etools-modules-common/dist/utils/debouncer';
import pick from 'lodash-es/pick';
import omit from 'lodash-es/omit';
import {EtoolsRouter} from '../../../../utils/routes';
import {langChanged, translate} from 'lit-translate';
import pmpEdpoints from '../../../../endpoints/endpoints';
import {formatDateLocalized} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';
declare const dayjs: any;

/**
 * @polymer
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
    return [gridLayoutStylesLit];
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
            font-size: 12px;
          }
        }

        .pd-ref,
        .view-report {
          @apply --text-btn-style;
        }

        .pd-ref {
          text-transform: none;
        }

        .final-badge {
          display: inline-block;
          border-radius: 1px;
          padding: 1px 6px;
          font-size: 10px;
          text-transform: uppercase;
          background-color: var(--paper-grey-300);
          margin-left: 5px;
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
      </style>

      <iron-media-query
        query="(max-width: 767px)"
        .queryMatches="${this.lowResolutionLayout}"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></iron-media-query>

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
                <etools-data-table-column class="flex-c">${translate('PARTNER')}</etools-data-table-column>
                <etools-data-table-column class="flex-c">${translate('REPORT_STATUS')}</etools-data-table-column>
                <etools-data-table-column class="flex-c">${translate('DUE_DATE')}</etools-data-table-column>
                <etools-data-table-column class="flex-c">${translate('REPORTING_PERIOD')}</etools-data-table-column>
                ${!this.noPdSsfaRef
                  ? html`<etools-data-table-column class="col-2"
                      >${translate('PD_SPD_REF_NUM')}</etools-data-table-column
                    >`
                  : ''}
              </etools-data-table-header>

              ${this.reports.map(
                (report: any) => html` <etools-data-table-row .lowResolutionLayout="${this.lowResolutionLayout}">
                  <div slot="row-data">
                    <span class="col-data col-2" data-col-header-label="${translate('REPORT_NUM')}">
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
                      <paper-tooltip for="tooltip-trigger-${report.id}" position="right">
                        ${report.programme_document.title}
                      </paper-tooltip>
                    </span>
                    <span class="col-data flex-c" data-col-header-label="${translate('PARTNER')}">
                      <span id="tooltip-partner-${report.id}" class="tooltip-trigger">
                        ${this._displayOrDefault(report.partner_name)}
                      </span>

                      <paper-tooltip for="tooltip-partner-${report.id}" position="right" fit-to-visible-bounds>
                        ${report.partner_vendor_number}
                      </paper-tooltip>
                    </span>
                    <span class="col-data flex-c" data-col-header-label="${translate('REPORT_STATUS')}">
                      <report-status .status="${report.status}"></report-status>
                    </span>
                    <span class="col-data flex-c" data-col-header-label="${translate('DUE_DATE')}">
                      ${this._displayOrDefault(formatDateLocalized(report.due_date))}
                    </span>
                    <span class="col-data flex-c" data-col-header-label="${translate('REPORTING_PERIOD')}">
                      ${this.displayLocalizedReportingPeriod(report.reporting_period)}
                    </span>

                    ${!this.noPdSsfaRef
                      ? html` <span class="col-data col-2" data-col-header-label="${translate('PD_SPD_REF_NUM')}">
                          <a
                            class="pd-ref truncate"
                            href="interventions/${report.programme_document?.external_id}/progress/reports"
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
  reports: [] = [
    {
      id: 31432,
      report_type: 'QPR',
      report_number: 5,
      is_final: true,
      partner_contribution_to_date: null,
      financial_contribution_to_date: null,
      financial_contribution_currency: 'USD',
      challenges_in_the_reporting_period: null,
      proposed_way_forward: null,
      status: 'Ove',
      reporting_period: '01-Nov-2022 - 31-Jan-2023 ',
      submission_date: null,
      due_date: '28-Feb-2023',
      is_draft: true,
      review_date: null,
      review_overall_status: null,
      review_overall_status_display: null,
      sent_back_feedback: null,
      programme_document: {
        id: 3570,
        external_id: '191',
        agreement: 'RWA/PCA2019128',
        reference_number: 'RWA/PCA2019128/PD2021191-1',
        title: 'UNICEF-University of Maryland Partnership to Improve PMTCT through Continuous Quality Improvement',
        start_date: '01-Nov-2021',
        end_date: '31-Jan-2023',
        status: 'Active',
        document_type: 'PD',
        document_type_display: 'Programme Document'
      },
      narrative: null,
      partner_name: 'STATE OF MD UNIVERSITY OF MARYLAND',
      partner_vendor_number: '2500241096',
      unicef_focal_points: ['Grace Muriisa'],
      reviewed_by_name: null,
      reviewed_by_email: null,
      reviewed_by_external_id: null
    },
    {
      id: 30223,
      report_type: 'QPR',
      report_number: 15,
      is_final: false,
      partner_contribution_to_date: null,
      financial_contribution_to_date: null,
      financial_contribution_currency: 'USD',
      challenges_in_the_reporting_period: null,
      proposed_way_forward: null,
      status: 'Ove',
      reporting_period: '01-Oct-2022 - 31-Dec-2022 ',
      submission_date: null,
      due_date: '31-Jan-2023',
      is_draft: true,
      review_date: null,
      review_overall_status: null,
      review_overall_status_display: null,
      sent_back_feedback: null,
      programme_document: {
        id: 436,
        external_id: '109',
        agreement: 'RWA/PCA201895',
        reference_number: 'RWA/PCA201895/PD2018109',
        title: 'Provision of Inclusive Market and Work-Based Early Childhood Development Services',
        start_date: '16-Oct-2018',
        end_date: '30-Jun-2023',
        status: 'Active',
        document_type: 'PD',
        document_type_display: 'Programme Document'
      },
      narrative: null,
      partner_name: 'ACTION POUR LE DEVELOPPEMENT DU PEU ADEPE',
      partner_vendor_number: '2500239300',
      unicef_focal_points: ['Ted Maly', 'Pierre Nzeyimana'],
      reviewed_by_name: null,
      reviewed_by_email: null,
      reviewed_by_external_id: null
    },
    {
      id: 30198,
      report_type: 'QPR',
      report_number: 6,
      is_final: true,
      partner_contribution_to_date: null,
      financial_contribution_to_date: null,
      financial_contribution_currency: 'USD',
      challenges_in_the_reporting_period: null,
      proposed_way_forward: null,
      status: 'Ove',
      reporting_period: '01-Oct-2022 - 31-Dec-2022 ',
      submission_date: null,
      due_date: '31-Jan-2023',
      is_draft: true,
      review_date: null,
      review_overall_status: null,
      review_overall_status_display: null,
      sent_back_feedback: null,
      programme_document: {
        id: 2773,
        external_id: '180',
        agreement: 'RWA/PCA201879',
        reference_number: 'RWA/PCA201879/PD2021180',
        title: 'Family strengthening and Community based support  for care of children with disabilities in families',
        start_date: '01-Jul-2021',
        end_date: '31-Dec-2022',
        status: 'Terminated',
        document_type: 'PD',
        document_type_display: 'Programme Document'
      },
      narrative: null,
      partner_name: 'CHANCE FOR CHILDHOOD CFC',
      partner_vendor_number: '2500238433',
      unicef_focal_points: ['Genevieve Uwamariya'],
      reviewed_by_name: null,
      reviewed_by_email: null,
      reviewed_by_external_id: null
    },
    {
      id: 32036,
      report_type: 'QPR',
      report_number: 4,
      is_final: false,
      partner_contribution_to_date: null,
      financial_contribution_to_date: null,
      financial_contribution_currency: 'USD',
      challenges_in_the_reporting_period: null,
      proposed_way_forward: null,
      status: 'Ove',
      reporting_period: '01-Oct-2022 - 31-Dec-2022 ',
      submission_date: null,
      due_date: '30-Jan-2023',
      is_draft: true,
      review_date: null,
      review_overall_status: null,
      review_overall_status_display: null,
      sent_back_feedback: null,
      programme_document: {
        id: 6119,
        external_id: '227',
        agreement: 'RWA/PCA201871',
        reference_number: 'RWA/PCA201871/PD2022227',
        title: 'QA-19-12-2022',
        start_date: '01-Jan-2022',
        end_date: '31-Dec-2023',
        status: 'Active',
        document_type: 'PD',
        document_type_display: 'Programme Document'
      },
      narrative: null,
      partner_name: 'IMBUTO FOUNDATION',
      partner_vendor_number: '2500209190',
      unicef_focal_points: ['k1 k1'],
      reviewed_by_name: null,
      reviewed_by_email: null,
      reviewed_by_external_id: null
    },
    {
      id: 32024,
      report_type: 'QPR',
      report_number: 4,
      is_final: false,
      partner_contribution_to_date: 'yrdy',
      financial_contribution_to_date: '324',
      financial_contribution_currency: 'USD',
      challenges_in_the_reporting_period: 'yrdy',
      proposed_way_forward: 'yrdy',
      status: 'Ove',
      reporting_period: '01-Oct-2022 - 31-Dec-2022 ',
      submission_date: null,
      due_date: '30-Jan-2023',
      is_draft: true,
      review_date: null,
      review_overall_status: null,
      review_overall_status_display: null,
      sent_back_feedback: null,
      programme_document: {
        id: 6129,
        external_id: '244',
        agreement: 'RWA/PCA2018118',
        reference_number: 'RWA/PCA2018118/PD2023244',
        title: 'QA-demo Schools and Health Care facilities and Sanitation promotions',
        start_date: '01-Jan-2022',
        end_date: '01-Jan-2024',
        status: 'Active',
        document_type: 'PD',
        document_type_display: 'Programme Document'
      },
      narrative: null,
      partner_name: 'HELP A CHILD',
      partner_vendor_number: '2500239437',
      unicef_focal_points: ['k1 k1'],
      reviewed_by_name: null,
      reviewed_by_email: null,
      reviewed_by_external_id: null
    },
    {
      id: 31987,
      report_type: 'QPR',
      report_number: 4,
      is_final: false,
      partner_contribution_to_date: null,
      financial_contribution_to_date: null,
      financial_contribution_currency: 'USD',
      challenges_in_the_reporting_period: null,
      proposed_way_forward: null,
      status: 'Ove',
      reporting_period: '01-Oct-2022 - 31-Dec-2022 ',
      submission_date: null,
      due_date: '30-Jan-2023',
      is_draft: true,
      review_date: null,
      review_overall_status: null,
      review_overall_status_display: null,
      sent_back_feedback: null,
      programme_document: {
        id: 6127,
        external_id: '241',
        agreement: 'RWA/PCA2018118',
        reference_number: 'RWA/PCA2018118/PD2023241',
        title: 'QA-10-01-2023',
        start_date: '01-Jan-2022',
        end_date: '01-Jan-2024',
        status: 'Active',
        document_type: 'PD',
        document_type_display: 'Programme Document'
      },
      narrative: null,
      partner_name: 'HELP A CHILD',
      partner_vendor_number: '2500239437',
      unicef_focal_points: ['k1 k1'],
      reviewed_by_name: null,
      reviewed_by_email: null,
      reviewed_by_external_id: null
    },
    {
      id: 31584,
      report_type: 'QPR',
      report_number: 2,
      is_final: true,
      partner_contribution_to_date: null,
      financial_contribution_to_date: null,
      financial_contribution_currency: 'USD',
      challenges_in_the_reporting_period: null,
      proposed_way_forward: null,
      status: 'Ove',
      reporting_period: '01-Dec-2022 - 31-Dec-2022 ',
      submission_date: null,
      due_date: '30-Jan-2023',
      is_draft: true,
      review_date: null,
      review_overall_status: null,
      review_overall_status_display: null,
      sent_back_feedback: null,
      programme_document: {
        id: 4372,
        external_id: '210',
        agreement: 'RWA/PCA2022153',
        reference_number: 'RWA/PCA2022153/PD2022210',
        title: 'Enhance the well-being of children and youth through sports for development.',
        start_date: '12-Sep-2022',
        end_date: '31-Dec-2022',
        status: 'Ended',
        document_type: 'PD',
        document_type_display: 'Programme Document'
      },
      narrative: null,
      partner_name: 'UMURI FOUNDATION',
      partner_vendor_number: '2500245200',
      unicef_focal_points: ['Redempter Batete'],
      reviewed_by_name: null,
      reviewed_by_email: null,
      reviewed_by_external_id: null
    },
    {
      id: 30982,
      report_type: 'QPR',
      report_number: 2,
      is_final: true,
      partner_contribution_to_date: null,
      financial_contribution_to_date: null,
      financial_contribution_currency: 'USD',
      challenges_in_the_reporting_period: null,
      proposed_way_forward: null,
      status: 'Ove',
      reporting_period: '01-Nov-2022 - 31-Dec-2022 ',
      submission_date: null,
      due_date: '30-Jan-2023',
      is_draft: true,
      review_date: null,
      review_overall_status: null,
      review_overall_status_display: null,
      sent_back_feedback: null,
      programme_document: {
        id: 4300,
        external_id: '205',
        agreement: 'RWA/PCA2022151',
        reference_number: 'RWA/PCA2022151/PD2022205',
        title: 'Improving access to HIV services for adolescents and young people in KIREHE district',
        start_date: '15-Aug-2022',
        end_date: '31-Dec-2022',
        status: 'Ended',
        document_type: 'PD',
        document_type_display: 'Programme Document'
      },
      narrative: null,
      partner_name: 'RWANDA DEVELOPMENT ORGANISATION',
      partner_vendor_number: '2500244101',
      unicef_focal_points: ['Annet Birungi'],
      reviewed_by_name: null,
      reviewed_by_email: null,
      reviewed_by_external_id: null
    },
    {
      id: 30888,
      report_type: 'QPR',
      report_number: 1,
      is_final: false,
      partner_contribution_to_date: 'Technical and coordination support',
      financial_contribution_to_date: '126912756',
      financial_contribution_currency: 'RWF',
      challenges_in_the_reporting_period: 'Delay of TMIS activities. High turnover of SBMs',
      proposed_way_forward: 'Continued programme implementation',
      status: 'Sub',
      reporting_period: '13-Oct-2022 - 31-Dec-2022 ',
      submission_date: '07-Feb-2023',
      due_date: '30-Jan-2023',
      is_draft: false,
      review_date: null,
      review_overall_status: null,
      review_overall_status_display: null,
      sent_back_feedback: null,
      programme_document: {
        id: 4751,
        external_id: '212',
        agreement: 'RWA/PCA201867',
        reference_number: 'RWA/PCA201867/PD2022212',
        title: 'In-service teacher development for quality results for children',
        start_date: '13-Oct-2022',
        end_date: '30-Sep-2023',
        status: 'Terminated',
        document_type: 'PD',
        document_type_display: 'Programme Document'
      },
      narrative: null,
      partner_name: 'INSPIRE EDUCATE AND EMPOWER RWANDA',
      partner_vendor_number: '2500216344',
      unicef_focal_points: ['Yonah Nyundo'],
      reviewed_by_name: null,
      reviewed_by_email: null,
      reviewed_by_external_id: null
    },
    {
      id: 30073,
      report_type: 'QPR',
      report_number: 3,
      is_final: true,
      partner_contribution_to_date: null,
      financial_contribution_to_date: null,
      financial_contribution_currency: 'USD',
      challenges_in_the_reporting_period: null,
      proposed_way_forward: null,
      status: 'Ove',
      reporting_period: '01-Oct-2022 - 31-Dec-2022 ',
      submission_date: null,
      due_date: '30-Jan-2023',
      is_draft: true,
      review_date: null,
      review_overall_status: null,
      review_overall_status_display: null,
      sent_back_feedback: null,
      programme_document: {
        id: 3833,
        external_id: '197',
        agreement: 'RWA/PCA201871',
        reference_number: 'RWA/PCA201871/PD2022197',
        title: 'Support to gender-equitable foundational learning through a comprehensive remedial education programme',
        start_date: '01-Apr-2022',
        end_date: '30-Jun-2023',
        status: 'Active',
        document_type: 'PD',
        document_type_display: 'Programme Document'
      },
      narrative: null,
      partner_name: 'IMBUTO FOUNDATION',
      partner_vendor_number: '2500209190',
      unicef_focal_points: ['Marie Therese Uwizeyeyezu'],
      reviewed_by_name: null,
      reviewed_by_email: null,
      reviewed_by_external_id: null
    }
  ];

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
  routeDetails!: RouteDetails | null;

  @property({type: Boolean})
  listLoadingActive = false;

  @property({type: Object})
  prevQueryStringObj: GenericObject = {size: 10, sort: 'partner_name.asc', status: 'Sen,Sub,Ove'};

  connectedCallback() {
    super.connectedCallback();

    this._loadReportsData = debounce(this._loadReportsData.bind(this), 400) as any;
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'reports-page'
    });
  }

  stateChanged(state: RootState) {
    if (state.app?.routeDetails?.routeName !== 'reports') {
      return;
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

  initFiltersForDisplay(commonData: CommonDataState) {
    const availableFilters = JSON.parse(JSON.stringify(getReportFilters()));
    this.populateDropdownFilterOptionsFromCommonData(commonData, availableFilters);
    this.allFilters = availableFilters;
  }

  populateDropdownFilterOptionsFromCommonData(commonData: CommonDataState, allFilters: EtoolsFilter[]) {
    ReportsFiltersHelper.updateFilterSelectionOptions(allFilters, ReportsFilterKeys.external_partner_id, this.partners);
    ReportsFiltersHelper.updateFilterSelectionOptions(allFilters, ReportsFilterKeys.cp_output, commonData!.cpOutputs);
    ReportsFiltersHelper.updateFilterSelectionOptions(allFilters, ReportsFilterKeys.section, commonData!.sections);
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
        logError('Reports list data request failed!', 'reports-list', error);

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
    return report.report_type + report.report_number;
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
        console.error('Reporting Period is not in the expected format!');
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
