import {PolymerElement, html} from '@polymer/polymer';
import EnvironmentFlagsPolymerMixin from '../../../common/environment-flags/environment-flags-mixin';
import pmpEndpoints from '../../../endpoints/endpoints';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-upload/etools-upload';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '../../../common/components/etools-warn-message';
import {SharedStyles} from '../../../styles/shared-styles';
import {gridLayoutStyles} from '../../../styles/grid-layout-styles';
import {requiredFieldStarredStyles} from '../../../styles/required-field-styles';
import {fireEvent} from '../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import CONSTANTS from '../../../../config/app-constants';
import CommonMixin from '../../../common/mixins/common-mixin';

/**
 * @polymer
 * @customElement
 * @appliesMixin EnvironmentFlagsPolymerMixin
 */
export class AgreementTermination extends EnvironmentFlagsPolymerMixin(CommonMixin(PolymerElement)) {
  static get template() {
    return html`
      ${SharedStyles} ${gridLayoutStyles} ${requiredFieldStarredStyles}
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
        hidden$="[[warningOpened]]"
        ok-btn-text="[[_getTranslation('TERMINATE')]]"
        dialog-title="[[_getTranslation('TERMINATE_AGREEMENT')]]"
        on-close="_onClose"
        on-confirm-btn-clicked="_triggerAgreementTermination"
        disable-confirm-btn="[[uploadInProgress]]"
        disable-dismiss-btn="[[uploadInProgress]]"
      >
        <div class="row-h flex-c">
          <etools-upload
            id="terminationNotice"
            label="[[_getTranslation('TERMINATION_NOTICE')]]"
            accept=".doc,.docx,.pdf,.jpg,.png"
            file-url="[[termination.attachment_id]]"
            upload-endpoint="[[uploadEndpoint]]"
            on-upload-finished="_uploadFinished"
            required
            auto-validation
            upload-in-progress="{{uploadInProgress}}"
            error-message="[[_getTranslation('TERMINATION_NOTICE_FILE_IS_REQUIRED')]]"
          >
          </etools-upload>
        </div>
        <div class="row-h">
          <etools-warn-message messages="[[_getTranslation('ONCE_YOU_HIT_SAVE_THE_AGREEMENT_WILL_BE_TERMINATED')]]">
          </etools-warn-message>
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
  terminationElSource!: PolymerElement;

  @property({type: Boolean})
  uploadInProgress = false;

  private _validationSelectors: string[] = ['#terminationNotice'];

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

  // TODO: refactor validation at some point (common with ag add amendment dialog and more)
  validate() {
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

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.set('termination.attachment_id', uploadResponse.id);
    }
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}

window.customElements.define('agreement-termination', AgreementTermination);
