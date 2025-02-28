/* eslint no-invalid-this: 0 */
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query';
import {TemplateResult, html} from 'lit';
import {GddInterventionNew} from './gdd-intervention-new';
import {LabelAndValue, Office, GenericObject} from '@unicef-polymer/etools-types';
import {langChanged, translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {formatDate} from '@unicef-polymer/etools-utils/dist/date.util';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi';
import {sharedStyles} from '../../../../styles/shared-styles-lit';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';

export function template(this: GddInterventionNew): TemplateResult {
  return html`
    ${sharedStyles}
    <style>
      label[required] {
        background: url(${Environment.basePath + '/assets/images/required.svg'}) no-repeat 95% 45%/4px;
        width: auto !important;
        max-width: 100%;
        right: auto;
        padding-inline-end: 15px;
      }

      :host-context([dir='rtl']) label[required] {
        background: url(${Environment.basePath + '/assets/images/required.svg'}) no-repeat 0% 45%/4px;
      }

      paper-input#unppNumber {
        --paper-input-error: {
          white-space: nowrap;
          overflow: visible;
        };
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
      etools-dropdown#documentType::part(form-control),
      etools-dropdown-multi#partnerFocalPoints::part(form-control) {
        padding-top: 0;
      }
    </style>

    <etools-media-query
      query="(max-width: 767px)"
      @query-matches-changed="${(e: any) => (this.windowWidthIsSmall = e.detail.value)}"
    ></etools-media-query>

    <!--   Header   -->
    <div class="title">${translate('NEW_GDD.INITIAL_DETAILS')}</div>

    <div class="form">
      <div class="row">
        <!--   Partner Organization   -->
        <div class="col-md-6 col-lg-8 col-12">
          <etools-dropdown
            id="partner"
            label=${translate('NEW_GDD.GOVERNMENT')}
            placeholder="&#8212;"
            .options="${this.partnersDropdownData}"
            option-value="id"
            option-label="name"
            required
            .selected="${this.newIntervention?.partner}"
            error-message=${translate('NEW_GDD.PARTNER_REQUIRED')}
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
            label=${translate('NEW_GDD.AGREEMENT')}
            placeholder="&#8212;"
            .readonly="${!this.newIntervention?.partner}"
            .options="${this.filteredAgreements}"
            option-value="id"
            option-label="agreement_number_status"
            .selected="${this.newIntervention?.agreement}"
            trigger-value-change-event
            @etools-selected-item-changed="${(event: CustomEvent) => this.agreementChanged(event)}"
            auto-validate
            error-message=${translate('NEW_GDD.AGREEMENT_REQUIRED')}
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
            label=${translate('NEW_GDD.PARTNER_VENDOR_NUMBER')}
            .value="${this.selectedPartner?.vendor_number}"
          >
          </etools-input>
        </div>
      </div>

      <div class="row">
        <!--   Partner Focal Points   -->
        <div class="col-md-6 col-lg-8 col-12">
          <label class="paper-label"> ${translate('NEW_GDD.DOC_PARTNER_FOCAL_POINTS')}</label>
          <info-icon-tooltip
            position="top"
            offset="48"
            .tooltipText="${translate('NEW_GDD.PARTNER_FOCAL_POINTS_TOOLTIP')}"
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
      </div>

      <div class="row">
        <!-- Start Date -->
        <div class="col-md-6 col-lg-4 col-12">
          <datepicker-lite
            id="startDate"
            label=${translate('NEW_GDD.START_DATE_ESTIMATED')}
            .minDate="${this.minDate}"
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
            label=${translate('NEW_GDD.END_DATE_ESTIMATED')}
            .minDate="${this.minDate}"
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
            label=${translate('NEW_GDD.REF_NUM_YEAR')}
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
            label=${translate('NEW_GDD.DOCUMENT_CURRENCY')}
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
            label=${translate('NEW_GDD.DOC_TITLE')}
            char-counter
            maxlength="256"
            placeholder="&#8212;"
            required
            error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
            .value="${
              this.newIntervention?.title ? this.newIntervention?.title : this.getDefaultTitle(this.newIntervention)
            }"
            @value-changed="${({detail}: CustomEvent) => this.setInterventionField('title', detail && detail.value)}"
            @focus="${this.resetError}"
            @click="${this.resetError}"
          ></etools-input>
        </div>
      </div>

      <div class="row">
        <!--   UNICEF Office(s)   -->
        <div class="col-md-4 col-lg-4 col-12">
          <etools-dropdown-multi
            id="unicefOffices"
            label=${translate('NEW_GDD.UNICEF_OFFICES')}
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
        <div class="col-md-4 col-lg-4 col-12">
          <etools-dropdown-multi
            id="unicefSections"
            label=${translate('CONTRIBUTING_SECTIONS')}
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

        <div class="col-md-4 col-lg-4 col-12">
          <etools-dropdown
            id="leadSection"
            label=${translate('LEAD_SECTION')}
            .options="${this.sections}"
            class="w100"
            option-label="name"
            option-value="id"
            .selected="${this.newIntervention.lead_section}"
            @etools-selected-item-changed="${({detail}: CustomEvent) => {
              if (detail.selectedItem?.id !== this.newIntervention.lead_section) {
                this.setInterventionField('lead_section', detail.selectedItem && detail.selectedItem.id);
              }
            }}"
            trigger-value-change-event
          >
          </etools-dropdown>
        </div>
      </div>

      <div class="row">
        <div class="col-md-4 col-lg-4 col-12">
          <etools-dropdown
            id="country_programme"
            label=${translate('NEW_GDD.COUNTRY_PROGRAMME')}
            placeholder="&#8212;"
            .options="${this.cpStructures}"
            option-label="name"
            option-value="id"
            .selected="${this.newIntervention.country_programme}"
            @etools-selected-item-changed="${({detail}: CustomEvent) => {
              if (detail.selectedItem?.id !== this.newIntervention.country_programme) {
                this.setInterventionField('country_programme', detail.selectedItem && detail.selectedItem.id);
              }
            }}"
            trigger-value-change-event
          >
          </etools-dropdown>
        </div>

          <!--   UNICEF Focal Points   -->
          <div class="col-md-4 col-lg-4 col-12">
            <etools-dropdown-multi
              id="unicefFocalPoints"
              label=${translate('NEW_GDD.UNICEF_FOCAL_POINTS')}
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
          <div class="col-md-4 col-lg-4 col-12">
            <etools-dropdown
              id="unicefBudgetOwner"
              label=${translate('NEW_GDD.UNICEF_BUDGET_OWNER')}
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
    </div>
  `;
}
