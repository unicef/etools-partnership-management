import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-label/iron-label.js';
import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin.js';

import '../../../../common/components/etools-form-element-wrapper';

import './sent-bk-comments.js';
import CommonMixin from '../../../../common/mixins/common-mixin-lit';
import {fireEvent} from '../../../../utils/fire-custom-event';
import CONSTANTS from '../../../../../config/app-constants.js';
import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {GenericObject} from '@unicef-polymer/etools-types';
import {openDialog} from '../../../../utils/dialog';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin EtoolsCurrency
 */
@customElement('report-summary')
export class ReportSummary extends CommonMixin(EtoolsCurrency(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, elevationStyles];
  }

  render() {
    if (!this.report) {
      return ``;
    }

    return html`
      ${pageCommonStyles} ${sharedStyles}
      <style>
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
        div[elevation] {
          padding: 15px 20px;
          background-color: var(--primary-background-color);
        }
      </style>
      <div class="content-section paper-material elevation remove-padding" elevation="1">
        <div class="row-h b-border">
          <div class="col col-5">
            <etools-form-element-wrapper2
              label="Submitted By"
              .value="${this.getDisplayValue(this.report.submitted_by)}"
            >
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-2">
            <etools-form-element-wrapper2
              label="Submission Date"
              .value="${this._displayOrDefault(this.report.submission_date)}"
            >
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-3 report-status" ?hidden="${this.statusIs(this.report.status, 'Sub')}">
            <etools-form-element-wrapper2
              label="Report Status"
              class="w-auto"
              .value="${this.getReportStatus(this.report.status, this.report.reviewed_by_name)}"
            >
            </etools-form-element-wrapper2>
            <iron-icon
              icon="speaker-notes"
              @click="${this._seeSentBackComments}"
              ?hidden="${!this.statusIs(this.report.status, 'Sen')}"
            ></iron-icon>
          </div>
          <div class="col col-2" ?hidden="${this.statusIs(this.report.status, 'Sub')}">
            <etools-form-element-wrapper2
              label="Date of Status"
              .value="${this._displayOrDefault(this.report.review_date)}"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>

        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="Non-financial contribution during reporting period"
              .value="${this.getDisplayValue(this.report.partner_contribution_to_date)}"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="Financial contribution during reporting period"
              .value="${this.getFinancialContributionText(this.report)}"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="Challenges/Bottlenecks in the Reporting Period (latest)"
              .value="${this.getDisplayValue(this.report.challenges_in_the_reporting_period)}"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="Proposed Way Forward (latest)"
              .value="${this.getDisplayValue(this.report.proposed_way_forward)}"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-padding" ?hidden="${this.isPrpSRReport(this.report.report_type)}">
          ${(this.reportAttachments || []).map(
            (item: any, index: number) => html`
              <div class="att">
                <iron-label for="file_${index}"> ${item.type} </iron-label>
                <a class="primary" id="file_${index}" href="${item.path}" target="_blank"> ${item.file_name} </a>
              </div>
            `
          )}
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
