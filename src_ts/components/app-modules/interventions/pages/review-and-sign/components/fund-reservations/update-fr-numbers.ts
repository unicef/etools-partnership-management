import '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

import '@unicef-polymer/etools-dialog/etools-dialog.js';
import RepeatableDataSetsMixin from '../../../../../../mixins/repeatable-data-sets-mixin';
import {PolymerElement, html} from '@polymer/polymer';
import {fireEvent} from '../../../../../../utils/fire-custom-event';
import {gridLayoutStyles} from '../../../../../../styles/grid-layout-styles';
import {repeatableDataSetsStyles} from '../../../../../../styles/repeatable-data-sets-styles';
import {buttonsStyles} from '../../../../../../styles/buttons-styles';
import {property} from '@polymer/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {PaperDialogElement} from '@polymer/paper-dialog/paper-dialog';

/**
 * @polymer
 * @customElement
 * @appliesMixin RepeatableDataSetsMixinMixin
 */
class UpdateFrNumbers extends (RepeatableDataSetsMixin(PolymerElement)) {
  static get template() {
    return html`
      ${gridLayoutStyles} ${repeatableDataSetsStyles} ${buttonsStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        :host {
          --paper-dialog-scrollable: {
            width: 100%;
            overflow-x: hidden;
            overflow-y: auto;
            max-height: 400px;
            padding: 0;
            margin-top: -20px;
            box-sizing: border-box;
          };
          --etools-dialog-title: {
            margin-bottom: 0 !important;
          }
        }

        paper-input {
          width: 250px;
        }

      </style>

      <etools-dialog id="frsDialog"
                    size="md"
                    dialog-title="Add/Update FR Numbers"
                    ok-btn-text="Add/Update"
                    disable-confirm-btn="[[disableConfirmBtn]]"
                    on-confirm-btn-clicked="_checkFrNumbers"
                    no-padding keep-dialog-open
                    spinner-text="Checking FR Numbers updates...">
        <template is="dom-repeat" items="{{dataItems}}">
          <div class="row-h item-container">
            <div class="item-actions-container">
              <div class="actions">
                <paper-icon-button class="action delete"
                                  on-tap="_openDeleteConfirmation"
                                  data-args$="[[index]]"
                                  icon="cancel"
                                  disabled$="[[!_showDeleteFrBtn(interventionStatus, dataItems.length)]]">
                </paper-icon-button>
              </div>
            </div>
            <div class="item-content">
              <div class="row-h">
                <!-- FR Number -->
                <paper-input id$="fr-nr-[[index]]"
                            label="FR Number"
                            value="{{item.fr_number}}"
                            placeholder="&#8212;"
                            allowed-pattern="[0-9]"
                            required
                            error-message="Please fill FR Number or remove the field"
                            on-value-changed="_frNrValueChanged">
                </paper-input>
              </div>
            </div>
          </div>
        </template>

        <div class="row-h" hidden$="[[!_emptyList(dataItems.length)]]">
          There are no fund reservations numbers added.
        </div>

        <div class="row-h">
          <paper-button class="secondary-btn" on-tap="_addNewFundReservation">
            <iron-icon icon="add"></iron-icon>
            Add FR Number
          </paper-button>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Boolean})
  editMode: boolean = true;

  // TODO: check if deleteDialog is still used
  // @property({type: Object, observer: '_delConfirmationDialogChange'})
  // deleteDialog!: object;

  @property({type: String})
  deleteConfirmationMessage: string = 'Are you sure you want to delete this FR Number?';

  @property({type: Boolean})
  disableConfirmBtn: boolean = true;

  @property({type: String})
  interventionStatus!: string;

  static get observers() {
    return ['_itemsLengthChanged(dataItems.length)'];
  }

  ready() {
    super.ready();
    this.dataSetModel = {fr_number: null};
  }

  _showDeleteFrBtn(interventionStatus: string, dataItemsLength: number) {
    return !(interventionStatus === 'active' && dataItemsLength === 1);
  }

  // _delConfirmationDialogChange() {
  //   if (!this.deleteDialog) {
  //     return;
  //   }
  //   // update delete confirmation dialog size
  //   this.deleteDialog.set('size', 'sm');
  // }

  openDialog() {
    (this.$.frsDialog as EtoolsDialog).opened = true;
  }

  stopSpinner(e?: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
    }
    (this.$.frsDialog as EtoolsDialog).stopSpinner();
  }

  startSpinner(e?: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
    }
    (this.$.frsDialog as EtoolsDialog).startSpinner();
  }

  closeDialog() {
    this.stopSpinner();
    (this.$.frsDialog as EtoolsDialog).opened = false;
  }

  validate() {
    let valid = true;
    if (this.dataItems instanceof Array && this.dataItems.length > 0) {
      this.dataItems.forEach((_item, index) => {
        const lastItem = this.shadowRoot!.querySelector('#fr-nr-' + index) as PaperInputElement;
        if (lastItem && !lastItem.validate()) {
          valid = false;
        }
      });
    }

    return valid;
  }

  _addNewFundReservation() {
    if (!this.validate()) {
      return;
    }
    this._addElement();
    setTimeout(this._centerDialog.bind(this), 0);
    setTimeout(this._updateScroll.bind(this), 100);
  }

  _centerDialog() {
    const d = this._getPaperDialog();
    if (d) {
      d.center();
    }
  }

  _updateScroll() {
    (this.$.frsDialog as EtoolsDialog).scrollDown();
  }

  _getPaperDialog() {
    return (this.$.frsDialog.shadowRoot!.querySelector('paper-dialog') as PaperDialogElement);
  }

  _emptyList(length: number) {
    return length === 0;
  }

  _frNrValueChanged() {
    if (!this.validate()) {
      this.set('disableConfirmBtn', true);
      return;
    }
    this.set('disableConfirmBtn', false);
  }

  _itemsLengthChanged(length: number) {
    if (typeof length === 'undefined') {
      return;
    }
    this._frNrValueChanged();
  }

  _checkFrNumbers(_e: CustomEvent) {
    if (!this.validate()) {
      return;
    }
    // resend fr number changes back to main fund reservations element
    fireEvent(this, 'update-frs-dialog-close', {frs: this._getUpdatedFrsNumbers()});
  }

  // prepare the fr numbers list, used to verify them using API endpoint (/api/v2/funds/frs)
  _getUpdatedFrsNumbers() {
    if (this.dataItems instanceof Array && this.dataItems.length > 0) {
      return this.dataItems.map((item) => {
        return item.fr_number;
      });
    }
    return [];
  }
}

window.customElements.define('update-fr-numbers', UpdateFrNumbers);
export {UpdateFrNumbers as UpdateFrNumbersEl};
