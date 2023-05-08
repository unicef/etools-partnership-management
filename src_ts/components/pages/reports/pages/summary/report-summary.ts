import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-label/iron-label.js';
import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin.js';

import '../../../../common/components/etools-form-element-wrapper';

import './sent-bk-comments.js';
import CommonMixinLit from '../../../../common/mixins/common-mixin-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import CONSTANTS from '../../../../../config/app-constants.js';
import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {GenericObject} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import cloneDeep from 'lodash-es/cloneDeep';
import {translate, get as getTranslation} from 'lit-translate';
import {getTranslatedValue, translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin EtoolsCurrency
 */
@customElement('report-summary')
export class ReportSummary extends CommonMixinLit(EtoolsCurrency(LitElement)) {
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
          padding-inline-start: 8px;
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
      </style>
      <div class="content-section paper-material elevation remove-padding" elevation="1">
        <div class="row-h b-border">
          <div class="col col-5">
            <etools-form-element-wrapper2
              label="${translate('SUBMITTED_BY')}"
              .value="${this.getDisplayValue(this.report.submitted_by)}"
            >
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-2">
            <etools-form-element-wrapper2
              label="${translate('SUBMISSION_DATE')}"
              .value="${this._displayOrDefault(this.report.submission_date)}"
            >
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-3 report-status" ?hidden="${this.statusIs(this.report.status, 'Sub')}">
            <etools-form-element-wrapper2
              label="${translate('REPORT_STATUS')}"
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
              label="${translate('DATE_OF_STATUS')}"
              .value="${this._displayOrDefault(this.report.review_date)}"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>

        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="${translate('NON-FINANCIAL_CONTRIBUTION_DURING_REPORTING_PERIOD')}"
              .value="${this.getDisplayValue(this.report.partner_contribution_to_date)}"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="${translate('FINANCIAL_CONTRIBUTION_DURING_REPORTING_PERIOD')}"
              .value="${this.getFinancialContributionText(this.report)}"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="${translate('CHALLENGES/BOTTLENECKS_IN_THE_REPORTING_PERIOD')}"
              .value="${this.getDisplayValue(this.report.challenges_in_the_reporting_period)}"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>
        <div class="row-h">
          <div class="col col-12">
            <etools-form-element-wrapper2
              label="${translate('PROPOSED_WAY_FORWARD')}"
              .value="${this.getDisplayValue(this.report.proposed_way_forward)}"
            >
            </etools-form-element-wrapper2>
          </div>
        </div>

        ${this.isFinalReport(this.report)
          ? html`<div class="row-h pb-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    label="${translate('RELEASE_CASH_IN_TIME')}"
                    .value="${this.getYesNoValue(this.report.final_review?.release_cash_in_time_choice)}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    .alwaysFloatLabel="${false}"
                    .noLabelFloat="${true}"
                    .value="${this.report.final_review?.release_cash_in_time_comment}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    label="${translate('RELEASE_SUPPLIES_IN_TIME')}"
                    .value="${this.getYesNoValue(this.report.final_review?.release_supplies_in_time_choice)}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    .alwaysFloatLabel="${false}"
                    .noLabelFloat="${true}"
                    .value="${this.report.final_review?.release_supplies_in_time_comment}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    label="${translate('FEEDBACK_FACE_FORM_IN_TIME')}"
                    .value="${this.getYesNoValue(this.report.final_review?.feedback_face_form_in_time_choice)}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    .alwaysFloatLabel="${false}"
                    .noLabelFloat="${true}"
                    .value="${this.report.final_review?.feedback_face_form_in_time_comment}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    label="${translate('RESPOND_REQUESTS_IN_TIME')}"
                    .value="${this.getYesNoValue(this.report.final_review?.respond_requests_in_time_choice)}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    .alwaysFloatLabel="${false}"
                    .noLabelFloat="${true}"
                    .value="${this.report.final_review?.respond_requests_in_time_comment}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    label="${translate('IMPLEMENTED_AS_PLANNED')}"
                    .value="${this.getYesNoValue(this.report.final_review?.implemented_as_planned_choice)}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    .alwaysFloatLabel="${false}"
                    .noLabelFloat="${true}"
                    .value="${this.report.final_review?.implemented_as_planned_comment}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    label="${translate('ACTION_TO_ADDRESS')}"
                    .value="${this.getYesNoValue(this.report.final_review?.action_to_address_choice)}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    .alwaysFloatLabel="${false}"
                    .noLabelFloat="${true}"
                    .value="${this.report.final_review?.action_to_address_comment}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pb-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    label="${translate('OVERALL_SATISFACTION')}"
                    .value="${this.getRatingValue(this.report.final_review?.overall_satisfaction_choice)}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>
              <div class="row-h pt-0">
                <div class="col col-12">
                  <etools-form-element-wrapper2
                    .alwaysFloatLabel="${false}"
                    .noLabelFloat="${true}"
                    .value="${this.report.final_review?.overall_satisfaction_comment}"
                  >
                  </etools-form-element-wrapper2>
                </div>
              </div>`
          : ''}
        <div class="row-padding" ?hidden="${this.isPrpSRReport(this.report.report_type)}">
          ${(this.reportAttachments || []).map(
            (item: any, index: number) => html`
              <div class="att">
                <iron-label for="file_${index}"> ${translateValue(item.type, 'COMMON_DATA.FILETYPES')} </iron-label>
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
        stat = `${getTranslation('SENT_BACK_BY')} `;
        break;
      case 'Sen':
        stat = `${getTranslation('ACCEPTED_BY')} `;
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

  _seeSentBackComments() {
    openDialog({
      dialog: 'sent-bk-comments',
      dialogData: {
        report: cloneDeep(this.report)
      }
    });
  }
}
