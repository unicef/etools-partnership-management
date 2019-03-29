import { PolymerElement, html } from '@polymer/polymer';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import '@polymer/app-route/app-route.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/iron-pages/iron-pages.js';

import '../../layout/page-content-header';
import '../../layout//page-content-header-slotted-styles';
import '../../layout/etools-tabs';

import './components/report-status';
import './components/report-rating-dialog';
import './components/report-reject-dialog';
import {GenericObject, User} from '../../../typings/globals.types';
import ModuleMainElCommonFunctionalityMixin from '../mixins/module-common-mixin';
import ModuleRoutingMixin from '../mixins/module-routing-mixin';
import EndpointsMixin from '../../endpoints/endpoints-mixin';
import ScrollControl from '../../mixins/scroll-control-mixin';
import { pageLayoutStyles } from '../../styles/page-layout-styles';
import { SharedStyles } from '../../styles/shared-styles';
import { buttonsStyles } from '../../styles/buttons-styles';
import { pageContentHeaderSlottedStyles } from '../../layout/page-content-header-slotted-styles';
import ReportDetailsMixin from './mixins/report-details-mixin';
import { fireEvent } from '../../utils/fire-custom-event';
import { isEmptyObject } from '../../utils/utils';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../store';
declare const moment: any;


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ModuleMainElCommonFunctionalityMixin
 * @appliesMixin ModuleRouting
 * @appliesMixin ReportDetails
 * @appliesMixin EndpointsMixin
 * @appliesMixin ScrollControl
 */
class ReportsModule extends connect(store)(ModuleMainElCommonFunctionalityMixin(ModuleRoutingMixin(ReportDetailsMixin(EndpointsMixin(ScrollControl(PolymerElement)))))) {
  [x: string]: any;

  static get is() {
    return 'reports-module';
  }

