import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import 'etools-dialog/etools-dialog.js';
import 'etools-behaviors/etools-mixin-factory.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import AjaxErrorsParserMixin from '../../../mixins/ajax-errors-parser-mixin';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import { SharedStyles } from '../../../styles/shared-styles';
import moment from 'moment';
import { fireEvent } from '../../../utils/fire-custom-event';


/*
  status: 'accepted'/'sent back'
  overall_status: if accepting, the status of things
  comment: required when sending a report back
*/
/**
 * @polymer
 * @customElement
 * @appliesMixin AjaxErrorsParser
 * @appliesMixin EndpointsMixin
 * @appliesMixin EventHelper
 */
class ReportRatingDialog extends EtoolsMixinFactory.combineMixins([
  AjaxErrorsParserMixin,
  EndpointsMixin
  ], PolymerElement) {

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
          ok-btn-text="Rate & Accept Report"
          cancel-btn-text="Cancel"
          dialog-title="Report for [[report.programme_document.reference_number]]: [[report.reporting_period]]"
          on-confirm-btn-clicked="saveStatus">
        <div id="content-box">
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

  static get properties() {
    return {
      report: Object,
      toastEventSource: {
        type: Object
      },
      selectedOverallStatus: {
        type: String,
        value: ''
      }
    };
  }

  open() {
    this.set('selectedOverallStatus', '');
    this.$.reportRatingDialog.set('opened', true);
  }

  close() {
    this.$.reportRatingDialog.set('opened', false);
  }

  startSpinner() {
    this.$.reportRatingDialog.startSpinner();
  }

  stopSpinner() {
    this.$.reportRatingDialog.stopSpinner();
  }

  getCurrentDate() {
    return moment(new Date()).format('D-MMM-YYYY');
  }

  saveStatus() {
    let self = this;
    let requestBody = {
      status: 'Acc',
      overall_status: this.selectedOverallStatus,
      reviewed_by_name: this.currentUser.name,
      review_date: this.getCurrentDate()
    };

    this.startSpinner();
    this.fireRequest(this, 'reportReview', {reportId: this.report.id}, {method: 'POST', body: requestBody})
        .then(function(response: any) {
          fireEvent(self, 'report-accepted', {report: response});
          self.stopSpinner();
          self.close();
        }).catch(function(error: any) {
      self._handleErrorResponse(error);
    });
  }

  _handleErrorResponse(error: any) {
    this.stopSpinner();
    this.parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
  }
}

window.customElements.define(ReportRatingDialog.is, ReportRatingDialog);
