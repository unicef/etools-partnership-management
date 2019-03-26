import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
import 'etools-dialog/etools-dialog.js';
import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory';
import EndpointsMixin from '../../../../../../endpoints/endpoints-mixin';
import { fireEvent } from '../../../../../../utils/fire-custom-event';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../../../../utils/ajax-errors-parser.js';
import {logError} from 'etools-behaviors/etools-logging.js';


/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class PdLowerResultName extends EtoolsMixinFactory.combineMixins([
  EndpointsMixin,
], PolymerElement) {
  [x: string]: any;

  static get template() {
    return html`
      <style>
        .pd-output-name {
          padding: 0 0 30px;
        }
      </style>

      <etools-dialog id="pdLowerResultNameDialog"
                    size="md"
                    dialog-title="Add/Update PD Output or SSFA Expected Result"
                    ok-btn-text="Add/Update"
                    disable-confirm-btn="[[disableConfirmBtn]]"
                    keep-dialog-open
                    spinner-text="Saving..."
                    on-confirm-btn-clicked="_saveChanges">

        <div class="pd-output-name">
          <paper-input id="pdLowerResultNameField"
                      label="PD Output or SSFA expected result"
                      placeholder="&#8212;"
                      value="{{lowerResultName}}"
                      required
                      auto-validate
                      error-message="PD Output or SSFA expected result must be specified">
          </paper-input>
        </div>

      </etools-dialog>
    `;
  }

  static get properties() {
    return {
      expectedResultId: Number,
      lowerResultId: Number,
      lowerResultName: {
        type: String,
        value: []
      },
      opened: {
        type: Boolean,
        value: false
      },
      disableConfirmBtn: {
        type: Boolean,
        value: false
      },
      toastEventSource: Object
    };
  }

  openDialog() {
    this.$.pdLowerResultNameDialog.set('opened', true);
  }

  closeDialog() {
    this.$.pdLowerResultNameDialog.set('opened', false);
  }

  resetData() {
    this.set('disableConfirmBtn', false);
    this.set('lowerResultId', null);
    this.set('lowerResultName', undefined);
    this.set('expectedResultId', null);
    this.$.pdLowerResultNameField.invalid = false;
  }

  _saveChanges() {
    if (!this.$.pdLowerResultNameField.validate()) {
      return false;
    }
    let lowerResult = {
      name: this.lowerResultName,
      result_link: this.expectedResultId
    };
    if (!lowerResult.result_link) {
      logError('Expected result ID is missing! Can not save lower result name.', 'lower-result-name-modal');
      return false;
    }

    let endpoint;
    let method;
    if (!this.lowerResultId) {
      endpoint = this.getEndpoint('pdLowerResults', {resultId: lowerResult.result_link});
      method = 'POST';
    } else {
      endpoint = this.getEndpoint('pdLowerResultDetails', {llResultId: this.lowerResultId});
      method = 'PATCH';
    }
    return this._saveLowerResult(endpoint, method, lowerResult, this._lowerResultSuccessfullySaved);
  }

  _saveLowerResult(endpoint: any, method: string, lowerResultData: any, successCallback: any) {
    let self = this;
    this.set('disableConfirmBtn', true);
    let dialog = this.$.pdLowerResultNameDialog;
    dialog.startSpinner();
    return this.sendRequest({
      method: method,
      endpoint: endpoint,
      body: lowerResultData
    }).then(function(response: any) {
      dialog.stopSpinner();
      self.set('disableConfirmBtn', false);
      if (typeof successCallback === 'function') {
        successCallback.bind(self, response)();
      }
      return true;
    }).catch(function(error: any) {
      dialog.stopSpinner();
      self.set('disableConfirmBtn', false);
      parseRequestErrorsAndShowAsToastMsgs(error, self.toastEventSource);
      return false;
    });
  }

  _lowerResultSuccessfullySaved(response: any) {
    let data = {
      lowerResultId: this.lowerResultId,
      expectedResultId: this.expectedResultId,
      lowerResult: response
    };

    this._initializeToBeAbleToAddIndicator(data.lowerResult);

    fireEvent(this, 'lower-result-saved', data);
    this.closeDialog();
  }

  _initializeToBeAbleToAddIndicator(lowerResult: any) {
    if (!lowerResult.applied_indicators) {
      lowerResult.applied_indicators = [];
    }
  }
}

window.customElements.define('pd-lower-result-name', PdLowerResultName);
