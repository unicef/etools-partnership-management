import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import 'etools-data-table/etools-data-table';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin';
import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory';
import './report-status';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { fireEvent } from '../../../utils/fire-custom-event';
import {GenericObject, User} from '../../../../typings/globals.types';
import AjaxErrorsParserMixin from '../../../mixins/ajax-errors-parser-mixin';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import CommonMixin from '../../../mixins/common-mixin';
import PaginationMixin from '../../../mixins/pagination-mixin';
import { gridLayoutStyles } from '../../../styles/grid-layout-styles';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../store';
import { isJsonStrMatch, isEmptyObject } from '../../../utils/utils';



/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin AjaxErrorsParserMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin CommonMixin
 * @appliesMixin PaginationMixin
 */
const ReportsDisplayListMixins = EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  AjaxErrorsParserMixin,
  EndpointsMixin,
  CommonMixin,
  PaginationMixin,
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin ReportsDisplayListMixins
 */
class ReportsDisplayList extends connect(store)(ReportsDisplayListMixins) {
  [x: string]: any;
  static get is() {
    return 'reports-display-list';
  }

  static get template() {
    return html`
      ${gridLayoutStyles}
      <style include="data-table-styles paper-material-styles">
        :host {
          @apply --layout-flex;
          width: 100%;

          --paper-tooltip: {
            text-align: center;
            line-height: 1.4;
          };
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

      </style>

      <div id="list" class="paper-material" elevation="1">

        <template is="dom-if" if="[[!reports.length]]">
          <div class="row-h">
            <p>There are no reports yet.</p>
          </div>
        </template>

        <template is="dom-if" if="[[reports.length]]">
          <etools-data-table-header id="listHeader"
                                    label="[[paginator.visible_range.0]]-[[paginator.visible_range.1]]
                                      of [[paginator.count]] results to show">
            <etools-data-table-column class="col-2">
              Report #
            </etools-data-table-column>
            <etools-data-table-column class="flex-c">
              Partner
            </etools-data-table-column>
            <etools-data-table-column class="flex-c">
              Report Status
            </etools-data-table-column>
            <etools-data-table-column class="flex-c">
              Due Date
            </etools-data-table-column>
            <etools-data-table-column class="flex-c">
              Reporting Period
            </etools-data-table-column>
            <template is="dom-if" if="[[!noPdSsfaRef]]" restamp>
              <etools-data-table-column class="col-2">
                PD/SSFA ref.#
              </etools-data-table-column>
            </template>
          </etools-data-table-header>

          <template is="dom-repeat" items="[[reports]]" as="report" on-dom-change="_listDataChanged">
            <etools-data-table-row>

              <div slot="row-data">
                <span class="col-data col-2">
                  <span id$="tooltip-trigger-[[report.id]]" class="tooltip-trigger">
                    <a class="view-report"
                      href$="reports/[[report.id]]/progress"
                      hidden$="[[!_canViewReport(report.status)]]">
                      [[_getReportTitle(report)]]
                    </a>
                    <span hidden$="[[_canViewReport(report.status)]]">[[_getReportTitle(report)]]</span>
                    <template
                        is="dom-if"
                        if="[[report.is_final]]">
                      <span class="final-badge">final</span>
                    </template>
                  </span>
                  <paper-tooltip for$="tooltip-trigger-[[report.id]]"
                                position="right"
                                fit-to-visible-bounds>
                    [[report.programme_document.title]]
                  </paper-tooltip>
                </span>
                <span class="col-data flex-c">
                  <span id$="tooltip-partner-[[report.id]]" class="tooltip-trigger">
                    [[_displayOrDefault(report.partner_name)]]
                  </span>

                  <paper-tooltip for$="tooltip-partner-[[report.id]]"
                                  position="right"
                                  fit-to-visible-bounds>
                    [[report.partner_vendor_number]]
                  </paper-tooltip>
                </span>
                <span class="col-data flex-c">
                  <report-status status="[[report.status]]"></report-status>
                </span>
                <span class="col-data flex-c">
                  [[_displayOrDefault(report.due_date)]]
                </span>
                <span class="col-data flex-c">
                  [[getDisplayValue(report.reporting_period)]]
                </span>
                <template is="dom-if" if="[[!noPdSsfaRef]]" restamp>
                  <span class="col-data col-2">
                    <a class="pd-ref truncate"
                      href$="interventions/[[report.programme_document.external_id]]/details"
                      title$="[[getDisplayValue(report.programme_document.reference_number)]]">
                      [[getDisplayValue(report.programme_document.reference_number)]]
                    </a>
                  </span>
                </template>
              </div>

              <div slot="row-data-details">
                <div class="row-details-content">
                  <span class="rdc-title flex-c">UNICEF Focal Points</span>
                  <span>[[getDisplayValue(report.unicef_focal_points)]]</span>
                </div>
              </div>

            </etools-data-table-row>
          </template>

          <etools-data-table-footer
              page-size="[[paginator.page_size]]"
              page-number="[[paginator.page]]"
              total-results="[[paginator.count]]"
              visible-range="{{paginator.visible_range}}"
              on-page-size-changed="pageSizeChanged"
              on-page-number-changed="pageNumberChanged">
          </etools-data-table-footer>

        </template>
      </div>

    `;
  }

