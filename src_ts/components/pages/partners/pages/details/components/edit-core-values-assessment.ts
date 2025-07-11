import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import pmpEdpoints from '../../../../../endpoints/endpoints';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {EtoolsUpload} from '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';

/**
 * @LitElement
 * @customElement
 * @appliesMixin CommonMixin
 */
@customElement('edit-core-values-assessment')
export class EditCoreValuesAssessment extends CommonMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-dialog
        id="cvaDialog"
        dialog-title="${translate('UPLOAD_CORE_VALUES_ASSESSMENT')}"
        size="md"
        ok-btn-text="${translate('GENERAL.SAVE')}"
        keep-dialog-open
        @close="${this._onClose}"
        @confirm-btn-clicked="${this._saveCoreValueAssessment}"
        .disableConfirmBtn="${this.uploadInProgress}"
        .disableDismissBtn="${this.uploadInProgress}"
      >
        <div class="layout-horizontal row-padding-v">
          <etools-input
            readonly
            placeholder="—"
            label="${translate('DATE_LAST_ASSESSED')}"
            .value="${this.getDateDisplayValue(this.item.date)}"
          >
          </etools-input>
        </div>
        <div class="layout-horizontal row-padding-v">
          <etools-upload
            id="attachment"
            label="${translate('CORE_VALUES_ASSESSMENTS')}"
            accept=".doc,.docx,.pdf,.jpg,.png"
            .fileUrl="${this.item.attachment}"
            .uploadEndpoint="${this.uploadEndpoint}"
            @upload-started="${() => (this.uploadInProgress = true)}"
            @upload-finished="${this._uploadFinished}"
            @upload-canceled="${() => (this.uploadInProgress = false)}"
            .uploadInProgress="${this.uploadInProgress}"
            @delete-file="${this._fileDeleted}"
            required
            error-message="${translate('ASSESSMENT_FILE_IS_REQUIRED')}"
          >
          </etools-upload>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  item: any = {};

  @property({type: Object})
  parent!: LitElement;

  @property({type: String})
  uploadEndpoint: string = pmpEdpoints.attachmentsUpload.url;

  @property({type: Boolean})
  uploadInProgress = false;

  set dialogData(data: any) {
    const {item, parent}: any = data;
    this.item = item;
    this.parent = parent;
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _saveCoreValueAssessment() {
    const attach = this.shadowRoot!.querySelector('#attachment') as unknown as EtoolsUpload;
    if (!attach || !attach.validate()) {
      return;
    }
    fireEvent(this.parent, 'save-core-values-assessment', this.item);
    this._onClose();
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.item = {...this.item, attachment: uploadResponse.id};
    }
    this.uploadInProgress = false;
  }

  _fileDeleted() {
    this.item.attachment = null;
    this.requestUpdate();
  }
}
