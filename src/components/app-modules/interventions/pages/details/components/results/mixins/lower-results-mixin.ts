import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 */
const LowerResultsMixin = dedupingMixin((superClass: any) => class extends EtoolsLogsMixin(superClass) {
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

    this.addEventListener('add-new-lower-result', this._handleAddNewLowerResult);
    this.addEventListener('edit-lower-result', this._handleEditLowerResult);
  }

  _removeLowerResultsListeners() {
    this.removeEventListener('add-new-lower-result', this._handleAddNewLowerResult);
    this.removeEventListener('edit-lower-result', this._handleEditLowerResult);
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

  _getDataIndex(id: string, dataSet: []) {
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
      this.logError('Get lower result index failed!', 'lower-results-behavior', err);
    }

    return -1;
  }

  _lowerResultSaved(e: CustomEvent) {
    e.stopImmediatePropagation();
    try {
      if (!e.detail.expectedResultId) {
        this.logError('Can not make changes if expected result ID is not specified.', 'lower-results-behavior');
        return;
      }
      let expectedResultIndex = this._getDataIndex(e.detail.expectedResultId, this.dataItems);
      let validExpectedResultsIndex = expectedResultIndex >= 0;
      if (!validExpectedResultsIndex) {
        this.logError('Result with ID: ' + e.detail.expectedResultId + ' not found.', 'lower-results-behavior');
        return;
      }
      if (!e.detail.lowerResultId) {
        this.push(['dataItems', expectedResultIndex, 'll_results'], e.detail.lowerResult);
      } else {
        let lrIndex = this._getDataIndex(e.detail.lowerResultId, this.get(['dataItems', expectedResultIndex,
          'll_results']));
        let validIndex = lrIndex >= 0;
        if (!validIndex) {
          this.logError('Lower result with ID: ' + e.detail.lowerResultId + ' not found.', 'lower-results-behavior');
          return;
        }
        this.set(['dataItems', expectedResultIndex, 'll_results', lrIndex, 'name'], e.detail.lowerResult.name);
      }
    } catch (err) {
      this.logError('Adding lower result in displayed list has failed!', 'lower-results-behavior', err);
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

});

export default LowerResultsMixin;