  static get properties() {
    return {
      currentUser: {
        type: Object,
        statePath: 'currentUser'
      },
      interventionId: {
        type: Number,
        value: 0
      },
      reports: {
        type: Array,
        value: []
      },
      noPdSsfaRef: {
        type: Boolean,
        value: false
      },
      queryParams: {
        type: Object,
        value: null,
        notify: true
      },
      debounceInterval: {
        type: Number,
        value: 100
      },
      waitQueryParamsInit: Boolean,
      _endpointName: {
        type: String,
        value: 'reports'
      },
      _lastParamsUsed: Object
    };
  }

  static get observers() {
    return [
      '_loadReportsData(prpCountries, interventionId, currentUser, paginator.page_size,' +
      ' paginator.page, queryParams.*, queryParams.status.length)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.currentUser, state.commonData!.currentUser)) {
      this.currentUser = state.commonData!.currentUser;
    }
  }

  _loadReportsData(prpCountries: any, interventionId: number, currentUser: User, _pageSize: number, _page: string, qParamsData: any) {
    if (isEmptyObject(currentUser) || this._queryParamsNotInitialized(qParamsData) ||
     isEmptyObject(prpCountries)) {
      return;
    }

    this._loadReportsDataDebouncer = Debouncer.debounce(this._loadReportsDataDebouncer,
        timeOut.after(this.debounceInterval),
        () => {
          let params = this._prepareReqParamsObj(interventionId);

          if (isJsonStrMatch(this._lastParamsUsed, params) ||
              (this.noPdSsfaRef && !params.programme_document_ext)) {
            return;
          }

          this._lastParamsUsed = Object.assign({}, params);

          fireEvent(this, 'global-loading', {
            message: 'Loading...',
            active: true,
            loadingSource: 'reports-list'
          });

          let activeReportsReq = this.getActiveRequestByKey(this._endpointName);
          if (activeReportsReq) {
            // abort previous req and then fire a new one with updated params
            this.abortActiveRequest(activeReportsReq);
          }

          this.fireRequest('reports', {}, {params: params}, this._endpointName)
              .then((response: any) => {
                if (response) {
                  this.set('reports', response.results);
                  this.updatePaginatorTotalResults(response);
                }
                fireEvent(this, 'global-loading', {active: false, loadingSource: 'reports-list'});
              })
              .catch((error: any) => {
                if (error.status === 0) {
                  // req aborted
                  return;
                }
                let errMsg = 'Reports list data request failed!';
                this.logError(errMsg, 'reports-list', error);

                this.parseRequestErrorsAndShowAsToastMsgs(error, this);
                fireEvent(this, 'global-loading', {active: false, loadingSource: 'reports-list'});
              });
        });
  }

  _prepareReqParamsObj(interventionId: number) {
    let params: GenericObject = {};
    if (interventionId > 0) {
      params.programme_document_ext = interventionId;
    }
    params = Object.assign({}, params, this._preserveExistingQueryParams(), this.getRequestPaginationParams());
    return params;
  }

  _canViewReport(status: string) {
    return ['Acc', 'Sen', 'Sub'].indexOf(status) > -1;
  }

  _preserveExistingQueryParams() {
    let params: GenericObject = {};
    if (!isEmptyObject(this.queryParams)) {
      Object.keys(this.queryParams).forEach((k: any) => {
        if ((this.queryParams[k] instanceof Array && this.queryParams[k].length > 0) ||
            (this.queryParams[k] instanceof Array === false && this.queryParams[k])) {
          params[k] = this.queryParams[k];
        }
      });
    }
    return params;
  }

  _queryParamsNotInitialized(qParamsData: any) {
    return this.waitQueryParamsInit && !qParamsData.value && qParamsData.path === 'queryParams';
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
    let rows = this.shadowRoot.querySelectorAll('etools-data-table-row');
    if (rows && rows.length) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].detailsOpened) {
          rows[i].set('detailsOpened', false);
        }
      }
    }
  }
}

window.customElements.define(ReportsDisplayList.is, ReportsDisplayList);
