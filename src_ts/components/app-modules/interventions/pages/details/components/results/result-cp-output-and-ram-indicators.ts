import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import 'etools-dialog/etools-dialog.js';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import EndpointsMixin from '../../../../../../endpoints/endpoints-mixin';
import MissingDropdownOptionsMixin from '../../../../../../mixins/missing-dropdown-options-mixin';
import { fireEvent } from '../../../../../../utils/fire-custom-event';
import { requiredFieldStarredStyles } from '../../../../../../styles/required-field-styles';
import { logError } from 'etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../../../../utils/ajax-errors-parser.js';

/**
 * @polymer
 * @customElement
 * @appliesMixins Endpoints
 * @appliesMixins MissingDropdownOptions
 */
class ResultCpOutputAndRamIndicators extends (EndpointsMixin(MissingDropdownOptionsMixin(PolymerElement)) as any) {
  [x: string]: any;

  static get template() {
    return html`
    ${requiredFieldStarredStyles}
    <style>
      :host {
      }

      .cp-output-row {
        padding: 0 0 16px;
      }

      .ram-indicators-row {
        padding: 16px 0 30px;
      }
    </style>

    <etools-dialog id="cpOutputRamIndicatorsDialog"
                  size="md"
                  dialog-title="Add/Update CP Output/CP Inidcators"
                  ok-btn-text="Add/Update"
                  disable-confirm-btn="[[disableConfirmBtn]]"
                  on-confirm-btn-clicked="_saveChanges"
                  keep-dialog-open>

      <div class="cp-output-row">
        <etools-dropdown id="cpOutput"
                        label="CP Output"
                        placeholder="&#8212;"
                        options="[[availableCpOutputs]]"
                        option-value="id"
                        option-label="name"
                        selected="{{selectedCpOutputId}}"
                        required
                        auto-validate
                        error-message="Please select CP Output"
                        disable-on-focus-handling
                        disabled="[[disableCpoField]]">
        </etools-dropdown>
      </div>

      <div class="ram-indicators-row">
        <etools-dropdown-multi id="indicators"
                              label="CP Indicators"
                              placeholder="&#8212;"
                              options="[[cpOutputRamIndicators]]"
                              option-value="id"
                              option-label="name"
                              selected-values="{{selectedRamIndicatorsIds}}"
                              required
                              auto-validate
                              error-message="Please select CP Indicators"
                              disable-on-focus-handling>
        </etools-dropdown-multi>
      </div>

    </etools-dialog>
    `;
  }

  static get properties() {
    return {
      interventionId: Number,
      expectedResultId: Number,
      availableCpOutputs: {
        type: Array,
        value: []
      },
      selectedCpOutputId: {
        type: Number,
        observer: '_cpOutputSelected'
      },
      cpOutputRamIndicators: {
        type: Array,
        value: []
      },
      selectedRamIndicatorsIds: {
        type: Array,
        value: []
      },
      autovalidateActive: {
        type: Boolean,
        value: false
      },
      ramIndicatorsLoadingMsg: {
        type: String,
        value: 'Loading...'
      },
      saveResultLoadingMsg: {
        type: String,
        value: 'Saving...'
      },
      opened: {
        type: Boolean,
        value: false
      },
      preventRamIndicatorReset: Boolean,
      editIndex: {
        value: null
      },
      disableConfirmBtn: {
        type: Boolean,
        value: false
      },
      toastEventSource: Object,
      disableCpoField: Boolean
    };
  }

  ready() {
    super.ready();
    this.setDropdownMissingOptionsAjaxDetails(this.$.cpOutput, 'cpOutputsByIdsAsValues', {dropdown: true});
  }

  _enableAutovalidate() {
    this.set('autovalidateActive', true);
  }

  _cpOutputSelected(cpOutputId: string) {
    if (cpOutputId) {
      // request ram indicators list
      this._setRamIndicatorsSpinnerText(this.ramIndicatorsLoadingMsg);
      this._showRamIndicatorsLoadingSpinner(true);

      let ramIndicatorsEndpoint = this.getEndpoint('ramIndicators', {id: cpOutputId});
      let self = this;
      this.sendRequest({
        endpoint: ramIndicatorsEndpoint
      }).then(function(response: any) {
        self._handleRamIndicatorsReqResponse(response);
      }).catch(function(error: any) {
        self._showRamIndicatorsLoadingSpinner(false);
        parseRequestErrorsAndShowAsToastMsgs(error, self.toastEventSource);
      });
    }
  }

