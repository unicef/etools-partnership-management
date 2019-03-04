import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';

import 'etools-content-panel/etools-content-panel.js';
import 'etools-data-table/etools-data-table.js';
import 'etools-behaviors/etools-logs-mixin.js';
import {EtoolsCurrency} from 'etools-currency-amount-input/mixins/etools-currency-mixin.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';

import '../../../../layout/etools-form-element-wrapper.js';
import '../../../../layout/etools-progress-bar.js';
import '../../../../layout/etools-ram-indicators.js';

import '../../../reports/components/report-status.js';
import '../../../reports/pages/progress/components/indicator-report-target.js';
import AjaxErrorsParserMixin from '../../../../mixins/ajax-errors-parser-mixin.js';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin.js';
import DateMixin from '../../../../mixins/date-mixin.js';
import CommonMixin from '../../../../mixins/common-mixin.js';
import UtilsMixin from '../../../../mixins/utils-mixin.js';
import { pageCommonStyles } from '../../../../styles/page-common-styles.js';
import { SharedStyles } from '../../../../styles/shared-styles.js';
import { gridLayoutStyles } from '../../../../styles/grid-layout-styles.js';
import { listFilterStyles } from '../../../../styles/list-filter-styles.js';
import { isEmptyObject } from '../../../../utils/utils.js';
import { fireEvent } from '../../../../utils/fire-custom-event.js';



/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin EtoolsCurrency
 * @appliesMixin AjaxErrorsParserMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin DateMixin
 * @appliesMixin CommonMixin
 * @appliesMixin UtilsMixin
 */
const InterventionProgressMixins = EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  EtoolsCurrency,
  AjaxErrorsParserMixin,
  EndpointsMixin,
  DateMixin,
  CommonMixin,
  UtilsMixin
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin InterventionProgressMixins
 */
class InterventionProgress extends InterventionProgressMixins {
  [x: string]: any;

