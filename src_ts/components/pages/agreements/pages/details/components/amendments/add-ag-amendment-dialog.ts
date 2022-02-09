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
import {AgreementAmendment} from '@unicef-polymer/etools-types';
import CommonMixin from '../../../../../../common/mixins/common-mixin.js';

/**
 * @polymer
 * @customElement
 */
class AddAgAmendmentDialog extends CommonMixin(PolymerElement) {
  static get template() {
    return html`
      ${SharedStyles} ${gridLayoutStyles} ${requiredFieldStarredStyles}

      <etools-dialog
        no-padding
        keep-dialog-open
        id="add-ag-amendment"
        opened
        size="md"
        hidden$="[[datePickerOpen]]"
        ok-btn-text="[[_getTranslation('GENERAL.SAVE')]]"
        dialog-title="[[_getTranslation('ADD_AMENDMENT')]]"
        on-close="_onClose"
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
              value="[[amendment.signed_date]]"
              required-error-msg="[[_getTranslation('PLEASE_SELECT_SIGNED_DATE')]]"
              max-date-error-msg="[[_getTranslation('DATE_CAN_NOT_BE_IN_THE_FUTURE')]]"
              open="{{datePickerOpen}}"
              auto-validate="[[autoValidate]]"
              max-date="[[getCurrentDate()]]"
              required
              selected-date-display-format="D MMM YYYY"
              fire-date-has-changed
              on-date-has-changed="_dateHasChanged"
              data-field-path="amendment.signed_date"
            >
            </datepicker-lite>
          </div>
        </div>
        <div class="row-h flex-c">
          <!-- Signed Agreement -->
          <etools-upload
            id="signedAmendment"
            label="[[_getTranslation('SIGNED_AMENDMENT')]]"
            accept=".doc,.docx,.pdf,.jpg,.png"
            file-url="[[amendment.signed_amendment_attachment]]"
            upload-endpoint="[[uploadEndpoint]]"
            on-upload-started="_uploadStarted"
            on-upload-finished="_uploadFinished"
            required
            upload-in-progress="[[uploadInProgress]]"
            auto-validate="[[autoValidate]]"
            error-message="[[_getTranslation('SIGNED_AMENDMENT_FILE_IS_REQUIRED')]]"
          >
          </etools-upload>
        </div>

        <div class="row-h flex-c">
          <etools-dropdown-multi
            id="amendmentTypes"
            label="[[_getTranslation('AMENDMENT_TYPES')]]"
            options="[[amendmentTypes]]"
            selected-values="[[amendment.types]]"
            hide-search
            error-message="[[_getTranslation('PLEASE_SELECT_AMENDMENT_TYPE')]]"
            required
            auto-validate="[[autoValidate]]"
            trigger-value-change-event
            on-etools-selected-items-changed="onAmendmentTypesChanged"
          >
          </etools-dropdown-multi>
        </div>

        <template is="dom-if" if="[[_showAuthorizedOfficersField(showAuthorizedOfficers, _aoTypeSelected)]]" restamp>
          <div class="row-h flex-c">
            <etools-dropdown-multi
              id="officers"
              label="[[_getTranslation('AUTHORIZED_OFFICERS')]]"
              placeholder="&#8212;"
              options="[[authorizedOfficersOptions]]"
              option-value="id"
              option-label="name"
              selected-values="[[authorizedOfficers]]"
              trigger-value-change-event
              on-etools-selected-items-changed="onAuthorizedOfficersChanged"
              error-message="[[_getTranslation('PLS_ENTER_PARTNER_AUTH_OFFICERS')]]"
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

  private _validationSelectors: string[] = ['#signedDate', '#signedAmendment', '#amendmentTypes', '#officers'];

  set dialogData(data: any) {
    const {authorizedOfficers, showAuthorizedOfficers, amendmentTypes}: any = data;

    this.set('amendment', new AgreementAmendment());
    this.set('amendmentTypes', amendmentTypes);
    this.set('authorizedOfficersOptions', authorizedOfficers);
    this.set('authorizedOfficers', []);
    this.set('showAuthorizedOfficers', showAuthorizedOfficers);
    this.set('autoValidate', true);
    this.set('_aoTypeSelected', false);
  }

  _validateAndSaveAmendment() {
    if (this.validate()) {
      fireEvent(this, 'dialog-closed', {
        confirmed: true,
        response: {
          amendment: this.amendment,
          ao: this.authorizedOfficers
        }
      });
    }
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
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

  onAmendmentTypesChanged(e: CustomEvent) {
    this.amendment.types = e.detail.value;
    this.amendment = {...this.amendment};
    this.set('_aoTypeSelected', this._isAoTypeSelected());
  }

  onAuthorizedOfficersChanged(e: CustomEvent) {
    this.authorizedOfficers = e.detail.value;
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
      this.uploadInProgress = false;
    }
  }

  _uploadStarted() {
    this.uploadInProgress = true;
  }

  getCurrentDate() {
    return new Date();
  }
}

window.customElements.define('add-ag-amendment-dialog', AddAgAmendmentDialog);

export {AddAgAmendmentDialog};
