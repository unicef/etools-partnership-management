import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
import 'etools-dialog/etools-dialog.js';

import EventHelper from '../../../mixins/event-helper-mixin.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin EventHelper
 */
class NewPartnerDialog extends EventHelper(PolymerElement) {

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

  static get properties() {
    return {
      vendorNumber: String,
      vendorNumberIsEmpty: {
        type: Boolean,
        computed: '_vendorNumberIsEmpty(vendorNumber)'
      }
    }
  }

  public vendorNumber: string = '';
  public vendorNumberIsEmpty: boolean = true;

  // @ts-ignore
  private _vendorNumberIsEmpty(): boolean {
    return !this.vendorNumber;
  }

  openNewPartnerDialog() {
    this.$.vendorNo.invalid = false;
    this.$.newPartnerDialog.opened = true;
  }

  _handleDialogClosed(closingReason: CustomEvent) {
    if (closingReason.detail.confirmed) {
      if (!this.vendorNumber) {
        return;
      }
      this.fireEvent('create-partner', {vendor: this.vendorNumber});
    } else {
      this.vendorNumber = '';
    }
  }

}

window.customElements.define('new-partner-dialog', NewPartnerDialog);
