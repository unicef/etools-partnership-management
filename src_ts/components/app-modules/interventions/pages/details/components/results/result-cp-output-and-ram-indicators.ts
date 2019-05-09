import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import 'etools-dialog/etools-dialog.js';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import MissingDropdownOptionsMixin from '../../../../../../mixins/missing-dropdown-options-mixin';
import {fireEvent} from '../../../../../../utils/fire-custom-event';
import {requiredFieldStarredStyles} from '../../../../../../styles/required-field-styles';
import {logError} from 'etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../../../../utils/ajax-errors-parser.js';
import {property} from '@polymer/decorators';
import EtoolsDialog from 'etools-dialog/etools-dialog.js';
import {EtoolsDropdownMultiEl} from 'etools-dropdown/etools-dropdown-multi.js';
import {EtoolsDropdownEl} from 'etools-dropdown/etools-dropdown.js';

/**
 * @polymer
 * @customElement
 * @appliesMixins MissingDropdownOptionsMixin
 */
class ResultCpOutputAndRamIndicators extends MissingDropdownOptionsMixin(PolymerElement) {

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
                  dialog-title="Add/Update CP Output/CP Indicators"
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

  @property({type: Number})
  interventionId!: number;

  @property({type: Number})
  expectedResultId!: number;

  @property({type: Array})
  availableCpOutputs: [] = [];

  @property({type: Number, observer: '_cpOutputSelected'})
  selectedCpOutputId!: number;

  @property({type: Array})
  cpOutputRamIndicators: [] = [];

  @property({type: Array})
  selectedRamIndicatorsIds: [] = [];

  @property({type: Boolean})
  autovalidateActive: boolean = false;

  @property({type: String})
  ramIndicatorsLoadingMsg: string = 'Loading...';

  @property({type: String})
  saveResultLoadingMsg: string = 'Saving...';

  @property({type: Boolean})
  opened: boolean = false;

  @property({type: Boolean})
  preventRamIndicatorReset!: boolean;

  @property({type: String})
  editIndex: string | null = null;

  @property({type: Boolean})
  disableConfirmBtn: boolean = false;

  @property({type: Object})
  toastEventSource!: PolymerElement;

  @property({type: Boolean})
  disableCpoField!: boolean;


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

      const ramIndicatorsEndpoint = this.getEndpoint('ramIndicators', {id: cpOutputId});
      const self = this;
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
    if (this._thereAreSelectedIndicators() && // to prevent triggering validation
        !this.preventRamIndicatorReset) {
      this.set('selectedRamIndicatorsIds', []);
    }
    this.set('preventRamIndicatorReset', false);
    this.set('cpOutputRamIndicators', response);
    (this.$.indicators as EtoolsDropdownMultiEl).invalid = false;
    this._showRamIndicatorsLoadingSpinner(false);
  }

  _thereAreSelectedIndicators() {
    return this.selectedRamIndicatorsIds && this.selectedRamIndicatorsIds.length;
  }

  _showRamIndicatorsLoadingSpinner(show: boolean) {
    if (show) {
      (this.$.cpOutputRamIndicatorsDialog as EtoolsDialog).startSpinner();
    } else {
      (this.$.cpOutputRamIndicatorsDialog as EtoolsDialog).stopSpinner();
    }
  }

  _setRamIndicatorsSpinnerText(text: string) {
    (this.$.cpOutputRamIndicatorsDialog as EtoolsDialog).spinnerText = text;
  }

  openDialog() {
    (this.$.cpOutputRamIndicatorsDialog as EtoolsDialog).set('opened', true);
  }

  closeDialog() {
    (this.$.cpOutputRamIndicatorsDialog as EtoolsDialog).set('opened', false);
  }

  resetData() {
    this.set('disableConfirmBtn', false);
    this.set('editIndex', null);
    this.set('expectedResultId', undefined);
    this.set('selectedCpOutputId', undefined);
    this.set('availableCpOutputs', []);
    this.set('cpOutputRamIndicators', []);
    this.set('selectedRamIndicatorsIds', []);

    (this.$.cpOutput as EtoolsDropdownEl).set('invalid', false);
    (this.$.indicators as EtoolsDropdownMultiEl).set('invalid', false);
  }

  _saveChanges() {
    (this.$.cpOutput as EtoolsDropdownEl).validate();
    (this.$.indicators as EtoolsDropdownMultiEl).validate();

    const result = {
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

  _getResultsEndpoint(interventionId: number) {
    return this.getEndpoint('pdExpectedResults', {pdId: interventionId});
  }

  _getResultDetailsEndpoint(resultId: number) {
    return this.getEndpoint('pdExpectedResultDetails', {resultId: resultId});
  }

  _saveExpectedResult(endpoint: any, method: string, result: any, successCallback: any) {
    const self = this;
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
export {ResultCpOutputAndRamIndicators as ResultCpOutputAndRamIndicatorsEl};
