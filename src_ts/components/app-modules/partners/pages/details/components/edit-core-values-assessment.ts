import {PolymerElement, html} from '@polymer/polymer';
import 'etools-dialog/etools-dialog';
import '@unicef-polymer/etools-upload/etools-upload';

import '../../../../../layout/etools-form-element-wrapper';


import pmpEdpoints from '../../../../../endpoints/endpoints';
import CommonMixin from '../../../../../mixins/common-mixin';

import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles';
import {requiredFieldStarredStyles} from '../../../../../styles/required-field-styles';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import EtoolsDialog from 'etools-dialog/etools-dialog';
/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 */
class EditCoreValuesAssessment extends CommonMixin(PolymerElement) {

  static get template() {
    // language=HTML
    return html`
      ${gridLayoutStyles} ${requiredFieldStarredStyles}
      <style>
        :host {
          display: block
        }
      </style>

      <etools-dialog id="cvaDialog" dialog-title="Upload Core Values Assessment" size="md"
                     ok-btn-text="Save" keep-dialog-open on-confirm-btn-clicked="_saveCoreValueAssessment"
                     disable-confirm-btn="[[uploadInProgress]]"
                     disable-dismiss-btn="[[uploadInProgress]]">
        <div class="layout-horizontal row-padding-v">
          <etools-form-element-wrapper label="Date Last Assessed"
                                       value="[[getDateDisplayValue(item.date)]]">
          </etools-form-element-wrapper>
        </div>
        <div class="layout-horizontal row-padding-v">
          <etools-upload id="attachment"
                         label="Core Values Assessment"
                         accept=".doc,.docx,.pdf,.jpg,.png"
                         file-url="[[item.attachment]]"
                         upload-endpoint="[[uploadEndpoint]]"
                         on-upload-finished="_uploadFinished"
                         upload-in-progress="{{uploadInProgress}}"
                         required
                         error-message="Assessment file is required">
          </etools-upload>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  item: any = {};

  @property({type: Object})
  parent!: PolymerElement;

  @property({type: String})
  uploadEndpoint: string = pmpEdpoints.attachmentsUpload.url;

  @property({type: Boolean})
  uploadInProgress: boolean = false;

  open() {
    (this.$.cvaDialog as EtoolsDialog).opened = true;
  }

  _saveCoreValueAssessment() {
    const attach = this.shadowRoot!.querySelector('#attachment') as any;
    if (!attach || !attach.validate()) {
      return;
    }
    fireEvent(this.parent, 'save-core-values-assessment', this.item);
    (this.$.cvaDialog as EtoolsDialog).opened = false;
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = JSON.parse(e.detail.success);
      this.set('item.attachment', uploadResponse.id);
    }
  }

}

window.customElements.define('edit-core-values-assessment', EditCoreValuesAssessment);

export {EditCoreValuesAssessment as EditCoreValuesAssessmentEl};
