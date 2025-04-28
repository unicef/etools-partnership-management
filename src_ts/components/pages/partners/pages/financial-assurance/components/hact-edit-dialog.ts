import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import clone from 'lodash-es/clone';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {GenericObject, User} from '@unicef-polymer/etools-types';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../../../../endpoints/endpoints';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {userIsHQorRSS} from '../../../../../common/user/user-permissions';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';

@customElement('hact-edit-dialog')
export class HactEditDialog extends CommonMixin(EndpointsLitMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
        }

        .heading {
          border-bottom: var(--header-bottom-line, 1px solid rgba(0, 0, 0, 0.12));
          padding-bottom: 10px;
          padding-top: 10px;
          width: 100%;
          text-align: center;
          flex: 1;
          color: var(--secondary-text-color);
          font-weight: 500;
          font-size: var(--etools-font-size-14, 14px);
        }

        .partner-name {
          min-height: 48px;
          line-height: 48px;
          text-transform: uppercase;
          font-size: var(--etools-font-size-20, 20px);
          color: var(--primary-color);
        }

        etools-input {
          max-width: 32px;
        }

        etools-input::part(input) {
          text-align: center;
        }
        etools-input::part(form-control-label) {
          text-align: center;
        }
        etools-input::part(prefix) {
          margin-inline-end: unset;
        }
        .avoid-scroll {
          overflow: hidden;
        }

        .space-around {
          justify-content: space-around;
        }

        .space-between {
          justify-content: space-between;
        }
        .layout-vertical.col-md-2,
        .layout-vertical.col-md-3,
        .layout-vertical.col-md-4 {
          padding-left: 0;
          padding-right: 0;
        }
        .row {
          margin-right: 0 !important;
          margin-left: 0 !important;
        }
      </style>

      <etools-dialog
        id="editPartnersDialog"
        size="lg"
        dialog-title="${translate('EDIT_HACT_ASSURANCE_PLAN')}"
        ok-btn-text="${translate('GENERAL.SAVE')}"
        keep-dialog-open
        @close="${this._onClose}"
        @confirm-btn-clicked="${this._saveChanges}"
      >
        <div class="layout-vertical">
          <div class="layout-horizontal">
            <div class="partner-name">${this.partner.name}</div>
          </div>

          <div class="avoid-scroll row space-between">
            ${this.isGovPartner
              ? html` <div class="layout-vertical col-md-3 col-12 ">
                  <div class="heading">${translate('PLANNED_PROGRAMMATIC_VISITS')}</div>
                  <div class="row space-around">
                    <etools-input
                      type="number"
                      class="col-3"
                      allowed-pattern="^[0-9]"
                      no-spin-buttons
                      min="0"
                      auto-validate
                      error-message="${translate('INVALID')}"
                      .value="${this.editableValues.planned_visits.programmatic_q1}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.editableValues.planned_visits.programmatic_q1 = detail.value;
                      }}"
                      label="Q1"
                    ></etools-input>
                    <etools-input
                      class="col-3"
                      .value="${this.editableValues.planned_visits.programmatic_q2}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.editableValues.planned_visits.programmatic_q2 = detail.value;
                      }}"
                      type="number"
                      allowed-pattern="^[0-9]"
                      min="0"
                      no-spin-buttons
                      auto-validate
                      error-message="${translate('INVALID')}"
                      label="Q2"
                    ></etools-input>
                    <etools-input
                      class="col-3"
                      .value="${this.editableValues.planned_visits.programmatic_q3}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.editableValues.planned_visits.programmatic_q3 = detail.value;
                      }}"
                      type="number"
                      allowed-pattern="^[0-9]"
                      min="0"
                      no-spin-buttons
                      auto-validate
                      error-message="${translate('INVALID')}"
                      label="Q3"
                    ></etools-input>
                    <etools-input
                      class="col-3"
                      type="number"
                      allowed-pattern="^[0-9]"
                      min="0"
                      no-spin-buttons
                      auto-validate
                      error-message="${translate('INVALID')}"
                      .value="${this.editableValues.planned_visits.programmatic_q4}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.editableValues.planned_visits.programmatic_q4 = detail.value;
                      }}"
                      label="Q4"
                    ></etools-input>
                  </div>
                </div>`
              : html``}

            <div class="layout-vertical col-md-2 col-12">
              <div class="heading">${translate('FOLLOW_UP_SPOT_CHECKS')}</div>
              <div class="row space-around">
                <etools-input
                  class="col-12"
                  always-float-label
                  .value="${this.editableValues.planned_engagement.spot_check_follow_up}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.editableValues.planned_engagement.spot_check_follow_up = detail.value;
                  }}"
                  type="number"
                  allowed-pattern="^[0-9]"
                  min="0"
                  no-spin-buttons
                >
                </etools-input>
              </div>
            </div>

            <div class="layout-vertical col-md-3 col-12">
              <div class="heading">${translate('PLANNED_SPOT_CHECKS')}</div>
              <div class="row space-around">
                <etools-input
                  class="col-3"
                  type="number"
                  allowed-pattern="^[0-9]"
                  min="0"
                  no-spin-buttons
                  .value="${this.editableValues.planned_engagement.spot_check_planned_q1}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.editableValues.planned_engagement.spot_check_planned_q1 = detail.value;
                  }}"
                  label="Q1"
                ></etools-input>
                <etools-input
                  class="col-3"
                  type="number"
                  allowed-pattern="^[0-9]"
                  min="0"
                  no-spin-buttons
                  .value="${this.editableValues.planned_engagement.spot_check_planned_q2}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.editableValues.planned_engagement.spot_check_planned_q2 = detail.value;
                  }}"
                  label="Q2"
                ></etools-input>
                <etools-input
                  class="col-3"
                  type="number"
                  allowed-pattern="^[0-9]"
                  min="0"
                  no-spin-buttons
                  .value="${this.editableValues.planned_engagement.spot_check_planned_q3}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.editableValues.planned_engagement.spot_check_planned_q3 = detail.value;
                  }}"
                  label="Q3"
                ></etools-input>
                <etools-input
                  class="col-3"
                  type="number"
                  allowed-pattern="^[0-9]"
                  min="0"
                  no-spin-buttons
                  .value="${this.editableValues.planned_engagement.spot_check_planned_q4}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.editableValues.planned_engagement.spot_check_planned_q4 = detail.value;
                  }}"
                  label="Q4"
                ></etools-input>
              </div>
            </div>

            <div class="layout-vertical col-md-4 col-12">
              <div class="heading">${translate('REQUIRED_AUDITS')}</div>
              <etools-dropdown-multi
                placeholder="&#8212;"
                .selectedValues="${this.selectedAudits}"
                .options="${this.auditOptions}"
                option-label="label"
                option-value="value"
                trigger-value-change-event
                @etools-selected-items-changed="${this._auditsChanged}"
              >
              </etools-dropdown-multi>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  partner!: GenericObject;

  @property({type: Boolean})
  isGovPartner = false;

  // Spot Checks and Audits changes get put here for PATCH request
  @property({type: Object})
  editableValues!: GenericObject;

  // Programmatic Visits changes here due to different endpoint for PATCH
  @property({type: Array})
  selectedAudits!: string[];

  @property({type: Object})
  currentUser!: User;

  @property({type: Array})
  auditOptions: any[] = [];

  set dialogData(data: any) {
    const {partner}: any = data;

    this.partner = partner;
    this.currentUser = getStore().getState().user.data;
    this.setAuditOptions();
    this._partnerChanged(this.partner);
  }

  setAuditOptions() {
    this.auditOptions = [
      {
        label: getTranslatedValue('Scheduled Audit', 'AUDIT_OPTIONS'),
        value: 'scheduled_audit',
        disabled: !userIsHQorRSS(this.currentUser),
        disabledTooltip: getTranslation('ONLY_HQ_RSS_CAN_EDIT_SCHEDULED_AUDIT')
      },
      {
        label: getTranslatedValue('Special Audit', 'AUDIT_OPTIONS'),
        value: 'special_audit'
      }
    ];
  }

  _partnerChanged(partner: any) {
    if (!partner) {
      return;
    }
    this.isGovPartner = this.partner.partner_type_slug === 'Gov';

    const editableValues = {planned_engagement: {}, planned_visits: {}};
    editableValues.planned_engagement = clone(partner.planned_engagement);

    if (this.isGovPartner) {
      const planned = clone(partner.hact_values.programmatic_visits.planned);
      const planned_visits = {
        programmatic_q1: planned.q1,
        programmatic_q2: planned.q2,
        programmatic_q3: planned.q3,
        programmatic_q4: planned.q4
      };
      editableValues.planned_visits = planned_visits;
    }
    const hasAudit = (auditType: any) => partner.planned_engagement[auditType.value];
    const selectedAudits = this.auditOptions.filter(hasAudit).map((a: any) => a.value);
    this.editableValues = editableValues;
    this.selectedAudits = selectedAudits;
  }

  _auditsChanged(e: CustomEvent) {
    const selectedItems = e.detail?.selectedItems;

    if (!selectedItems) {
      return;
    }

    this.selectedAudits = selectedItems.map((a: any) => a.value);
    this.auditOptions.forEach((audit: any) => {
      this.editableValues.planned_engagement[audit.value] = this.selectedAudits.includes(audit.value);
    });
  }

  _saveChanges() {
    (this.shadowRoot!.querySelector('#editPartnersDialog') as EtoolsDialog).startSpinner();
    this.savePartnerDetails(this.editableValues, this.partner.id);
  }

  _handleSaveResponse(resp: any) {
    (this.shadowRoot!.querySelector('#editPartnersDialog') as EtoolsDialog).stopSpinner();
    fireEvent(this, 'dialog-closed', {confirmed: true, response: resp});
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  savePartnerDetails(body: any, partnerId: string) {
    const params = {
      method: 'PATCH',
      endpoint: this.getEndpoint(pmpEdpoints, 'partnerDetails', {id: partnerId}),
      body
    };
    sendRequest(params)
      .then((resp: any) => {
        window.EtoolsPmpApp.DexieDb.partners.put(resp).then(() => this._handleSaveResponse(resp));
      })
      .catch((err: any) => {
        (this.shadowRoot!.querySelector('#editPartnersDialog') as EtoolsDialog).stopSpinner();
        parseRequestErrorsAndShowAsToastMsgs(err, this, false);
      });
  }
}
