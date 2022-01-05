import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {fireEvent} from '../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import CommonMixin from '../../../common/mixins/common-mixin';

/**
 * @polymer
 * @customElement
 */
export class NewPartnerDialog extends CommonMixin(PolymerElement) {
  static get template() {
    // language=HTML
    return html`
      <etools-dialog
        id="newPartnerDialog"
        size="md"
        ok-btn-text="Save"
        disable-confirm-btn="[[vendorNumberIsEmpty]]"
        dialog-title="[[_getTranslation('IMPORT_PARTNER')]]"
        keep-dialog-open
        opened
        on-close="_onClose"
        on-confirm-btn-clicked="_handleDialogClosed"
      >
        <paper-input
          id="vendorNo"
          label="[[_getTranslation('VISION_VENDOR_NUMBER')]]"
          value="{{vendorNumber}}"
          placeholder="&#8212;"
          autofocus
          required
          auto-validate
          error-message="[[_getTranslation('VISION_VENDOR_NUMBER_REQUIRED')]]"
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
