import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import EndpointsMixin from '../../../../../../endpoints/endpoints-mixin';
import {fireEvent} from '../../../../../../utils/fire-custom-event';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {property} from '@polymer/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {PaperInputElement} from '@polymer/paper-input/paper-input.js';


/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class PdLowerResultName extends EndpointsMixin(PolymerElement) {

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

  @property({type: Number})
  expectedResultId!: number;

  @property({type: Number})
  lowerResultId!: number;

  @property({type: String})
  lowerResultName!: string;

  @property({type: Boolean})
  opened: boolean = false;

  @property({type: Boolean})
  disableConfirmBtn: boolean = false;

  @property({type: Object})
  toastEventSource!: PolymerElement;


  openDialog() {
    (this.$.pdLowerResultNameDialog as EtoolsDialog).set('opened', true);
  }

  closeDialog() {
    (this.$.pdLowerResultNameDialog as EtoolsDialog).set('opened', false);
  }

  resetData() {
    this.set('disableConfirmBtn', false);
    this.set('lowerResultId', null);
    this.set('lowerResultName', undefined);
    this.set('expectedResultId', null);
    (this.$.pdLowerResultNameField as PaperInputElement).invalid = false;
  }

  _saveChanges() {
    if (!(this.$.pdLowerResultNameField as PaperInputElement).validate()) {
      return false;
    }
    const lowerResult = {
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
    this.set('disableConfirmBtn', true);
    const dialog = this.$.pdLowerResultNameDialog as EtoolsDialog;
    dialog.startSpinner();
    return sendRequest({
      method: method,
      endpoint: endpoint,
      body: lowerResultData
    }).then((response: any) => {
      dialog.stopSpinner();
      this.set('disableConfirmBtn', false);
      if (typeof successCallback === 'function') {
        successCallback.bind(this, response)();
      }
      return true;
    }).catch((error: any) => {
      dialog.stopSpinner();
      this.set('disableConfirmBtn', false);
      parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
      return false;
    });
  }

  _lowerResultSuccessfullySaved(response: any) {
    const data = {
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

export {PdLowerResultName as PdLowerResultNameEl};
