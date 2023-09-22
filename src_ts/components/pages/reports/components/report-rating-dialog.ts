import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
declare const dayjs: any;
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {RootState, store} from '../../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import CONSTANTS from '../../../../config/app-constants.js';
import {GenericObject} from '@unicef-polymer/etools-types';
import pmpEdpoints from '../../../endpoints/endpoints';

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
@customElement('report-rating-dialog')
export class ReportRatingDialog extends connect(store)(EndpointsLitMixin(LitElement)) {
  render() {
    return html`
      ${sharedStyles}
      <style>
        [hidden] {
          display: none !important;
        }
        sl-radio {
          display: inline-block;
          margin-inline-end: 15px;
        }
        sl-radio-group {
          margin-top: 10px;
          margin-bottom: 10px;
        }
      </style>
      <etools-dialog
        id="reportRatingDialog"
        size="md"
        keep-dialog-open
        spinner-text="Sending rating..."
        ?disable-confirm-btn="${!this.selectedOverallStatus.length}"
        ok-btn-text="${this.okBtnText}"
        dialog-title="Report for ${this.report.programme_document.reference_number}: ${this.report.reporting_period}"
        ?show-spinner="${this.showSpinner}"
        @confirm-btn-clicked="${this.saveStatus}"
        @close="${this._onClose}"
      >
        <div id="content-box" ?hidden="${this.isSRReport}">
          <p>Rate the overall progress of this PD/SPD in light of this report and monitoring visits.</p>
          <sl-radio-group
            id="overallStatus"
            .value="${this.selectedOverallStatus}"
            @sl-change="${(e: any) => {
              this.selectedOverallStatus = e.target.value;
            }}"
          >
            <sl-radio value="Met"> Met</sl-radio>
            <sl-radio value="OnT"> On track</sl-radio>
            <sl-radio value="NoP"> No progress</sl-radio>
            <sl-radio value="Con"> Constrained</sl-radio>
          </sl-radio-group>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  report!: GenericObject;

  @property({type: String})
  selectedOverallStatus = '';

  @property({type: String})
  okBtnText = '';

  @property({type: Boolean})
  isSRReport!: boolean;

  @property({type: Boolean})
  showSpinner = false;

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
    this.selectedOverallStatus = this.isSRReport ? 'Met' : '';
    this.okBtnText = this.isSRReport ? 'Accept Report' : 'Rate & Accept Report';
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
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
