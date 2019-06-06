import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/iron-icons/communication-icons';

import 'etools-dialog/etools-dialog';

import '../../../../../layout/etools-form-element-wrapper';
import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../../styles/shared-styles';
import {requiredFieldStarredStyles} from '../../../../../styles/required-field-styles';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {StaffMember} from '../../../../../../models/partners.models';
import EtoolsDialog from 'etools-dialog/etools-dialog';
import EndpointsMixin from '../../../../../endpoints/endpoints-mixin';
import {parseRequestErrorsAndShowAsToastMsgs} from "../../../../../utils/ajax-errors-parser";

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class AddEditStaffMembers extends (EndpointsMixin(PolymerElement)) {

  static get template() {
    // language=HTML
    return html`
      ${gridLayoutStyles} ${SharedStyles} ${requiredFieldStarredStyles}
      <style>
        paper-input {
          width: 100%;
        }

        .col:first-of-type {
          padding-right: 12px;
        }

        .col:not(:first-of-type) {
          padding-left: 12px;
        }
      </style>
      <etools-dialog id="staffMemberDialog" dialog-title="Partner Contact" size="md"
                     ok-btn-text="Save" keep-dialog-open spinner-Text="Saving..."
                     on-confirm-btn-clicked="_savePartnerContact">
        <div class="layout-horizontal row-padding-v flex-c">
          <div class="col col-6">
            <paper-input id="title" label="Position"
                         value="{{item.title}}"
                         placeholder="&#8212;"
                         maxlength="30"
                         required
                         invalid="[[!_isValid('title', item.title, item.first_name, item.last_name, item.email, item.phone)]]"
                         error-message="Position is required"></paper-input>
          </div>
          <div class="col col-6">
            <etools-form-element-wrapper no-placeholder>
              <paper-checkbox checked="{{item.active}}">
                Active Staff
              </paper-checkbox>
            </etools-form-element-wrapper>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v flex-c">
          <div class="col col-6">
            <paper-input id="firstName"
                         label="First Name"
                         value="{{item.first_name}}"
                         placeholder="&#8212;"
                         maxlength="30"
                         required
                         invalid="[[!_isValid('firstName', item.title, item.first_name, item.last_name, item.email, item.phone)]]"
                         error-message="First name is required">
            </paper-input>
          </div>
          <div class="col col-6">
            <paper-input id="lastName"
                         label="Last Name"
                         value="{{item.last_name}}"
                         placeholder="&#8212;"
                         maxlength="30"
                         required
                         invalid="[[!_isValid('lastName', item.title, item.first_name, item.last_name, item.email, item.phone)]]"
                         error-message="Last name is required">
            </paper-input>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v flex-c">
          <div class="col col-6">
            <paper-input id="email"
                         label="E-mail address"
                         value="{{item.email}}"
                         placeholder="&#8212;"
                         readonly$="[[!_isNewStaffMember(item)]]"
                         maxlength="50"
                         required
                         invalid="[[!_isValid('emailAddress', item.title, item.first_name, item.last_name, item.email, item.phone)]]"
                         error-message="A valid & unused email address is required">
              <iron-icon slot="prefix" icon="communication:email"></iron-icon>
            </paper-input>
          </div>
          <div class="col col-6">
            <paper-input id="phone"
                         label="Phone number"
                         value="{{item.phone}}"
                         placeholder="&#8212;"
                         maxlength="15"
                         allowed-pattern="[0-9\\ \\.\\+\\-\\(\\)]">
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
  mainEl: object = {};

  open() {
    this.resetValidations();
    (this.$.staffMemberDialog as EtoolsDialog).opened = true;
  }

  _isNewStaffMember(item: {id: number | null}) {
    return !item || !item.id;
  }

  _isValid(field: string, title: string, firstName: string, lastName: string, emailAddress: string, phone: string) {
    let valid = true;
    switch (field) {
      case 'title':
        if (!this._notEmpty(title) && (this._notEmpty(firstName) || this._notEmpty(lastName) ||
            this._notEmpty(emailAddress) || this._notEmpty(phone))) {
          valid = false;
        }
        break;
      case 'firstName':
        if (!this._notEmpty(firstName) && (this._notEmpty(title) || this._notEmpty(lastName) ||
            this._notEmpty(emailAddress) || this._notEmpty(phone))) {
          valid = false;
        }
        break;
      case 'lastName':
        if (!this._notEmpty(lastName) && (this._notEmpty(title) || this._notEmpty(firstName) ||
            this._notEmpty(emailAddress) || this._notEmpty(phone))) {
          valid = false;
        }
        break;
      case 'emailAddress':
        if (this._notEmpty(emailAddress)) {
          valid = this._validStaffMemberEmailAddress(emailAddress);
        } else {
          if (this._notEmpty(phone) || this._notEmpty(title) || this._notEmpty(firstName) ||
              this._notEmpty(lastName)) {
            valid = false;
          } else {
            valid = true; // empty staff member data, hide error msgs
          }
        }
        break;
    }
    return valid;
  }

  _notEmpty(value: any) {
    return typeof value !== 'undefined' && value !== null && value !== '';
  }

  _validStaffMemberEmailAddress(emailAddress: string) {
    let valid = true;

    if (this._emailAlreadyUsed(emailAddress)) {
      valid = false;
    } else {
      // eslint-disable-next-line
      let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      valid = re.test(emailAddress);
    }
    return valid;
  }

  _emailAlreadyUsed(emailAddress: string) {
    const sameEmailItems = this.dataItems.filter((el: any) => {
      return el.email === emailAddress
          && Number(el.id) !== Number(this.item.id);
    });

    return sameEmailItems.length > 0;
  }

  validate() {
    let valid = true;

    const fieldSelectors = ['#firstName', '#lastName', '#email', '#title'];

    const elements = [];

    for (let i = 0; i < fieldSelectors.length; i++) {
      elements[i] = this.$.staffMemberDialog.querySelector(fieldSelectors[i]);
      elements[i].validate();
      if (fieldSelectors[i] === '#email') {
        elements[i].invalid = elements[i].invalid || this._emailAlreadyUsed(this.item.email);
      }
    }

    for (let i = 0; i < fieldSelectors.length; i++) {
      const el = elements[i] || this.$.staffMemberDialog.querySelector(fieldSelectors[i]);
      if (el && el.invalid) {
        valid = false;
        break;
      }
    }
    return valid;
  }

  resetValidations() {
    const fieldSelectors = ['#firstName', '#lastName', '#email', '#phone', '#title'];
    for (let i = 0; i < fieldSelectors.length; i++) {
      const el = this.$.staffMemberDialog.querySelector(fieldSelectors[i]) as PolymerElement & {invalid: boolean};
      if (el) {
        el.invalid = false;
      }
    }
  }

  _savePartnerContact() {
    if (this.validate()) {
      const dialog: EtoolsDialog = this.$.staffMemberDialog;
      const endpoint = this.getEndpoint('partnerDetails', {id: this.partnerId});
      dialog.startSpinner();

      this.sendRequest({
        endpoint: endpoint,
        method: 'PATCH',
        body: {
          id: this.id,
          staff_members: [this.item]
        }
      }).then((response: any) => {
        fireEvent(this.mainEl, 'partner-contacts-updated', response.staff_members);
        dialog.stopSpinner();
        dialog.opened = false;
      }).catch((error: any) => {
        dialog.stopSpinner();
        parseRequestErrorsAndShowAsToastMsgs(error, this.mainEl);
      });
    }
  }

}

window.customElements.define('add-edit-staff-members', AddEditStaffMembers);

export {AddEditStaffMembers as AddEditStaffMembersEl};