  static get template() {
    return html`
     ${pageCommonStyles} ${SharedStyles} ${gridLayoutStyles} ${listFilterStyles}
      <style
          include="data-table-styles paper-material-styles">

        #progress-summary etools-progress-bar {
          margin-top: 16px;
        }

        #cash-progress etools-form-element-wrapper {
          width: 140px;
        }

        #cash-progress etools-form-element-wrapper:first-child {
          margin-right: 24px;
        }

        etools-data-table-row {
          --list-row-collapse-wrapper: {
            padding: 0;
          };
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
      </style>

      <div id="progress-summary" class="content-section paper-material" elevation="1">
        <div class="row-h">
          <div class="layout-vertical col-4">
            <etools-form-element-wrapper label="PD Duration"
                                          value="[[_getPdDuration(progress.start_date, progress.end_date)]]">
            </etools-form-element-wrapper>
            <etools-progress-bar value="[[pdProgress]]" no-decimals></etools-progress-bar>
          </div>
          <div class="layout-vertical col-4">
            <div class="layout-horizontal" id="cash-progress">
              <etools-form-element-wrapper label="Cash Transfered"
                                            value="[[latestAcceptedPr.programme_document.funds_received_to_date_currency]]
                                            [[displayCurrencyAmount(latestAcceptedPr.programme_document.funds_received_to_date, '0', 0)]]">
              </etools-form-element-wrapper>
              <etools-form-element-wrapper label="UNICEF Cash"
                                            value="[[latestAcceptedPr.programme_document.total_unicef_cash_currency]]
                                            [[displayCurrencyAmount(latestAcceptedPr.programme_document.total_unicef_cash, '0', 0)]]">
              </etools-form-element-wrapper>
            </div>
            <etools-progress-bar value="[[cashProgress]]" no-decimals></etools-progress-bar>
          </div>
          <div class="col col-4">
            <etools-form-element-wrapper label="Overall PD/SSFA Rating by UNICEF"
                                          value="[[_getOverallPdStatusDate(latestAcceptedPr.review_date)]]"
                                          no-placeholder>
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
          <etools-ram-indicators class="row-h" intervention-id="[[interventionId]]"
                                  cp-id="[[item.external_cp_output_id]]"></etools-ram-indicators>

          <div class="row-h" hidden$="[[!_emptyList(item.ll_outputs)]]">
            <p>There are no PD Outputs or SSFA Expected Results.</p>
          </div>

          <div class="lower-results-table" hidden$="[[_emptyList(item.ll_outputs)]]">

            <etools-data-table-header id="listHeader" no-title>
              <etools-data-table-column class="col-9">
                PD Outputs or SSFA Expected Results
              </etools-data-table-column>
              <etools-data-table-column class="col-3">
                Current progress (Last Reported on)
              </etools-data-table-column>
            </etools-data-table-header>

            <template is="dom-repeat" items="[[item.ll_outputs]]" as="lowerResult">
              <etools-data-table-row>
                <div slot="row-data">
                  <span class="col-data col-9">
                    [[lowerResult.title]]
                  </span>
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
                          <etools-progress-bar class="report-progress-bar"
                                                value="[[indicatorReport.reportable.progress_percentage]]">
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
                              indicatorReport.total.v, indicatorReport.total.c)]]"></indicator-report-target>
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

  static get properties() {
    return {
      interventionId: {
        type: Number
      },
      pdProgress: {
        type: Number,
        computed: '_getTimeProgress(progress.start_date, progress.end_date)'
      },
      cashProgress: {
        type: Number,
        computed: '_getCashProgress(latestAcceptedPr.programme_document.funds_received_to_date, ' +
        'latestAcceptedPr.programme_document.total_unicef_cash)'
      },
      progress: {
        type: Object,
        observer: '_progressDataObjChanged'
      },
      latestAcceptedPr: {
        type: Object,
        computed: '_computeLatestAcceptedPr(progress)'
      },
      indicatorReports: {
        type: Array,
        value: []
      }
    };
  }

  static get observers() {
    return [
      // `prpCountries` and `currentUser` are defined in endpoint behavior
      '_requestProgressData(interventionId, prpCountries, currentUser)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for progress tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'interv-page'});
    fireEvent(this, 'tab-content-attached');
  }

  _requestProgressData(id, prpCountries, currentUser) {
    if (!id || isEmptyObject(prpCountries) || isEmptyObject(currentUser)) {
      return;
    }
    let self = this;

    fireEvent(self, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'pd-progress'
    });

    this.fireRequest('interventionProgress', {pdId: id}).then(function(response: any) {
      self.set('progress', response);
      fireEvent(self, 'global-loading', {active: false, loadingSource: 'pd-progress'});
    }).catch(function(error: any) {
      let errMsg = 'PD/SSFA progress request failed!';
      self.logError(errMsg, 'intervention-progress', error);
      self.parseRequestErrorsAndShowAsToastMsgs(error, self);
      fireEvent(self, 'global-loading', {active: false, loadingSource: 'pd-progress'});
    });
  }

  _emptyList(dataSet) {
    return isEmptyObject(dataSet);
  }

  _computeLatestAcceptedPr(progress) {
    return (progress && progress.latest_accepted_pr) ? progress.latest_accepted_pr : null;
  }

  _progressDataObjChanged(progress) {
    if (!progress) {
      this.set('indicatorReports', []);
      return;
    }
    let self = this;
    if (!this._emptyList(progress.details.cp_outputs)) {
      progress.details.cp_outputs.forEach(function(result: any) {
        if (!self._emptyList(result.ll_outputs)) {
          result.ll_outputs.forEach(function(lowerResult: any) {
            self._prepareindicatorReportsData(lowerResult.id, progress.latest_accepted_pr_indicator_reports);
          });
        }
      });
    }
  }

  _prepareindicatorReportsData(lowerResultId: any, progressIndicatorReports: any) {
    let indicatorReportData = {
      lowerResultId: lowerResultId,
      reports: []
    };
    if (this._emptyList(progressIndicatorReports)) {
      return;
    }
    indicatorReportData.reports = progressIndicatorReports.filter(function(report) {
      return report.reportable_object_id === lowerResultId;
    });
    this.push('indicatorReports', indicatorReportData);
  }

  _countIndicatorReports(lowerResultId: any) {
    return !this._emptyList(this.indicatorReports) &&
        !!this.indicatorReports.find(function(indReports) {
          return indReports.lowerResultId === lowerResultId;
        });
  }

  _getIndicatorsReports(lowerResultId: any) {
    if (this._emptyList(this.indicatorReports)) {
      return [];
    }
    let indicatorsReports = this.indicatorReports.filter(function(indReports) {
      return indReports.lowerResultId === lowerResultId;
    });
    return indicatorsReports.length === 0 ? [] : indicatorsReports[0].reports;
  }

  /**
    * Assuming all indicators reports are already sort by date desc
    */
  _getLatestIndicatorReport(lowerResultId: any) {
    if (!this._emptyList(this.indicatorReports)) {
      let indReports = this.indicatorReports.find(function(indReports) {
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
    let latestIndReport = this._getLatestIndicatorReport(lowerResultId);
    if (latestIndReport) {
      status = latestIndReport.overall_status;
    }
    return status;
  }

  _getLowerResultStatusDate(lowerResultId) {
    let resultStatusDateStr = '';
    let latestIndReport = this._getLatestIndicatorReport(lowerResultId);
    if (latestIndReport) {
      let d = this._convertToDisplayFormat(latestIndReport.submission_date);
      resultStatusDateStr = '(' + this.prettyDate(d) + ')';
    }
    return resultStatusDateStr;
  }

  _getPdDuration(start, end) {
    start = this._convertToDisplayFormat(start) || 'N/A';
    end = this._convertToDisplayFormat(end) || 'N/A';
    return start + ' - ' + end;
  }

  _getTimeProgress(start, end) {
    let today = new Date();
    let startDt = this._EdgeAcceptableDateParse(start);
    let endDt = this._EdgeAcceptableDateParse(end);
    try {
      if (this.dateIsBetween(startDt, endDt, today)) {
        let intervalTotalDays = this.dateDiff(startDt, endDt);
        let intervalDaysCompleted = this.dateDiff(startDt, today);
        return intervalDaysCompleted * 100 / intervalTotalDays;
      }
    } catch (err) {
      this.logWarn('Time progress compute error', 'intervention-progress', err);
    }
    // if end date is valid and is past date or today's date, progress should be 100%
    if (this.isValidDate(endDt) &&
        (this.dateIsAfter(today, endDt) || this.datesAreEqual(today === endDt))) {
      return 100;
    }
    return 0;
  }

  _getCashProgress(actual, total) {
    return parseFloat(actual) * 100 / parseFloat(total);
  }

  _getOverallPdStatusDate(date) {
    return date ? ('(' + this._convertToDisplayFormat(date) + ')') : '';
  }

  _convertToDisplayFormat(strDt: string) {
    return moment(this._EdgeAcceptableDateParse(strDt)).format('D MMM YYYY');
  }

}

window.customElements.define('intervention-progress', InterventionProgress);
