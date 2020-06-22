import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {property} from '@polymer/decorators';
import {LabelAndValue} from '../../../../../../typings/globals.types';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';

/**
 * @polymer
 * @customElement
 */
class GeneratePcaDialog extends PolymerElement {
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
        ok-btn-text="Download"
        dialog-title="Generate PCA"
        on-close="_handleDialogClosed"
      >
        <paper-dropdown-menu label="Choose Template">
          <paper-listbox slot="dropdown-content" attr-for-selected="item-value" selected="{{selectedTemplate}}">
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
    {value: 'english', label: 'English'},
    {value: 'french', label: 'French'},
    {value: 'portuguese', label: 'Portuguese'},
    {value: 'russian', label: 'Russian'},
    {value: 'spanish', label: 'Spanish'},
    {value: 'ifrc_english', label: 'IFRC English'},
    {value: 'ifrc_french', label: 'IFRC French'}
  ];

  @property({type: String})
  selectedTemplate: string | null = null;

  open() {
    (this.$.etoolsDialog as EtoolsDialog).opened = true;
  }

  _handleDialogClosed(closingReason: any) {
    if (typeof closingReason.detail.confirmed === 'undefined') {
      // filter out the on-close event fired by the containing dropdown
      return;
    }
    if (closingReason.detail.confirmed) {
      window.open(
        '/api/v2/agreements/' +
          this.agreementId +
          '/generate_doc/?lang=' +
          encodeURIComponent(this.selectedTemplate as string),
        '_blank'
      );
    }
    this.selectedTemplate = null;
  }
}

window.customElements.define('generate-pca-dialog', GeneratePcaDialog);
export {GeneratePcaDialog as GeneratePcaDialogEl};