  _handleRamIndicatorsReqResponse(response: any) {
    if (this._thereAreSelectedIndicators() &&  // to prevent triggering validation
        !this.preventRamIndicatorReset) {
      this.set('selectedRamIndicatorsIds', []);
    }
    this.set('preventRamIndicatorReset', false);
    this.set('cpOutputRamIndicators', response);
    this.$.indicators.invalid = false;
    this._showRamIndicatorsLoadingSpinner(false);
  }

  _thereAreSelectedIndicators() {
    return this.selectedRamIndicatorsIds && this.selectedRamIndicatorsIds.length;
  }

  _showRamIndicatorsLoadingSpinner(show: boolean) {
    if (show) {
      this.$.cpOutputRamIndicatorsDialog.startSpinner();
    } else {
      this.$.cpOutputRamIndicatorsDialog.stopSpinner();
    }
  }

  _setRamIndicatorsSpinnerText(text: string) {
    this.$.cpOutputRamIndicatorsDialog.spinnerText = text;
  }

  openDialog() {
    this.$.cpOutputRamIndicatorsDialog.set('opened', true);
  }

  closeDialog() {
    this.$.cpOutputRamIndicatorsDialog.set('opened', false);
  }

  resetData() {
    this.set('disableConfirmBtn', false);
    this.set('editIndex', null);
    this.set('expectedResultId', undefined);
    this.set('selectedCpOutputId', undefined);
    this.set('availableCpOutputs', []);
    this.set('cpOutputRamIndicators', []);
    this.set('selectedRamIndicatorsIds', []);

    this.$.cpOutput.set('invalid', false);
    this.$.indicators.set('invalid', false);
  }

  _saveChanges() {
    this.$.cpOutput.validate();
    this.$.indicators.validate();

    let result = {
      intervention: this.interventionId,
      cp_output: this.selectedCpOutputId,
      ram_indicators: (this.selectedRamIndicatorsIds instanceof Array) ? this.selectedRamIndicatorsIds : []
    };

    if (!this._isValidResult(result)) {
      return;
    }

    let endpoint;
    if (this._isNewResult()) {
      endpoint = this._getResultsEndpoint(result.intervention);
      this._saveExpectedResult(endpoint, 'POST', result, this._newResultSuccessfullyAdded);
    } else {
      endpoint = this._getResultDetailsEndpoint(this.expectedResultId);
      this._saveExpectedResult(endpoint, 'PATCH', result, this._resultSuccessfullyUpdated);
    }
  }

  _isValidResult(result: any) {
    let valid = true;
    if (!result.intervention) {
      logError('Intervention ID is missing! Can not save result.', 'expected-results-modal');
      valid = false;
    }
    if (!result.cp_output || result.ram_indicators.length === 0) {
      valid = false;
    }
    return valid;
  }

  _isNewResult() {
    return !this.expectedResultId;
  }

  _getResultsEndpoint(interventionId: string) {
    return this.getEndpoint('pdExpectedResults', {pdId: interventionId});
  }

  _getResultDetailsEndpoint(resultId: string) {
    return this.getEndpoint('pdExpectedResultDetails', {resultId: resultId});
  }

  _saveExpectedResult(endpoint: any, method: string, result: any, successCallback: any) {
    let self = this;
    this._setRamIndicatorsSpinnerText(this.saveResultLoadingMsg);
    this._showRamIndicatorsLoadingSpinner(true);
    this.set('disableConfirmBtn', true);
    this.sendRequest({
      method: method,
      endpoint: endpoint,
      body: result
    }).then(function(response: any) {
      self._showRamIndicatorsLoadingSpinner(false);
      self.set('disableConfirmBtn', false);
      if (typeof successCallback === 'function') {
        successCallback.bind(self, response)();
      }
    }).catch(function(error: any) {
      self._showRamIndicatorsLoadingSpinner(false);
      self.set('disableConfirmBtn', false);
      parseRequestErrorsAndShowAsToastMsgs(error, self.toastEventSource);
    });
  }

  _newResultSuccessfullyAdded(response: any) {
    fireEvent(this, 'new-expected-result-added', {result: response});
    this.closeDialog();
  }

  _resultSuccessfullyUpdated(response: any) {
    fireEvent(this, 'expected-result-updated', {index: this.editIndex, result: response});
    this.closeDialog();
  }

}

window.customElements.define('result-cp-output-and-ram-indicators', ResultCpOutputAndRamIndicators);
export {ResultCpOutputAndRamIndicators as ResultCpOutputAndRamIndicatorsEl}
