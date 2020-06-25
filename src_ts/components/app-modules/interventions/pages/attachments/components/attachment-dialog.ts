import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-upload/etools-upload.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import '../../../../../layout/etools-form-element-wrapper.js';
import EndpointsMixin from '../../../../../endpoints/endpoints-mixin.js';
import pmpEndpoints from '../../../../../endpoints/endpoints.js';
import {InterventionAttachment} from '../../../../../../typings/intervention.types.js';
import {IdAndName} from '../../../../../../typings/globals.types.js';
import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles.js';
import {requiredFieldStarredStyles} from '../../../../../styles/required-field-styles.js';
import {SharedStyles} from '../../../../../styles/shared-styles.js';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {property} from '@polymer/decorators';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox.js';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
class AttachmentDialog extends EndpointsMixin(PolymerElement) {
  static get template() {
    return html`
      ${gridLayoutStyles} ${SharedStyles} ${requiredFieldStarredStyles}
      <style>
        etools-dialog > .row-h {
          padding-top: 0;
        }
      </style>

      <etools-dialog
        no-padding
        keep-dialog-open
        id="attachmentDialog"
        opened="{{opened}}"
        size="md"
        ok-btn-text="Save"
        dialog-title="Attachment"
        on-confirm-btn-clicked="_validateAndSaveAttachment"
        disable-confirm-btn="[[uploadInProgress]]"
        disable-dismiss-btn="[[uploadInProgress]]"
      >
        <div class="row-h col-5">
          <!-- Document Type -->
          <etools-dropdown
            id="document-types"
            label="Document Type"
            placeholder="&#8212;"
            options="[[fileTypes]]"
            option-value="id"
            option-label="name"
            selected="{{attachment.type}}"
            hide-search
            required
            auto-validate
            error-message="Document type is required"
          >
          </etools-dropdown>
        </div>
        <div class="row-h flex-c">
          <!-- Attachment -->
          <etools-upload
            id="attachment-upload"
            label="Attachment"
            accept=".doc,.docx,.pdf,.jpg,.png"
            file-url="[[attachment.attachment_document]]"
            upload-endpoint="[[uploadEndpoint]]"
            on-upload-finished="_attachmentUploadFinished"
            required
            auto-validate
            upload-in-progress="{{uploadInProgress}}"
            error-message="Attachment required"
            readonly="[[_readonlyAttachment(attachment.id)]]"
          >
          </etools-upload>
        </div>

        <div class="row-h flex-c">
          <etools-form-element-wrapper no-placeholder>
            <paper-checkbox checked="[[!attachment.active]]" on-change="_invalidChanged">
              Invalid
            </paper-checkbox>
          </etools-form-element-wrapper>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  toastEventSource!: PolymerElement;

  @property({
    type: Boolean,
    notify: true,
    observer: AttachmentDialog.prototype._resetFields
  })
  opened!: boolean;

  @property({type: Number})
  interventionId!: number;

  @property({type: Array})
  fileTypes: IdAndName[] = [];

  @property({type: Object})
  attachment!: InterventionAttachment;

  @property({type: String})
  uploadEndpoint: string = pmpEndpoints.attachmentsUpload.url;

  @property({type: Boolean})
  uploadInProgress = false;

  private _validationSelectors: string[] = ['#document-types', '#attachment-upload'];

  initAttachment(attachment?: InterventionAttachment) {
    this.set('attachment', !attachment ? new InterventionAttachment() : JSON.parse(JSON.stringify(attachment)));
  }

  startSpinner() {
    ((this.$.attachmentDialog as unknown) as EtoolsDialog).startSpinner();
  }

  stopSpinner() {
    ((this.$.attachmentDialog as unknown) as EtoolsDialog).stopSpinner();
  }

  isValidAttachment() {
    let isValid = true;
    this._validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as PolymerElement & {
        validate(): boolean;
      };
      if (el && !el.validate()) {
        isValid = false;
      }
    });
    return isValid;
  }

  _resetAttachmentValidations() {
    this._validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as PolymerElement;
      if (el) {
        el.set('invalid', false);
      }
    });
  }

  _resetFields() {
    this._resetAttachmentValidations();
  }

  _validateAndSaveAttachment() {
    if (!this.isValidAttachment()) {
      return;
    }
    this._saveAttachment(Object.assign({}, this.attachment));
  }

  _saveAttachment(attachment: InterventionAttachment) {
    const isNewAttachment = !attachment.id;
    if (!isNewAttachment) {
      delete attachment.attachment_document;
      // TODO: remove attachment and attachment_file after API refactoring/cleanup
      delete attachment.attachment;
      delete attachment.attachment_file;
    } else if (!this.interventionId || isNaN(this.interventionId)) {
      logWarn('You need a valid PD id to be able to save the attachment!', 'attachment-dialog');
      return;
    }
    const endpointName = !isNewAttachment ? 'updatePdAttachment' : 'pdAttachments';
    const endpointParams = !isNewAttachment ? {attId: attachment.id} : {pdId: this.interventionId};
    const options = {
      method: !isNewAttachment ? 'PATCH' : 'POST',
      endpoint: this.getEndpoint(endpointName, endpointParams),
      body: attachment
    };
    this.startSpinner();
    sendRequest(options)
      .then((resp: any) => {
        this._handleResponse(resp, isNewAttachment);
        this.stopSpinner();
      })
      .catch((error: any) => {
        this._handleErrorResponse(error);
        this.stopSpinner();
      });
  }

  _handleResponse(response: any, isNewAttachment: boolean) {
    this.set('opened', false);
    fireEvent(this, isNewAttachment ? 'attachment-added' : 'attachment-updated', response);
  }

  _handleErrorResponse(error: any) {
    parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
  }

  _attachmentUploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.set('attachment.attachment_document', uploadResponse.id);
    }
  }
  _readonlyAttachment(id: string) {
    return id && Number(id) > 0;
  }

  _invalidChanged(e: CustomEvent) {
    this.set('attachment.active', !(e.target as PaperCheckboxElement).checked);
  }
}

window.customElements.define('attachment-dialog', AttachmentDialog);
