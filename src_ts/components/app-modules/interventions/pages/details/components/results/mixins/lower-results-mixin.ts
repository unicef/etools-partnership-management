//import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
import { GenericObject, Constructor } from '../../../../../../../../typings/globals.types';
import {logError} from 'etools-behaviors/etools-logging.js';
import { PolymerElement } from '@polymer/polymer';

/**
 * @polymer
 * @mixinFunction
 */
function LowerResultsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class lowerResultsClass extends baseClass {
    [x: string]: any;

    static get properties() {
      return {
        lowerResultNameEditElem: Object
      };
    }

    static get observers() {
      /* _makeSureDataItemsAreValid is a method from repeatable data sets mixin */
      return [
        '_makeSureDataItemsAreValid(dataItems)'
      ];
    }

    ready() {
      super.ready();
      this._initLowerResultsListeners();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._removeLowerResultsListeners();
    }

    _initLowerResultsListeners() {
      this._handleAddNewLowerResult = this._handleAddNewLowerResult.bind(this);
      this._handleEditLowerResult = this._handleEditLowerResult.bind(this);

      this.addEventListener('add-new-lower-result', this._handleAddNewLowerResult as EventListenerOrEventListenerObject);
      this.addEventListener('edit-lower-result', this._handleEditLowerResult as EventListenerOrEventListenerObject);
    }

    _removeLowerResultsListeners() {
      this.removeEventListener('add-new-lower-result', this._handleAddNewLowerResult as EventListenerOrEventListenerObject);
      this.removeEventListener('edit-lower-result', this._handleEditLowerResult as EventListenerOrEventListenerObject);
    }

    createLowerResultNameDialog() {
      this.lowerResultNameEditElem = document.querySelector('body')!.querySelector('#pdLowerResultName');
      if (!this.lowerResultNameEditElem) {
        this.lowerResultNameEditElem = document.createElement('pd-lower-result-name');
        this.lowerResultNameEditElem.setAttribute('id', 'pdLowerResultName');
        this.lowerResultNameEditElem.set('toastEventSource', this);

        this._lowerResultSaved = this._lowerResultSaved.bind(this);
        this.lowerResultNameEditElem.addEventListener('lower-result-saved', this._lowerResultSaved);
        document.querySelector('body')!.appendChild(this.lowerResultNameEditElem);
      }
    }

    removeLowerResultNameDialog() {
      if (this.lowerResultNameEditElem) {
        this.lowerResultNameEditElem.removeEventListener('lower-result-saved', this._lowerResultSaved);
        document.querySelector('body')!.removeChild(this.lowerResultNameEditElem);
      }
    }

    _getDataIndex(id: string, dataSet: GenericObject[]) {
      try {
        let index = null;
        let resultsLength = dataSet.length;
        for (index = 0; index < resultsLength; index++) {
          if (parseInt(dataSet[index].id, 10) === parseInt(id, 10)) {
            break;
          }
        }
        return index;
      } catch (err) {
        logError('Get lower result index failed!', 'lower-results-behavior', err);
      }

      return -1;
    }

    _lowerResultSaved(e: CustomEvent) {
      e.stopImmediatePropagation();
      try {
        if (!e.detail.expectedResultId) {
          logError('Can not make changes if expected result ID is not specified.',
              'lower-results-behavior');
          return;
        }
        let expectedResultIndex = this._getDataIndex(e.detail.expectedResultId, this.dataItems);
        let validExpectedResultsIndex = expectedResultIndex >= 0;
        if (!validExpectedResultsIndex) {
          logError('Result with ID: ' + e.detail.expectedResultId + ' not found.',
              'lower-results-behavior');
          return;
        }
        if (!e.detail.lowerResultId) {
          this.push(['dataItems', expectedResultIndex, 'll_results'], e.detail.lowerResult);
        } else {
          let lrIndex = this._getDataIndex(e.detail.lowerResultId, this.get(['dataItems', expectedResultIndex,
            'll_results']));
          let validIndex = lrIndex >= 0;
          if (!validIndex) {
            logError('Lower result with ID: ' + e.detail.lowerResultId + ' not found.', 'lower-results-behavior');
            return;
          }
          this.set(['dataItems', expectedResultIndex, 'll_results', lrIndex, 'name'], e.detail.lowerResult.name);
        }
      } catch (err) {
        logError('Adding lower result in displayed list has failed!', 'lower-results-behavior',
            err);
      }
    }

    _handleAddNewLowerResult(e: CustomEvent) {
      e.stopImmediatePropagation();
      this._openLowerResultNameDialog(null, undefined, e.detail.expectedResultId);
    }

    _handleEditLowerResult(e: CustomEvent) {
      e.stopImmediatePropagation();
      this._openLowerResultNameDialog(e.detail.lowerResultId, e.detail.lowerResultName, e.detail.expectedResultId);
    }

    _openLowerResultNameDialog(lowerResultId: number | null, lowerResultName?: string, expectedResultId?: number) {
      if (this.lowerResultNameEditElem) {
        this.lowerResultNameEditElem.resetData();
        this.lowerResultNameEditElem.set('expectedResultId', expectedResultId);
        if (lowerResultId) {
          // edit operation
          this.lowerResultNameEditElem.set('lowerResultId', lowerResultId);
          this.lowerResultNameEditElem.set('lowerResultName', lowerResultName);
        }
        this.lowerResultNameEditElem.openDialog();
      }
    }

  };
  return lowerResultsClass;
}

export default LowerResultsMixin;
