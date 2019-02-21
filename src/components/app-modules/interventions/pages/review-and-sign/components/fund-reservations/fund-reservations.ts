import { PolymerElement, html } from '@polymer/polymer';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';

import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import 'etools-content-panel/etools-content-panel.js';
// @ts-ignore
import {DynamicDialogMixin} from 'etools-dialog/dynamic-dialog-mixin.js';
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import 'etools-info-tooltip/etools-info-tooltip.js';

import './update-fr-numbers.js';
import EndpointsMixin from '../../../../../../endpoints/endpoints-mixin.js';
import ArrayHelperMixin from '../../../../../../mixins/array-helper-mixin.js';
import FrNumbersConsistencyMixin from '../../../../mixins/fr-numbers-consistency-mixin.js';
import { frWarningsStyles } from '../../../../styles/fr-warnings-styles.js';
import { FrsDetails } from '../../../../../../../typings/intervention.types.js';
import { pmpCustomIcons } from '../../../../../../styles/custom-iconsets/pmp-icons.js';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin DynamicDialogMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin ArrayHelperMixin
 * @appliesMixin FrNumbersConsistencyMixin
 */
const InterventionFundReservationsMixins = EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  DynamicDialogMixin,
  EndpointsMixin,
  ArrayHelperMixin,
  FrNumbersConsistencyMixin
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin InterventionFundReservationsMixins
 */
class FundReservations extends InterventionFundReservationsMixins {
  [x: string]: any;
  static get template() {
    return html`
      ${pmpCustomIcons}
      ${frWarningsStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
        }

        #frs-container {
          padding: 16px 0;
        }

        .fr-number {
          padding: 8px 12px;
          font-size: 16px;
          box-sizing: border-box;
        }

        .warning {
          padding: 24px;
        }

        .warning,
        .fr-number {
          line-height: 24px;
        }
      </style>

      <etools-content-panel panel-title="Fund Reservations">
        <paper-icon-button slot="panel-btns"
                          icon="add-box"
                          on-click="_openFrsDialog"
                          hidden$="[[!editMode]]"
                          disabled$="[[!editMode]]"></paper-icon-button>
        <div id="frs-container" hidden$="[[!thereAreFrs(intervention.frs_details)]]">
          <etools-info-tooltip class="frs-inline-list"
                              icon-first
                              custom-icon
                              hide-tooltip$="[[!frsConsistencyWarningIsActive(_frsConsistencyWarning)]]">
            <div slot="field">
              <template is="dom-repeat" items="[[intervention.frs_details.frs]]">
                <span class="fr-number">[[item.fr_number]]</span>
              </template>
            </div>
            <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
            <span slot="message"><span>[[_frsConsistencyWarning]]</span></span>
          </etools-info-tooltip>
        </div>
        <!-- class or slot? -->
        <div class="warning" hidden$="[[thereAreFrs(intervention.frs_details)]]">
          [[_getNoFrsWarningText(intervention.id)]]
        </div>

      </etools-content-panel>
    `;
  }

  static get properties() {
    return {
      intervention: {
        type: Object
      },
      editMode: {
        type: Boolean
      },
      frsDialogEl: {
        type: Object
      },
      frsConfirmationsDialog: {
        type: Object
      },
      _frsDetailsRequestEndpoint: {
        type: Object
      },
      _lastFrsDetailsReceived: {
        type: Object
      },
      _frsConsistencyWarning: {
        type: String,
        value: ''
      },
      _frsConfirmationsDialogMessage: {
        type: String
      },
      _frsNrsLoadingMsgSource: {
        type: String,
        value: 'fr-nrs-check'
      }
    };
  }

  static get observers() {
    return [
      '_frsDetailsChanged(intervention.frs_details, intervention.planned_budget.unicef_cash_local,' +
      ' intervention.start, intervention.end)'
    ];
  }

  ready() {
    super.ready();
    this.set('_frsDetailsRequestEndpoint', this.getEndpoint('frNumbersDetails'));
  }

