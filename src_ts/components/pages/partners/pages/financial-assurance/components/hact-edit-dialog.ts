import {LitElement, html, customElement, property} from 'lit-element';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import '@polymer/paper-input/paper-input';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import clone from 'lodash-es/clone';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {GenericObject} from '@unicef-polymer/etools-types';
import CommonMixinLit from '../../../../../common/mixins/common-mixin-lit';
import {translate} from 'lit-translate';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../../../../endpoints/endpoints';

@customElement('hact-edit-dialog')
export class HactEditDialog extends CommonMixinLit(EndpointsLitMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          --paper-input-container-label: {
            font-size: 12px;
            text-align: center;
          }
          --paper-input-container-input-webkit-spinner: {
            -webkit-appearance: none;
            margin: 0;
          }
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
        }

        .partner-name {
          height: 48px;
          line-height: 48px;
          text-transform: uppercase;
          font-size: 20px;
          color: var(--primary-color);
        }

        paper-input {
          max-width: 32px;
          text-align: center;
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
      </style>

      <etools-dialog
        id="editPartnersDialog"
        size="lg"
        dialog-title="${translate('EDIT_HACT_ASSURANCE_PLAN')}"
        ok-btn-text="Save"
        keep-dialog-open
        opened
        @close="${this._onClose}"
        spinner-text="Saving..."
        @confirm-btn-clicked="${this._saveChanges}"
      >
        <div class="layout-vertical">
          <div class="layout-horizontal">
            <div class="partner-name">${this.partner.name}</div>
          </div>

          <div class="avoid-scroll layout-horizontal space-between">
            ${this.isGovPartner
              ? html` <div class="layout-vertical col-3">
                  <div class="heading">${translate('PLANNED_PROGRAMMATIC_VISITS')}</div>
                  <div class="layout-horizontal space-around">
                    <paper-input
                      type="number"
                      allowed-pattern="[0-9]"
                      auto-validate
                      error-message="${translate('INVALID')}"
                      .value="${this.editableValues.planned_visits.programmatic_q1}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.editableValues.planned_visits.programmatic_q1 = detail.value;
                      }}"
                      label="Q1"
                    ></paper-input>
                    <paper-input
                      .value="${this.editableValues.planned_visits.programmatic_q2}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.editableValues.planned_visits.programmatic_q2 = detail.value;
                      }}"
                      type="number"
                      allowed-pattern="[0-9]"
                      auto-validate
                      error-message="${translate('INVALID')}"
                      label="Q2"
                    ></paper-input>
                    <paper-input
                      .value="${this.editableValues.planned_visits.programmatic_q3}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.editableValues.planned_visits.programmatic_q3 = detail.value;
                      }}"
                      type="number"
                      allowed-pattern="[0-9]"
                      auto-validate
                      error-message="${translate('INVALID')}"
                      label="Q3"
                    ></paper-input>
                    <paper-input
                      type="number"
                      allowed-pattern="[0-9]"
                      auto-validate
                      error-message="${translate('INVALID')}"
                      .value="${this.editableValues.planned_visits.programmatic_q4}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.editableValues.planned_visits.programmatic_q4 = detail.value;
                      }}"
                      label="Q4"
                    ></paper-input>
                  </div>
                </div>`
              : html``}

            <div class="layout-vertical col-2">
              <div class="heading">${translate('FOLLOW_UP_SPOT_CHECKS')}</div>
              <div class="layout-horizontal space-around">
                <paper-input
                  .value="${this.editableValues.planned_engagement.spot_check_follow_up}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.editableValues.planned_engagement.spot_check_follow_up = detail.value;
                  }}"
                  type="number"
                  allowed-pattern="[0-9]"
                >
                </paper-input>
              </div>
            </div>

            <div class="layout-vertical col-3">
              <div class="heading">${translate('PLANNED_SPOT_CHECKS')}</div>
              <div class="layout-horizontal space-around">
                <paper-input
                  type="number"
                  allowed-pattern="[0-9]"
                  .value="${this.editableValues.planned_engagement.spot_check_planned_q1}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.editableValues.planned_engagement.spot_check_planned_q1 = detail.value;
                  }}"
                  label="Q1"
                ></paper-input>
                <paper-input
                  type="number"
                  allowed-pattern="[0-9]"
                  .value="${this.editableValues.planned_engagement.spot_check_planned_q2}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.editableValues.planned_engagement.spot_check_planned_q2 = detail.value;
                  }}"
                  label="Q2"
                ></paper-input>
                <paper-input
                  type="number"
                  allowed-pattern="[0-9]"
                  .value="${this.editableValues.planned_engagement.spot_check_planned_q3}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.editableValues.planned_engagement.spot_check_planned_q3 = detail.value;
                  }}"
                  label="Q3"
                ></paper-input>
                <paper-input
                  type="number"
                  allowed-pattern="[0-9]"
                  .value="${this.editableValues.planned_engagement.spot_check_planned_q4}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.editableValues.planned_engagement.spot_check_planned_q4 = detail.value;
                  }}"
                  label="Q4"
                ></paper-input>
              </div>
            </div>

            <div class="layout-vertical col-4">
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

  @property({type: Array})
  auditOptions = [
    {
      label: 'Scheduled Audit',
      value: 'Scheduled Audit'
    },
    {
      label: 'Special Audit',
      value: 'Special Audit'
    }
  ];
  @property({type: Array})
  auditMap = [
    {
      label: 'Special Audit',
      prop: 'special_audit'
    },
    {
      label: 'Scheduled Audit',
      prop: 'scheduled_audit'
    }
  ];

  set dialogData(data: any) {
    const {partner}: any = data;

    this.partner = partner;
    this._partnerChanged(this.partner);
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
    const hasAudit = (auditType: any) => partner.planned_engagement[auditType.prop];
    // const selectedAudits = compose(map(prop('label')), filter(hasAudit))(this.auditMap);
    const selectedAudits = this.auditMap.filter(hasAudit).map((a: any) => a.label);
    this.editableValues = editableValues;
    this.selectedAudits = selectedAudits;
  }

  _auditsChanged() {
    this.auditMap.map(
      (audit: any) =>
        (this.editableValues.planned_engagement[`${audit.prop}`] = this.selectedAudits.includes(audit.label))
    );
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
