import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {fireEvent} from '../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 */
export class NewPartnerDialog extends PolymerElement {
  static get template() {
    // language=HTML
    return html`
      <etools-dialog
        id="newPartnerDialog"
        size="md"
        ok-btn-text="Save"
        disable-confirm-btn="[[vendorNumberIsEmpty]]"
        dialog-title="Import Partner"
        keep-dialog-open
        opened="{{dialogOpened}}"
        on-close="_onClose"
        on-confirm-btn-clicked="_handleDialogClosed"
      >
        <paper-input
          id="vendorNo"
          label="VISION Vendor Number"
          value="{{vendorNumber}}"
          placeholder="&#8212;"
          autofocus
          required
          auto-validate
          error-message="VISION Vendor number is required"
          allowed-pattern="[0-9]"
          char-counter
          maxlength="11"
        ></paper-input>
      </etools-dialog>
    `;
  }

  @property({type: String})
  vendorNumber = '';

  @property({type: Boolean, computed: '_vendorNumberIsEmpty(vendorNumber)'})
  vendorNumberIsEmpty = true;

  @property({type: Boolean})
  protected dialogOpened = true;

  // @ts-ignore
  private _vendorNumberIsEmpty(): boolean {
    return !this.vendorNumber;
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _handleDialogClosed() {
    if (!this.vendorNumber.trim()) {
      return;
    }
    fireEvent(this, 'dialog-closed', {confirmed: true, response: {vendor: this.vendorNumber.trim()}});
  }
}

window.customElements.define('new-partner-dialog', NewPartnerDialog);
