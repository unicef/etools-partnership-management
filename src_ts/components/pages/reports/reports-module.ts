import {LitElement, html, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/iron-pages/iron-pages.js';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

import '../../common/components/page-content-header';

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
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../redux/store';
import {ReportsListEl} from './pages/list/reports-list';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {translate, get as getTranslation} from 'lit-translate';
import pmpEdpoints from '../../endpoints/endpoints';
import cloneDeep from 'lodash-es/cloneDeep';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';

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
  MatomoMixin(
    ScrollControlMixin(
      ModuleMainElCommonFunctionalityMixin(ModuleRoutingMixin(CommonMixin(ReportDetailsMixin(LitElement))))
    )
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

        .tooltip-trigger {
          position: relative;
        }
        .no-right-padd {
          padding-inline-end: 0;
        }
        .move-to-the-right {
          margin-inline-end: -20px;
        }
        .secondary-title {
          font-size: 12px;
          font-weight: bold;
          color: var(--primary-color);
        }
      </style>

      <page-content-header ?withTabsVisible="${this.tabsActive}">
        <div slot="page-title">
          ${this.listActive ? html`<span>${translate('PARTNER_REPORTS')}</span>` : ''}
          ${this.tabsActive
            ? html`
                <div class="secondary-title">
                  <a target="_blank" href="${this.rootPath}partners/${this.report?.partner_org_id}/details">
                    ${this.report?.partner_org_name} - ${this.report?.partner_vendor_number}
                  </a>
                </div>

                <span id="tooltip-trigger-pdtitle" class="tooltip-trigger">
                  <a class="primary" href="${this._getTitleLink(this.report)}">
                    ${this.report?.programme_document?.reference_number}
                  </a>
                </span>

                <span>: ${this.report?.report_type}${this.report?.report_number} ${this.report?.reporting_period}</span>
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
                  ${this.report?.programme_document?.title}
                </paper-tooltip>
              `
            : ''}
        </div>

        <div slot="title-row-actions" class="content-header-actions move-to-the-right">
          <div class="action" ?hidden="${!this.listActive}">
            <sl-dropdown>
              <sl-button slot="trigger" variant="text" class="export" caret>
                <iron-icon icon="file-download" slot="prefix"></iron-icon>
                ${translate('EXPORT')}
              </sl-button>
              <sl-menu>
                <sl-menu-item tracker="Export Indicators - PDF" @click="${this._exportIndicatorsPDF}"
                  >${translate('EXPORT_INDICATORS_PDF')}</sl-menu-item
                >
                <sl-menu-item tracker="Export Indicators - XLS" @click="${this._exportIndicatorsXLS}"
                  >${translate('EXPORT_INDICATORS_XLS')}</sl-menu-item
                >
              </sl-menu>
            </sl-dropdown>
          </div>

          <div ?hidden="${this._hideActionBtns(this.tabsActive, this.report)}">
            <report-status
              .status="${this.report?.status}"
              ?hidden="${this.statusIs(this.report?.status, 'Sub')}"
              tabindex="-1"
            ></report-status>

            <sl-dropdown
              ?hidden="${!this.statusIs(this.report?.status, 'Sub')}"
              tabindex="${this.statusIs(this.report?.status, 'Sub') ? undefined : -1}"
            >
              <sl-button variant="primary" slot="trigger" class="primary-btn"
                >${translate('ACCEPT_SEND_BACK')}</sl-button
              >
              <sl-menu>
                <sl-menu-item @click="${this._accept}">${translate('ACCEPT_REPORT')}</sl-menu-item>
                <sl-menu-item @click="${this._sendBackToPartner}">${translate('SEND_BACK_TO_PARTNER')}</sl-menu-item>
              </sl-menu>
            </sl-dropdown>

            <sl-dropdown>
              <sl-icon-button slot="trigger" name="more-vert"> </sl-icon-button>
              <sl-menu>
                <sl-menu-item @click="${this._downloadAnexC}">${translate('DOWNLOAD_REPORT')}</sl-menu-item>
                <sl-menu-item @click="${this._goToActionPointModule}">${translate('ADD_ACTION_POINTS')}</sl-menu-item>
                <sl-menu-item @click="${this._downloadXls}">${translate('DOWNLOAD_XLS')}</sl-menu-item>
                <sl-menu-item @click="${this._downloadPdf}">${translate('DOWNLOAD_PDF')}</sl-menu-item>
              </sl-menu>
            </sl-dropdown>
          </div>
        </div>

        ${this.tabsActive
          ? html` <sl-tab-group slot="tabs" @sl-tab-show="${this._handleTabSelectAction}">
              ${this.reportTabs?.map(
                (t) =>
                  html` <sl-tab slot="nav" panel="${t.tab}" ?active="${this.reduxRouteDetails?.subRouteName === t.tab}"
                    >${t.tabLabel}</sl-tab
                  >`
              )}
            </sl-tab-group>`
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
      tabLabel: getTranslation('RESULTS_REPORTED'),
      hidden: false
    },
    {
      tab: 'summary',
      tabLabel: getTranslation('OTHER_INFO'),
      hidden: false
    }
  ];

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: String})
  rootPath!: string;

  @property({type: String})
  moduleName = 'reports';

  @property({type: Object})
  reduxRouteDetails?: EtoolsRouteDetails;

  @property({type: String})
  _page = '';

  stateChanged(state: RootState) {
    this.endStateChanged(state);
    if (!state.app?.routeDetails?.routeName) {
      return;
    }

    if (state.app.routeDetails.routeName == 'reports') {
      this.reduxRouteDetails = state.app.routeDetails!;
      this.listActive = this.reduxRouteDetails?.subRouteName == 'list';
      this.tabsActive = !this.listActive;
      this.activePage = this.reduxRouteDetails?.subRouteName!;
      this._page = this.reduxRouteDetails?.subRouteName!;
    }
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
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'reports-page'
    });

    setTimeout(() => {
      fireEvent(this, 'global-loading', {active: false});
    }, 100);
    this.requestReportDetails = debounce(this.requestReportDetails.bind(this), 50) as any;
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('listActive') || changedProperties.has('tabsActive') || changedProperties.has('_page')) {
      this._pageChanged(this.listActive, this.tabsActive);
    }
    if (
      changedProperties.has('_page') ||
      changedProperties.has('tabsActive') ||
      changedProperties.has('prpCountries') ||
      changedProperties.has('currentUser') ||
      changedProperties.has('reduxRouteDetails')
    ) {
      this._loadReport(this.reduxRouteDetails?.params?.itemId, this.tabsActive, this.prpCountries, this.currentUser);
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

  _pageChanged(listActive: boolean, tabsActive: boolean) {
    // Using isActiveModule will prevent wrong page import
    if ((!listActive && !tabsActive) || !this.reduxRouteDetails || this.reduxRouteDetails.routeName !== 'reports') {
      return;
    }

    this.scrollToTopOnCondition(!listActive);
  }

  _handleTabSelectAction(e: CustomEvent) {
    this._showTabChangeLoadingMsg(e, 'reports-page', 'report-');
    const newTabName: string = e.detail.name;
    if (!this.report || !this.report.id || newTabName == this.activePage) {
      return;
    }
    const newPath = `reports/${this.report!.id}/${newTabName}`;
    history.pushState(window.history.state, '', `${ROOT_PATH}${newPath}`);
    window.dispatchEvent(new CustomEvent('popstate'));
  }

  _loadReport(reportId: string | number | undefined, tabsActive: boolean, prpCountries: any, currentUser: User) {
    // Using isActiveModule will prevent report request with the wrong id (PD id)
    if (this.reduxRouteDetails?.routeName !== 'reports' || isEmptyObject(prpCountries) || isEmptyObject(currentUser)) {
      return;
    }

    if (!tabsActive || !reportId) {
      return;
    }
    // @ts-ignore
    const id = parseInt(reportId, 10);
    if (this.report && this.report.id === id) {
      return;
    }
    setTimeout(() => {
      if (isNaN(id)) {
        fireEvent(this, 'toast', {
          text: getTranslation('INVALID_REPORT_ID')
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
        report: cloneDeep(this.report)
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
        report: cloneDeep(this.report)
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

  _getTitleLink(report: any) {
    return `${this.rootPath}interventions/${report?.programme_document?.external_id}/progress/reports`;
  }

  _exportIndicatorsPDF(e: CustomEvent) {
    this._exportIndicators(e, 'pdf');
  }

  _exportIndicatorsXLS(e: CustomEvent) {
    this._exportIndicators(e, 'xlsx');
  }

  _exportIndicators(e: CustomEvent, type: string) {
    this.trackAnalytics(e);
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
    const list = this.shadowRoot!.querySelector<ReportsListEl>('#list');
    if (list && this.elementIsImported(list)) {
      const currentReports = list.reports as any[];
      let index = -1;
      for (let i = 0; i < currentReports.length; i++) {
        if (currentReports[i].id === report.id) {
          index = i;
          break;
        }
      }
      if (index > -1) {
        // updates report found in list => update shown data
        currentReports[index].status = report.status;
        // TODO: find out if any of the next report properties can change on accept/send back
        currentReports[index].due_date = report.due_date;
        currentReports[index].submission_date = report.submission_date;
        currentReports[index].review_date = report.review_date;
        currentReports[index].reporting_period = report.reporting_period;
        currentReports[index].sent_back_feedback = report.sent_back_feedback;
        list.requestUpdate();
      }
    }
  }

  // Component is lazy loaded
  elementIsImported(element: any) {
    return !!element.shadowRoot;
  }

  statusIs(currentStatus: string, status: string) {
    return currentStatus === status;
  }
}
