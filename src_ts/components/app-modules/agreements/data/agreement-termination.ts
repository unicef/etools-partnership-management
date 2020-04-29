import {PolymerElement, html} from '@polymer/polymer';
import EnvironmentFlagsMixin from '../../../environment-flags/environment-flags-mixin';
import pmpEndpoints from '../../../endpoints/endpoints';
declare const moment: any;
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-upload/etools-upload';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '../../../layout/etools-warn-message';
import {SharedStyles} from '../../../styles/shared-styles';
import {gridLayoutStyles} from '../../../styles/grid-layout-styles';
import {requiredFieldStarredStyles} from '../../../styles/required-field-styles';
import {fireEvent} from '../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import CONSTANTS from '../../../../config/app-constants';


/**
 * @polymer
 * @customElement
 * @appliesMixin EnvironmentFlagsMixin
 */
class AgreementTermination extends EnvironmentFlagsMixin(PolymerElement) {

  static get template() {
    return html`
    ${SharedStyles} ${gridLayoutStyles} ${requiredFieldStarredStyles}
    <style>
      :host {
        /* host CSS */
      }

      #pdTermination {
        --etools-dialog-default-btn-bg: var(--error-color);
      }

      #pdTerminationConfirmation {
        --etools-dialog-confirm-btn-bg: var(--primary-color);
      }
    </style>

    <etools-dialog no-padding
                  keep-dialog-open
                  id="pdTermination"
                  opened="{{opened}}"
                  size="md"
                  hidden$="[[warningOpened]]"
                  ok-btn-text="Terminate"
                  dialog-title="Terminate Agreement"
                  on-close="_handleDialogClosed"
                  on-confirm-btn-clicked="_triggerAgreementTermination"
                  disable-confirm-btn="[[uploadInProgress]]"
                  disable-dismiss-btn="[[uploadInProgress]]">

      <div class="row-h flex-c">
        <datepicker-lite id="terminationDate"
                          label="Termination Date"
                          value="{{termination.date}}"
                          error-message="Please select termination date"
                          auto-validate
                          required
                          selected-date-display-format="D MMM YYYY">
        </datepicker-lite>
      </div>

      <div class="row-h flex-c">
        <etools-upload id="terminationNotice"
                      label="Termination Notice"
                      accept=".doc,.docx,.pdf,.jpg,.png"
                      file-url="[[termination.attachment_notice]]"
                      upload-endpoint="[[uploadEndpoint]]"
                      on-upload-finished="_uploadFinished"
                      required
                      auto-validate
                      upload-in-progress="{{uploadInProgress}}"
                      error-message="Termination Notice file is required">
        </etools-upload>
      </div>
      <div class="row-h">
        <etools-warn-message
                messages="Once you hit save, the Agreement will be Terminated and this action can not be reversed">
        </etools-warn-message>
      </div>

    </etools-dialog>

    <etools-dialog no-padding
                  id="pdTerminationConfirmation"
                  theme="confirmation"
                  opened="{{warningOpened}}"
                  size="md"
                  ok-btn-text="Continue"
                  on-close="_terminationConfirmed">
      <div class="row-h">
        Please make sure that the reporting requirements for the PD are updated with the correct dates
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
  termination!: {date: string; attachment_notice: number};

  @property({type: Object})
  terminationElSource!: PolymerElement

  @property({type: Boolean})
  uploadInProgress: boolean = false;


  private _validationSelectors: string[] = ['#terminationDate', '#terminationNotice'];


  connectedCallback() {
    super.connectedCallback();
    (this.$.terminationDate as any).maxDate = this._getMaxDate();
  }

  _getMaxDate() {
    return moment(Date.now()).add(30, 'd').toDate();
  }

  _handleDialogClosed() {
    this.resetValidations();
  }

  _triggerAgreementTermination() {
    if (!this.validate()) {
      return;
    }
    if (this.environmentFlags &&
      !this.environmentFlags.prp_mode_off && this.environmentFlags.prp_server_on) {
      this.set('warningOpened', true);
    } else {
      this._terminateAgreement();
    }
  }

  _terminationConfirmed(e: CustomEvent) {
    if (e.detail.confirmed) {
      this._terminateAgreement();
    }
  }

  _terminateAgreement() {
    if (this.validate()) {
      fireEvent(this, 'update-agreement-status',
        {
          agreementId: this.agreementId,
          terminationData: {
            date: this.termination.date,
            fileId: this.termination.attachment_notice
          },
          status: CONSTANTS.STATUSES.Terminated.toLowerCase() + ''
        });
      console.log('jashdjkashdjks');
      fireEvent(this, 'reload-list');
      this.set('opened', false);
    }

    //old, we use the constant..as this will always have status terminated
    // if (this.validate()) {
    //   fireEvent(this, 'update-agreement-status', {
    //     agreementId: this.agreementId,
    //     status: CONSTANTS.STATUSES.Terminated.toLowerCase() + ''
    //   });
    //   fireEvent(this, 'reload-list');
    // }
    // this.set('newStatus', '');
  }

  // TODO: refactor validation at some point (common with ag add amendment dialog and more)
  resetValidations() {
    this._validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as PolymerElement;
      if (el) {
        el.set('invalid', false);
      }
    });
  }

  // TODO: refactor validation at some point (common with ag add amendment dialog and more)
  validate() {
    let isValid = true;
    this._validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as PolymerElement & {validate(): boolean};
      if (el && !el.validate()) {
        isValid = false;
      }
    });
    return isValid;
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = JSON.parse(e.detail.success);
      this.set('termination.attachment_notice', uploadResponse.id);
    }
  }

}

window.customElements.define('agreement-termination', AgreementTermination);
