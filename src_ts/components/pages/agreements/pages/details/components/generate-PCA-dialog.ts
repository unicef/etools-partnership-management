import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {property} from '@polymer/decorators';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import CommonMixin from '../../../../../common/mixins/common-mixin';
import {get as getTranslation} from 'lit-translate';

/**
 * @polymer
 * @customElement
 */
class GeneratePcaDialog extends CommonMixin(PolymerElement) {
  static get template() {
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
        ok-btn-text="[[_getTranslation('DOWNLOAD')]]"
        dialog-title="[[_getTranslation('GENERATE_PCA')]]"
        keep-dialog-open
        on-close="_onClose"
        on-confirm-btn-clicked="_onConfirm"
        opened
      >
        <paper-dropdown-menu label="[[_getTranslation('CHOOSE_TEMPLATE')]]">
          <paper-listbox
            slot="dropdown-content"
            attr-for-selected="item-value"
            selected="[[selectedTemplate]]"
            on-selected-changed="onSelectedTemplateChanged"
          >
            <template id="repeat" is="dom-repeat" items="[[templateOptions]]">
              <paper-item item-value$="[[item.value]]">[[item.label]]</paper-item>
            </template>
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

  onSelectedTemplateChanged(e: CustomEvent) {
    this.selectedTemplate = e.detail.value;
  }
}

window.customElements.define('generate-pca-dialog', GeneratePcaDialog);
export {GeneratePcaDialog as GeneratePcaDialogEl};
