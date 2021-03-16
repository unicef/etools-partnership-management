/* eslint no-invalid-this: 0 */
import {TemplateResult, html} from 'lit-element';
import {InterventionNew} from './intervention-new';
import {BASE_URL} from '../../../../../config/config';
import {SharedStyles} from '../../../../styles/shared-styles';
import {LabelAndValue, Office, GenericObject} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {formatDate} from '../../../../utils/date-utils';

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

      paper-input#unppNumber {
        --paper-input-error: {
          white-space: normal;
        }
      }
      datepicker-lite {
        --paper-input-container_-_width: 100%;
      }

      etools-info-tooltip {
        --etools-tooltip-trigger-icon: {
          color: var(--primary-color);
        }
      }
    </style>

    <!--   Header   -->
    <div class="title">${translate('NEW_INTERVENTION.INITIAL_DETAILS')}</div>

    <div class="form">
      <div class="row">
        <!--   Partner Organization   -->
        <div class="col-8">
          <etools-dropdown
            id="partner"
            label=${translate('NEW_INTERVENTION.PARTNER_ORGANIZATION')}
            placeholder="&#8212;"
            .options="${this.partnersDropdownData}"
            option-value="id"
            option-label="name"
            required
            .selected="${this.newIntervention?.partner}"
            error-message=${translate('NEW_INTERVENTION.PARTNER_REQUIRED')}
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
            label=${translate('NEW_INTERVENTION.AGREEMENT')}
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
            error-message=${translate('NEW_INTERVENTION.AGREEMENT_REQUIRED')}
            @focus="${this.resetError}"
            @click="${this.resetError}"
          >
          </etools-dropdown>
        </div>
      </div>

      <div class="row">
        <!--   Partner Vendor Number   -->
        <div class="col-8">
          <etools-form-element-wrapper2
            label=${translate('NEW_INTERVENTION.PARTNER_VENDOR_NUMBER')}
            .value="${this.selectedPartner?.vendor_number}"
          >
          </etools-form-element-wrapper2>
        </div>

        <!--   Agreement Authorized Officers   -->
        <div class="col-4">
          <etools-form-element-wrapper2
            label=${translate('NEW_INTERVENTION.AGREEMENT_AUTH_OFFICERS')}
            .value="${this.authorizedOfficers}"
          >
          </etools-form-element-wrapper2>
        </div>
      </div>

      <div class="row">
        <!--   Partner Focal Points   -->
        <div class="col-8">
          <etools-info-tooltip>
            <etools-dropdown-multi
              slot="field"
              id="partnerFocalPoints"
              label=${translate('NEW_INTERVENTION.DOC_PARTNER_FOCAL_POINTS')}
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
            <span slot="message">${translate('NEW_INTERVENTION.PARTNER_FOCAL_POINTS_TOOLTIP')}</span>
          </etools-info-tooltip>
        </div>
        <div class="col-4">
          <etools-dropdown-multi
            label=${translate('NEW_INTERVENTION.CP_STRUCTURES')}
            placeholder="&#8212;"
            .options="${this.cpStructures}"
            option-value="id"
            option-label="name"
            .selectedValues="${this.newIntervention.country_programmes || []}"
            @etools-selected-items-changed="${({detail}: CustomEvent) =>
              this.setInterventionField(
                'country_programmes',
                detail.selectedItems.map(({id}: any) => id)
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
            label=${translate('NEW_INTERVENTION.DOC_TYPE')}
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
        <!-- Start Date -->
        <div class="col-4">
          <datepicker-lite
            id="startDate"
            label=${translate('INTERVENTIONS_LIST.COLUMNS.START_DATE')}
            .value="${this.newIntervention.start}"
            fire-date-has-changed
            @date-has-changed="${({detail}: CustomEvent) =>
              this.setInterventionField('start', formatDate(detail.date, 'YYYY-MM-DD'))}"
            selected-date-display-format="D MMM YYYY"
          >
          </datepicker-lite>
        </div>
        <!-- End Date -->
        <div class="col-4">
          <datepicker-lite
            id="endDate"
            label=${translate('INTERVENTIONS_LIST.COLUMNS.END_DATE')}
            .value="${this.newIntervention.end}"
            fire-date-has-changed
            @date-has-changed="${({detail}: CustomEvent) =>
              this.setInterventionField('end', formatDate(detail.date, 'YYYY-MM-DD'))}"
            selected-date-display-format="D MMM YYYY"
          >
          </datepicker-lite>
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
            ${translate('NEW_INTERVENTION.SPD_HUMANITARIAN')}
          </paper-toggle-button>
        </div>

        <!--   Contingency Document   -->
        <div class="col-6" ?hidden="${!this.newIntervention.humanitarian_flag}">
          <paper-toggle-button
            ?checked="${this.newIntervention.contingency_pd}"
            @checked-changed="${({detail}: CustomEvent) => this.setInterventionField('contingency_pd', detail.value)}"
          >
            ${translate('NEW_INTERVENTION.CONTINGENCY_DOC')}
          </paper-toggle-button>
        </div>
      </div>

      <div class="row">
        <!--   Reference Number Year   -->
        <div class="col-4">
          <etools-dropdown
            id="yearSelector"
            label=${translate('NEW_INTERVENTION.REF_NUM_YEAR')}
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

        <!--   Document Currency   -->
        <div class="col-4">
          <etools-dropdown
            id="currency"
            label=${translate('NEW_INTERVENTION.DOCUMENT_CURRENCY')}
            placeholder="&#8212;"
            .options="${this.currencies}"
            .selected="${this.newIntervention?.planned_budget?.currency}"
            trigger-value-change-event
            @etools-selected-item-changed="${({detail}: CustomEvent) =>
              this.setCurrency(detail.selectedItem && detail.selectedItem.value)}"
            option-value="value"
            option-label="label"
          >
          </etools-dropdown>
        </div>
        <!--   UNPP CFEI Number   -->
        <div class="col-4">
          <paper-input
            id="unppNumber"
            pattern="CEF/[a-zA-Z]{3}/\\d{4}/\\d{3}"
            label=${translate('NEW_INTERVENTION.UNPP_CFEI_DSR_REF_NUM')}
            placeholder="CEF/___/____/___"
            .value="${this.newIntervention.cfei_number}"
            auto-validate
            error-message="${translate('NEW_INTERVENTION.CFEI_EXPECTED_FORMAT')}"
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
            label=${translate('NEW_INTERVENTION.DOC_TITLE')}
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
            label=${translate('NEW_INTERVENTION.UNICEF_OFFICES')}
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
            label=${translate('NEW_INTERVENTION.UNICEF_SECTIONS')}
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
            label=${translate('NEW_INTERVENTION.UNICEF_FOCAL_POINTS')}
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
            label=${translate('NEW_INTERVENTION.UNICEF_BUDGET_OWNER')}
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
        <paper-button @click="${this.cancel}">${translate('GENERAL.CANCEL')}</paper-button>
        <paper-button class="primary-btn" @click="${() => this.createIntervention()}"
          >${translate('GENERAL.CREATE')}</paper-button
        >
      </div>
    </div>
  `;
}
