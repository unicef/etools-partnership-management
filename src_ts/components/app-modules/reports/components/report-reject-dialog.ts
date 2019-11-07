import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import {PolymerElement, html} from '@polymer/polymer';
import {SharedStyles} from '../../../styles/shared-styles';
import {requiredFieldStarredStyles} from '../../../styles/required-field-styles';
import {fireEvent} from '../../../utils/fire-custom-event';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../utils/ajax-errors-parser.js';
declare const moment: any;
import {property} from '@polymer/decorators/lib/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {GenericObject} from '../../../../typings/globals.types';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../store';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class ReportRejectDialog extends connect(store)(EndpointsMixin(PolymerElement)) {

  static get is() {
    return 'report-reject-dialog';
  }

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
          spinner-text="Sending rating..."
          disable-confirm-btn="[[!comment.length]]"
          ok-btn-text="Send Back to Partner"
          cancel-btn-text="Cancel"
          dialog-title="Report for [[report.programme_document.reference_number]]: [[report.reporting_period]]"
          on-confirm-btn-clicked="saveStatus">
        <div id="content-box">
          <paper-input required label="Feedback/Comments" placeholder="&#8212;" value="{{comment}}"></paper-input>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  report!: GenericObject;

  @property({type: Object})
  toastEventSource!: object;

  @property({type: String})
  comment: string = '';


  stateChanged(state: RootState) {
    this.endStateChanged(state);
  }

  open() {
    this.set('comment', '');
    (this.$.reportRejectDialog as EtoolsDialog).set('opened', true);
  }

  close() {
    (this.$.reportRejectDialog as EtoolsDialog).set('opened', false);
  }

  startSpinner() {
    (this.$.reportRejectDialog as EtoolsDialog).startSpinner();
  }

  stopSpinner() {
    (this.$.reportRejectDialog as EtoolsDialog).stopSpinner();
  }

  getCurrentDate() {
    return moment(new Date()).format('D-MMM-YYYY');
  }

  saveStatus() {
    const self = this;
    const requestBody = {
      status: 'Sen',
      comment: this.comment,
      reviewed_by_name: this.currentUser.name,
      review_date: this.getCurrentDate()
    };

    this.startSpinner();

    this.fireRequest('reportReview', {reportId: this.report.id}, {method: 'POST', body: requestBody})
      .then(function(response: any) {
        fireEvent(self, 'report-rejected', {report: response});
        self.stopSpinner();
        self.close();
      })
      .catch(function(error: any) {
        self._handleErrorResponse(error);
      });
  }

  _handleErrorResponse(error: any) {
    this.stopSpinner();
    parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
  }
}

window.customElements.define(ReportRejectDialog.is, ReportRejectDialog);
export {ReportRejectDialog as ReportRejectDialogEl};
