import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import {debounce} from '@unicef-polymer/etools-modules-common/dist/utils/debouncer';
import '@polymer/app-route/app-route.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/iron-pages/iron-pages.js';

import '../../common/components/page-content-header';
import '../../styles/page-content-header-slotted-styles';
import '../../common/components/etools-tabs';

import './components/report-status';
import './components/report-rating-dialog';
import './components/report-reject-dialog';

import {GenericObject, User} from '@unicef-polymer/etools-types';
import ModuleMainElCommonFunctionalityMixin from '../../common/mixins/module-common-mixin-lit';
import ModuleRoutingMixin from '../../common/mixins/module-routing-mixin-lit';
import ScrollControlMixin from '../../common/mixins/scroll-control-mixin-lit';
import CommonMixin from '../../common/mixins/common-mixin-lit';

import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {buttonsStyles} from '../../styles/buttons-styles-lit';
import {pageContentHeaderSlottedStyles} from '../../styles/page-content-header-slotted-styles-lit';

import ReportDetailsMixin from './mixins/report-details-mixin';
import {fireEvent} from '../../utils/fire-custom-event';
import {isEmptyObject} from '../../utils/utils';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../redux/store';
import {ReportsListEl} from './pages/list/reports-list';
import {openDialog} from '../../utils/dialog';
import set from 'lodash-es/set';
import {translate} from 'lit-translate';
import pmpEdpoints from '../../endpoints/endpoints';
declare const dayjs: any;

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ModuleMainElCommonFunctionalityMixin
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin ReportDetailsMixin
 * @appliesMixin ScrollControlMixin
 */
