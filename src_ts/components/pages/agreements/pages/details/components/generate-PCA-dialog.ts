import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';

/**
 * @polymer
 * @customElement
 */
@customElement('generate-pca-dialog')
export class GeneratePcaDialog extends LitElement {
  render() {
    return html`
      <style>
        paper-dropdown-menu,
        paper-listbox {
          width: 250px;
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
        <paper-dropdown-menu label="${translate('CHOOSE_TEMPLATE')}">
          <paper-listbox
            slot="dropdown-content"
            attr-for-selected="item-value"
            .selected="${this.selectedTemplate}"
            @selected-changed="${(e: CustomEvent) => {
              this.selectedTemplate = e.detail.value;
            }}"
          >
            ${this.templateOptions.map(
              (item: any) => html` <paper-item .item-value="${item.value}">${item.label}</paper-item>`
            )}
          </paper-listbox>
        </paper-dropdown-menu>
      </etools-dialog>
    `;
  }

  @property({type: String})
  agreementId: string | null = null;

  @property({type: Array})
  templateOptions: LabelAndValue[] = [
    {value: 'english', label: getTranslation('ENGLISH')},
    {value: 'french', label: getTranslation('FRENCH')},
    {value: 'portuguese', label: getTranslation('PORTUGUESE')},
    {value: 'russian', label: getTranslation('RUSSIAN')},
    {value: 'spanish', label: getTranslation('SPANISH')},
    {value: 'ifrc_english', label: getTranslation('IFRC_ENGLISH')},
    {value: 'ifrc_french', label: getTranslation('IFRC_FRENCH')}
  ];

  @property({type: String})
  selectedTemplate: string | null = null;

  set dialogData(data: any) {
    const {agreementId}: any = data;
    this.agreementId = agreementId;
  }

  _onConfirm() {
    window.open(
      '/api/v2/agreements/' +
        this.agreementId +
        '/generate_doc/?lang=' +
        encodeURIComponent(this.selectedTemplate as string),
      '_blank'
    );
    this.selectedTemplate = null;
    this._onClose();
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

}

export {GeneratePcaDialog as GeneratePcaDialogEl};
