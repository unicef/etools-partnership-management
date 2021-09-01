import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';

import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip.js';
import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin.js';

import '../../../../layout/etools-form-element-wrapper.js';
import '../../../../layout/etools-progress-bar.js';
import '../../../../layout/etools-ram-indicators.js';

import '../../../reports/components/report-status.js';
import '../../../reports/pages/progress/components/indicator-report-target.js';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin.js';
import CommonMixin from '../../../../mixins/common-mixin.js';
import UtilsMixin from '../../../../mixins/utils-mixin.js';
import {pageCommonStyles} from '../../../../styles/page-common-styles.js';
import {SharedStyles} from '../../../../styles/shared-styles.js';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles.js';
import {listFilterStyles} from '../../../../styles/list-filter-styles.js';
import {isEmptyObject} from '../../../../utils/utils.js';
import {fireEvent} from '../../../../utils/fire-custom-event.js';
import {User, GenericObject} from '../../../../../typings/globals.types.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../store.js';
import {dateDiff, dateIsBetween, isValidDate, dateIsAfter, datesAreEqual} from '../../../../utils/date-utils';
import {logError, logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {property} from '@polymer/decorators';
import {pmpCustomIcons} from '../../../../styles/custom-iconsets/pmp-icons.js';
import {frWarningsStyles} from '../../styles/fr-warnings-styles.js';
declare const moment: any;

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin EndpointsMixin
 * @appliesMixin CommonMixin
 * @appliesMixin UtilsMixin
 */
class InterventionProgress extends connect(store)(
  UtilsMixin(
    CommonMixin(
      EndpointsMixin(
        // eslint-disable-next-line new-cap
        EtoolsCurrency(PolymerElement)
      )
    )
  )
) {
  static get template() {
    return html`
      ${pageCommonStyles} ${SharedStyles} ${gridLayoutStyles} ${listFilterStyles} ${pmpCustomIcons} ${frWarningsStyles}
      <style include="data-table-styles paper-material-styles">
        #progress-summary etools-progress-bar {
          margin-top: 16px;
        }

        #cash-progress etools-form-element-wrapper {
          width: 140px;
        }

        #cash-progress etools-form-element-wrapper:first-child {
          margin-right: 24px;
        }

        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          padding: 0;
        }

        .lower-result-status-date {
          margin-left: 4px;
        }

        .indicator-report {
          padding-bottom: 0;
        }

        .indicator-report,
        .progress-details {
          padding-left: 58px;
        }

        .progress-details + .indicator-report {
          border-top: 1px solid var(--list-divider-color);
        }

        .report-progress-bar {
          @apply --layout-flex;
          --etools-progress-bar-width: 100%;
        }

        .progress-details {
          @apply --layout-end-justified;
          padding-top: 0;
        }

        indicator-report-target {
          --indicator-report-target-row: {
            padding-right: 72px;
          }
        }

        etools-ram-indicators {
          border-top: 1px solid var(--list-divider-color);
          border-bottom: 1px solid var(--list-divider-color);
        }

        @media print {
          .indicator-report {
            @apply --layout-horizontal;
          }

          .indicator-report .col-data {
            max-width: calc(100% - 224px);
            flex: none;
            width: auto;
          }

          .indicator-report .progress-bar {
            min-width: 200px;
          }

          .indicator-report .col-data:first-child {
            margin-right: 24px;
          }

          .target-details {
            display: flex;
            width: auto;
            max-width: none;
            margin-top: 16px;
            flex: 1;
          }

          .progress-details {
            @apply --layout-start-justified;
          }
        }

        etools-info-tooltip etools-form-element-wrapper {
          width: 100% !important;
        }
      </style>

      <div id="progress-summary" class="content-section paper-material" elevation="1">
        <div class="row-h">
          <div class="layout-vertical col-4">
            <etools-form-element-wrapper
              label="PD Duration"
              value="[[_getPdDuration(progress.start_date, progress.end_date)]]"
            >
            </etools-form-element-wrapper>
            <etools-progress-bar value="[[pdProgress]]" no-decimals></etools-progress-bar>
          </div>
          <div class="layout-vertical col-5">
            <div class="layout-horizontal" id="cash-progress">
              <etools-info-tooltip
                class="fr-nr-warn col-6"
                custom-icon
                icon-first
                hide-tooltip="[[!multipleCurrenciesWereUsed(progress.disbursement, progress)]]"
              >
                <etools-form-element-wrapper
                  slot="field"
                  label="Cash Transfered"
                  value="[[progress.disbursement_currency]] [[displayCurrencyAmount(progress.disbursement, '0', 0)]]"
                >
                </etools-form-element-wrapper>
                <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                <span slot="message">Disbursement amounts in multiple currencies.</span>
              </etools-info-tooltip>

              <etools-form-element-wrapper
                class="col-6"
                label="UNICEF Cash"
                value="[[progress.unicef_budget_cash_currency]]
                        [[displayCurrencyAmount(progress.unicef_budget_cash, '0', 0)]]"
              >
              </etools-form-element-wrapper>
            </div>

            <etools-progress-bar
              value="[[progress.disbursement_percent]]"
              no-decimals
              hidden$="[[multipleCurrenciesWereUsed(progress.disbursement_percent, progress)]]"
            >
            </etools-progress-bar>

            <template is="dom-if" if="[[multipleCurrenciesWereUsed(progress.disbursement_percent, progress)]]">
              <etools-info-tooltip
                class="currency-mismatch col-6"
                custom-icon
                icon-first
                hide-tooltip="[[!multipleCurrenciesWereUsed(progress.disbursement_percent, progress)]]"
              >
                <span slot="field">N/A %</span>
                <iron-icon slot="custom-icon" icon="pmp-custom-icons:not-equal"></iron-icon>
                <span slot="message">FR currency does not match PD/SSFA currency.</span>
              </etools-info-tooltip>
            </template>
          </div>
          <div class="col col-3">
            <etools-form-element-wrapper
              label="Overall PD/SSFA Rating by UNICEF"
              value="[[_getOverallPdStatusDate(latestAcceptedPr.review_date)]]"
              no-placeholder
            >
              <report-status status="[[latestAcceptedPr.review_overall_status]]" slot="prefix"></report-status>
            </etools-form-element-wrapper>
          </div>
        </div>
      </div>

      <etools-content-panel class="content-section" panel-title="Results reported">
        <div class="row-h" hidden$="[[!_emptyList(progress.details.cp_outputs)]]">
          <p>There are no results to show.</p>
        </div>
        <template is="dom-repeat" items="[[progress.details.cp_outputs]]">
          <div class="row-v row-second-bg">
            <strong>CP Output: [[item.title]]</strong>
          </div>

          <!-- RAM indicators display -->
          <etools-ram-indicators
            class="row-h"
            intervention-id="[[interventionId]]"
            cp-id="[[item.external_cp_output_id]]"
          ></etools-ram-indicators>

          <div class="row-h" hidden$="[[!_emptyList(item.ll_outputs)]]">
            <p>There are no PD Outputs or SSFA Expected Results.</p>
          </div>

          <div class="lower-results-table" hidden$="[[_emptyList(item.ll_outputs)]]">
            <etools-data-table-header id="listHeader" no-title>
              <etools-data-table-column class="col-9"> PD Outputs or SSFA Expected Results </etools-data-table-column>
              <etools-data-table-column class="col-3"> Current progress (Last Reported on) </etools-data-table-column>
            </etools-data-table-header>

            <template is="dom-repeat" items="[[item.ll_outputs]]" as="lowerResult">
              <etools-data-table-row>
                <div slot="row-data">
                  <span class="col-data col-9"> [[lowerResult.title]] </span>
                  <span class="col-data col-3">
                    <report-status status="[[_getLowerResultStatus(lowerResult.id)]]"></report-status>
                    <span class="lower-result-status-date">[[_getLowerResultStatusDate(lowerResult.id)]]</span>
                  </span>
                </div>
                <div slot="row-data-details">
                  <div class="row-details-content flex-c">
                    <div class="row-h" hidden$="[[_countIndicatorReports(lowerResult.id)]]">
                      No indicators on this PD Output or SSFA Expected Result
                    </div>
                    <template is="dom-repeat" items="[[_getIndicatorsReports(lowerResult.id)]]" as="indicatorReport">
                      <div class="row-h indicator-report">
                        <div class="col-data col-9">
                          [[_ternary(indicatorReport.reportable.blueprint.unit, 'number', '#', '%')]]
                          [[indicatorReport.reportable.blueprint.title]]
                        </div>
                        <div class="col-data col-3 progress-bar">
                          <etools-progress-bar
                            class="report-progress-bar"
                            value="[[getProgressPercentage(indicatorReport.reportable.total_against_target,
                                        indicatorReport.reportable.blueprint.display_type)]]"
                          >
                          </etools-progress-bar>
                        </div>
                      </div>
                      <div class="row-h progress-details">
                        <div class="layout-vertical col-5 target-details">
                          <indicator-report-target
                            class="print-inline"
                            display-type="[[indicatorReport.reportable.blueprint.display_type]]"
                            target="[[indicatorReport.reportable.target]]"
                            cumulative-progress="[[_ternary(indicatorReport.reportable.blueprint.display_type, 'number',
                              indicatorReport.reportable.achieved.v, indicatorReport.reportable.achieved.c)]]"
                            achievement="[[_ternary(indicatorReport.reportable.blueprint.display_type, 'number',
                              indicatorReport.total.v, indicatorReport.total.c)]]"
                          ></indicator-report-target>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </etools-data-table-row>
            </template>
          </div>
        </template>
      </etools-content-panel>
    `;
  }

  @property({type: Number})
  interventionId!: number;

  @property({
    type: Number,
    computed: '_getTimeProgress(progress.start_date, progress.end_date)'
  })
  pdProgress!: number;

  @property({type: Object, observer: '_progressDataObjChanged'})
  progress: GenericObject | null = null;

  @property({type: Object, computed: '_computeLatestAcceptedPr(progress)'})
  latestAcceptedPr!: GenericObject;

  @property({type: Array})
  indicatorReports: GenericObject[] = [];

  static get observers() {
    return [
      // `prpCountries` and `currentUser` are defined in endpoint mixin
      '_requestProgressData(interventionId, prpCountries, currentUser)'
    ];
  }

  stateChanged(state: RootState) {
    this.endStateChanged(state);
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for progress tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
    fireEvent(this, 'tab-content-attached');
  }

  multipleCurrenciesWereUsed(disbursementOrPercent: string, progress: GenericObject | null) {
    if (!progress || disbursementOrPercent === undefined) {
      return false; // hide icon until request data is received
    }
    return Number(disbursementOrPercent) === -1 || disbursementOrPercent === 'N/A';
  }

  _requestProgressData(id: string, prpCountries: any, currentUser: User) {
    if (!id || isEmptyObject(prpCountries) || isEmptyObject(currentUser)) {
      return;
    }

    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'pd-progress'
    });

    this.fireRequest('interventionProgress', {pdId: id})
      .then((response: any) => {
        this.set('progress', response);
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'pd-progress'
        });
      })
      .catch((error: any) => {
        logError('PD/SSFA progress request failed!', 'intervention-progress', error);
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'pd-progress'
        });
      });
  }

  _emptyList(dataSet: any) {
    return isEmptyObject(dataSet);
  }

  _computeLatestAcceptedPr(progress: any) {
    return progress && progress.latest_accepted_pr ? progress.latest_accepted_pr : null;
  }

  _progressDataObjChanged(progress: any) {
    if (!progress) {
      this.set('indicatorReports', []);
      return;
    }
    if (!this._emptyList(progress.details.cp_outputs)) {
      progress.details.cp_outputs.forEach((result: any) => {
        if (!this._emptyList(result.ll_outputs)) {
          result.ll_outputs.forEach((lowerResult: any) => {
            this._prepareindicatorReportsData(lowerResult.id, progress.latest_accepted_pr_indicator_reports);
          });
        }
      });
    }
  }

  _prepareindicatorReportsData(lowerResultId: any, progressIndicatorReports: any) {
    const indicatorReportData = {
      lowerResultId: lowerResultId,
      reports: []
    };
    if (this._emptyList(progressIndicatorReports)) {
      return;
    }
    indicatorReportData.reports = progressIndicatorReports.filter(function (report: any) {
      return report.reportable_object_id === lowerResultId;
    });
    this.push('indicatorReports', indicatorReportData);
  }

  _countIndicatorReports(lowerResultId: any) {
    return (
      !this._emptyList(this.indicatorReports) &&
      !!this.indicatorReports.find(function (indReports: any) {
        return indReports.lowerResultId === lowerResultId;
      })
    );
  }

  _getIndicatorsReports(lowerResultId: any) {
    if (this._emptyList(this.indicatorReports)) {
      return [];
    }
    const indicatorsReports = this.indicatorReports.filter(function (indReports: any) {
      return indReports.lowerResultId === lowerResultId;
    });
    return indicatorsReports.length === 0 ? [] : indicatorsReports[0].reports;
  }

  /**
   * Assuming all indicators reports are already sort by date desc
   */
  _getLatestIndicatorReport(lowerResultId: any) {
    if (!this._emptyList(this.indicatorReports)) {
      const indReports = this.indicatorReports.find(function (indReports: any) {
        return indReports.lowerResultId === lowerResultId;
      });
      if (indReports && indReports.reports[0]) {
        return indReports.reports[0];
      }
    }
    return null;
  }

  _getLowerResultStatus(lowerResultId: any) {
    let status = null;
    const latestIndReport = this._getLatestIndicatorReport(lowerResultId);
    if (latestIndReport) {
      status = latestIndReport.overall_status;
    }
    return status;
  }

  _getLowerResultStatusDate(lowerResultId: any) {
    let resultStatusDateStr = '';
    const latestIndReport = this._getLatestIndicatorReport(lowerResultId);
    if (latestIndReport) {
      resultStatusDateStr = '(' + this._convertToDisplayFormat(latestIndReport.submission_date) + ')';
    }
    return resultStatusDateStr;
  }

  _getPdDuration(start: string, end: string) {
    if (!start && !end) {
      return;
    }
    start = this._convertToDisplayFormat(start) || 'N/A';
    end = this._convertToDisplayFormat(end) || 'N/A';
    return start + ' - ' + end;
  }

  _getTimeProgress(start: string, end: string) {
    if (!start && !end) {
      return;
    }
    const today = new Date();
    const startDt = moment(start).toDate();
    const endDt = moment(end).toDate();
    try {
      if (dateIsBetween(startDt, endDt, today)) {
        const intervalTotalDays = dateDiff(startDt, endDt);
        const intervalDaysCompleted = dateDiff(startDt, today);
        return (intervalDaysCompleted * 100) / intervalTotalDays;
      }
    } catch (err) {
      logWarn('Time progress compute error', 'intervention-progress', err);
    }
    // if end date is valid and is past date or today's date, progress should be 100%
    if (isValidDate(endDt) && (dateIsAfter(today, endDt) || datesAreEqual(today, endDt))) {
      return 100;
    }
    return 0;
  }

  _getOverallPdStatusDate(date: string) {
    return date ? '(' + this._convertToDisplayFormat(date) + ')' : '';
  }

  _convertToDisplayFormat(strDt: string) {
    return moment(strDt).format('D MMM YYYY');
  }

  getProgressPercentage(progress_percentage: number, displayType: string) {
    if (displayType === 'percentage') {
      return progress_percentage;
    }
    return progress_percentage * 100;
  }
}

window.customElements.define('intervention-progress', InterventionProgress);
