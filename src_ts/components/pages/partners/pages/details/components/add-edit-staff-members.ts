import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/iron-icons/communication-icons';
import '@unicef-polymer/etools-dialog/etools-dialog';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox.js';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {StaffMember} from '../../../../../../models/partners.models';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import CommonMixinLit from '../../../../../common/mixins/common-mixin-lit';
import {translate} from 'lit-translate';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../../../../endpoints/endpoints';

/**
 * @customElement
 * @polymer
 * @appliesMixin EndpointsMixin
 */
@customElement('add-edit-staff-members')
export class AddEditStaffMembers extends CommonMixinLit(EndpointsLitMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        paper-input {
          width: 100%;
        }

        .col:first-of-type {
          padding-inline-end: 12px;
        }

        .col:not(:first-of-type) {
          padding-inline-start: 12px;
        }

        .layout-horizontal:last-of-type {
          padding-bottom: 16px;
        }
      </style>
      <etools-dialog
        id="staffMemberDialog"
        dialog-title="${translate('PARTNER_CONTACT')}"
        size="md"
        ok-btn-text="${translate('GENERAL.SAVE')}"
        keep-dialog-open
        opened
        @close="${this._onClose}"
        @confirm-btn-clicked="${this._savePartnerContact}"
      >
        <div class="layout-horizontal row-padding-v flex-c">
          <div class="col col-9">
            <paper-input
              id="title"
              label="${translate('POSITION')}"
              .value="${this.item.title}"
              @value-changed="${({detail}: CustomEvent) => {
                this.item.title = detail.value;
              }}"
              placeholder="&#8212;"
              maxlength="100"
              required
              auto-validate
              .errorMessage="${translate('POSITION_IS_REQUIRED')}"
            ></paper-input>
          </div>
          <div class="col col-3 right-align">
            <paper-checkbox
              ?checked="${this.item.active}"
              @checked-changed="${({target}: CustomEvent) =>
                (this.item.active = Boolean((target as PaperCheckboxElement).checked))}"
            >
              ${translate('ACTIVE_STAFF')}
            </paper-checkbox>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v flex-c">
          <div class="col col-6">
            <paper-input
              id="firstName"
              label="${translate('FIRST_NAME')}"
              .value="${this.item.first_name}"
              @value-changed="${({detail}: CustomEvent) => {
                this.item.first_name = detail.value;
              }}"
              placeholder="&#8212;"
              maxlength="30"
              required
              auto-validate
              .errorMessage="${translate('FIRST_NAME_IS_REQUIRED')}"
            >
            </paper-input>
          </div>
          <div class="col col-6">
            <paper-input
              id="lastName"
              label="${translate('LAST_NAME')}"
              .value="${this.item.last_name}"
              @value-changed="${({detail}: CustomEvent) => {
                this.item.last_name = detail.value;
              }}"
              placeholder="&#8212;"
              maxlength="30"
              required
              auto-validate
              .errorMessage="${translate('LAST_NAME_IS_REQUIRED')}"
            >
            </paper-input>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v flex-c">
          <div class="col col-6">
            <paper-input
              id="email"
              label="${translate('EMAIL_ADDRESS')}"
              .value="${this.item.email}"
              placeholder="&#8212;"
              ?readonly="${!this._isNewStaffMember(this.item)}"
              @value-changed="${({detail}: CustomEvent) => {
                this.item.email = detail.value;
              }}"
              maxlength="50"
              type="email"
              required
              auto-validate
              .errorMessage="${translate('A_VALID_UNUSED_EMAIL_ADDRESS_IS_REQUIRED')}"
            >
              <iron-icon slot="prefix" icon="communication:email"></iron-icon>
            </paper-input>
          </div>
          <div class="col col-6">
            <paper-input
              id="phone"
              label="${translate('PHONE_NUMBER')}"
              .value="${this.item.phone}"
              placeholder="&#8212;"
              maxlength="15"
              allowed-pattern="[0-9\\ \\.\\+\\-\\(\\)]"
              @value-changed="${({detail}: CustomEvent) => {
                this.item.phone = detail.value;
              }}"
            >
              <iron-icon slot="prefix" icon="communication:phone"></iron-icon>
            </paper-input>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  item!: StaffMember;

  @property({type: Array})
  dataItems: StaffMember[] = [];

  @property({type: Object})
  mainEl!: HTMLElement;

  @property({type: Number})
  partnerId: number | null = null;

  @property({type: Array})
  fieldSelectors: string[] = ['#firstName', '#lastName', '#email', '#title'];

  set dialogData(data: any) {
    const {item, partnerId, dataItems, mainEl}: any = data;
    this.item = item;
    this.partnerId = partnerId;
    this.dataItems = dataItems;
    this.mainEl = mainEl;
  }

  _isNewStaffMember(item: {id: number | null}) {
    return !item || !item.id;
  }

  validate() {
    let valid = true;

    this.fieldSelectors.forEach((s) => {
      const el: (Element & {validate: () => boolean}) | null = this.shadowRoot!.querySelector(s);
      if (el && !el.validate()) {
        valid = false;
      }
    });

    return valid;
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _savePartnerContact() {
    if (this.validate()) {
      const dialog = this.shadowRoot!.querySelector('#staffMemberDialog') as EtoolsDialog;
      const endpoint = this.getEndpoint(pmpEdpoints, 'partnerDetails', {
        id: this.partnerId
      });
      dialog.startSpinner();

      sendRequest({
        endpoint: endpoint,
        method: 'PATCH',
        body: {
          id: this.id,
          staff_members: [this.item]
        }
      })
        .then((response: any) => {
          fireEvent(this.mainEl, 'partner-contacts-updated', response.staff_members);
          dialog.stopSpinner();
          this._onClose();
        })
        .catch((error: any) => {
          dialog.stopSpinner();
          parseRequestErrorsAndShowAsToastMsgs(error, this.mainEl);
        });
    }
  }
}
