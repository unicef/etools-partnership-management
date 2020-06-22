import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../../../typings/globals.types';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import EtoolsDialog from '@unicef-polymer/etools-dialog';
import EndpointsMixin from '../../../../../endpoints/endpoints-mixin';
import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles';
import clone from 'lodash-es/clone';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';

class HactEditDialog extends EndpointsMixin(PolymerElement) {
  static get template() {
    return html`
      ${gridLayoutStyles}
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
          white-space: nowrap;
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
          min-height: 120px;
        }
      </style>

      <etools-dialog
        id="editPartnersDialog"
        size="lg"
        dialog-title="Edit HACT Assurance Plan"
        ok-btn-text="Save"
        keep-dialog-open
        spinner-text="Saving..."
        on-confirm-btn-clicked="_saveChanges"
      >
        <div class="layout-vertical">
          <div class="layout-horizontal">
            <div class="partner-name">
              [[partner.name]]
            </div>
          </div>

          <div class="avoid-scroll layout-horizontal space-between">
            <template is="dom-if" if="{{isGovPartner}}">
              <div class="layout-vertical col-3">
                <div class="heading">Planned Programmatic Visits</div>
                <div class="layout-horizontal space-around">
                  <paper-input
                    type="number"
                    allowed-pattern="[0-9]"
                    auto-validate
                    error-message="Invalid"
                    value="{{editableValues.planned_visits.programmatic_q1}}"
                    label="Q1"
                  ></paper-input>
                  <paper-input
                    value="{{editableValues.planned_visits.programmatic_q2}}"
                    type="number"
                    allowed-pattern="[0-9]"
                    auto-validate
                    error-message="Invalid"
                    label="Q2"
                  ></paper-input>
                  <paper-input
                    value="{{editableValues.planned_visits.programmatic_q3}}"
                    type="number"
                    allowed-pattern="[0-9]"
                    auto-validate
                    error-message="Invalid"
                    label="Q3"
                  ></paper-input>
                  <paper-input
                    type="number"
                    allowed-pattern="[0-9]"
                    auto-validate
                    error-message="Invalid"
                    value="{{editableValues.planned_visits.programmatic_q4}}"
                    label="Q4"
                  ></paper-input>
                </div>
              </div>
            </template>

            <div class="layout-vertical col-2">
              <div class="heading">Follow-up Spot Checks</div>
              <div class="layout-horizontal space-around">
                <paper-input
                  value="{{editableValues.planned_engagement.spot_check_follow_up}}"
                  type="number"
                  allowed-pattern="[0-9]"
                >
                </paper-input>
              </div>
            </div>

            <div class="layout-vertical col-3">
              <div class="heading">Planned Spot Checks</div>
              <div class="layout-horizontal space-around">
                <paper-input
                  type="number"
                  allowed-pattern="[0-9]"
                  value="{{editableValues.planned_engagement.spot_check_planned_q1}}"
                  label="Q1"
                ></paper-input>
                <paper-input
                  type="number"
                  allowed-pattern="[0-9]"
                  value="{{editableValues.planned_engagement.spot_check_planned_q2}}"
                  label="Q2"
                ></paper-input>
                <paper-input
                  type="number"
                  allowed-pattern="[0-9]"
                  value="{{editableValues.planned_engagement.spot_check_planned_q3}}"
                  label="Q3"
                ></paper-input>
                <paper-input
                  type="number"
                  allowed-pattern="[0-9]"
                  value="{{editableValues.planned_engagement.spot_check_planned_q4}}"
                  label="Q4"
                ></paper-input>
              </div>
            </div>

            <div class="layout-veritcal col-4">
              <div class="heading">Required Audits</div>
              <etools-dropdown-multi
                placeholder="&#8212;"
                selected-values="{{selectedAudits}}"
                options="[[auditOptions]]"
                trigger-value-change-event
                on-etools-selected-items-changed="_auditsChanged"
              >
              </etools-dropdown-multi>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object, observer: '_partnerChanged'})
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

  @property({type: Object})
  toastSource!: PolymerElement;

  openDialog() {
    (this.$.editPartnersDialog as EtoolsDialog).opened = true;
  }

  _partnerChanged(partner: any) {
    if (!partner) {
      return;
    }
    this.set('isGovPartner', this.partner.partner_type_slug === 'Gov');

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
    this.setProperties({editableValues, selectedAudits});
  }

  _auditsChanged() {
    this.auditMap.map((audit: any) =>
      this.set(`editableValues.planned_engagement.${audit.prop}`, this.selectedAudits.includes(audit.label))
    );
  }

  _saveChanges() {
    (this.$.editPartnersDialog as EtoolsDialog).startSpinner();
    this.savePartnerDetails(this.editableValues, this.partner.id);
  }

  _handleSaveResponse(resp: any) {
    (this.$.editPartnersDialog as EtoolsDialog).stopSpinner();
    fireEvent(this, 'hact-values-saved', {partner: resp});
    this._closeDialog();
  }

  _closeDialog() {
    this.setProperties({
      editableValues: null,
      selectedAudits: null,
      partner: null
    });
    (this.$.editPartnersDialog as EtoolsDialog).opened = false;
  }

  savePartnerDetails(body: any, partnerId: string) {
    const params = {
      method: 'PATCH',
      endpoint: this.getEndpoint('partnerDetails', {id: partnerId}),
      body
    };
    sendRequest(params)
      .then((resp: any) => {
        window.EtoolsPmpApp.DexieDb.partners.put(resp).then(() => this._handleSaveResponse(resp));
      })
      .catch((err: any) => {
        (this.$.editPartnersDialog as EtoolsDialog).stopSpinner();
        parseRequestErrorsAndShowAsToastMsgs(err, this.toastSource, false);
      });
  }
}

window.customElements.define('hact-edit-dialog', HactEditDialog);
