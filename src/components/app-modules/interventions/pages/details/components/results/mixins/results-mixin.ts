import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import { ExpectedResult, CpOutput } from '../../../../../../../../typings/intervention.types';
import { isEmptyObject, isJsonStrMatch } from '../../../../../../../utils/utils';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../../../../store';

/**
 * Behavior used to add/edit expected results (result_links).
 *  - create cp output and ram indicators dialog
 *  - save new result or edit one by selecting a cp output and a available ram indicators
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 */
const ResultsMixin = dedupingMixin(
  (superClass: any) => class extends connect(store)(EtoolsLogsMixin(superClass)) {

    static get properties() {
      return {
        interventionId: {
          type: Number
        },
        cpOutputRamIndicatorsEditElem: Object,
        selectedCpStructure: {
          type: String
        },
        cpOutputs: {
          type: Array,
          statePath: 'cpOutputs'
        },
        availableCpOutputs: {
          type: Array,
          value: [],
          computed: '_computeAvailableCpOutputs(cpOutputs, alreadySelectedCpOutputs, selectedCpStructure)'
        },
        alreadySelectedCpOutputs: {
          type: Array,
          value: []
        }
      };
    }

    stateChanged(state: RootState) {
      if (!isJsonStrMatch(this.cpOutputs, state.commonData!.cpOutputs)) {
        this.cpOutputs = [...state.commonData!.cpOutputs];
      }
    }

    _computeAvailableCpOutputs(cpOutputs: CpOutput[], alreadySelectedCpOutputs: number[], selectedCpStructure: number) {
      if (isEmptyObject(cpOutputs) ||
          typeof alreadySelectedCpOutputs === 'undefined' ||
          typeof selectedCpStructure === 'undefined') {
        return;
      }
      let selectedCpStructureId = parseInt(selectedCpStructure, 10);
      return cpOutputs.filter(function(cp) {
        let notSelected = alreadySelectedCpOutputs.indexOf(cp.id) === -1;
        let belongsToCpStructure = true;
        if (selectedCpStructureId > 0 && selectedCpStructureId !== parseInt(cp.country_programme, 10)) {
          belongsToCpStructure = false;
        }
        return notSelected && belongsToCpStructure;
      });
    }

    setAlreadySelectedCpOutputs(resultsLength: number, results: ExpectedResult[]) {
      if (resultsLength > 0) {
        this.set('alreadySelectedCpOutputs', this._getSelectedCpOutputsIds(results || []));
      } else {
        this.set('alreadySelectedCpOutputs', []);
      }
    }

    // get selected cpoutputs ids
    _getSelectedCpOutputsIds(results: ExpectedResult[]) {
      let selectedCpOIds: number[] = [];
      if (results.length > 0) {
        results.forEach(function(result) {
          if (result.cp_output) {
            selectedCpOIds.push(result.cp_output);
          }
        });
      }
      return selectedCpOIds;
    }

    removeCpOutputRamIndicatorsDialog() {
      if (this.cpOutputRamIndicatorsEditElem) {
        this.cpOutputRamIndicatorsEditElem.removeEventListener('new-expected-result-added',
            this._handleNewResultAdded);
        this.cpOutputRamIndicatorsEditElem.removeEventListener('expected-result-updated',
            this._handleResultUpdated);
        document.querySelector('body')!.removeChild(this.cpOutputRamIndicatorsEditElem);
      }
    }

    createAddEditCpOutputRamIndicatorsElement() {
      this.cpOutputRamIndicatorsEditElem = document.querySelector('body')!
          .querySelector('#cpOutputRamIndicatorsEditElem');
      if (!this.cpOutputRamIndicatorsEditElem) {
        this.cpOutputRamIndicatorsEditElem = document.createElement('result-cp-output-and-ram-indicators');
        this.cpOutputRamIndicatorsEditElem.setAttribute('id', 'cpOutputRamIndicatorsEditElem');

        this.cpOutputRamIndicatorsEditElem.set('toastEventSource', this);

        this._handleNewResultAdded = this._handleNewResultAdded.bind(this);
        this.cpOutputRamIndicatorsEditElem.addEventListener('new-expected-result-added',
            this._handleNewResultAdded);

        this._handleResultUpdated = this._handleResultUpdated.bind(this);
        this.cpOutputRamIndicatorsEditElem.addEventListener('expected-result-updated', this._handleResultUpdated);

        document.querySelector('body')!.appendChild(this.cpOutputRamIndicatorsEditElem);
      }
    }

    openCpOutputAndRamIndicatorsDialog(expectedResultId?: number, cpOutputId?: number,
       ramIndicatorsIds?: number[], editIndex?: number) {
      if (this.cpOutputRamIndicatorsEditElem) {
        this.cpOutputRamIndicatorsEditElem.resetData();

        this.cpOutputRamIndicatorsEditElem.set('interventionId', this.interventionId);
        this.cpOutputRamIndicatorsEditElem.set('disableCpoField', !this.get('editMode'));
        if (expectedResultId) {
          this.cpOutputRamIndicatorsEditElem.set('expectedResultId', expectedResultId);
        }
        if (!_.isEmpty(ramIndicatorsIds)) {
          this.cpOutputRamIndicatorsEditElem.set('selectedRamIndicatorsIds', ramIndicatorsIds);
        }

        let availableCpOutputsOptions = this.availableCpOutputs.slice(0);
        this.cpOutputRamIndicatorsEditElem.set('availableCpOutputs', availableCpOutputsOptions);
        if (cpOutputId) {
          /**
           * cpOutputId is valid => edit operation, include curent cpOutput in the availableCpOutputsOptions
           * as user might want to edit only the ram indicators
           */
          let currentCpOutputData = this.cpOutputs.find(function(cp) {
            return parseInt(cp.id, 10) === parseInt(cpOutputId, 10);
          });
          if (currentCpOutputData) {
            availableCpOutputsOptions.push(currentCpOutputData);
          } // else => old cp output, not found, it's data will be requested by the cp outputs dropdown

          // prevent ram indicators reset at first request, edit operation
          this.cpOutputRamIndicatorsEditElem.set('preventRamIndicatorReset', true);
          this.cpOutputRamIndicatorsEditElem.set('editIndex', editIndex);
          this.cpOutputRamIndicatorsEditElem.set('selectedCpOutputId', cpOutputId);
        }

        this.cpOutputRamIndicatorsEditElem.openDialog();
      }
    }

    _handleNewResultAdded(e: CustomEvent) {
      e.stopImmediatePropagation();
      if (!this._canUpdateResult()) {
        return;
      }
      let resultLink = e.detail.result;
      this._initializeToBeAbleToAddLowerResult(resultLink);
      this.push('dataItems', resultLink);
    }

    _initializeToBeAbleToAddLowerResult(resultLink: ExpectedResult) {
      if (!resultLink.ll_results) {
        resultLink.ll_results = [];
      }
    }

    _handleResultUpdated(e: CustomEvent) {
      e.stopImmediatePropagation();
      if (!this._canUpdateResult()) {
        return;
      }
      let index = e.detail.index || 0;
      this.set(['dataItems', index, 'cp_output'], e.detail.result.cp_output);
      this.set(['dataItems', index, 'ram_indicators'], e.detail.result.ram_indicators);
      this.set(['dataItems', index, 'ram_indicator_names'], e.detail.result.ram_indicator_names);
    }

    _canUpdateResult() {
      if (!this.get('dataItems')) {
        this.logError('dataItems is undefined or null. You must have dataItems(Array of result_links) defined ' +
            'to use this behavior.', 'results-behavior');
        return false;
      }
      return true;
    }

  });

  export default ResultsMixin;
