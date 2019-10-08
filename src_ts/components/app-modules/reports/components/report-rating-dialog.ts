import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import {SharedStyles} from '../../../styles/shared-styles';
declare const moment: any;
import {fireEvent} from '../../../utils/fire-custom-event';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../utils/ajax-errors-parser.js';
import {property} from '@polymer/decorators/lib/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {GenericObject} from '../../../../typings/globals.types';
import {RootState, store} from '../../../../store';
import {connect} from 'pwa-helpers/connect-mixin';
import CONSTANTS from '../../../../config/app-constants.js';

/*
  status: 'accepted'/'sent back'
  overall_status: if accepting, the status of things
  comment: required when sending a report back
*/
/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class ReportRatingDialog extends connect(store)(EndpointsMixin(PolymerElement)) {

  static get template() {
    return html`
      ${SharedStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        #content-box {
          margin-bottom: 20px;
        }
      </style>
      <etools-dialog
          id="reportRatingDialog"
          size="md"
          keep-dialog-open
          spinner-text="Sending rating..."
          disable-confirm-btn="[[!selectedOverallStatus.length]]"
          ok-btn-text="[[okBtnText]]"
          cancel-btn-text="Cancel"
          dialog-title="Report for [[report.programme_document.reference_number]]: [[report.reporting_period]]"
          on-confirm-btn-clicked="saveStatus">
        <div id="content-box" hidden$="[[isSRReport]]">
          <p>Rate the overall progress of this PD/SSFA in light of this report and monitoring visits.</p>
          <paper-radio-group id="overallStatus" selected="{{selectedOverallStatus}}">
            <paper-radio-button name="Met"> Met</paper-radio-button>
            <paper-radio-button name="OnT"> On track</paper-radio-button>
            <paper-radio-button name="NoP"> No progress</paper-radio-button>
            <paper-radio-button name="Con"> Constrained</paper-radio-button>
          </paper-radio-group>
        </div>
      </etools-dialog>
    `;
  }
  static get is() {
    return 'report-rating-dialog';
  }

  @property({type: Object})
  report!: GenericObject;

  @property({type: Object})
  toastEventSource!: object;

  @property({type: String})
  selectedOverallStatus: string = '';

  @property({type: String})
  okBtnText: string = '';

  @property({type: Boolean})
  isSRReport!: boolean;

  stateChanged(state: RootState) {
    this.endStateChanged(state);
  }

  open() {
    this.set('selectedOverallStatus', '');
    this.isSRReport = this.report.report_type === CONSTANTS.REQUIREMENTS_REPORT_TYPE.SR;
    this.okBtnText = this.isSRReport ? 'Accept Report' : 'Rate & Accept Report';
    (this.$.reportRatingDialog as EtoolsDialog).set('opened', true);
  }

  close() {
    (this.$.reportRatingDialog as EtoolsDialog).set('opened', false);
  }

  startSpinner() {
    (this.$.reportRatingDialog as EtoolsDialog).startSpinner();
  }

  stopSpinner() {
    (this.$.reportRatingDialog as EtoolsDialog).stopSpinner();
  }

  getCurrentDate() {
    return moment(new Date()).format('D-MMM-YYYY');
  }

  saveStatus() {
    const self = this;
    const requestBody = {
      status: 'Acc',
      overall_status: this.selectedOverallStatus,
      reviewed_by_name: this.currentUser.name,
      review_date: this.getCurrentDate()
    };

    this.startSpinner();
    this.fireRequest('reportReview', {reportId: this.report.id}, {method: 'POST', body: requestBody})
      .then(function (response: any) {
        fireEvent(self, 'report-accepted', {report: response});
        self.stopSpinner();
        self.close();
      }).catch(function (error: any) {
        self._handleErrorResponse(error);
      });
  }

  _handleErrorResponse(error: any) {
    this.stopSpinner();
    parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
  }
}

window.customElements.define(ReportRatingDialog.is, ReportRatingDialog);
export {ReportRatingDialog as ReportRatingDialogEl};
