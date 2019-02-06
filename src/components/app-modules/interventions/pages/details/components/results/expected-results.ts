import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';

import 'etools-data-table/etools-data-table.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import { fireEvent } from '../../../../../../utils/fire-custom-event';
import RepeatableDataSetsMixin from '../../../../../../mixins/repeatable-data-sets-mixin';
import { PolymerElEvent } from '../../../../../../../typings/globals.types';
import '../../../../../../mixins/repeatable-data-sets-mixin.js';
import '../../../../../../layout/icons-actions.js';

import './mixins/results-mixin.js';
import './mixins/lower-results-mixin.js';
import './result-cp-output-and-ram-indicators.js';
import './result-link-lower-results.js';
import './indicator-dialog.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin RepeatableDataSets
 * @appliesMixin Results
 * @appliesMixin LowerResults
 */
class ExpectedResults extends EtoolsMixinFactory.combineMixins([
  RepeatableDataSetsMixin,
  //ResultsMixin,
  //LowerResultsMixin
], PolymerElement) {

  static get is() {
    return html`
    `;
  }

  static get properties() {
    return {
      _deleteEpName: {
        type: String,
        value: 'interventionResultLinkDelete',
        readOnly: true
      },
      interventionStatus: String,
      editableCpoRamIndicators: {
        type: Boolean
      },
      editMode: {
        type: Boolean
      },
      indicatorDialog: {
        type: Object
      },
      indicatorLocationOptions: {
        type: Array
      },
      indicatorSectionOptions: {
        type: Array
      },
      detailsOpened: {
        type: Boolean,
        value: true
      },
      showInactiveIndicators: {
        type: Boolean,
        value: false
      }
    };
  }

  static get observers() {
    return [
      '_dataItemsChanged(dataItems.length)',
      '_indicatorLocationOptionsUpdate(indicatorLocationOptions, indicatorDialog)',
      '_indicatorSectionOptionsUpdate(indicatorSectionOptions, indicatorDialog)'
    ];
  }

  ready() {
    super.ready();
    // init cp outputs and ram indicator add/edit element
    this.createAddEditCpOutputRamIndicatorsElement();
    // init PD output or SSFA expected result add/edit element
    this.createLowerResultNameDialog();

    this._createIndicatorDialog();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeIndicatorDialog();
    this.removeCpOutputRamIndicatorsDialog();
    this.removeLowerResultNameDialog();
    this.removeDeactivateIndicatorDialog();
  }

  _createIndicatorDialog() {
    // init indicator dialog data
    this.indicatorDialog = document.createElement('indicator-dialog');
    this.indicatorDialog.setAttribute('id', 'indicatorDialog');

    // attach close handler
    this.indicatorDialogDataReceived = this.indicatorDialogDataReceived.bind(this);
    this.indicatorDialog.addEventListener('indicator-dialog-close', this.indicatorDialogDataReceived);
    document.querySelector('body')!.appendChild(this.indicatorDialog);
  }

  _removeIndicatorDialog() {
    if (this.indicatorDialog) {
      this.indicatorDialog.removeEventListener('indicator-dialog-close', this.indicatorDialogDataReceived);
      document.querySelector('body')!.removeChild(this.indicatorDialog);
    }
  }

  removeDeactivateIndicatorDialog() {
    let body = document.querySelector('body');
    let dialogs = body.querySelectorAll('etools-dialog#deactivateIndicatorDialog');
    dialogs.forEach(d => body.removeChild(d));
  }

  _dataItemsChanged(dataItemsLength: number) {
    if (typeof dataItemsLength === 'undefined') {
      return;
    }
    this.setAlreadySelectedCpOutputs(dataItemsLength, this.dataItems);
  }

  _addNewCpOutputAndRamIndicators() {
    this.openCpOutputAndRamIndicatorsDialog();
  }

  _editCpOutputAndRamIndicators(e: PolymerElEvent) {
    e.stopPropagation();
    let index = parseInt(e.target.getAttribute('data-args'), 10);
    if (index < 0) {
      this.logError('Can not edit, invalid index selected', 'expected-results');
      return;
    }

    let result = this.dataItems[index];
    if (!result) {
      this.logError('Result not found in data items by index: ' + index, 'expected-results');
      return;
    }

    this.openCpOutputAndRamIndicatorsDialog(result.id, result.cp_output, result.ram_indicators, index);
  }

  /**
   * Add/update indicators data
   */
  indicatorDialogDataReceived(event: CustomEvent) {
    const data = event.detail;
    try {
      let actionParams = data.actionParams;
      let indicator = data.indicatorData;
      let i;
      for (i = 0; i < this.dataItems.length; i++) {
        // search expected result item by output id
        if (this.dataItems[i].cp_output === actionParams.cpOutputId) {

          if (actionParams.appliedIndicatorsIndex !== null) {
            // we just edited an indicator, replace data in indicators list
            this.set(['dataItems', i, 'll_results', actionParams.llResultIndex,
              'applied_indicators', actionParams.appliedIndicatorsIndex], JSON.parse(JSON.stringify(indicator)));
          } else {
            // new indicator added
            this.push(['dataItems', i, 'll_results', actionParams.llResultIndex, 'applied_indicators'],
                indicator);
          }
          break;
        }
      }
      this._updateInterventionLocAndClusters();
    } catch (err) {
      this.logError('Updating/adding new indicator data in displayed list has failed!',
          'lower-results-behavior', err);
    }
  }

  // open indicator dialog to add or edit indicator
  _openIndicatorDialog(event: CustomEvent) {
    event.stopImmediatePropagation();
    let actionParams = event.detail;

    if (actionParams.appliedIndicatorsIndex === null) {
      this.indicatorDialog.setTitle('Add Indicator');
    } else {
      this.indicatorDialog.setTitle('Edit Indicator');
    }
    this.indicatorDialog.toastEventSource = this;
    this.indicatorDialog.resetFieldValues();
    this.indicatorDialog.setIndicatorData(actionParams.indicatorData, actionParams, this.interventionStatus);
    this.indicatorDialog.openIndicatorDialog();
    this.indicatorDialog.resetValidationsAndStyle(undefined, true);
  }

  _updateInterventionLocAndClusters() {
    fireEvent(this, 'indicators-changed');
  }

  _indicatorSectionOptionsUpdate(sectionOptions) {
    if (typeof sectionOptions === 'undefined') {
      return;
    }
    this._updateIndicatorData('sectionOptionsIds', sectionOptions);
  }

  _indicatorLocationOptionsUpdate(locationOptions) {
    if (typeof locationOptions === 'undefined') {
      return;
    }
    this._updateIndicatorData('locationOptionsIds', locationOptions);
  }

  _updateIndicatorData(property: string, data: any) {
    if (this.indicatorDialog && typeof data !== 'undefined') {
      this.indicatorDialog.set(property, data);
    }
  }

}

window.customElements.define('expected-results', ExpectedResults);
