import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {LabelAndValue} from '@unicef-polymer/etools-types';
// @dci check GTC_TERMS_AND_CONDITIONS import {translateUnsafeHTML} from 'lit-translate';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

/**
 * @LitElement
 * @customElement
 */
@customElement('generate-gtc-dialog')
export class GenerateGtcDialog extends LitElement {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        .terms_wrapper {
          overflow-y: auto;
          overflow-x: hidden;
          max-height: 40vh;
          margin-bottom: 25px;
        }
        etools-checkbox[invalid]::part(control) {
          border-color: red;
        }
      </style>
      <etools-dialog
        id="etoolsDialog"
        size="md"
        .okBtnText="${translate('DOWNLOAD')}"
        dialog-title="${translate('GENERATE_GTC')}"
        keep-dialog-open
        @close="${this._onClose}"
        @confirm-btn-clicked="${this._onConfirm}"
      >
        <div>
          <div class="terms_wrapper">${translate('GTC_TERMS_AND_CONDITIONS')}</div>
          <div class="layout-horizontal flex-c">
            <div class="col col-12">
              <etools-checkbox
                @sl-change=${(e: any) => {
                  this.acknowledgedTC = e.target.checked;
                }}
                required
                ?invalid="${this.errors.acknowledgedTC}"
                @focus="${() => this.resetFieldError('acknowledgedTC')}"
                @click="${() => this.resetFieldError('acknowledgedTC')}"
              >
                ${translate('GTC_READ_AND_FOLLOWED_INSTRUCTIONS')}
              </etools-checkbox>
            </div>
          </div>
          <div class="layout-horizontal row-padding-v  flex-c">
            <div class="col col-12">
              <etools-dropdown
                class="validate-input required"
                .selected="${this.selectedTemplate}"
                label="${translate('CHOOSE_TEMPLATE')}"
                placeholder="${translate('CHOOSE_TEMPLATE')}"
                .options="${this.templateOptions}"
                option-label="label"
                option-value="value"
                update-selected
                required
                ?invalid="${this.errors.selectedTemplate}"
                @focus="${() => this.resetFieldError('selectedTemplate')}"
                @click="${() => this.resetFieldError('selectedTemplate')}"
                hide-search
                allow-outside-scroll
                dynamic-align
                trigger-value-change-event
                @etools-selected-item-changed="${({detail}: CustomEvent) =>
                  (this.selectedTemplate = detail.selectedItem?.value)}"
              >
              </etools-dropdown>
            </div>
          </div>
          <br />
        </div>
      </etools-dialog>
    `;
  }

  @property({type: String})
  agreementId: string | null = null;

  @property({type: Boolean})
  acknowledgedTC = false;

  @property({type: Object})
  errors: any = {};

  @property({type: Array})
  templateOptions: LabelAndValue[] = [
    {value: 'english', label: getTranslation('ENGLISH')},
    {value: 'french', label: getTranslation('FRENCH')},
    {value: 'portuguese', label: getTranslation('PORTUGUESE')},
    {value: 'russian', label: getTranslation('RUSSIAN')},
    {value: 'spanish', label: getTranslation('SPANISH')}
    // {value: 'arabic', label: getTranslation('ARABIC')} // Not working as expected on backend
    // {value: 'ifrc_english', label: getTranslation('IFRC_ENGLISH')},
    // {value: 'ifrc_french', label: getTranslation('IFRC_FRENCH')}
  ];

  @property({type: String})
  selectedTemplate: string | null = null;

  set dialogData(data: any) {
    const {agreementId}: any = data;
    this.agreementId = agreementId;
  }

  validate() {
    this.errors = {};
    if (!this.acknowledgedTC) {
      this.errors.acknowledgedTC = true;
      fireEvent(this, 'toast', {text: getTranslation('GTC_REQUIRE_ACKNOWLEDGE')});
    }

    if (!this.selectedTemplate) {
      this.errors.selectedTemplate = true;
      fireEvent(this, 'toast', {text: getTranslation('GTC_REQUIRE_TEMPLATE')});
    }

    this.requestUpdate();
    return Object.keys(this.errors).length === 0;
  }

  _onConfirm() {
    if (!this.validate()) {
      return;
    }

    window.open(
      '/api/v2/agreements/' +
        this.agreementId +
        '/generate_gtc/?lang=' +
        encodeURIComponent(this.selectedTemplate as string) +
        '&terms_acknowledged=' +
        encodeURIComponent(this.acknowledgedTC),
      '_blank'
    );
    this.selectedTemplate = null;
    this._onClose();
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  resetFieldError(field: string) {
    if (!this.errors[field]) {
      return;
    }
    delete this.errors[field];
    this.requestUpdate();
  }
}

export {GenerateGtcDialog as GenerateGtcDialogEl};
