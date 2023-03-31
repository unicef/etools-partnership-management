import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/paper-item/paper-item.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation, translateUnsafeHTML} from 'lit-translate';
import '@polymer/paper-checkbox/paper-checkbox.js';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';

/**
 * @polymer
 * @customElement
 */
@customElement('generate-pca-dialog')
export class GeneratePcaDialog extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        paper-dropdown-menu,
        paper-listbox {
          width: 250px;
        }

        .terms_wrapper {
          overflow-y: auto;
          overflow-x: hidden;
          max-height: 40vh;
          margin-bottom: 25px;
        }
      </style>
      <etools-dialog
        id="etoolsDialog"
        size="md"
        .okBtnText="${translate('DOWNLOAD')}"
        dialog-title="${translate('GENERATE_PCA')}"
        keep-dialog-open
        @close="${this._onClose}"
        @confirm-btn-clicked="${this._onConfirm}"
        opened
      >
        <div>
          <div class="terms_wrapper">${translateUnsafeHTML('PCA_TERMS_AND_CONDITIONS')}</div>
          <div class="layout-horizontal flex-c">
            <div class="col col-12">
              <paper-checkbox
                @checked-changed=${({detail}: CustomEvent) => {
                  this.acknowledgedTC = detail.value;
                }}
                required
                ?invalid="${this.errors.acknowledgedTC}"
                @focus="${() => this.resetFieldError('acknowledgedTC')}"
                @click="${() => this.resetFieldError('acknowledgedTC')}"
              >
                ${translate('PCA_READ_AND_FOLLOWED_INSTRUCTIONS')}
              </paper-checkbox>
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
    {value: 'english', label: getTranslation('ENGLISH')}
    // comment then until everything it's translated
    // {value: 'french', label: getTranslation('FRENCH')},
    // {value: 'portuguese', label: getTranslation('PORTUGUESE')},
    // {value: 'russian', label: getTranslation('RUSSIAN')},
    // {value: 'spanish', label: getTranslation('SPANISH')},
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
      fireEvent(this, 'toast', {text: getTranslation('PCA_REQUIRE_ACKNOWLEDGE')});
    }

    if (!this.selectedTemplate) {
      this.errors.selectedTemplate = true;
      fireEvent(this, 'toast', {text: getTranslation('PCA_REQUIRE_TEMPLATE')});
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
        '/generate_doc/?lang=' +
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

export {GeneratePcaDialog as GeneratePcaDialogEl};
