import {LitElement, html, property, customElement} from 'lit-element';
import EnvironmentFlagsPolymerMixin from '../../../common/environment-flags/environment-flags-mixin-lit';
import CommonMixinLit from '../../../common/mixins/common-mixin-lit';
import pmpEndpoints from '../../../endpoints/endpoints';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-upload/etools-upload';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-warn-message';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {requiredFieldStarredStyles} from '../../../styles/required-field-styles-lit';

import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import {fireEvent} from '../../../utils/fire-custom-event';
import CONSTANTS from '../../../../config/app-constants';
import {translate} from 'lit-translate';

/**
 * @polymer
 * @customElement
 * @appliesMixin EnvironmentFlagsPolymerMixin
 */
@customElement('agreement-termination')
export class AgreementTermination extends EnvironmentFlagsPolymerMixin(CommonMixinLit(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles} ${requiredFieldStarredStyles}
      <style>
        :host {
          /* host CSS */
        }

        #agreementTermination {
          --etools-dialog-default-btn-bg: var(--error-color);
        }
      </style>

      <etools-dialog
        no-padding
        keep-dialog-open
        id="agreementTermination"
        opened
        size="md"
        ?hidden="${this.warningOpened}"
        .okBtnText="${translate('TERMINATE')}"
        dialog-title="${translate('TERMINATE_AGREEMENT')}"
        @close="${this._onClose}"
        @confirm-btn-clicked="${this._triggerAgreementTermination}"
        ?disableConfirmBtn="${this.uploadInProgress}"
        ?disableDismissBtn="${this.uploadInProgress}"
      >
        <div class="row-h flex-c">
          <etools-upload
            id="terminationNotice"
            label="${translate('TERMINATION_NOTICE')}"
            accept=".doc,.docx,.pdf,.jpg,.png"
            .fileUrl="${this.termination.attachment_id}"
            .uploadEndpoint="${this.uploadEndpoint}"
            @upload-started="${this._uploadStarted}"
            @upload-finished="${this._uploadFinished}"
            required
            auto-validation
            .uploadInProgress="${this.uploadInProgress}"
            error-message="${translate('TERMINATION_NOTICE_FILE_IS_REQUIRED')}"
          >
          </etools-upload>
        </div>
        <div class="row-h">
          <etools-warn-message-lit .messages="${translate('ONCE_YOU_HIT_SAVE_THE_AGREEMENT_WILL_BE_TERMINATED')}">
          </etools-warn-message-lit>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: String})
  uploadEndpoint: string = pmpEndpoints.attachmentsUpload.url;

  @property({type: Number})
  interventionId!: number;

  @property({type: Number})
  agreementId!: number;

  @property({type: Boolean})
  opened!: boolean;

  @property({type: Boolean})
  warningOpened!: boolean;

  @property({type: Object})
  termination!: {attachment_id: number};

  @property({type: Object})
  terminationElSource!: LitElement;

  @property({type: Boolean})
  uploadInProgress = false;

  set dialogData(data: any) {
    const {terminationElSource, agreementId, termination}: any = data;
    this.terminationElSource = terminationElSource;
    this.agreementId = agreementId;
    this.termination = termination;
  }

  _triggerAgreementTermination() {
    if (!this.validate()) {
      return;
    }

    this._terminateAgreement();
  }

  _terminateAgreement() {
    fireEvent(this.terminationElSource, 'terminate-agreement', {
      agreementId: this.agreementId,
      terminationData: {
        fileId: this.termination.attachment_id
      },
      status: CONSTANTS.STATUSES.Terminated.toLowerCase() + ''
    });
    this._onClose();
  }

  validate() {
    return validateRequiredFields(this);
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.termination.attachment_id = uploadResponse.id;
      this.termination = {...this.termination};
      this.uploadInProgress = false;
    }
  }

  _uploadStarted(_e: CustomEvent) {
    this.uploadInProgress = true;
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
