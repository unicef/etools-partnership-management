import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-label/iron-label.js';
import {EtoolsCurrency} from 'etools-currency-amount-input/mixins/etools-currency-mixin.js';

import '../../../../layout/etools-form-element-wrapper.js';

import './sent-bk-comments.js';
import CommonMixin from '../../../../mixins/common-mixin.js';
import {PolymerElement, html} from '@polymer/polymer';
import {fireEvent} from '../../../../utils/fire-custom-event.js';
import CONSTANTS from '../../../../../config/app-constants.js';
import {pageCommonStyles} from '../../../../styles/page-common-styles.js';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles.js';
import {SharedStyles} from '../../../../styles/shared-styles.js';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../../typings/globals.types.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin EtoolsCurrency
 */
class ReportSummary extends (CommonMixin(EtoolsCurrency(PolymerElement))) {

  static get is() {
    return 'report-summary';
  }

  static get template() {
    return html`
     ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles}
      <style include="paper-material-styles">
        .remove-padding {
          padding: 0 !important;
        }
        iron-icon[icon="speaker-notes"] {
          color: var(--primary-color);
          padding-top: 14px;
          padding-left: 8px;
          cursor: pointer;
        }
        .report-status {
          @apply --layout-horizontal;
          @apply --layout-center;
        }
        .w-auto {
          width: auto;
        }

        iron-label {
          display: block;
          font-size: 12px;
          color: var(--secondary-text-color);
        }

        .att {
          margin-bottom: 24px;
        }

      </style>
      <div class="content-section paper-material remove-padding" elevation="1">
        <div class="row-h b-border">
          <div class="col col-5">
            <etools-form-element-wrapper label="Submitted By"
                                        value="[[getDisplayValue(report.submitted_by)]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-2">
            <etools-form-element-wrapper label="Submission Date"
                                        value="[[_displayOrDefault(report.submission_date)]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-3 report-status" hidden$="[[statusIs(report.status, 'Sub')]]">
            <etools-form-element-wrapper label="Report Status" class="w-auto"
                                          value="[[getReportStatus(report.status, report.reviewed_by_name)]]">
            </etools-form-element-wrapper>
            <iron-icon icon="speaker-notes" on-click="_seeSentBackComments" hidden$="[[!statusIs(report.status, 'Sen')]]"></iron-icon>
          </div>
          <div class="col col-2" hidden$="[[statusIs(report.status, 'Sub')]]">
            <etools-form-element-wrapper label="Date of Status"
                                          value="[[_displayOrDefault(report.review_date)]]">
            </etools-form-element-wrapper>
          </div>
        </div>

        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper label="Partner Contribution to Date"
                                        value="[[getDisplayValue(report.partner_contribution_to_date)]]">
            </etools-form-element-wrapper>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper label="Challneges/Bottlenecks in the Reporting Period (latest)"
                                        value="[[getDisplayValue(report.challenges_in_the_reporting_period)]]">
            </etools-form-element-wrapper>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper label="Proposed Way Forward (latest)"
                                        value="[[getDisplayValue(report.proposed_way_forward)]]">
            </etools-form-element-wrapper>
          </div>
        </div>
        <div class="row-padding"  hidden$="[[isPrpSRReport(report.report_type)]]">
          <template is="dom-repeat" items="[[reportAttachments]]">
            <div class="att">
              <iron-label for="file_[[index]]">
                [[item.type]]
              </iron-label>

              <a class="primary" id="file_[[index]]" href="[[item.path]]" target="_blank">
                [[item.file_name]]
              </a>
            </div>
          </template>

        </div>
      </div>
    `;
  }

  @property({type: Object})
  report!: GenericObject;

  @property({type: Array})
  reportAttachments!: any[];

  @property({type: Object})
  sentBkCommentsDialog!: any;

  ready() {
    super.ready();
    this._createSentBkCommentsDialog();
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for report summary tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'reports-page'});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.sentBkCommentsDialog) {
      document.querySelector('body')!.removeChild(this.sentBkCommentsDialog);
    }
  }

  _createSentBkCommentsDialog() {
    this.sentBkCommentsDialog = document.createElement('sent-bk-comments');
    document.querySelector('body')!.appendChild(this.sentBkCommentsDialog);
  }

  /**
   * SR report check, used to hide attachment from this page. SR report attachment is displayed in progress tab
   * @param repType
   * @returns {boolean}
   */
  isPrpSRReport(repType: string) {
    return repType === CONSTANTS.REQUIREMENTS_REPORT_TYPE.SR;
  }

  _displayOrDefault(val: string) {
    if (!val) {
      return '-';
    }
    return val;
  }

  getReportStatus(status: string, username: string) {
    let stat = '';
    switch (status) {
      case 'Acc':
        stat = 'Accepted by ';
        break;
      case 'Sen':
        stat = 'Sent back by ';
        break;
      default:
        stat = '';
    }

    return stat + (username ? username : 'N/A');
  }

  statusIs(currentStatus: string, status: string) {
    return currentStatus === status;
  }

  _seeSentBackComments() {
    if (this.sentBkCommentsDialog) {
      this.sentBkCommentsDialog.report = this.report;
      this.sentBkCommentsDialog.opened = true;
    }
  }

}

window.customElements.define(ReportSummary.is, ReportSummary);
