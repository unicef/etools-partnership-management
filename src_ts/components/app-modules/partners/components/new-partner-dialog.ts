import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
import 'etools-dialog/etools-dialog.js';
import {fireEvent} from '../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {PaperInputElement} from '@polymer/paper-input/paper-input.js';
import EtoolsDialog from 'etools-dialog/etools-dialog.js';

/**
 * @polymer
 * @customElement
 */
export class NewPartnerDialog extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      <style>
        #vendorNo {
          margin-bottom: 30px;
        }
      </style>

      <etools-dialog id="newPartnerDialog" size="md" ok-btn-text="Save" disable-confirm-btn="[[vendorNumberIsEmpty]]"
                     dialog-title="Import Partner" on-close="_handleDialogClosed">

        <paper-input id="vendorNo" label="VISION Vendor Number" value="{{vendorNumber}}"
                     placeholder="&#8212;" autofocus
                     required auto-validate error-message="VISION Vendor number is required"
                     allowed-pattern="[0-9]"
                     char-counter
                     maxlength="11"></paper-input>

      </etools-dialog>
    `;
  }

  @property({type: String})
  vendorNumber: string = '';

  @property({type: Boolean, computed: '_vendorNumberIsEmpty(vendorNumber)'})
  vendorNumberIsEmpty: boolean = true;

  // @ts-ignore
  private _vendorNumberIsEmpty(): boolean {
    return !this.vendorNumber;
  }

  openNewPartnerDialog() {
    (this.$.vendorNo as PaperInputElement).invalid = false;
    (this.$.newPartnerDialog as EtoolsDialog).opened = true;
  }

  _handleDialogClosed(closingReason: CustomEvent) {
    if (closingReason.detail.confirmed) {
      if (!this.vendorNumber) {
        return;
      }
      fireEvent(this, 'create-partner', {vendor: this.vendorNumber});
    } else {
      this.vendorNumber = '';
    }
  }

}

window.customElements.define('new-partner-dialog', NewPartnerDialog);
