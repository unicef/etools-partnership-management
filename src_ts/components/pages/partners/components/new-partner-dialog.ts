/* eslint-disable lit-a11y/no-autofocus */
import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';

/**
 * @LitElement
 * @customElement
 */
@customElement('new-partner-dialog')
export class NewPartnerDialog extends LitElement {
  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <etools-dialog
        id="newPartnerDialog"
        size="md"
        ok-btn-text="${translate('GENERAL.SAVE')}"
        ?disable-confirm-btn="${this.vendorNumberIsEmpty}"
        dialog-title="${translate('IMPORT_SYNC_PARTNER')}"
        keep-dialog-open
        @close="${this._onClose}"
        @confirm-btn-clicked="${this._handleDialogClosed}"
      >
        <etools-input
          id="vendorNo"
          label="${translate('VISION_VENDOR_NUMBER')}"
          .value="${this.vendorNumber}"
          @value-changed="${({detail}: CustomEvent) => {
            this.vendorNumber = detail.value;
          }}"
          placeholder="&#8212;"
          autofocus
          required
          auto-validate
          error-message="${translate('VISION_VENDOR_NUMBER_REQUIRED')}"
          allowed-pattern="[0-9]"
          char-counter
          maxlength="11"
        ></etools-input>
      </etools-dialog>
    `;
  }

  _vendorNumber!: string;

  set vendorNumber(vendorNumber: string) {
    this._vendorNumber = vendorNumber;
    this.vendorNumberIsEmpty = !this.vendorNumber;
  }

  @property({type: String})
  get vendorNumber() {
    return this._vendorNumber;
  }

  @property({type: Boolean})
  vendorNumberIsEmpty = true;

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