  connectedCallback() {
    super.connectedCallback();
    this._createFrsDialogEl();
    this._createFrsConfirmationsDialog();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // remove update frs el on fr el detached
    this._removeFrsDialogEl();

    // remove confirmations frs dialog on fr element detached
    this._removeFrsConfirmationsDialog();
  }

  _createFrsDialogEl() {
    // init frs update element
    this.frsDialogEl = document.createElement('update-fr-numbers');
    this.frsDialogEl.setAttribute('id', 'frNumbersUpdateEl');

    // attach frs update handler (on modal/dialog close)
    this.frNumbersUpdateHandler = this.frNumbersUpdateHandler.bind(this);
    this.frsDialogEl.addEventListener('update-frs-dialog-close', this.frNumbersUpdateHandler);

    document.querySelector('body')!.appendChild(this.frsDialogEl);
  }

  _removeFrsDialogEl() {
    if (this.frsDialogEl) {
      this.frsDialogEl.removeEventListener('update-frs-dialog-close', this.frNumbersUpdateHandler);
      document.querySelector('body')!.removeChild(this.frsDialogEl);
    }
  }

  _createFrsConfirmationsDialog() {
    // init frs confirmations dialog element
    this._frsConfirmationsDialogMessage = document.createElement('span');
    this._frsConfirmationsDialogMessage.setAttribute('id', 'frsConfirmationsDialogMessage');

    this._frsInconsistenciesConfirmationHandler = this._frsInconsistenciesConfirmationHandler.bind(this);
    this.frsConfirmationsDialog = this.createDialog('Fund Reservation Warning', 'md', 'Yes', 'No',
        this._frsInconsistenciesConfirmationHandler, this._frsConfirmationsDialogMessage);
  }

  _removeFrsConfirmationsDialog() {
    if (this.frsConfirmationsDialog) {
      this.frsConfirmationsDialog.removeEventListener('close', this._frsInconsistenciesConfirmationHandler);
      this.removeDialog(this.frsConfirmationsDialog);
    }
  }

  _updateFrsInconsistenciesDialogMessage(warning: string) {
    if (!this.frsConfirmationsDialog) {
      return;
    }
    if (this._frsConfirmationsDialogMessage) {
      this._frsConfirmationsDialogMessage.innerHTML = warning + '<br><br>Do you want to continue?';
    } else {
      this.logWarn('frsConfirmationsDialogMessage element not found', 'Fund Reservations');
    }
  }

  _openFrsDialog() {
    if (!this.editMode) {
      return;
    }
    if (this.frsDialogEl) {
      // populate dialog with current frs numbers deep copy
      let currentFrs = this._getCurrentFrs();
      let frs = currentFrs.map((fr) => {
            return {fr_number: fr.fr_number};
          });

      this.frsDialogEl.set('dataItems', frs);
      this.frsDialogEl.set('interventionStatus', this.intervention.status);
      this.frsDialogEl.openDialog();
    }
  }

  // get original/initial intervention frs numbers
  _getCurrentFrs() {
    return (this.intervention.frs_details &&
            this.intervention.frs_details.frs instanceof Array)
        ? this.intervention.frs_details.frs : [];
  }

  frNumbersUpdateHandler(e: CustomEvent) {
    e.stopImmediatePropagation();
    let frNumbers = e.detail.frs;
    if (frNumbers.length === 0) {
      this._handleEmptyFrsAfterUpdate();
      return;
    }
    // FR Numbers not empty
    this._handleNotEmptyFrsAfterUpdate(frNumbers);
  }

  /**
   * After FR Numbers update the numbers list might be empty.
   * This can happen if the user removed all the existing numbers or if there is no change made
   */
  _handleEmptyFrsAfterUpdate() {
    let frsBeforeUpdate = this._getCurrentFrs();
    if (frsBeforeUpdate.length !== 0) {
      // all FR Numbers have been deleted
      this._triggerPdFrsUpdate({frs: []});
    }
  }

