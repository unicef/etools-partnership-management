import { PolymerElement, html } from "@polymer/polymer";
import "@polymer/paper-input/paper-input";
import "@polymer/paper-checkbox/paper-checkbox";
import "@polymer/iron-icons/communication-icons";
import "@unicef-polymer/etools-dialog/etools-dialog";

import "../../../../../layout/etools-form-element-wrapper";
import { gridLayoutStyles } from "../../../../../styles/grid-layout-styles";
import { SharedStyles } from "../../../../../styles/shared-styles";
import { requiredFieldStarredStyles } from "../../../../../styles/required-field-styles";
import { fireEvent } from "../../../../../utils/fire-custom-event";
import { property } from "@polymer/decorators";
import { StaffMember } from "../../../../../../models/partners.models";
import EtoolsDialog from "@unicef-polymer/etools-dialog/etools-dialog";
import EndpointsMixin from "../../../../../endpoints/endpoints-mixin";
import { sendRequest } from "@unicef-polymer/etools-ajax/etools-ajax-request";
import { parseRequestErrorsAndShowAsToastMsgs } from "@unicef-polymer/etools-ajax/ajax-error-parser";
import { ValidatableField } from "../../../../../../typings/globals.types";

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class AddEditStaffMembers extends EndpointsMixin(PolymerElement) {
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
      <etools-dialog
        id="staffMemberDialog"
        dialog-title="Partner Contact"
        size="md"
        ok-btn-text="Save"
        keep-dialog-open
        spinner-Text="Saving..."
        on-confirm-btn-clicked="_savePartnerContact"
      >
        <div class="layout-horizontal row-padding-v flex-c">
          <div class="col col-9">
            <paper-input
              id="title"
              label="Position"
              value="{{item.title}}"
              placeholder="&#8212;"
              maxlength="100"
              required
              auto-validate
              error-message="Position is required"
            ></paper-input>
          </div>
          <div class="col col-3 right-align">
            <etools-form-element-wrapper no-placeholder>
              <paper-checkbox checked="{{item.active}}">
                Active Staff
              </paper-checkbox>
            </etools-form-element-wrapper>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v flex-c">
          <div class="col col-6">
            <paper-input
              id="firstName"
              label="First Name"
              value="{{item.first_name}}"
              placeholder="&#8212;"
              maxlength="30"
              required
              auto-validate
              error-message="First name is required"
            >
            </paper-input>
          </div>
          <div class="col col-6">
            <paper-input
              id="lastName"
              label="Last Name"
              value="{{item.last_name}}"
              placeholder="&#8212;"
              maxlength="30"
              required
              auto-validate
              error-message="Last name is required"
            >
            </paper-input>
          </div>
        </div>
        <div class="layout-horizontal row-padding-v flex-c">
          <div class="col col-6">
            <paper-input
              id="email"
              label="E-mail address"
              value="{{item.email}}"
              placeholder="&#8212;"
              readonly$="[[!_isNewStaffMember(item)]]"
              maxlength="50"
              type="email"
              required
              auto-validate
              error-message="A valid & unused email address is required"
            >
              <iron-icon slot="prefix" icon="communication:email"></iron-icon>
            </paper-input>
          </div>
          <div class="col col-6">
            <paper-input
              id="phone"
              label="Phone number"
              value="{{item.phone}}"
              placeholder="&#8212;"
              maxlength="15"
              allowed-pattern="[0-9\\ \\.\\+\\-\\(\\)]"
            >
              <iron-icon slot="prefix" icon="communication:phone"></iron-icon>
            </paper-input>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({ type: Object })
  item!: StaffMember;

  @property({ type: Array })
  dataItems: StaffMember[] = [];

  @property({ type: Object })
  mainEl!: HTMLElement;

  @property({ type: Number })
  partnerId: number | null = null;

  @property({ type: Array })
  fieldSelectors: string[] = ["#firstName", "#lastName", "#email", "#title"];

  open() {
    this.resetValidations();
    (this.$.staffMemberDialog as EtoolsDialog).opened = true;
  }

  _isNewStaffMember(item: { id: number | null }) {
    return !item || !item.id;
  }

  validate() {
    let valid = true;

    this.fieldSelectors.forEach((s) => {
      const el: ValidatableField | null = this.shadowRoot!.querySelector(s);
      if (el && !el.validate()) {
        valid = false;
      }
    });

    return valid;
  }

  resetValidations() {
    this.fieldSelectors.forEach((s) => {
      const el: ValidatableField | null = this.shadowRoot!.querySelector(s);
      if (el) {
        el.invalid = false;
      }
    });
  }

  _savePartnerContact() {
    if (this.validate()) {
      const dialog: EtoolsDialog = this.$.staffMemberDialog as EtoolsDialog;
      const endpoint = this.getEndpoint("partnerDetails", {
        id: this.partnerId,
      });
      dialog.startSpinner();

      sendRequest({
        endpoint: endpoint,
        method: "PATCH",
        body: {
          id: this.id,
          staff_members: [this.item],
        },
      })
        .then((response: any) => {
          fireEvent(
            this.mainEl,
            "partner-contacts-updated",
            response.staff_members
          );
          dialog.stopSpinner();
          dialog.opened = false;
        })
        .catch((error: any) => {
          dialog.stopSpinner();
          parseRequestErrorsAndShowAsToastMsgs(error, this.mainEl);
        });
    }
  }
}

window.customElements.define("add-edit-staff-members", AddEditStaffMembers);

export { AddEditStaffMembers as AddEditStaffMembersEl };
