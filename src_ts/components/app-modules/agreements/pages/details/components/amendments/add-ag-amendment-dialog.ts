import {PolymerElement, html} from '@polymer/polymer';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-upload/etools-upload.js';
import '@unicef-polymer/etools-date-time/datepicker-lite.js';
import pmpEndpoints from '../../../../../../endpoints/endpoints.js';
import {SharedStyles} from '../../../../../../styles/shared-styles';
import {gridLayoutStyles} from '../../../../../../styles/grid-layout-styles';
import {requiredFieldStarredStyles} from '../../../../../../styles/required-field-styles';
import {fireEvent} from '../../../../../../utils/fire-custom-event.js';
import {property} from '@polymer/decorators';
import {AgreementAmendment, LabelAndValue} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 */
class AddAgAmendmentDialog extends PolymerElement {
  static get template() {
    return html`
      ${SharedStyles} ${gridLayoutStyles} ${requiredFieldStarredStyles}

      <etools-dialog
        no-padding
        keep-dialog-open
        id="add-ag-amendment"
        opened="{{opened}}"
        size="md"
        hidden$="[[datePickerOpen]]"
        ok-btn-text="Save"
        dialog-title="Add Amendment"
        on-close="_handleDialogClosed"
        on-confirm-btn-clicked="_validateAndSaveAmendment"
        disable-confirm-btn="[[uploadInProgress]]"
        disable-dismiss-btn="[[uploadInProgress]]"
      >
        <div class="row-h flex-c">
          <div class="col col-4">
            <!-- Signed Date -->
            <datepicker-lite
              id="signedDate"
              label="Signed Date"
              value="{{amendment.signed_date}}"
              required-error-msg="Please select signed date"
              max-date-error-msg="Date can not be in the future"
              open="{{datePickerOpen}}"
              auto-validate="[[autoValidate]]"
              max-date="[[getCurrentDate()]]"
              required
              selected-date-display-format="D MMM YYYY"
            >
            </datepicker-lite>
          </div>
        </div>
        <div class="row-h flex-c">
          <!-- Signed Agreement -->
          <etools-upload
            id="signedAmendment"
            label="Signed Amendment"
            accept=".doc,.docx,.pdf,.jpg,.png"
            file-url="[[amendment.signed_amendment_attachment]]"
            upload-endpoint="[[uploadEndpoint]]"
            on-upload-finished="_uploadFinished"
            required
            upload-in-progress="{{uploadInProgress}}"
            auto-validate="[[autoValidate]]"
            error-message="Signed Amendment file is required"
          >
          </etools-upload>
        </div>

        <div class="row-h flex-c">
          <etools-dropdown-multi
            id="amendmentTypes"
            label="Amendment Types"
            options="[[amendmentTypes]]"
            selected-values="{{amendment.types}}"
            hide-search
            error-message="Please select amendment type"
            required
            auto-validate="[[autoValidate]]"
            trigger-value-change-event
            on-etools-selected-items-changed="_onAmendmentTypesSelected"
          >
          </etools-dropdown-multi>
        </div>

        <template is="dom-if" if="[[_showAuthorizedOfficersField(showAuthorizedOfficers, _aoTypeSelected)]]" restamp>
          <div class="row-h flex-c">
            <etools-dropdown-multi
              id="officers"
              label="Authorized Officers"
              placeholder="&#8212;"
              options="[[authorizedOfficersOptions]]"
              option-value="id"
              option-label="name"
              selected-values="{{authorizedOfficers}}"
              error-message="Please enter Partner Authorized Officer(s)"
              required
              auto-validate
            >
            </etools-dropdown-multi>
          </div>
        </template>
      </etools-dialog>
    `;
  }

  @property({type: Boolean})
  opened = false;

  @property({type: Boolean})
  datePickerOpen = false;

  @property({type: String})
  uploadEndpoint: string = pmpEndpoints.attachmentsUpload.url;

  @property({type: Array})
  amendmentTypes: [] = [];

  @property({type: Object})
  amendment!: AgreementAmendment;

  @property({type: Boolean})
  autoValidate = false;

  @property({type: Boolean})
  showAuthorizedOfficers = false;

  @property({type: Array})
  authorizedOfficersOptions: [] = [];

  @property({type: Array})
  authorizedOfficers: [] = [];

  @property({type: Boolean})
  _aoTypeSelected = false;

  @property({type: Boolean})
  uploadInProgress = false;

  @property({type: Object})
  toastEventSource!: PolymerElement;

  private _validationSelectors: string[] = ['#signedDate', '#signedAmendment', '#amendmentTypes', '#officers'];

  initData(authorizedOfficers: any, showAuthorizedOfficers: boolean, amendmentTypes: LabelAndValue[]) {
    this.set('amendment', new AgreementAmendment());
    this.set('amendmentTypes', amendmentTypes);
    this.set('authorizedOfficersOptions', JSON.parse(JSON.stringify(authorizedOfficers)));
    this.set('authorizedOfficers', []);
    this.set('showAuthorizedOfficers', showAuthorizedOfficers);
    this.set('autoValidate', true);
    this.set('_aoTypeSelected', false);
    this._resetValidations();
  }

  _validateAndSaveAmendment() {
    if (this.validate()) {
      fireEvent(this, 'update-amendment-and-ao', {
        amendment: this.amendment,
        ao: JSON.parse(JSON.stringify(this.authorizedOfficers))
      });
      this.set('opened', false);
    }
  }

  _handleDialogClosed() {
    this.set('autoValidate', false);
    this._resetValidations();
  }

  _resetValidations() {
    this._validationSelectors.forEach((selector: string) => {
      const el = this.shadowRoot!.querySelector(selector) as PolymerElement;
      if (el) {
        el.set('invalid', false);
      }
    });
  }

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

  _showAuthorizedOfficersField(showAuthorizedOfficers: boolean, _aoTypeSelected: boolean) {
    return showAuthorizedOfficers && _aoTypeSelected;
  }

  _onAmendmentTypesSelected() {
    this.set('_aoTypeSelected', this._isAoTypeSelected());
  }

  _isAoTypeSelected() {
    if (!(this.amendment && this.amendment.types instanceof Array && this.amendment.types.length > 0)) {
      return false;
    }
    return this.amendment.types.indexOf('Change authorized officer') > -1;
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.set('amendment.signed_amendment_attachment', uploadResponse.id);
    }
  }

  getCurrentDate() {
    return new Date();
  }
}

window.customElements.define('add-ag-amendment-dialog', AddAgAmendmentDialog);

export {AddAgAmendmentDialog};
