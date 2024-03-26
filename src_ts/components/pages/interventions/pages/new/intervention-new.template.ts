/* eslint no-invalid-this: 0 */
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query';
import {TemplateResult, html} from 'lit';
import {InterventionNew} from './intervention-new';
import {BASE_URL} from '../../../../../config/config';
import {LabelAndValue, Office, GenericObject} from '@unicef-polymer/etools-types';
import {langChanged, translate} from 'lit-translate';
import {formatDate} from '@unicef-polymer/etools-utils/dist/date.util';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi';
import {sharedStyles} from '../../../../styles/shared-styles-lit';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import {SlSwitch} from '@shoelace-style/shoelace';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';

export function template(this: InterventionNew): TemplateResult {
  return html`
    ${sharedStyles}
    <style>
      label[required] {
          background: url(${BASE_URL + '/assets/images/required.svg'}) no-repeat 95% 45%/4px;
          width: auto !important;
          max-width: 100%;
          right: auto;
          padding-inline-end: 15px;
      }

      :host-context([dir='rtl'])  label[required] {
          background: url(${BASE_URL + '/assets/images/required.svg'}) no-repeat 0% 45%/4px;
      }

      paper-input#unppNumber {
        --paper-input-error: {
          white-space: nowrap;
          overflow: visible;
        }
      }
      datepicker-lite {
        --paper-input-container_-_width: 100%;
      }
      info-icon-tooltip {
        --iit-font-size: var(--etools-font-size-16, 16px);
        --iit-icon-size: 18px;
        --iit-margin: 0 0 4px 4px;
        --iit-max-width: auto;
      }
      etools-dropdown#documentType::part(form-control), etools-dropdown-multi#partnerFocalPoints::part(form-control) {
        padding-top:0;
      }
    </style>

    <etools-media-query
      query="(max-width: 767px)"
      @query-matches-changed="${(e: any) => (this.windowWidthIsSmall = e.detail.value)}"
    ></etools-media-query>

    <!--   Header   -->
    <div class="title">${translate('NEW_INTERVENTION.INITIAL_DETAILS')}</div>

    <div class="form">
      <div class="row">
        <!--   Partner Organization   -->
        <div class="col-md-6 col-lg-8 col-12">
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
        <div class="col-md-6 col-lg-4 col-12">
          <etools-dropdown
            id="agreements"
            label=${translate('AGREEMENT')}
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
        <div class="col-md-6 col-lg-8 col-12">
          <etools-input
            readonly
            placeholder="—"
            label=${translate('NEW_INTERVENTION.PARTNER_VENDOR_NUMBER')}
            .value="${this.selectedPartner?.vendor_number}"
          >
          </etools-input>
        </div>

        <!--   Agreement Authorized Officers   -->
        <div class="col-md-6 col-lg-4 col-12">
          <etools-input
            readonly
            placeholder="—"
            label=${translate('NEW_INTERVENTION.AGREEMENT_AUTH_OFFICERS')}
            .value="${this.authorizedOfficers}"
          >
          </etools-input>
        </div>
      </div>

      <div class="row">
        <!--   Partner Focal Points   -->
        <div class="col-md-6 col-lg-8 col-12">
        <label class="paper-label"> ${translate('NEW_INTERVENTION.DOC_PARTNER_FOCAL_POINTS')}</label>
        <info-icon-tooltip
              position="top"
              offset="48"
              .tooltipText="${translate('NEW_INTERVENTION.PARTNER_FOCAL_POINTS_TOOLTIP')}"
            ></info-icon-tooltip>
          <etools-dropdown-multi
            id="partnerFocalPoints"
            no-label-float
            placeholder="&#8212;"
            .readonly="${!this.partnerStaffMembers.length}"
            .options="${langChanged(() => this.formattedPartnerStaffMembers)}"
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
        <div class="col-md-6 col-lg-4 col-12">
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
        <!--   UNPP CFEI Number   -->
        <div class="col-md-6 col-lg-4 col-12">
          <etools-input
            id="unppNumber"
            pattern="CEF/[a-zA-Z]{3}/\\d{4}/\\d{3}"
            label=${translate('UNPP_CFEI_DSR_REF_NUM')}
            placeholder="CEF/___/____/___"
            .value="${this.newIntervention.cfei_number ? this.newIntervention.cfei_number : ''}"
            error-message="${
              this.windowWidthIsSmall
                ? translate('NEW_INTERVENTION.CFEI_EXPECTED_FORMAT_SHORT')
                : translate('CFEI_EXPECTED_FORMAT')
            }"
            @blur="${(ev: CustomEvent) => this.validateCFEI(ev)}"
            @value-changed="${({detail}: CustomEvent) =>
              this.setInterventionField('cfei_number', detail && detail.value)}"
          ></etool-input>
        </div>
      </div>

      <div class="row">
        <!--   Document Type   -->
        <div class="col-md-6 col-lg-4 col-12">
        <label class="paper-label" required> ${translate('NEW_INTERVENTION.DOC_TYPE')}</label>
        <info-icon-tooltip
              position="top"
              offset="48"
              .tooltipText="${this.getDocTypeTooltip()}"
            ></info-icon-tooltip>

          <etools-dropdown
            id="documentType"
            placeholder="&#8212;"
            no-label-float
            ?readonly="${!this.documentTypes.length}"
            required
            .options="${this.documentTypes}"
            .selected="${this.newIntervention.document_type}"
            error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
            @etools-selected-item-changed="${({detail}: CustomEvent) =>
              this.documentTypeChanged(detail.selectedItem && detail.selectedItem.value)}"
            trigger-value-change-event
            hide-search
            @focus="${this.resetError}"
            @click="${this.resetError}"
          >
          </etools-dropdown>
        </div>
        <div class="col-md-6 col-lg-8 col-12">
          <div class="row">
            <!--   SPD is Humanitarian   -->
            <div ?hidden="${!this.isSPD}">
              <sl-switch
                ?checked="${this.newIntervention.humanitarian_flag}"
                @sl-change="${(e: CustomEvent) => {
                  this.setInterventionField('contingency_pd', false);
                  this.setInterventionField('humanitarian_flag', (e.target! as SlSwitch).checked);
                }}"
              >
                ${translate('NEW_INTERVENTION.SPD_HUMANITARIAN')}
              </sl-switch>
            </div>

            <!--   Contingency Document   -->
            <div ?hidden="${!this.newIntervention.humanitarian_flag}">
              <sl-switch
                ?checked="${this.newIntervention.contingency_pd}"
                @sl-change="${(e: CustomEvent) => {
                  this.setInterventionField('contingency_pd', (e.target! as SlSwitch).checked);
                  this.setInterventionField('activation_protocol', '');
                }}"
              >
                ${translate('NEW_INTERVENTION.CONTINGENCY_DOC')}
              </sl-switch>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12" ?hidden="${!this.newIntervention.contingency_pd}">
        <etools-input
          label=${translate('NEW_INTERVENTION.ACTIVATION_PROTOCOL')}
          placeholder="&#8212;"
          ?required="${this.newIntervention.contingency_pd}"
          error-message=${translate('GENERAL.REQUIRED_FIELD')}
          value="${this.newIntervention.activation_protocol || ''}"
          @value-changed="${({detail}: CustomEvent) => this.setInterventionField('activation_protocol', detail.value)}"
          @focus="${this.resetError}"
          @click="${this.resetError}"
        >
        </etools-input>
      </div>

      <div class="row">
        <!-- Start Date -->
        <div class="col-md-6 col-lg-4 col-12">
          <datepicker-lite
            id="startDate"
            label=${translate('NEW_INTERVENTION.START_DATE_ESTIMATED')}
            .value="${this.newIntervention.start}"
            fire-date-has-changed
            @date-has-changed="${({detail}: CustomEvent) =>
              this.setInterventionField('start', formatDate(detail.date, 'YYYY-MM-DD'))}"
            selected-date-display-format="D MMM YYYY"
          >
          </datepicker-lite>
        </div>
        <!-- End Date -->
        <div class="col-md-6 col-lg-4 col-12">
          <datepicker-lite
            id="endDate"
            label=${translate('NEW_INTERVENTION.END_DATE_ESTIMATED')}
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
        <!--   Reference Number Year   -->
        <div class="col-md-6 col-lg-4 col-12">
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
        <div class="col-md-6 col-lg-4 col-12">
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
      </div>

      <div class="row">
        <!--   Document Title   -->
        <div class="col-12">
          <etools-input
            id="title"
            label=${translate('NEW_INTERVENTION.DOC_TITLE')}
            char-counter
            maxlength="256"
            placeholder="&#8212;"
            required
            error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
            .value="${this.newIntervention?.title ? this.newIntervention?.title : ''}"
            @value-changed="${({detail}: CustomEvent) => this.setInterventionField('title', detail && detail.value)}"
            @focus="${this.resetError}"
            @click="${this.resetError}"
          ></etools-input>
        </div>
      </div>

      <div class="row">
        <!--   UNICEF Office(s)   -->
        <div class="col-md-6 col-lg-6 col-12">
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
        <div class="col-md-6 col-lg-6 col-12">
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
        <div class="col-md-6 col-lg-6 col-12">
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
        <div class="col-md-6 col-lg-6 col-12">
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
        <etools-button variant="neutral" @click="${this.cancel}">${translate('GENERAL.CANCEL')}</etools-button>
        <etools-button variant="primary" @click="${() => this.createIntervention()}"
          >${translate('GENERAL.CREATE')}</etools-button
        >
      </div>
    </div>
  `;
}
