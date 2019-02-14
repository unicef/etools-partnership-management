import { PolymerElement, html } from '@polymer/polymer';
import EnvironmentFlags from '../../../environment-flags/environment-flags-mixin.js';
import pmpEndpoints from '../../../endpoints/endpoints.js';
import moment from 'moment';
import 'etools-dialog/etools-dialog.js';
import 'etools-upload/etools-upload.js';
import 'etools-date-time/datepicker-lite.js';
import '../../../layout/etools-warn-message.js';
import { SharedStyles } from '../../../styles/shared-styles';
import { gridLayoutStyles } from '../../../styles/grid-layout-styles';
import { requiredFieldStarredStyles } from '../../../styles/required-field-styles';
import {fireEvent} from '../../../utils/fire-custom-event.js';


/**
 * @polymer
 * @customElement
 * @appliesMixin EnvironmentFlags
 */
class PdTermination extends EnvironmentFlags(PolymerElement) {

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
                  dialog-title="Terminate PD/SSFA"
                  on-close="_handleDialogClosed"
                  on-confirm-btn-clicked="_triggerPdTermination"
                  disable-confirm-btn="[[uploadInProgress]]"
                  disable-dismiss-btn="[[uploadInProgress]]">

      <div class="row-h flex-c">
        <datepicker-lite id="terminationDate"
                          label="Termination Date"
                          value="{{termination.date}}"
                          error-message="Please select termination date"
                          auto-validate
                          required>
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
                message="Once you hit save, the PD/SSFA will be Terminated and this action can not be reversed">
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

  static get properties() {
    return {
      uploadEndpoint: {
        type: String,
        value: function() {
          return pmpEndpoints.attachmentsUpload.url;
        }
      },
      interventionId: Number,
      opened: Boolean,
      warningOpened: Boolean,
      termination: {
        type: Object
      },
      _validationSelectors: {
        type: Array,
        value: ['#terminationDate', '#terminationNotice']
      },
      terminationElSource: Object,
      uploadInProgress: {
        type: Boolean,
        value: false
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    this.$.terminationDate.maxDate = this._getMaxDate();
  }

  _getMaxDate() {
    return moment(Date.now()).add(30, 'd').toDate();
  }

  _handleDialogClosed(e: CustomEvent) {
    this.resetValidations();
  }

  _triggerPdTermination(e: CustomEvent) {
    if (!this.validate()) {
      return;
    }
    if (this.environmentFlags &&
        !this.environmentFlags.prp_mode_off && this.environmentFlags.prp_server_on) {
      this.set('warningOpened', true);
    } else {
      this._terminatePD();
    }
  }

  _terminationConfirmed(e: CustomEvent) {
    if (e.detail.confirmed) {
      this._terminatePD();
    }
  }

  _terminatePD() {
    if (this.validate()) {
      fireEvent(this.terminationElSource, 'terminate-pd',
          {
            interventionId: this.interventionId,
            terminationData: {
              date: this.termination.date,
              fileId: this.termination.attachment_notice
            }
          });
      this.set('opened', false);
    }
  }

  // TODO: refactor validation at some point (common with ag add amendment dialog and more)
  resetValidations() {
    this._validationSelectors.forEach((selector: string) => {
      let el = this.shadowRoot.querySelector(selector);
      if (el) {
        el.set('invalid', false);
      }
    });
  }

  // TODO: refactor validation at some point (common with ag add amendment dialog and more)
  validate() {
    let isValid = true;
    this._validationSelectors.forEach((selector: string) => {
      let el = this.shadowRoot.querySelector(selector);
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

window.customElements.define('pd-termination', PdTermination);
