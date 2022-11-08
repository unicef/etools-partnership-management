import {html, LitElement, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {requiredFieldStarredStyles} from '../../../styles/required-field-styles-lit';
import {fireEvent} from '../../../utils/fire-custom-event';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
declare const dayjs: any;
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../redux/store';
import {GenericObject} from '@unicef-polymer/etools-types';
import pmpEdpoints from '../../../endpoints/endpoints';

/**
 * @polymer
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
        opened
        spinner-text="Sending rating..."
        ?disable-confirm-btn="${!this.comment.length}"
        ok-btn-text="Send Back to Partner"
        dialog-title="Report for ${this.report.programme_document.reference_number}: ${this.report.reporting_period}"
        ?show-spinner="${this.showSpinner}"
        @confirm-btn-clicked="${this.saveStatus}"
        @close="${this._onClose}"
      >
        <div id="content-box">
          <paper-input
            required
            label="Feedback/Comments"
            placeholder="&#8212;"
            .value="${this.comment}"
            @value-changed="${({detail}: CustomEvent) => (this.comment = detail.value)}"
          ></paper-input>
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