  /**
   * Updates made and FR Numbers list is not empty
   */
  _handleNotEmptyFrsAfterUpdate(frNumbers) {
    let diff = this.getArraysDiff(this._getCurrentFrs(), frNumbers, 'fr_number');
    if (!diff.length) {
      // no changes have been made to FR Numbers
      this.frsDialogEl.closeDialog();
    } else {
      // request FR Numbers details from server
      this._triggerFrsDetailsRequest(frNumbers);
    }
  }

  // handle frs validations warning confirmation
  _frsInconsistenciesConfirmationHandler(e: CustomEvent) {
    e.stopImmediatePropagation();

    if (e.detail.confirmed) {
      // confirmed, add numbers to intervention
      this._triggerPdFrsUpdate(Object.assign({}, this._lastFrsDetailsReceived));
      this.set('_lastFrsDetailsReceived', null);
    } else {
      // frs warning not confirmed/cancelled, frs update is canceled
      // re-check frs warning on initial data
      this._frsDetailsChanged(this.intervention.frs_details);
    }
  }

  /**
   * Get FR Numbers details from server
   */
  _triggerFrsDetailsRequest(frNumbers: []) {
    this.frsDialogEl.startSpinner();

    let url = this._frsDetailsRequestEndpoint.url + '?values=' + frNumbers.join(',');
    if (this.intervention.id) {
      url += '&intervention=' + this.intervention.id;
    }

    this.sendRequest({
      endpoint: {url: url}
    }).then((resp: any) => {
      this._frsDetailsSuccessHandler(resp);
    }).catch((error: any) => {
      this._frsDetailsErrorHandler(error.response);
    });
  }

  /*
  * Frs details received, check frs consistency
  */
  _frsDetailsSuccessHandler(frsDetails: FrsDetails) {

    frsDetails.currencies_match = this._frsCurrenciesMatch(frsDetails.frs);

    let inconsistencyMsg = this.checkFrsConsistency(frsDetails, this.intervention, true);
    this.set('_frsConsistencyWarning', inconsistencyMsg);

    if (inconsistencyMsg) { // there are inconsistencies
      this.set('_lastFrsDetailsReceived', frsDetails);

      this._updateFrsInconsistenciesDialogMessage(inconsistencyMsg);
      this._openFrsInconsistenciesDialog();
    } else {
      // append FR numbers to intervention
      this._triggerPdFrsUpdate(frsDetails);
    }
  }

  /**
   * frs details request failed
   */
  _frsDetailsErrorHandler(responseErr: any) {
    this.frsDialogEl.stopSpinner();

    // show the invalid frs warning
    this.fireEvent('toast', {
      text: responseErr.error,
      showCloseBtn: true
    });
  }

  // trigger FR Numbers update on main intervention
  _triggerPdFrsUpdate(newFrsDetails: FrsDetails) {
    this.frsDialogEl.closeDialog();
    this.fireEvent('frs-update', {frsDetails: newFrsDetails});
  }

  thereAreFrs(_frsDetails: any) {
    let frs = this._getCurrentFrs();
    return !!frs.length;
  }

  _openFrsInconsistenciesDialog() {
    if (this.frsConfirmationsDialog) {
      this.frsConfirmationsDialog.opened = true;
      this.frsDialogEl.closeDialog();
    }
  }

  _getNoFrsWarningText(interventionId: string) {
    let msg = 'There are no fund reservations numbers added.';
    if (!interventionId) {
      msg = 'You can not add FR Numbers. The PD/SSFA needs to be saved first.';
    }
    return msg;
  }

  _frsDetailsChanged(frsDetails: FrsDetails) {
    if (typeof frsDetails === 'undefined') {
      return;
    }
    this._frsDetailsDebouncer = Debouncer.debounce(this._frsDetailsDebouncer,
        timeOut.after(10),
        () => {
          this.set('_frsConsistencyWarning', this.checkFrsConsistency(frsDetails, this.intervention));
        });
  }

}

window.customElements.define('fund-reservations', FundReservations);
