import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {requiredFieldStarredStyles} from '../../../styles/required-field-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
declare const dayjs: any;
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../redux/store';
import {GenericObject} from '@unicef-polymer/etools-types';
import pmpEdpoints from '../../../endpoints/endpoints';
import {translate} from 'lit-translate';
import {get as getTranslation} from 'lit-translate/util';

/**
 * @LitElement
 * @customElement
 * @appliesMixin EndpointsMixin
 */
@customElement('report-reject-dialog')
export class ReportRejectDialog extends connect(store)(EndpointsLitMixin(LitElement)) {
  render() {
    return html`
      ${sharedStyles} ${requiredFieldStarredStyles}
      <style>
        [hidden] {
          display: none !important;
        }
      </style>

      <etools-dialog
        id="reportRejectDialog"
        size="md"
        keep-dialog-open
        spinner-text="${translate('SENDING_RATING')}"
        ?disable-confirm-btn="${!this.comment.length}"
        ok-btn-text="${translate('SEND_BACK_TO_PARTNER')}"
        dialog-title="${translate('REPORT_FOR')} ${this.report.programme_document
          .reference_number}: ${this.translateReportingPeriodText(this.report.reporting_period)}"
        ?show-spinner="${this.showSpinner}"
        @confirm-btn-clicked="${this.saveStatus}"
        @close="${this._onClose}"
      >
        <div id="content-box">
          <etools-input
            required
            label="${translate('FEEDBACK_COMMENTS')}"
            placeholder="&#8212;"
            .value="${this.comment}"
            @value-changed="${({detail}: CustomEvent) => (this.comment = detail.value)}"
          ></etools-input>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  report!: GenericObject;

  @property({type: Object})
  toastEventSource!: HTMLElement;

  @property({type: String})
  comment = '';

  @property({type: Boolean})
  showSpinner = false;

  set dialogData(data: any) {
    const {report}: any = data;
    this.report = report;
  }

  stateChanged(state: RootState) {
    this.endStateChanged(state);
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  getCurrentDate() {
    return dayjs(new Date()).format('D-MMM-YYYY');
  }
  translateReportingPeriodText(periodText: string) {
    if (periodText === 'No reporting period') {
      return getTranslation('NO_REPORTING_PERIOD');
    }
    return periodText;
  }
  saveStatus() {
    const requestBody = {
      status: 'Sen',
      comment: this.comment,
      reviewed_by_name: this.currentUser.name,
      review_date: this.getCurrentDate()
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

export {ReportRejectDialog as ReportRejectDialogEl};
