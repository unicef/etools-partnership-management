import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {EtoolsCurrency} from '@unicef-polymer/etools-unicef/src/mixins/currency.js';

import './sent-bk-comments.js';
import './accepted-comments.js';
import CommonMixinLit from '../../../../common/mixins/common-mixin-lit';
import CONSTANTS from '../../../../../config/app-constants.js';
import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {GenericObject} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import cloneDeep from 'lodash-es/cloneDeep';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {getTranslatedValue, translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

/**
 * @LitElement
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin EtoolsCurrency
 */
@customElement('report-summary')
export class ReportSummary extends CommonMixinLit(EtoolsCurrency(LitElement)) {
  static get styles() {
    return [layoutStyles, elevationStyles];
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
        etools-icon[name='speaker-notes'] {
          color: var(--primary-color);
          padding-top: 26px;
          padding-inline-start: 8px;
          cursor: pointer;
        }
        .report-status {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
        }
        .w-auto {
          width: auto;
        }
        label {
          display: block;
          font-size: var(--etools-font-size-12, 12px);
          color: var(--secondary-text-color);
        }
        .att {
          margin-bottom: 24px;
        }
        div[elevation] {
          padding: 15px 20px;
          background-color: var(--primary-background-color);
        }
        .pt-0 {
          padding-top: 0 !important;
        }
        .pb-0 {
          padding-bottom: 0 !important;
        }
        .row-padding {
          padding: 16px;
        }
      </style>
      <div class="content-section paper-material elevation remove-padding" elevation="1">
        <div class="row-h b-border">
          <div class="col col-5">
            <etools-input
              readonly
              placeholder="—"
              label="${translate('SUBMITTED_BY')}"
              .value="${this.getDisplayValue(this.report.submitted_by)}"
            >
            </etools-input>
          </div>
          <div class="col col-2">
            <etools-input
              readonly
              placeholder="—"
              label="${translate('SUBMISSION_DATE')}"
              .value="${this._displayOrDefault(this.report.submission_date)}"
            >
            </etools-input>
          </div>
          <div class="col col-3 report-status" ?hidden="${this.statusIs(this.report.status, 'Sub')}">
            <etools-input
              readonly
              placeholder="—"
              label="${translate('REPORT_STATUS')}"
              class="w-auto"
              .value="${this.getReportStatus(this.report.status, this.report.reviewed_by_name)}"
            >
            </etools-input>
            <etools-icon
              name="speaker-notes"
              @click="${this._seeComments}"
              ?hidden="${!(this.statusIs(this.report.status, 'Sen') || this.statusIs(this.report.status, 'Acc'))}"
            ></etools-icon>
          </div>
          <div class="col col-2" ?hidden="${this.statusIs(this.report.status, 'Sub')}">
            <etools-input
              readonly
              placeholder="—"
              label="${translate('DATE_OF_STATUS')}"
              .value="${this._displayOrDefault(this.report.review_date)}"
            >
            </etools-input>
          </div>
        </div>

        <div class="row-h">
          <div class="col col-12">
            <etools-textarea
              readonly
              placeholder="—"
              label="${translate('NON-FINANCIAL_CONTRIBUTION_DURING_REPORTING_PERIOD')}"
              .value="${this.getDisplayValue(this.report.partner_contribution_to_date)}"
            >
            </etools-textarea>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-textarea
              readonly
              placeholder="—"
              label="${translate('FINANCIAL_CONTRIBUTION_DURING_REPORTING_PERIOD')}"
              .value="${this.getFinancialContributionText(this.report)}"
            >
            </etools-textarea>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-textarea
              readonly
              placeholder="—"
              label="${translate('CHALLENGES/BOTTLENECKS_IN_THE_REPORTING_PERIOD')}"
              .value="${this.getDisplayValue(this.report.challenges_in_the_reporting_period)}"
            >
            </etools-textarea>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-textarea
              readonly
              placeholder="—"
              label="${translate('PROPOSED_WAY_FORWARD')}"
              .value="${this.getDisplayValue(this.report.proposed_way_forward)}"
            >
            </etools-textarea>
          </div>
        </div>

        ${this.isFinalReport(this.report)
          ? html`<div class="row-h pb-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    label="${translate('RELEASE_CASH_IN_TIME')}"
                    .value="${this.getYesNoValue(this.report.final_review?.release_cash_in_time_choice)}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    .value="${this.report.final_review?.release_cash_in_time_comment}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    label="${translate('RELEASE_SUPPLIES_IN_TIME')}"
                    .value="${this.getYesNoValue(this.report.final_review?.release_supplies_in_time_choice)}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    .value="${this.report.final_review?.release_supplies_in_time_comment}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    label="${translate('FEEDBACK_FACE_FORM_IN_TIME')}"
                    .value="${this.getYesNoValue(this.report.final_review?.feedback_face_form_in_time_choice)}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    .value="${this.report.final_review?.feedback_face_form_in_time_comment}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    label="${translate('RESPOND_REQUESTS_IN_TIME')}"
                    .value="${this.getYesNoValue(this.report.final_review?.respond_requests_in_time_choice)}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    .value="${this.report.final_review?.respond_requests_in_time_comment}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    label="${translate('IMPLEMENTED_AS_PLANNED')}"
                    .value="${this.getYesNoValue(this.report.final_review?.implemented_as_planned_choice)}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    .value="${this.report.final_review?.implemented_as_planned_comment}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    label="${translate('ACTION_TO_ADDRESS')}"
                    .value="${this.getYesNoValue(this.report.final_review?.action_to_address_choice)}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    .value="${this.report.final_review?.action_to_address_comment}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    label="${translate('OVERALL_SATISFACTION')}"
                    .value="${this.getRatingValue(this.report.final_review?.overall_satisfaction_choice)}"
                  >
                  </etools-input>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-input
                    readonly
                    placeholder="—"
                    .value="${this.report.final_review?.overall_satisfaction_comment}"
                  >
                  </etools-input>
                </div>
              </div>`
          : ''}
        <div class="row-padding" ?hidden="${this.isPrpSRReport(this.report.report_type)}">
          ${(this.reportAttachments || []).map(
            (item: any, index: number) => html`
              <div class="att">
                <label for="file_${index}"> ${translateValue(item.type, 'COMMON_DATA.FILETYPES')} </label>
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

  /**
   * SR report check, used to hide attachment from this page. SR report attachment is displayed in progress tab
   * @param repType
   * @returns {boolean}
   */
  isPrpSRReport(repType: string) {
    return repType === CONSTANTS.REQUIREMENTS_REPORT_TYPE.SR;
  }

  isFinalReport(report: GenericObject) {
    return report.is_final && !this.isPrpSRReport(report.report_type);
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
        stat = `${getTranslation('ACCEPTED_BY')} `;
        break;
      case 'Sen':
        stat = `${getTranslation('SENT_BACK_BY')} `;
        break;
      default:
        stat = '';
    }

    return stat + (username ? username : getTranslation('NA'));
  }

  statusIs(currentStatus: string, status: string) {
    return currentStatus === status;
  }

  getYesNoValue(value: any) {
    return getTranslatedValue(
      this.getDisplayValue(value === true ? 'yes' : value === false ? 'no' : value) as string,
      'GENERAL'
    );
  }

  getRatingValue(value: string) {
    return getTranslatedValue(this.getDisplayValue(value) as string, 'OVERALL_SATISFACTION_RATINGS');
  }

  _seeComments() {
    openDialog({
      dialog: this.report.status === 'Acc' ? 'accepted-comments' : 'sent-bk-comments',
      dialogData: {
        report: cloneDeep(this.report)
      }
    });
  }
}