  static get template() {
    return html`
    ${pageLayoutStyles} ${SharedStyles} ${buttonsStyles} ${pageContentHeaderSlottedStyles}
    <style>
        :host {
          display: block;
        }

        h1[main-title] sup {
          font-size: 14px;
        }
        iron-icon {
          color: var(--dark-secondary-text-color);
        }
        .tooltip-trigger {
          position: relative;
        }
        .no-right-padd {
          padding-right: 0;
        }
        .move-to-the-right {
          margin-right: -20px;
        }
        .secondary-title {
          font-size: 12px;
          font-weight: bold;
          color: var(--primary-color);
        }

        /* TODO: refactor export btn styles (maybe use a common style module) */
        #export paper-item {
          --paper-item-selected: {
            font-weight: normal !important;
          };
          /* Prevent first item highlighted by default */
          --paper-item-focused-before: {
            background: none;
            opacity: 0;
          };
          --paper-item-focused-after: {
            background: none;
            opacity: 0;
          }
        }
      </style>

      <app-route
          route="{{route}}"
          pattern="/list"
          query-params="{{listPageQueryParams}}"
          active="{{listActive}}"></app-route>

      <app-route
          route="{{route}}"
          pattern="/:id/:tab"
          active="{{tabsActive}}"
          data="{{routeData}}"></app-route>

      <page-content-header with-tabs-visible="[[tabsActive]]">
        <div slot="page-title">
          <template is="dom-if" if="[[listActive]]">
            Partner Reports
          </template>
          <template is="dom-if" if="[[tabsActive]]">
            <div class="secondary-title">
              <a target="_blank"
                href$="[[rootPath]]partners/[[report.partner_org_id]]/details">
                [[report.partner_org_name]] - [[report.partner_vendor_number]]
              </a>
            </div>

            <span id="tooltip-trigger-pdtitle" class="tooltip-trigger">
              <a class="primary"
                href$="[[rootPath]]interventions/[[report.programme_document.external_id]]/reports">
                  [[report.programme_document.reference_number]]
              </a>
            </span>

            <span>: [[report.report_type]][[report.report_number]] [[report.reporting_period]]</span>
            <!-- <sup>
              <report-status status="[[report.status]]"></report-status>
            </sup> -->
            <paper-tooltip for="tooltip-trigger-pdtitle"
                      position="bottom"
                      fit-to-visible-bounds
                      animation-delay="0"
                      offset="0">
              [[report.programme_document.title]]
            </paper-tooltip>
          </template>
        </div>

        <div slot="title-row-actions" class="content-header-actions move-to-the-right">

          <div class="action" hidden$="[[!listActive]]">
            <paper-menu-button id="export" close-on-activate horizontal-align="right">
              <paper-button slot="dropdown-trigger">
                <iron-icon icon="file-download"></iron-icon>
                Export
              </paper-button>
              <paper-listbox slot="dropdown-content">
                <paper-item on-tap="_exportIndicatorsPDF">Export Indicators - PDF</paper-item>
                <paper-item on-tap="_exportIndicatorsXLS">Export Indicators - XLS</paper-item>
              </paper-listbox>
            </paper-menu-button>
          </div>

          <div hidden$="[[_hideActionBtns(tabsActive, report)]]">
            <report-status status="[[report.review_overall_status]]" hidden$="[[statusIs(report.status, 'Sub')]]"></report-status>

            <paper-menu-button close-on-activate class="no-right-padd" hidden$="[[!statusIs(report.status, 'Sub')]]">
              <paper-button slot="dropdown-trigger" class="primary-btn">
                Accept / Send Back
              </paper-button>
              <paper-listbox slot="dropdown-content">
                <paper-item on-tap="_accept">Accept Report</paper-item>
                <paper-item on-tap="_sendBackToPartner">Send Back to Partner</paper-item>
              </paper-listbox>
            </paper-menu-button>

            <paper-menu-button close-on-activate horizontal-align="right">
                <iron-icon slot="dropdown-trigger" icon="more-vert"></iron-icon>
                <paper-listbox slot="dropdown-content">
                  <paper-item on-tap="_downloadAnexC">Download Report</paper-item>
                  <paper-item on-tap="_goToActionPointModule">Add Action Point</paper-item>
                  <paper-item on-tap="_downloadXls">Download XLS</paper-item>
                  <paper-item on-tap="_downloadPdf">Download PDF</paper-item>
                </paper-listbox>
              </paper-menu-button>

          </div>
        </div>

        <template is="dom-if" if="[[tabsActive]]">
          <etools-tabs slot="tabs"
                      tabs="[[reportTabs]]"
                      active-tab="{{routeData.tab}}"
                      on-iron-select="_handleTabSelectAction"></etools-tabs>
        </template>
      </page-content-header>

      <div id="main">
        <div id="pageContent">
          <iron-pages id="reportsPages"
                      selected="{{activePage}}"
                      attr-for-selected="name"
                      role="main">

            <template is="dom-if" if="[[_pageEquals(activePage, 'list')]]">
              <reports-list id="list"
                            name="list"
                            active="[[listActive]]"
                            url-params="[[preservedListQueryParams]]"></reports-list>
            </template>

            <template is="dom-if" if="[[_pageEquals(activePage, 'summary')]]">
              <report-summary name="summary"
                              report="[[report]]"
                              report-attachment="[[reportAttachment]]"></report-summary>
            </template>

            <template is="dom-if" if="[[_pageEquals(activePage, 'progress')]]">
              <report-progress id="reportDetails"
                              name="progress"
                              report="[[report]]"
                              report-attachment="[[reportAttachment]]"></report-progress>
            </template>
          </iron-pages>

        </div> <!-- page content end -->
        <!-- No sidebar here -->
      </div> <!-- main container end -->
    `;
  }

  static get properties() {
    return {
      reportTabs: {
        type: Array,
        value: [
          {
            tab: 'progress',
            tabLabel: 'Results Reported',
            hidden: false
          },
          {
            tab: 'summary',
            tabLabel: 'Other Info',
            hidden: false
          }
        ]
      },
      reportRatingDialog: {
        type: Object
      },
      reportRejectDialog: {
        type: Object
      },
      permissions: {
        type: Object
      },
      // This shouldn't be neccessary, but the Analyzer isn't picking up
      // Polymer.Element#rootPath
      rootPath: String,
      moduleName: {
        type: String,
        value: 'reports'
      }
    };
  }

  static get observers() {
    return [
      '_pageChanged(listActive, tabsActive, routeData)',
      '_loadReport(routeData.id, tabsActive, prpCountries, currentUser)',
      '_reportChanged(report)'
    ];
  }

  stateChanged(state: RootState) {
    this.repDetailsStateChanged(state);
  }

  ready() {
    super.ready();

    this.mockupListLoadedDebouncer = Debouncer.debounce(this.mockupListLoadedDebouncer,
        timeOut.after(500),
        () => {
          fireEvent(this, 'global-loading', {active: false});
        }
    );
  }

