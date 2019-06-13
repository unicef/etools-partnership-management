// import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
import {ExpectedResult, CpOutput} from '../../../../../../../../typings/intervention.types';
import {isEmptyObject, isJsonStrMatch, copy} from '../../../../../../../utils/utils';
import {RootState} from '../../../../../../../../store';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {Constructor} from '../../../../../../../../typings/globals.types';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ResultCpOutputAndRamIndicatorsEl} from '../result-cp-output-and-ram-indicators';

/**
 * Behavior used to add/edit expected results (result_links).
 *  - create cp output and ram indicators dialog
 *  - save new result or edit one by selecting a cp output and a available ram indicators
 * @polymer
 * @mixinFunction
 */
function ResultsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ResultsClass extends baseClass {

    @property({type: Number})
    interventionId!: number;

    @property({type: Object})
    cpOutputRamIndicatorsEditElem!: ResultCpOutputAndRamIndicatorsEl;

    @property({type: String})
    selectedCpStructure!: string;

    @property({type: Array})
    cpOutputs!: CpOutput[];

    @property({type: Array, computed: '_computeAvailableCpOutputs(cpOutputs, alreadySelectedCpOutputs, selectedCpStructure)'})
    availableCpOutputs!: CpOutput[];

    @property({type: Array})
    alreadySelectedCpOutputs: [] = [];


    resultsStateChanged(state: RootState) {
      if (!isJsonStrMatch(this.cpOutputs, state.commonData!.cpOutputs)) {
        this.cpOutputs = [...state.commonData!.cpOutputs];
      }
    }

    _computeAvailableCpOutputs(cpOutputs: CpOutput[], alreadySelectedCpOutputs: number[], selectedCpStructure: string) {
      if (isEmptyObject(cpOutputs) ||
          typeof alreadySelectedCpOutputs === 'undefined' ||
          typeof selectedCpStructure === 'undefined') {
        return;
      }
      const selectedCpStructureId = parseInt(selectedCpStructure, 10);
      return cpOutputs.filter(function(cp) {
        const notSelected = alreadySelectedCpOutputs.indexOf(cp.id) === -1;
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
      const selectedCpOIds: number[] = [];
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
          this._handleNewResultAdded as any);
        this.cpOutputRamIndicatorsEditElem.removeEventListener('expected-result-updated',
          this._handleResultUpdated as any);
        document.querySelector('body')!.removeChild(this.cpOutputRamIndicatorsEditElem as any);
      }
    }

    createAddEditCpOutputRamIndicatorsElement() {
      this.cpOutputRamIndicatorsEditElem = document.querySelector('body')!
        .querySelector('#cpOutputRamIndicatorsEditElem') as any;

      if (!this.cpOutputRamIndicatorsEditElem) {
        this.cpOutputRamIndicatorsEditElem = document.createElement('result-cp-output-and-ram-indicators') as any;
        this.cpOutputRamIndicatorsEditElem.setAttribute('id', 'cpOutputRamIndicatorsEditElem');

        this.cpOutputRamIndicatorsEditElem.set('toastEventSource', this);

        this._handleNewResultAdded = this._handleNewResultAdded.bind(this);
        this.cpOutputRamIndicatorsEditElem.addEventListener('new-expected-result-added',
          this._handleNewResultAdded as any);

        this._handleResultUpdated = this._handleResultUpdated.bind(this);
        this.cpOutputRamIndicatorsEditElem.addEventListener('expected-result-updated', this._handleResultUpdated as any);

        document.querySelector('body')!.appendChild(this.cpOutputRamIndicatorsEditElem as any);
      }
    }

    openCpOutputAndRamIndicatorsDialog(expectedResultId?: number, cpOutputId?: string,
      ramIndicatorsIds?: number[], editIndex?: number) {
      if (this.cpOutputRamIndicatorsEditElem) {
        this.cpOutputRamIndicatorsEditElem.resetData();

        this.cpOutputRamIndicatorsEditElem.set('interventionId', this.interventionId);
        this.cpOutputRamIndicatorsEditElem.set('disableCpoField', !this.get('editMode'));
        if (expectedResultId) {
          this.cpOutputRamIndicatorsEditElem.set('expectedResultId', expectedResultId);
        }
        if (!isEmptyObject(ramIndicatorsIds)) {
          this.cpOutputRamIndicatorsEditElem.set('selectedRamIndicatorsIds', ramIndicatorsIds);
        }

        const availableCpOutputsOptions = this.availableCpOutputs.slice(0);
        this.cpOutputRamIndicatorsEditElem.set('availableCpOutputs', availableCpOutputsOptions);
        if (cpOutputId) {
          /**
           * cpOutputId is valid => edit operation, include curent cpOutput in the availableCpOutputsOptions
           * as user might want to edit only the ram indicators
           */
          const currentCpOutputData = this.cpOutputs.find(function(cp: any) {
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
      const resultLink = e.detail.result;
      this._initializeToBeAbleToAddLowerResult(resultLink);
      this.push('dataItems', resultLink);

      // To mke sure all req. observers are triggered
      // @ts-ignore dataIems is defined in component
      this.dataItems = copy(this.dataItems);
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
      const index = e.detail.index || 0;
      this.set(['dataItems', index, 'cp_output'], e.detail.result.cp_output);
      this.set(['dataItems', index, 'ram_indicators'], e.detail.result.ram_indicators);
      this.set(['dataItems', index, 'ram_indicator_names'], e.detail.result.ram_indicator_names);
    }

    _canUpdateResult() {
      if (!this.get('dataItems')) {
        logError('dataItems is undefined or null. You must have dataItems(Array of result_links) defined' +
            ' to use this behavior.', 'results-behavior');
        return false;
      }
      return true;
    }

  }
  return ResultsClass;
}

export default ResultsMixin;