@customElement('reports-module')
export class ReportsModule extends connect(store)(
  ScrollControlMixin(
    ModuleMainElCommonFunctionalityMixin(ModuleRoutingMixin(CommonMixin(ReportDetailsMixin(LitElement))))
  )
) {
  render() {
    return html`
      ${pageLayoutStyles} ${sharedStyles} ${buttonsStyles} ${pageContentHeaderSlottedStyles}
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
          }
          /* Prevent first item highlighted by default */
          --paper-item-focused-before: {
            background: none;
            opacity: 0;
          }
          --paper-item-focused-after: {
            background: none;
            opacity: 0;
          }
        }
      </style>

      <app-route
        .route="${this.route}"
        @route-changed="${({detail}: CustomEvent) => {
          // Sometimes only __queryParams get changed
          // In this case  detail will contain detail.path = 'route._queryParams'
          // and value will contain only the value for this.route._queryParams and not the entire route object
          if (detail.path) {
            set(this, detail.path, detail.value);
            this.route = {...this.route};
          } else {
            this.route = detail.value;
          }
        }}"
        pattern="/list"
        .queryParams="${this.listPageQueryParams}"
        @query-params-changed="${({detail}: CustomEvent) => {
          setTimeout(() => {
            this.listPageQueryParams = detail.value;
          }, 100);
        }}"
        .active="${this.listActive}"
        @active-changed="${({detail}: CustomEvent) => {
          this.listActive = detail.value;
        }}"
      ></app-route>

      <app-route
        .route="${this.route}"
        @route-changed="${({detail}: CustomEvent) => {
          // Sometimes only __queryParams get changed
          // In this case  detail will contain detail.path = 'route._queryParams'
          // and value will contain only the value for this.route._queryParams and not the entire route object
          if (detail.path) {
            set(this, detail.path, detail.value);
            this.route = {...this.route};
          } else {
            this.route = detail.value;
          }
        }}"
        @data-changed="${({detail}: CustomEvent) => {
          this.routeData = detail.value;
        }}"
        pattern="/:id/:tab"
        .active="${this.tabsActive}"
        @active-changed="${({detail}: CustomEvent) => {
          this.tabsActive = detail.value;
        }}"
      ></app-route>

      <page-content-header ?with-tabs-visible="${this.tabsActive}">
        <div slot="page-title">
          ${this.listActive ? html`<span>${translate('PARTNER_REPORTS')}</span>` : ''}
          ${this.tabsActive
            ? html`
                <div class="secondary-title">
                  <a target="_blank" href="${this.rootPath}partners/${this.report.partner_org_id}/details">
                    ${this.report.partner_org_name} - ${this.report.partner_vendor_number}
                  </a>
                </div>

                <span id="tooltip-trigger-pdtitle" class="tooltip-trigger">
                  <a
                    class="primary"
                    href="${this.rootPath}interventions/${this.report.programme_document?.external_id}/reports"
                  >
                    ${this.report.programme_document?.reference_number}
                  </a>
                </span>

                <span>: ${this.report.report_type}${this.report.report_number} ${this.report.reporting_period}</span>
                <!-- <sup>
                  <report-status .status="report.status"></report-status>
                </sup> -->
                <paper-tooltip
                  for="tooltip-trigger-pdtitle"
                  position="bottom"
                  fit-to-visible-bounds
                  animation-delay="0"
                  offset="0"
                >
                  ${this.report.programme_document?.title}
                </paper-tooltip>
              `
            : ''}
        </div>

        <div slot="title-row-actions" class="content-header-actions move-to-the-right">
          <div class="action" ?hidden="${!this.listActive}">
            <paper-menu-button id="export" close-on-activate horizontal-align="right">
              <paper-button slot="dropdown-trigger">
                <iron-icon icon="file-download"></iron-icon>
                ${translate('EXPORT')}
              </paper-button>
              <paper-listbox slot="dropdown-content">
                <paper-item @click="${this._exportIndicatorsPDF}">Export Indicators - PDF</paper-item>
                <paper-item @click="${this._exportIndicatorsXLS}">Export Indicators - XLS</paper-item>
              </paper-listbox>
            </paper-menu-button>
          </div>

          <div ?hidden="${this._hideActionBtns(this.tabsActive, this.report)}">
            <report-status
              .status="${this.report.status}"
              ?hidden="${this.statusIs(this.report.status, 'Sub')}"
            ></report-status>

            <paper-menu-button
              close-on-activate
              class="no-right-padd"
              ?hidden="${!this.statusIs(this.report.status, 'Sub')}"
            >
              <paper-button slot="dropdown-trigger" class="primary-btn">${translate('ACCEPT_SEND_BACK')}</paper-button>
              <paper-listbox slot="dropdown-content">
                <paper-item @click="${this._accept}">${translate('ACCEPT_REPORT')}</paper-item>
                <paper-item @click="${this._sendBackToPartner}">${translate('SEND_BACK_TO_PARTNER')}</paper-item>
              </paper-listbox>
            </paper-menu-button>

            <paper-menu-button close-on-activate horizontal-align="right">
              <iron-icon slot="dropdown-trigger" icon="more-vert"></iron-icon>
              <paper-listbox slot="dropdown-content">
                <paper-item @click="${this._downloadAnexC}">${translate('DOWNLOAD_REPORT')}</paper-item>
                <paper-item @click="${this._goToActionPointModule}">${translate('ADD_ACTION_POINTS')}</paper-item>
                <paper-item @click="${this._downloadXls}">Download XLS</paper-item>
                <paper-item @click="${this._downloadPdf}">Download PDF</paper-item>
              </paper-listbox>
            </paper-menu-button>
          </div>
        </div>

        ${this.tabsActive
          ? html` <etools-tabs
              slot="tabs"
              .tabs="${this.reportTabs}"
              .activeTab="${(this.routeData || {}).tab}"
              @iron-select="${this._handleTabSelectAction}"
            ></etools-tabs>`
          : ''}
      </page-content-header>

      <div id="main">
        <div id="pageContent">
          <reports-list
            ?hidden="${!this._pageEquals(this.activePage, 'list')}"
            id="list"
            name="list"
            .active="${this.listActive}"
            .urlParams="${this.preservedListQueryParams}"
          ></reports-list>

          <report-summary
            ?hidden="${!this._pageEquals(this.activePage, 'summary')}"
            id="summary"
            name="summary"
            .report="${this.report}"
            .reportAttachments="${this.reportAttachments}"
          ></report-summary>

          <report-progress
            ?hidden="${!this._pageEquals(this.activePage, 'progress')}"
            id="progress"
            name="progress"
            .report="${this.report}"
            .reportAttachments="${this.reportAttachments}"
          ></report-progress>
        </div>
        <!-- page content end -->
        <!-- No sidebar here -->
      </div>
      <!-- main container end -->
    `;
  }

  @property({type: Array})
  reportTabs: GenericObject[] = [
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
  ];

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: String})
  rootPath!: string;

  @property({type: String})
  moduleName = 'reports';

  stateChanged(state: RootState) {
    this.endStateChanged(state);
  }

  connectedCallback() {
    super.connectedCallback();

    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'main-page'
    });
    /**
     * Loading msg used on stamping tabs elements (disabled in each tab main element attached callback)
     */
    const loadingMsg = 'Loading...';
    fireEvent(this, 'global-loading', {
      message: loadingMsg,
      active: true,
      loadingSource: 'reports-page'
    });

    setTimeout(() => {
      fireEvent(this, 'global-loading', {active: false});
    }, 100);
    this.requestReportDetails = debounce(this.requestReportDetails.bind(this), 50) as any;
  }

  updated(changedProperties: PropertyValues) {
    if (
      changedProperties.has('listActive') ||
      changedProperties.has('tabsActive') ||
      changedProperties.has('routeData')
    ) {
      this._pageChanged(this.listActive, this.tabsActive, this.routeData);
    }
    if (
      changedProperties.has('routeData') ||
      changedProperties.has('tabsActive') ||
      changedProperties.has('prpCountries') ||
      changedProperties.has('currentUser')
    ) {
      this._loadReport((this.routeData || {}).id, this.tabsActive, this.prpCountries, this.currentUser);
    }
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

    const fileImportDetails = {
      filenamePrefix: 'report',
      baseUrl: '../app-elements/reports/',
      importErrMsg: 'Reports page import error occurred',
      errMsgPrefixTmpl: '[report(s) ##page##]',
      loadingMsgSource: 'reports-page'
    };
    const page: string = listActive ? 'list' : routeData.tab;
    this.setActivePage(page, fileImportDetails);
  }

  _handleTabSelectAction(e: CustomEvent) {
    this._showTabChangeLoadingMsg(e, 'reports-page', 'report-');
    const newTabName: string = e.detail.item.getAttribute('name');
    if (!this.report || !this.report.id || newTabName == this.activePage) {
      return;
    }
    const newPath = `reports/${this.report!.id}/${newTabName}`;
    fireEvent(this, 'update-main-path', {path: newPath});
  }

  _loadReport(reportId: string, tabsActive: boolean, prpCountries: any, currentUser: User) {
    // Using isActiveModule will prevent report request with the wrong id (PD id)
    if (!this.isActiveModule() || isEmptyObject(prpCountries) || isEmptyObject(currentUser)) {
      return;
    }

    if (!tabsActive || !reportId) {
      return;
    }
    const id = parseInt(reportId, 10);
    if (this.report && this.report.id === id) {
      return;
    }
    setTimeout(() => {
      if (isNaN(id)) {
        fireEvent(this, 'toast', {
          text: 'Invalid report ID!',
          showCloseBtn: true
        });
        this.report = null;
        return;
      }
      this.requestReportDetails(id ? id.toString() : '');
    }, 0);
  }

  _accept() {
    openDialog({
      dialog: 'report-rating-dialog',
      dialogData: {
        report: this.report
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      this._updateReportDetailsObj(response);
    });
  }

  _sendBackToPartner() {
    openDialog({
      dialog: 'report-reject-dialog',
      dialogData: {
        report: this.report
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      this._updateReportDetailsObj(response);
    });
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
    const reportsList = this.shadowRoot!.querySelector('#list') as ReportsListEl;
    if (reportsList instanceof LitElement === false) {
      return;
    }

    const params: GenericObject = {};
    const queryParams = reportsList.routeDetails?.queryParams || {};
    if (typeof queryParams.pd_ref_title === 'string' && queryParams.pd_ref_title !== '') {
      params.pd_ref_title = queryParams.pd_ref_title;
    }

    if (queryParams.status && queryParams.status.length > 0) {
      params.report_status = queryParams.status;
    }

    if (queryParams.report_type) {
      params.report_type = queryParams.report_type;
    }

    if (queryParams.external_partner_id) {
      params.report_partner_external = queryParams.external_partner_id;
    }

    if (queryParams.cp_output) {
      params.cp_output = queryParams.cp_output;
    }

    if (queryParams.section) {
      params.report_section = queryParams.section;
    }

    if (queryParams.unicef_focal_points && queryParams.unicef_focal_points.length > 0) {
      params.unicef_focal_points = queryParams.unicef_focal_points;
    }

    params.export = type;

    this.fireRequest(pmpEdpoints, 'reportIndicatorsExport', {}, {method: 'GET', handleAs: 'blob', params: params}).then(
      (blob: Blob) => this._handleBlobDataReceivedAndStartDownload(blob, 'Reports Indicators.' + type)
    );
  }

  _downloadAnexC() {
    const filename = 'Progress Report.pdf';
    this._reportTokenizedDownload('downloadReportAnexC', filename);
  }

  _downloadXls() {
    const filename = '[' + this._getCurrentDateTime() + '] Progress Report(s) Summary.xls';
    this._reportTokenizedDownload('downloadReportXls', filename);
  }

  _getCurrentDateTime() {
    return dayjs(new Date()).format('ddd D MMM h-mm-ss YYYY');
  }

  _downloadPdf() {
    const filename = '[' + this._getCurrentDateTime() + '] Progress Report(s) Summary.pdf';
    this._reportTokenizedDownload('downloadReportPdf', filename);
  }

  _reportTokenizedDownload(endpoint: any, filename: string) {
    if (!this.report) {
      return;
    }

    this.fireRequest(pmpEdpoints, endpoint, {reportId: this.report.id}, {method: 'GET', handleAs: 'blob'}).then(
      (blob: Blob) => this._handleBlobDataReceivedAndStartDownload(blob, filename)
    );
  }

  _handleBlobDataReceivedAndStartDownload(blob: Blob, filename: string) {
    if (window.navigator.userAgent.indexOf('Trident/') > -1) {
      (window.navigator as any).msSaveBlob(blob, filename);
    } else {
      // create a blob url representing the data
      const url = window.URL.createObjectURL(blob);
      // attach blob url to anchor element with download attribute
      const anchor = document.createElement('a');
      anchor.setAttribute('href', url);
      anchor.setAttribute('download', filename);

      //* anchor.click() doesn't work on ff, edge
      anchor.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    }
  }

  _goToActionPointModule() {
    const a = document.createElement('a');
    a.setAttribute('target', '_blank');
    a.href = '/apd/';
    a.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
  }

  _updateReportDetailsObj(report: any) {
    if (!report) {
      return;
    }
    this.report = report;
    // update reports list object data without makeing a new request
    this._updateReportDataOnList(report);
  }

  _updateReportDataOnList(report: any) {
    const list = this.shadowRoot!.querySelector('#list');
    if (list) {
      const reportsDisplayList = list.shadowRoot!.querySelector('reports-display-list') as GenericObject;
      if (reportsDisplayList && !isEmptyObject(reportsDisplayList.reports)) {
        const currentReports = reportsDisplayList.reports;
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
