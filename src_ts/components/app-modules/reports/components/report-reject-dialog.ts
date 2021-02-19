import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import {PolymerElement, html} from '@polymer/polymer';
import {SharedStyles} from '../../../styles/shared-styles';
import {requiredFieldStarredStyles} from '../../../styles/required-field-styles';
import {fireEvent} from '../../../utils/fire-custom-event';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
declare const dayjs: any;
import {property} from '@polymer/decorators/lib/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../store';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class ReportRejectDialog extends connect(store)(EndpointsMixin(PolymerElement)) {
  static get template() {
    return html`
      ${SharedStyles} ${requiredFieldStarredStyles}
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
        disable-confirm-btn="[[!comment.length]]"
        ok-btn-text="Send Back to Partner"
        cancel-btn-text="Cancel"
        dialog-title="Report for [[report.programme_document.reference_number]]: [[report.reporting_period]]"
        on-confirm-btn-clicked="saveStatus"
        on-close="_onClose"
      >
        <div id="content-box">
          <paper-input required label="Feedback/Comments" placeholder="&#8212;" value="{{comment}}"></paper-input>
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

  startSpinner() {
    (this.$.reportRejectDialog as EtoolsDialog).startSpinner();
  }

  stopSpinner() {
    (this.$.reportRejectDialog as EtoolsDialog).stopSpinner();
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

    this.startSpinner();
    this.fireRequest('reportReview', {reportId: this.report.id}, {method: 'POST', body: requestBody})
      .then((response: any) => {
        this.stopSpinner();
        fireEvent(this, 'dialog-closed', {confirmed: true, response: response});
      })
      .catch((error: any) => {
        this._handleErrorResponse(error);
      });
  }

  _handleErrorResponse(error: any) {
    this.stopSpinner();
    parseRequestErrorsAndShowAsToastMsgs(error, this);
  }
}

window.customElements.define('report-reject-dialog', ReportRejectDialog);
export {ReportRejectDialog as ReportRejectDialogEl};
