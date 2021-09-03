import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-label/iron-label.js';
import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin.js';

import '../../../../layout/etools-form-element-wrapper';

import './sent-bk-comments.js';
import CommonMixin from '../../../../common/mixins/common-mixin.js';
import {PolymerElement, html} from '@polymer/polymer';
import {fireEvent} from '../../../../utils/fire-custom-event';
import CONSTANTS from '../../../../../config/app-constants.js';
import {pageCommonStyles} from '../../../../styles/page-common-styles';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../styles/shared-styles';
import {property} from '@polymer/decorators';
import {GenericObject} from '@unicef-polymer/etools-types';
import {openDialog} from '../../../../utils/dialog';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin EtoolsCurrency
 */
class ReportSummary extends CommonMixin(EtoolsCurrency(PolymerElement)) {
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
        iron-icon[icon='speaker-notes'] {
          color: var(--primary-color);
          padding-top: 14px;
          padding-left: 8px;
          cursor: pointer;
        }
        .report-status {
          display: flex;
          flex-direction: row;
          align-items: center;
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
          margin-left: 16px;
        }
      </style>
      <div class="content-section paper-material remove-padding" elevation="1">
        <div class="row-h b-border">
          <div class="col col-5">
            <etools-form-element-wrapper2 label="Submitted By" value="[[getDisplayValue(report.submitted_by)]]">
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-2">
            <etools-form-element-wrapper2 label="Submission Date" value="[[_displayOrDefault(report.submission_date)]]">
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-3 report-status" hidden$="[[statusIs(report.status, 'Sub')]]">
            <etools-form-element-wrapper2
              label="Report Status"
              class="w-auto"
              value="[[getReportStatus(report.status, report.reviewed_by_name)]]"
            >
            </etools-form-element-wrapper2>
            <iron-icon
              icon="speaker-notes"
              on-click="_seeSentBackComments"
              hidden$="[[!statusIs(report.status, 'Sen')]]"
            ></iron-icon>
          </div>
          <div class="col col-2" hidden$="[[statusIs(report.status, 'Sub')]]">
            <etools-form-element-wrapper2 label="Date of Status" value="[[_displayOrDefault(report.review_date)]]">
            </etools-form-element-wrapper2>
          </div>
        </div>

        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="Non-financial contribution during reporting period"
              value="[[getDisplayValue(report.partner_contribution_to_date)]]"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="Financial contribution during reporting period"
              value="[[getFinancialContributionText(report)]]"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="Challenges/Bottlenecks in the Reporting Period (latest)"
              value="[[getDisplayValue(report.challenges_in_the_reporting_period)]]"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="Proposed Way Forward (latest)"
              value="[[getDisplayValue(report.proposed_way_forward)]]"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-padding" hidden$="[[isPrpSRReport(report.report_type)]]">
          <template is="dom-repeat" items="[[reportAttachments]]">
            <div class="att">
              <iron-label for="file_[[index]]"> [[item.type]] </iron-label>

              <a class="primary" id="file_[[index]]" href="[[item.path]]" target="_blank"> [[item.file_name]] </a>
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

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for report summary tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'reports-page'
    });
  }

  /**
   * SR report check, used to hide attachment from this page. SR report attachment is displayed in progress tab
   * @param repType
   * @returns {boolean}
   */
  isPrpSRReport(repType: string) {
    return repType === CONSTANTS.REQUIREMENTS_REPORT_TYPE.SR;
  }

  getFinancialContributionText(report: GenericObject) {
    return `${this.displayCurrencyAmount(report.financial_contribution_to_date, '0.00')} ${this.getDisplayValue(
      report.financial_contribution_currency
    )}`;
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
    openDialog({
      dialog: 'sent-bk-comments',
      dialogData: {
        report: this.report
      }
    });
  }
}

window.customElements.define(ReportSummary.is, ReportSummary);
