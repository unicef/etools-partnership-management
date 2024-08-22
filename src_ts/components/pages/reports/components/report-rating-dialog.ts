import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-radio/etools-radio-group';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import dayjs from 'dayjs';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {RootState, store} from '../../../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import CONSTANTS from '../../../../config/app-constants.js';
import {GenericObject} from '@unicef-polymer/etools-types';
import pmpEdpoints from '../../../endpoints/endpoints';
import {translate, get as getTranslation} from 'lit-translate';

/*
  status: 'accepted'/'sent back'
  overall_status: if accepting, the status of things
  comment: required when sending a report back
*/
/**
 * @LitElement
 * @customElement
 * @appliesMixin EndpointsMixin
 */
@customElement('report-rating-dialog')
export class ReportRatingDialog extends connect(store)(EndpointsLitMixin(LitElement)) {
  render() {
    return html`
      ${sharedStyles}
      <style>
        [hidden] {
          display: none !important;
        }
      </style>
      <etools-dialog
        id="reportRatingDialog"
        size="md"
        keep-dialog-open
        spinner-text="${translate('SENDING_RATING')}"
        ?disable-confirm-btn="${!this.selectedOverallStatus.length}"
        ok-btn-text="${this.okBtnText}"
        dialog-title="${translate('REPORT_FOR')} ${this.report.programme_document
          .reference_number}: ${this.translateReportingPeriodText(this.report.reporting_period)}"
        ?show-spinner="${this.showSpinner}"
        @confirm-btn-clicked="${this.saveStatus}"
        @close="${this._onClose}"
      >
        <div id="content-box" ?hidden="${this.isSRReport}">
          <p>${translate('RATE_THE_OVERALL_PROGRESS_OF_THIS_PD')}</p>
          <etools-radio-group
            id="overallStatus"
            .value="${this.selectedOverallStatus}"
            @sl-change="${(e: any) => {
              this.selectedOverallStatus = e.target.value;
            }}"
          >
            ${this.isFinalReport
              ? html`
                  <sl-radio value="AchievedAsP"> ${translate('ACHIEVED_AS_PLANNED')}</sl-radio>
                  <sl-radio value="NotAchievedAsP"> ${translate('NOT_ACHIEVED_AS_PLANNED')}</sl-radio>
                `
              : html`
                  <sl-radio value="Met"> ${translate('MET')}</sl-radio>
                  <sl-radio value="OnT"> ${translate('ON_TRACK')}</sl-radio>
                  <sl-radio value="NoP"> ${translate('NO_PROGRESS')}</sl-radio>
                  <sl-radio value="Con"> ${translate('CONSTRAINED')}</sl-radio>
                `}
          </etools-radio-group>
          <etools-input
            id="comment"
            label="${translate('COMMENT')}"
            .value="${this.acceptedComment}"
            @value-changed="${({detail}: CustomEvent) => {
              this.acceptedComment = detail.value;
            }}"
            placeholder="&#8212;"
            maxlength="50"
          ></etools-input>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  report!: GenericObject;

  @property({type: String})
  selectedOverallStatus = '';

  @property({type: String})
  acceptedComment = '';

  @property({type: String})
  okBtnText = '';

  @property({type: Boolean})
  isSRReport!: boolean;

  @property({type: Boolean})
  showSpinner = false;

  @property({type: Boolean})
  isFinalReport = false;

  set dialogData(data: any) {
    const {report}: any = data;
    this.report = report;
    this.init();
  }

  stateChanged(state: RootState) {
    this.endStateChanged(state);
  }

  init() {
    this.isSRReport = this.report.report_type === CONSTANTS.REQUIREMENTS_REPORT_TYPE.SR;
    this.isFinalReport = this.report.is_final;
    this.selectedOverallStatus = this.isSRReport && !this.isFinalReport ? 'Met' : '';
    this.okBtnText =
      this.isSRReport && !this.isFinalReport ? getTranslation('ACCEPT_REPORT') : getTranslation('RATE_ACCEPT_REPORT');
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  getCurrentDate() {
    return dayjs(new Date()).format('YYYY-MM-DD');
  }
  translateReportingPeriodText(periodText: string) {
    if (periodText === 'No reporting period') {
      return getTranslation('NO_REPORTING_PERIOD');
    }
    return periodText;
  }
  saveStatus() {
    const requestBody = {
      status: 'Acc',
      overall_status: this.selectedOverallStatus,
      reviewed_by_name: this.currentUser.name,
      review_date: this.getCurrentDate(),
      accepted_comment: this.acceptedComment
    };
    this.showSpinner = true;
    this.fireRequest(pmpEdpoints, 'reportReview', {reportId: this.report.id}, {method: 'POST', body: requestBody})
      .then((response: any) => {
        this.showSpinner = false;
        fireEvent(this, 'dialog-closed', {confirmed: true, response: response});
      })
      .catch((error: any) => {
        this._handleErrorResponse(error);
      });
  }

  _handleErrorResponse(error: any) {
    this.showSpinner = false;
    parseRequestErrorsAndShowAsToastMsgs(error, this);
  }
}

export {ReportRatingDialog as ReportRatingDialogEl};
