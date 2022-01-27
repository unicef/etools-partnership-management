import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import {SharedStyles} from '../../../styles/shared-styles';
declare const dayjs: any;
import {fireEvent} from '../../../utils/fire-custom-event';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {property} from '@polymer/decorators/lib/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {RootState, store} from '../../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import CONSTANTS from '../../../../config/app-constants.js';
import {GenericObject} from '@unicef-polymer/etools-types';

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
      </style>
      <etools-dialog
        id="reportRatingDialog"
        size="md"
        keep-dialog-open
        opened
        spinner-text="Sending rating..."
        disable-confirm-btn="[[!selectedOverallStatus.length]]"
        ok-btn-text="[[okBtnText]]"
        cancel-btn-text="Cancel"
        dialog-title="Report for [[report.programme_document.reference_number]]: [[report.reporting_period]]"
        on-confirm-btn-clicked="saveStatus"
        on-close="_onClose"
      >
        <div id="content-box" hidden$="[[isSRReport]]">
          <p>Rate the overall progress of this PD/SPD in light of this report and monitoring visits.</p>
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

  @property({type: String})
  selectedOverallStatus = '';

  @property({type: String})
  okBtnText = '';

  @property({type: Boolean})
  isSRReport!: boolean;

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
    this.set('selectedOverallStatus', this.isSRReport ? 'Met' : '');
    this.okBtnText = this.isSRReport ? 'Accept Report' : 'Rate & Accept Report';
    (this.$.reportRatingDialog as EtoolsDialog).opened = true;
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  startSpinner() {
    (this.$.reportRatingDialog as EtoolsDialog).startSpinner();
  }

  stopSpinner() {
    (this.$.reportRatingDialog as EtoolsDialog).stopSpinner();
  }

  getCurrentDate() {
    return dayjs(new Date()).format('D-MMM-YYYY');
  }

  saveStatus() {
    const requestBody = {
      status: 'Acc',
      overall_status: this.selectedOverallStatus,
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

window.customElements.define('report-rating-dialog', ReportRatingDialog);
export {ReportRatingDialog as ReportRatingDialogEl};
