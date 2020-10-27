/* eslint no-invalid-this: 0 */
import {TemplateResult, html} from 'lit-element';
import {InterventionNew} from './intervention-new';
import {GenericObject, LabelAndValue, Office} from '../../../../../typings/globals.types';
import {BASE_URL} from '../../../../../config/config';
import {SharedStyles} from '../../../../styles/shared-styles';

export function template(this: InterventionNew): TemplateResult {
  return html`
    ${SharedStyles}
    <style>
      paper-button {
        --paper-button: {
          color: var(--light-primary-text-color, #fff);
          font-weight: bold;
          padding: 5px 10px;
        }
      }
      :host > * {
        --required-star-style: {
          background: url(${BASE_URL + '/images/required.svg'}) no-repeat 99% 20%/8px;
          width: auto !important;
          max-width: 100%;
          right: auto;
          padding-right: 15px;
        }
      }

      paper-input[required][label],
      paper-input-container[required],
      etools-dropdown[required],
      etools-dropdown-multi[required] {
        --paper-input-container-label: {
          @apply --required-star-style;
          color: var(--secondary-text-color, #737373);
        }
        --paper-input-container-label-floating: {
          @apply --required-star-style;
          color: var(--secondary-text-color, #737373);
        }
      }
    </style>

    <!--   Header   -->
    <div class="title">Enter initial details</div>

    <div class="form">
      <div class="row">
        <!--   Partner Organization   -->
        <div class="col-8">
          <etools-dropdown
            id="partner"
            label="Partner Organization"
            placeholder="&#8212;"
            .options="${this.partnersDropdownData}"
            option-value="id"
            option-label="name"
            required
            .selected="${this.newIntervention?.partner}"
            error-message="Partner is required"
            trigger-value-change-event
            @etools-selected-item-changed="${(event: CustomEvent) => this.partnerChanged(event)}"
            @focus="${this.resetError}"
            @click="${this.resetError}"
          >
          </etools-dropdown>
        </div>

        <!--   Agreement   -->
        <div class="col-4">
          <etools-dropdown
            id="agreements"
            label="Agreement"
            placeholder="&#8212;"
            .readonly="${!this.newIntervention?.partner}"
            .options="${this.filteredAgreements}"
            option-value="id"
            option-label="agreement_number_status"
            required
            .selected="${this.newIntervention?.agreement}"
            trigger-value-change-event
            @etools-selected-item-changed="${(event: CustomEvent) => this.agreementChanged(event)}"
            auto-validate
            error-message="Agreement required"
            @focus="${this.resetError}"
            @click="${this.resetError}"
          >
          </etools-dropdown>
        </div>
      </div>

      <div class="row">
        <!--   Partner Vendor Number   -->
        <div class="col-8">
          <etools-form-element-wrapper label="Partner Vendor Number" .value="${this.selectedPartner?.vendor_number}">
          </etools-form-element-wrapper>
        </div>

        <!--   Agreement Authorized Officers   -->
        <div class="col-4">
          <etools-form-element-wrapper label="Agreement Authorized Officers" .value="${this.authorizedOfficers}">
          </etools-form-element-wrapper>
        </div>
      </div>

      <div class="row">
        <!--   Partner Staff Members   -->
        <div class="col-12 w100">
          <etools-form-element-wrapper label="Partner Staff Members" .value="${this.allStaffMembers}">
          </etools-form-element-wrapper>
        </div>
      </div>

      <div class="row">
        <!--   Partner Focal Points   -->
        <div class="col-8">
          <etools-dropdown-multi
            label="Document Partner Focal Points"
            placeholder="&#8212;"
            .readonly="${!this.staffMembers.length}"
            .options="${this.staffMembers}"
            .selectedValues="${this.newIntervention.partner_focal_points || []}"
            @etools-selected-items-changed="${({detail}: CustomEvent) =>
              this.setInterventionField(
                'partner_focal_points',
                detail.selectedItems.map(({value}: LabelAndValue) => value)
              )}"
            trigger-value-change-event
            auto-validate
          >
          </etools-dropdown-multi>
        </div>
      </div>

      <div class="row">
        <!--   Document Type   -->
        <div class="col-4">
          <etools-dropdown
            id="documentType"
            label="Document Type"
            placeholder="&#8212;"
            ?readonly="${!this.documentTypes.length}"
            required
            .options="${this.documentTypes}"
            .selected="${this.newIntervention.document_type}"
            @etools-selected-item-changed="${({detail}: CustomEvent) =>
              this.documentTypeChanged(detail.selectedItem && detail.selectedItem.value)}"
            trigger-value-change-event
            hide-search
            @focus="${this.resetError}"
            @click="${this.resetError}"
          >
          </etools-dropdown>
        </div>

        <!--   Reference Number Year   -->
        <div class="col-4">
          <etools-dropdown
            id="yearSelector"
            label="Reference Number Year"
            required
            .options="${this.availableYears}"
            .selected="${this.newIntervention.reference_number_year}"
            @etools-selected-item-changed="${({detail}: CustomEvent) =>
              this.setInterventionField('reference_number_year', detail.selectedItem && detail.selectedItem.value)}"
            trigger-value-change-event
            allow-outside-scroll
            hide-search
            @focus="${this.resetError}"
            @click="${this.resetError}"
          >
          </etools-dropdown>
        </div>
      </div>

      <div class="row">
        <!--   SPD is Humanitarian   -->
        <div ?hidden="${!this.isSPD}">
          <paper-toggle-button
            ?checked="${this.newIntervention.humanitarian_flag}"
            @checked-changed="${({detail}: CustomEvent) => {
              this.setInterventionField('contingency_pd', false);
              this.setInterventionField('humanitarian_flag', detail.value);
            }}"
          >
            This SPD is Humanitarian
          </paper-toggle-button>
        </div>

        <!--   Contingency Document   -->
        <div class="col-6" ?hidden="${!this.newIntervention.humanitarian_flag}">
          <paper-toggle-button
            ?checked="${this.newIntervention.contingency_pd}"
            @checked-changed="${({detail}: CustomEvent) => this.setInterventionField('contingency_pd', detail.value)}"
          >
            This is Contingency Document
          </paper-toggle-button>
        </div>
      </div>

      <div class="row">
        <!--   UNPP Number Toggle   -->
        <paper-toggle-button
          ?checked="${this.hasUNPP}"
          @checked-changed="${({detail}: CustomEvent) => {
            this.hasUNPP = detail.value;
            this.setInterventionField('cfei_number', '');
          }}"
        >
          I Have UNPP Number
        </paper-toggle-button>

        <!--   UNPP CFEI Number   -->
        <div class="col-3">
          <paper-input
            id="unppNumber"
            ?hidden="${!this.hasUNPP}"
            label="UNPP CFEI/DSR Ref Number"
            placeholder="&#8212;"
            .value="${this.newIntervention.cfei_number}"
            @value-changed="${({detail}: CustomEvent) =>
              this.setInterventionField('cfei_number', detail && detail.value)}"
          ></paper-input>
        </div>
      </div>

      <div class="row">
        <!--   Document Title   -->
        <div class="col-12">
          <paper-input
            id="title"
            label="Document Title"
            char-counter
            maxlength="256"
            placeholder="&#8212;"
            required
            .value="${this.newIntervention?.title}"
            @value-changed="${({detail}: CustomEvent) => this.setInterventionField('title', detail && detail.value)}"
            @focus="${this.resetError}"
            @click="${this.resetError}"
          ></paper-input>
        </div>
      </div>

      <div class="row">
        <!--   UNICEF Office(s)   -->
        <div class="col-6">
          <etools-dropdown-multi
            id="unicefOffices"
            label="UNICEF Office(s)"
            placeholder="&#8212;"
            .options="${this.offices}"
            option-label="name"
            option-value="id"
            .selectedValues="${this.newIntervention.offices || []}"
            @etools-selected-items-changed="${({detail}: CustomEvent) =>
              this.setInterventionField(
                'offices',
                detail.selectedItems.map(({id}: Office) => id)
              )}"
            trigger-value-change-event
          >
          </etools-dropdown-multi>
        </div>

        <!--   UNICEF Sections   -->
        <div class="col-6">
          <etools-dropdown-multi
            id="unicefSections"
            label="UNICEF Sections"
            placeholder="&#8212;"
            .options="${this.sections}"
            option-label="name"
            option-value="id"
            .selectedValues="${this.newIntervention.sections || []}"
            @etools-selected-items-changed="${({detail}: CustomEvent) =>
              this.setInterventionField(
                'sections',
                detail.selectedItems.map(({id}: GenericObject) => id)
              )}"
            trigger-value-change-event
          >
          </etools-dropdown-multi>
        </div>
      </div>

      <div class="row">
        <!--   UNICEF Focal Points   -->
        <div class="col-6">
          <etools-dropdown-multi
            id="unicefFocalPoints"
            label="UNICEF Focal Points"
            placeholder="&#8212;"
            .options="${this.unicefUsersData}"
            option-label="name"
            option-value="id"
            .selectedValues="${this.newIntervention.unicef_focal_points || []}"
            @etools-selected-items-changed="${({detail}: CustomEvent) =>
              this.setInterventionField(
                'unicef_focal_points',
                detail.selectedItems.map(({id}: GenericObject) => id)
              )}"
            trigger-value-change-event
          >
          </etools-dropdown-multi>
        </div>

        <!--   UNICEF Budget Owner   -->
        <div class="col-6">
          <etools-dropdown
            id="unicefBudgetOwner"
            label="UNICEF Budget Owner"
            placeholder="&#8212;"
            .options="${this.unicefUsersData}"
            option-label="name"
            option-value="id"
            .selected="${this.newIntervention.budget_owner}"
            @etools-selected-item-changed="${({detail}: CustomEvent) =>
              this.setInterventionField('budget_owner', detail.selectedItem && detail.selectedItem.id)}"
            trigger-value-change-event
          >
          </etools-dropdown>
        </div>
      </div>

      <div class="buttons">
        <paper-button @click="${this.cancel}">Cancel</paper-button>
        <paper-button class="primary-btn" @click="${() => this.createIntervention()}">Create</paper-button>
      </div>
    </div>
  `;
}
