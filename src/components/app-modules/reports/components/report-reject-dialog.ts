import '@polymer/paper-input/paper-input.js';
import 'etools-dialog/etools-dialog.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import AjaxErrorsParserMixin from '../../../mixins/ajax-errors-parser-mixin';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import { PolymerElement, html } from '@polymer/polymer';
import { SharedStyles } from '../../../styles/shared-styles';
import { requiredFieldStarredStyles } from '../../../styles/required-field-styles';
import moment from 'moment';



/**
 * @polymer
 * @customElement
 * @appliesMixin AjaxErrorsParser
 * @appliesMixin Endpoints
 * @appliesMixin EventHelper
 */
class ReportRejectDialog extends EtoolsMixinFactory.combineMixins([
  AjaxErrorsParserMixin,
  EndpointsMixin
  ], PolymerElement) {

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

        #content-box {
          margin-bottom: 20px;
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

  static get properties() {
    return {
      report: Object,
      toastEventSource: {
        type: Object
      },
      comment: {
        type: String,
        value: ''
      }
    };
  }

  open() {
    this.set('comment', '');
    this.$.reportRejectDialog.set('opened', true);
  }

  close() {
    this.$.reportRejectDialog.set('opened', false);
  }

  startSpinner() {
    this.$.reportRejectDialog.startSpinner();
  }

  stopSpinner() {
    this.$.reportRejectDialog.stopSpinner();
  }

  getCurrentDate() {
    return moment(new Date()).format('D-MMM-YYYY');
  }

  saveStatus() {
    let self = this;
    let requestBody = {
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
    this.parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
  }
}

window.customElements.define(ReportRejectDialog.is, ReportRejectDialog);