  connectedCallback() {
    super.connectedCallback();

    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'main-page'});
    /**
     * Loading msg used on stamping tabs elements (disabled in each tab main element attached callback)
     */
    let loadingMsg = 'Loading...';
    fireEvent(this, 'global-loading', {
      message: loadingMsg,
      active: true,
      loadingSource: 'reports-page'
    });

    this._createReportStatusUpdateDialogs();
  }

  _hideActionBtns(tabsActive: boolean, report: any) {
    if (!tabsActive) {
      return true;
    }
    if (!report) {
      return true;
    }

    return false;
  }

  _pageChanged(listActive: boolean, tabsActive: boolean, routeData: any) {
    // Using isActiveModule will prevent wrong page import
    if (!this.isActiveModule() || (!listActive && !tabsActive) || typeof routeData === 'undefined') {
      return;
    }

    this.scrollToTopOnCondition(!listActive);

    let fileImportDetails = {
      filenamePrefix: 'report',
      baseUrl: '../app-elements/reports/',
      importErrMsg: 'Reports page import error occurred',
      errMsgPrefixTmpl: '[report(s) ##page##]',
      loadingMsgSource: 'reports-page'
    };
    this.setActivePage(listActive, routeData.tab, fileImportDetails);
  }

  _handleTabSelectAction(e: CustomEvent) {
    this._showTabChangeLoadingMsg(e, 'reports-page', 'report-');
  }

  _loadReport(reportId: string, tabsActive: boolean, prpCountries: any, currentUser: User) {
    // Using isActiveModule will prevent report request with the wrong id (PD id)
    if (!this.isActiveModule() || isEmptyObject(prpCountries) || isEmptyObject(currentUser)) {
      return;
    }

    if (!tabsActive || !reportId) {
      return;
    }
    let id = parseInt(reportId, 10);
    if (this.report && this.report.id === id) {
      return;
    }
    setTimeout(() => {
      if (isNaN(id)) {
        fireEvent(this, 'toast', {text: 'Invalid report ID!', showCloseBtn: true});
        this.set('report', null);
        return;
      }
      this.loadingReportDataDebouncer = Debouncer.debounce(this.loadingReportDataDebouncer,
          timeOut.after(50),
          () => {
            this.requestReportDetails.bind(this, id)();
          }
      );
    }, 0);
  }

  _accept() {
    this.reportRatingDialog.open();
  }

  _sendBackToPartner() {
    this.reportRejectDialog.open();
  }

  _computeReportFilename(report: any) {
    return report.programme_document.reference_number + '_' + report.id + '_' + report.status + '.pdf';
  }

  _exportIndicatorsPDF() {
    this._exportIndicators('pdf');
  }

  _exportIndicatorsXLS() {
    this._exportIndicators('xlsx');
  }

  _exportIndicators(type: string) {
    const reportsList = this.shadowRoot.querySelector('#list');
    if (reportsList instanceof PolymerElement === false) {
      return;
    }

    let params: GenericObject = {};

    if (typeof reportsList.queryParams.pd_ref_title === 'string' && reportsList.queryParams.pd_ref_title !== '') {
      params.pd_ref_title = reportsList.queryParams.pd_ref_title;
    }

    if (reportsList.queryParams.status.length > 0) {
      params.report_status = reportsList.queryParams.status;
    }

    if (reportsList.queryParams.report_type) {
      params.report_type = reportsList.queryParams.report_type;
    }

    if (reportsList.queryParams.external_partner_id) {
      params.report_partner_external = reportsList.queryParams.external_partner_id;
    }

    if (reportsList.queryParams.cp_output) {
      params.cp_output = reportsList.queryParams.cp_output;
    }

    if (reportsList.queryParams.section) {
      params.report_section = reportsList.queryParams.section;
    }

    if (reportsList.queryParams.unicef_focal_points.length > 0) {
      params.unicef_focal_points = reportsList.queryParams.unicef_focal_points;
    }

    params.export = type;

    this.fireRequest('reportIndicatorsExport', {}, {method: 'GET', handleAs: 'blob', params: params})
        .then((blob: Blob) => this._handleBlobDataReceivedAndStartDownload(blob, 'Reports Indicators.' + type));
  }

  _downloadAnexC() {
    let filename = 'Progress Report.pdf';
    this._reportTokenizedDownload('downloadReportAnexC', filename);
  }

  _downloadXls() {
    let filename = '[' + this._getCurrentDateTime() + '] Progress Report(s) Summary.xls';
    this._reportTokenizedDownload('downloadReportXls', filename);
  }

  _getCurrentDateTime() {
    return moment(new Date()).format('ddd D MMM h-mm-ss YYYY');
  }

  _downloadPdf() {
    let filename = '[' + this._getCurrentDateTime() + '] Progress Report(s) Summary.pdf';
    this._reportTokenizedDownload('downloadReportPdf', filename);
  }

  _reportTokenizedDownload(endpoint: any, filename: string) {
    if (!this.report) {
      return;
    }

    this.fireRequest(endpoint, {reportId: this.report.id}, {method: 'GET', handleAs: 'blob'})
        .then((blob: Blob) => this._handleBlobDataReceivedAndStartDownload(blob, filename));
  }

  _handleBlobDataReceivedAndStartDownload(blob: Blob, filename: string) {
    if (window.navigator.userAgent.indexOf('Trident/') > -1) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      // create a blob url representing the data
      let url = window.URL.createObjectURL(blob);
      // attach blob url to anchor element with download attribute
      let anchor = document.createElement('a');
      anchor.setAttribute('href', url);
      anchor.setAttribute('download', filename);

      //* anchor.click() doesn't work on ff, edge
      anchor.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    }
  }

  _goToActionPointModule() {
    let a = document.createElement('a');
    a.setAttribute('target', '_blank');
    a.href = '/apd/';
    a.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.reportRatingDialog) {
      this.reportRatingDialog.removeEventListener('report-accepted', this._updateReportDetailsObj);
      document.querySelector('body')!.removeChild(this.reportRatingDialog);
    }
    if (this.reportRejectDialog) {
      this.reportRejectDialog.removeEventListener('report-rejected', this._updateReportDetailsObj);
      document.querySelector('body')!.removeChild(this.reportRejectDialog);
    }
  }

  _createReportStatusUpdateDialogs() {
    this._updateReportDetailsObj = this._updateReportDetailsObj.bind(this);

    this.reportRatingDialog = document.createElement('report-rating-dialog');
    this.reportRatingDialog.setAttribute('id', 'reportRatingDialog');
    this.reportRatingDialog.set('toastEventSource', this);
    this.reportRatingDialog.addEventListener('report-accepted', this._updateReportDetailsObj);

    document.querySelector('body')!.appendChild(this.reportRatingDialog);

    this.reportRejectDialog = document.createElement('report-reject-dialog');
    this.reportRejectDialog.setAttribute('id', 'reportRejectDialog');
    this.reportRejectDialog.set('toastEventSource', this);
    this.reportRejectDialog.addEventListener('report-rejected', this._updateReportDetailsObj);

    document.querySelector('body')!.appendChild(this.reportRejectDialog);
  }

  _reportChanged(report: any) {
    if (!report) {
      return;
    }
    this.reportRatingDialog.set('report', report);
    this.reportRejectDialog.set('report', report);
  }

  _updateReportDetailsObj(e: CustomEvent) {
    e.stopImmediatePropagation();
    if (!e.detail.report) {
      return;
    }
    this.set('report', e.detail.report);
    // update reports list object data without makeing a new request
    this._updateReportDataOnList(e.detail.report);
  }

  _updateReportDataOnList(report: any) {
    let list = this.shadowRoot.querySelector('#list');
    if (list) {
      let reportsDisplayList = list.shadowRoot.querySelector('reports-display-list');
      if (reportsDisplayList && !isEmptyObject(reportsDisplayList.reports)) {
        let currentReports = reportsDisplayList.reports;
        let index = -1;
        for (let i = 0; i < currentReports.length; i++) {
          if (currentReports[i].id === report.id) {
            index = i;
            break;
          }
        }
        if (index > -1) {
          // updates report found in list => update shown data
          reportsDisplayList.set(['reports', index, 'status'], report.status);
          // TODO: find out if any of the next report properties can change on accept/send back
          reportsDisplayList.set(['reports', index, 'due_date'], report.due_date);
          reportsDisplayList.set(['reports', index, 'submission_date'], report.submission_date);
          reportsDisplayList.set(['reports', index, 'review_date'], report.review_date);
          reportsDisplayList.set(['reports', index, 'reporting_period'], report.reporting_period);
          reportsDisplayList.set(['reports', index, 'sent_back_feedback'], report.sent_back_feedback);
        }

      }
    }
  }

  statusIs(currentStatus: string, status: string) {
    return currentStatus === status;
  }

}

window.customElements.define(ReportsModule.is, ReportsModule);
