import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {EtoolsCurrency} from '@unicef-polymer/etools-unicef/src/mixins/currency.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';

import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit.js';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import AjaxServerErrorsMixin from '../../../../common/mixins/ajax-server-errors-mixin-lit.js';
import PaginationMixin from '@unicef-polymer/etools-unicef/src/mixins/pagination-mixin';
import RiskRatingMixin from '../../../../common/mixins/risk-rating-mixin-lit.js';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin.js';

import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '../../../../styles/shared-styles-lit';
import {riskRatingStyles} from '../../../../styles/risk-rating-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

import dayjs from 'dayjs';
import {AP_DOMAIN} from '../../../../../config/config';

import './components/assessments-items.js';
import './components/partner-monitoring-visits-list';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {Partner, PartnerAssessment} from '../../../../../models/partners.models';
import './components/hact-edit-dialog';
import clone from 'lodash-es/clone';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import './components/monitoring-activities/monitoring-activities';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import pmpEdpoints from '../../../../endpoints/endpoints.js';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {getTranslatedValue, translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin CommonMixin
 * @appliesMixin EndpointsLitMixin
 * @appliesMixin AjaxServerErrorsMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin RiskRatingMixin
 */
@customElement('partner-financial-assurance')
export class PartnerFinancialAssurance extends PaginationMixin(
  EtoolsCurrency(CommonMixin(EndpointsLitMixin(AjaxServerErrorsMixin(RiskRatingMixin(LitElement)))))
) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    if (!this.partner) return;
    // language=HTML
    return html`
      ${pageCommonStyles} ${sharedStyles} ${riskRatingStyles}
      <style>
        ${dataTableStylesLit}
        /* overview panel styles */
        .overview-header {
          background-color: var(--medium-theme-background-color, #eeeeee);
          padding: 0 !important;
          padding-inline: 48px 24px !important;
        }

        .overview-header etools-data-table-column {
          padding-inline-end: 0;
        }

        .vision {
          align-items: center;
          position: relative;
          width: calc(100% - 3px);
          font-size: var(--etools-font-size-16, 16px);
          border: 2px solid rgba(0, 97, 233, 0.38);
          min-height: 56px;
          margin-inline-start: -24px;
          padding-inline-start: 24px;
          line-height: normal;
          box-sizing: content-box !important;
        }

        .from-vision {
          position: absolute;
          color: var(--secondary-color);
          font-size: var(--etools-font-size-12, 12px);
          font-weight: 500;
          padding: 0 8px;
          top: -9px;
          left: 12px;
          background: var(--primary-background-color);
        }

        .green {
          color: var(--sl-color-green-500);
        }

        .hact-values {
          font-size: var(--etools-font-size-18, 18px);
        }

        .engagements-header {
          background-color: var(--light-theme-background-color);
          padding: 0 24px;
        }

        .panel-table-row {
          border-bottom: 1px solid var(--list-divider-color, #9d9d9d);
          align-items: center;
          padding: 16px 24px;
        }

        .darker-bg {
          background-color: #fafafa;
        }

        etools-data-table-column,
        .table-title {
          font-weight: 500;
        }

        .panel-row-tall {
          height: 56px;
          box-sizing: border-box;
        }

        .assessment-row {
          height: 48px;
          font-size: var(--etools-font-size-13, 13px);
          color: var(--list-text-color, #2b2b2b);
          padding: 0 24px;
        }

        .report {
          color: var(--primary-color, #0099ff);
          cursor: pointer;
          margin-inline-start: -8px;
          align-items: center;
        }

        .report-header {
          padding-inline-start: 2px;
        }

        .margin-l {
          margin-inline-start: 56px;
        }

        .margin-t {
          margin-top: 24px;
        }

        .planning-wrapper {
          padding: 24px;
          font-size: var(--etools-font-size-12, 12px);
        }

        .no-r-padd .row {
          padding-inline-end: 0;
        }

        .table-main div:not(:first-child) {
          color: var(--secondary-text-color);
          font-weight: 500;
        }

        .table-main div.totals {
          height: 56px;
          margin-top: -16px;
          margin-bottom: -15px;
          font-size: var(--etools-font-size-16, 16px);
          color: var(--primary-text-color);
          align-items: center;
          justify-content: center;
        }

        .quarter {
          display: flex;
          flex: 1;
          justify-content: center;
        }

        etools-icon-button[name='open-in-new'] {
          color: var(--primary-color);
        }
        .col {
          display: flex;
          flex-direction: row;
          box-sizing: border-box;
        }
        etools-data-table-header {
          --list-bg-color: var(--medium-theme-background-color, #eeeeee);
        }
        etools-data-table-row.no-divider,
        etools-data-table-header.no-divider {
          --list-divider-color: none !important;
        }
        .overview-row {
          padding-inline-start: 34px;
        }
        *[slot='row-data'] .col-data.center-align {
          justify-content: center;
        }
      </style>
      <etools-media-query
        query="(max-width: 1200px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel panel-title="${this._getYear()} ${translate('OVERVIEW')}" class="content-section">
        <etools-data-table-header
          class="no-divider"
          no-title
          no-collapse
          .lowResolutionLayout="${this.lowResolutionLayout}"
        >
          <etools-data-table-column class="col col-1"> ${translate('HACT_RISK_RATING')} </etools-data-table-column>
          <etools-data-table-column class="col col-2">
            ${translate('TYPE_OF_ASSESSMENT')} - ${translate('DATE_OF_ASSESSMENT')}
          </etools-data-table-column>
          <etools-data-table-column class="col col-1 center-align" title="Jan-Dec">
            ${translate('CASH_TRANSFERS_USD')}
          </etools-data-table-column>
          <etools-data-table-column class="col col-2 center-align">
            ${translate('PROG_VISIT')}<br />
            ${translate('PLANNED_MR_COMPLETED')}
          </etools-data-table-column>
          <etools-data-table-column class="col col-2 center-align">
            ${translate('SPOT_CHECKS')} <br />
            ${translate('REQUIRED_COMPLETED')}
          </etools-data-table-column>
          <etools-data-table-column class="col col-2 center-align">
            ${translate('AUDIT')} <br />
            ${translate('REQUIRED_COMPLETED')}
          </etools-data-table-column>
          <etools-data-table-column class="col col-1 center-align">
            ${translate('SEA_RISK_RATING')}
          </etools-data-table-column>
          <etools-data-table-column class="col col-1 center-align">
            ${translate('LAST_PSEA_ASSESSMENT_DATE')}
          </etools-data-table-column>
        </etools-data-table-header>
        <etools-data-table-row class="no-divider" no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
          <div slot="row-data">
            <div
              class="col-data col-12 col-md-4"
              data-col-header-label="${translate('HACT_RISK_RATING')} / ${translate(
                'TYPE_OF_ASSESSMENT'
              )} - ${translate('DATE_OF_ASSESSMENT')} / ${translate('CASH_TRANSFERS_USD')}"
            >
              <div class="${this.lowResolutionLayout ? 'layout-horizontal' : 'row'}  vision">
                <div class="from-vision">${translate('FROM_VISION')}</div>
                <div class="col-3">
                  <span class="${this.getRiskRatingClass(this.partner.rating)}">
                    ${translateValue(this.getRiskRatingValue(this.partner.rating), 'COMMON_DATA.PARTNERRISKRATINGS')}
                  </span>
                </div>
                <div class="col col-5">
                  ${translateValue(this.partner.type_of_assessment, 'COMMON_DATA.ASSESSMENTTYPES')} <br />
                  ${this.getDateDisplayValue(this.partner.last_assessment_date)}
                </div>
                <div class="col col-4 ${this.lowResolutionLayout ? '' : 'center-align'}">
                  $ ${this.displayCurrencyAmount(this.partner.total_ct_ytd, '0', 0)}
                </div>
              </div>
            </div>
            <div
              class="col-data col col-2  ${this.lowResolutionLayout ? '' : 'center-align  hact-values'}"
              data-col-header-label="${translate('PROG_VISIT')} 
            ${translate('PLANNED_MR_COMPLETED')}"
            >
              <strong>
                ${this.partner.hact_values?.programmatic_visits?.planned?.total} /
                <span class="green"> ${this.partner.hact_min_requirements?.programmatic_visits}</span>
                / ${this.partner.hact_values?.programmatic_visits?.completed?.total}
              </strong>
            </div>
            <div
              class="col-data col col-2  ${this.lowResolutionLayout ? '' : 'center-align  hact-values'}"
              data-col-header-label="${translate('SPOT_CHECKS')} 
            ${translate('REQUIRED_COMPLETED')}"
            >
              <strong>
                <span class="green">${this.partner.planned_engagement?.spot_check_required} </span>
                / ${this.partner.hact_values?.spot_checks?.completed?.total}
              </strong>
            </div>
            <div
              class="col-data col-2 col  ${this.lowResolutionLayout ? '' : 'center-align hact-values'}"
              data-col-header-label="${translate('AUDIT')} 
            ${translate('REQUIRED_COMPLETED')}"
            >
              <strong>
                <span class="green">${this._getMinReqAudits(this.partner.planned_engagement)} </span>
                / ${this.partner.hact_values?.audits?.completed}
              </strong>
            </div>
            <div
              class="col-data col-1 col  ${this.lowResolutionLayout ? '' : 'center-align'}"
              data-col-header-label="${translate('SEA_RISK_RATING')}"
            >
              <span class="${this.getRiskRatingClass(this.partner.sea_risk_rating_name)}">
                ${translateValue(
                  this.getRiskRatingValue(this.partner.sea_risk_rating_name, 1),
                  'COMMON_DATA.SEARISKRATINGS'
                )}
              </span>
            </div>
            <div
              class="col-data col col-1  ${this.lowResolutionLayout ? '' : 'center-align'}"
              data-col-header-label="${translate('LAST_PSEA_ASSESSMENT_DATE')}"
            >
              ${this.getDateDisplayValue(this.partner.psea_assessment_date)}
            </div>
          </div>
        </etools-data-table-row>
        <div class="layout-horizontal ${!this.lowResolutionLayout ? 'overview-row' : ''} ">
          <div class="col col-1" ?hidden="${this.lowResolutionLayout}"></div>
          <div class="col col-md-3 col-12">
            <etools-dropdown
              label="${translate('BASIS_FOR_RISK_RATING')}"
              .options="${this.basisOptions}"
              .selected="${this.partner.basis_for_risk_rating}"
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                if (!detail.selectedItem) {
                  return;
                }
                this.partner.basis_for_risk_rating = detail.selectedItem ? detail.selectedItem.value : '';
              }}"
              trigger-value-change-event
              ?disabled="${this._disableBasisForRiskRating(
                this.editMode,
                this.partner.type_of_assessment,
                this.partner.rating
              )}"
            >
            </etools-dropdown>
          </div>
        </div>
      </etools-content-panel>

      <etools-content-panel panel-title="${translate('ASSURANCE_ACTIVITIES')}" class="content-section">
        <div slot="panel-btns">
          <etools-icon-button name="create" title="${translate('GENERAL.EDIT')}" @click="${this._openHactEditDialog}">
          </etools-icon-button>
        </div>
        <div class="planning-wrapper">
          <div class="row">
            <div class="table-main col-xl-4 col-12 no-r-padd">
              <div class="table-main panel-row-tall row panel-table-row darker-bg">
                <div class="col-4 table-title">${translate('PROGRAMMATIC_VISITS')}</div>
                <div class="quarter">Q1</div>
                <div class="quarter">Q2</div>
                <div class="quarter">Q3</div>
                <div class="quarter">Q4</div>
                <div class="col-2 center-align">${translate('GENERAL.TOTAL_C')}</div>
              </div>
              <div class="row panel-table-row">
                <div class="col-4">${translate('PLANNED')}</div>
                <div class="quarter">${this.partner.hact_values?.programmatic_visits?.planned?.q1}</div>
                <div class="quarter">${this.partner.hact_values?.programmatic_visits?.planned?.q2}</div>
                <div class="quarter">${this.partner.hact_values?.programmatic_visits?.planned?.q3}</div>
                <div class="quarter">${this.partner.hact_values?.programmatic_visits?.planned?.q4}</div>
                <div class="col-2 darker-bg layout-horizontal totals">
                  <strong>${this.partner.hact_values?.programmatic_visits?.planned?.total}</strong>
                </div>
              </div>

              <div class="row panel-table-row ">
                <div class="col-4">${translate('COMPLETED')}</div>
                <div class="quarter">${this.partner.hact_values?.programmatic_visits?.completed?.q1}</div>
                <div class="quarter">${this.partner.hact_values?.programmatic_visits?.completed?.q2}</div>
                <div class="quarter">${this.partner.hact_values?.programmatic_visits?.completed?.q3}</div>
                <div class="quarter">${this.partner.hact_values?.programmatic_visits?.completed?.q4}</div>
                <div class="col-2 darker-bg totals layout-horizontal center-align">
                  <strong>${this.partner.hact_values?.programmatic_visits?.completed?.total}</strong>
                </div>
              </div>
            </div>

            <div
              class="table-main col-xl-4 col-12 ${this.lowResolutionLayout
                ? 'margin-t no-r-padd'
                : 'margin-l no-r-padd'}"
            >
              <div class="table-main panel-row-tall row panel-table-row darker-bg">
                <div class="col-4 table-title">${translate('SPOT_CHECK')}</div>
                <div class="quarter">Q1</div>
                <div class="quarter">Q2</div>
                <div class="quarter">Q3</div>
                <div class="quarter">Q4</div>
                <div class="col-2 center-align">${translate('GENERAL.TOTAL_C')}</div>
              </div>
              <div class="row panel-table-row">
                <div class="col-4">${translate('PLANNED')}</div>
                <div class="quarter">${this.partner.planned_engagement?.spot_check_planned_q1}</div>
                <div class="quarter">${this.partner.planned_engagement?.spot_check_planned_q2}</div>
                <div class="quarter">${this.partner.planned_engagement?.spot_check_planned_q3}</div>
                <div class="quarter">${this.partner.planned_engagement?.spot_check_planned_q4}</div>
                <div class="col-2 darker-bg totals layout-horizontal">
                  <strong>${this.partner.planned_engagement?.total_spot_check_planned}</strong>
                </div>
              </div>

              <div class="row panel-table-row">
                <div class="col-4">${translate('COMPLETED')}</div>
                <div class="quarter">${this.partner.hact_values?.spot_checks?.completed?.q1}</div>
                <div class="quarter">${this.partner.hact_values?.spot_checks?.completed?.q2}</div>
                <div class="quarter">${this.partner.hact_values?.spot_checks?.completed?.q3}</div>
                <div class="quarter">${this.partner.hact_values?.spot_checks?.completed?.q4}</div>
                <div class="col-2 darker-bg totals layout-horizontal center-align">
                  <strong>${this.partner.hact_values?.spot_checks?.completed?.total}</strong>
                </div>
              </div>
            </div>

            <div
              class="table-main col-xl-2 col-12 ${this.lowResolutionLayout
                ? 'margin-t no-r-padd'
                : 'margin-l no-r-padd'}"
            >
              <div class="table-main panel-row-tall row panel-table-row darker-bg">
                <div class="col-7 table-title">${translate('AUDITS')}</div>
                <div class="col-5 center-align">${translate('GENERAL.TOTAL_C')}</div>
              </div>
              <div class="row panel-table-row ">
                <div class="col-7">${translate('REQUIRED')}</div>
                <div class="col-5 layout-horizontal center-align totals darker-bg">
                  ${this.partner.hact_min_requirements?.audits}
                </div>
              </div>
              <div class="row panel-table-row ">
                <div class="col-7">${translate('COMPLETED')}</div>
                <div class="col-5 layout-horizontal center-align totals darker-bg">
                  ${this.partner.hact_values?.audits?.completed}
                </div>
              </div>
            </div>
          </div>
        </div>
      </etools-content-panel>

      <etools-content-panel
        show-expand-btn
        class="content-section"
        panel-title="${translate('ASSESSMENTS_AND_ASSURANCE')} (${this.allEngagements.length})"
      >
        <etools-data-table-header no-title no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
          <etools-data-table-column class="col-2">${translate('ENGAGEMENT_TYPE')} </etools-data-table-column>
          <etools-data-table-column class="col-2"> ${translate('DATE')} </etools-data-table-column>
          <etools-data-table-column class="col-2"> ${translate('AMOUNT_TESTED')} <br />(USD) </etools-data-table-column>
          <etools-data-table-column class="col-2 col">
            ${translate('FINANCIAL_FINDINGS')} <br />(USD)
          </etools-data-table-column>
          <etools-data-table-column class="col-2 col">
            ${translate('PENDING_UNSUPPORTED_AMOUNT')} <br />(USD)
          </etools-data-table-column>
          <etools-data-table-column class="col-2"> ${translate('REPORT')} </etools-data-table-column>
        </etools-data-table-header>
        ${this.paginatedEngagements.map(
          (item) => html`
            <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data" class="layout-horizontal">
                <div class="col-data col-2" data-col-header-label="${translate('ENGAGEMENT_TYPE')}">
                  ${this._displayType(item.engagement_type)}
                </div>
                <div class="col-data col-2" data-col-header-label="${translate('DATE')}">
                  ${this.getDateDisplayValue(item.status_date)}
                </div>
                <div class="col-data col-2" data-col-header-label="${translate('AMOUNT_TESTED')}">
                  ${this.displayCurrencyAmount(item.amount_tested, 0, 0)}
                </div>
                <div class="col-data col-2 col" data-col-header-label="${translate('FINANCIAL_FINDINGS')}">
                  ${this.displayCurrencyAmount(item.outstanding_findings, 0, 0)}
                </div>
                <div class="col-data col-2 col" data-col-header-label="${translate('PENDING_UNSUPPORTED_AMOUNT')}">
                  ${this.displayCurrencyAmount(item.pending_unsupported_amount, 0, 0)}
                </div>
                <a
                  class="col-data ${this.lowResolutionLayout ? '' : 'report'} col-2"
                  data-col-header-label="${translate('REPORT')}"
                  target="_blank"
                  href="${this.linkFixUp(item.object_url)}"
                >
                  <etools-icon-button name="open-in-new"></etools-icon-button>
                  ${translate('VIEW_REPORT')}
                </a>
              </div>
            </etools-data-table-row>
          `
        )}
        <etools-data-table-footer
          .lowResolutionLayout="${this.lowResolutionLayout}"
          .pageSize="${this.paginator.page_size}"
          .pageNumber="${this.paginator.page}"
          .totalResults="${this.paginator.count}"
          .visibleRange="${this.paginator.visible_range}"
          @page-size-changed="${this.pageSizeChanged}"
          @page-number-changed="${this.pageNumberChanged}"
        >
        </etools-data-table-footer>
      </etools-content-panel>

      <monitoring-activities
        .isReadonly="${!this.editMode}"
        .activityGroups="${this.partner.monitoring_activity_groups}"
        .partnerId="${this.partner.id}"
      ></monitoring-activities>

      <assessments-items
        id="assessmentsList"
        class="content-section"
        .dataItems="${this.partner.assessments}"
        .editMode="${this.editMode}"
        .partnerId="${this.partner.id}"
      ></assessments-items>
    `;
  }

  @property({type: String})
  auditorPortalBasePath: string = AP_DOMAIN;

  @property({type: Array})
  paginatedEngagements: any[] = [];

  @property({type: Array})
  allEngagements: any[] = [];

  _partner!: any;

  @property({type: Boolean})
  lowResolutionLayout = false;

  set partner(partner) {
    // If is needed to avoid infinite request.
    if (JSON.stringify(this._partner) !== JSON.stringify(partner)) {
      this._partner = partner;
      this._partnerReceived(this._partner);
    }
  }

  @property({type: Object, reflect: true})
  get partner() {
    return this._partner;
  }

  @property({type: Object})
  TYPES: any = {
    audit: 'Audit',
    ma: 'Micro Assessment',
    sc: 'Spot Check',
    sa: 'Special Audit'
  };

  @property({type: Array})
  basisOptions: any[] = [];

  @property({type: Array})
  auditOptions: any[] = [
    {label: 'NO', value: 'NO'},
    {label: 'YES', value: 'YES'}
  ];

  @property({type: Boolean})
  editMode!: boolean;

  public connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for details tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */

    setTimeout(() => {
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: 'partners-page'
      });

      fireEvent(this, 'tab-content-attached');
    }, 100);

    this._assessmentUpdated = this._assessmentUpdated.bind(this);
    this._assessmentAdded = this._assessmentAdded.bind(this);

    this.addEventListener('assessment-updated-step2', this._assessmentUpdated as any);
    this.addEventListener('assessment-added-step2', this._assessmentAdded as any);
  }

  _openHactEditDialog() {
    openDialog({
      dialog: 'hact-edit-dialog',
      dialogData: {
        partner: clone(this.partner)
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      this._refreshPartner(response);
      this.dispatchEvent(
        new CustomEvent('update-partner', {
          bubbles: true,
          composed: true,
          detail: new Partner(response)
        })
      );
    });
  }

  _refreshPartner(partner: any) {
    this.partner = clone(partner);
  }

  _removeListeners() {
    this.removeEventListener('assessment-updated-step2', this._assessmentUpdated as any);
    this.removeEventListener('assessment-added-step2', this._assessmentAdded as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  linkFixUp(url: string) {
    if (!url.includes('https://') && !url.includes('localhost')) {
      return 'https://' + url;
    }
    return url;
  }

  public _init(engagements: any) {
    this.allEngagements = engagements;
    this.paginatedEngagements = [];
    this.paginator = JSON.parse(
      JSON.stringify({
        count: engagements.length,
        page: 1,
        page_size: 5
      })
    );
    this._addBasisFromEngagements(engagements);
  }

  public _displayType(type: any) {
    return translateValue(this.TYPES[type], 'ENGAGEMENT_TYPES');
  }

  public _getEngagementsRequestOptions(partnerId: any) {
    return {
      endpoint: this.getEndpoint(pmpEdpoints, 'engagements'),
      params: {
        ordering: 'unique_id',
        status: 'final',
        partner: partnerId
      },
      csrf: true
    };
  }

  public _partnerReceived(partner: any) {
    if (!partner || !partner.id) {
      return;
    }
    const requestOptions = this._getEngagementsRequestOptions(partner.id);

    sendRequest(requestOptions)
      .then((results: any) => {
        this._init(results);
      })
      // @ts-ignore
      .catch((err: any) => this.handleErrorResponse(err));

    this.basisOptions = [];
    this._addBasisFromPartner();
  }

  public _addBasisFromPartner() {
    this.basisOptions = [
      ...this.basisOptions,
      ...this.partner.assessments.map((a: PartnerAssessment) => ({
        label: `${getTranslatedValue(a.type!, 'ENGAGEMENT_TYPES')} - ${this.getDateDisplayValue(a.completed_date!)}`,
        value: `${a.type} - ${this.getDateDisplayValue(a.completed_date!)}`
      }))
    ];
  }

  public _addBasisFromEngagements(engagements: any) {
    this.basisOptions = [
      ...this.basisOptions,
      ...engagements.map((e: any) => ({
        label: `${getTranslatedValue(this.TYPES[e.engagement_type], 'ENGAGEMENT_TYPES')} - ${this.getDateDisplayValue(
          e.status_date
        )}`,
        value: `${this.TYPES[e.engagement_type]} - ${this.getDateDisplayValue(e.status_date)}`
      }))
    ];
  }

  public _paginate(pageNumber: number, pageSize: number) {
    if (!this.allEngagements) {
      return;
    }
    let engagements = cloneDeep(this.allEngagements);
    engagements = engagements
      .sort((a: any, b: any) => dayjs(b.status_date).unix() - dayjs(a.status_date).unix())
      .slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    this.paginatedEngagements = engagements;
  }

  public _getYear() {
    return dayjs().year();
  }

  // TODO: polymer 3 - is this still needed?
  // public _toggleRadio(e: CustomEvent) {
  //   const checked = e.target.checked;
  //   const quarter = e.target.getAttribute('data-idx');
  //   let spotChecksMr = assign({
  //     q1: 0,
  //     q2: 0,
  //     q3: 0,
  //     q4: 0
  //   }, {
  //     [quarter]: checked ? 1 : 0
  //   });
  //   this.set('partner.planned_engagement.spot_check_mr', spotChecksMr);
  // }

  public _getMinReqAudits(plannedEngagement: any) {
    return !plannedEngagement ? 0 : Number(plannedEngagement.scheduled_audit) + Number(plannedEngagement.special_audit);
  }

  public _disableBasisForRiskRating(editMode: boolean, typeOfAssessment: any, rating: any) {
    return (
      !editMode ||
      (typeOfAssessment === 'Micro Assessment' && rating === 'Non Required') ||
      ['Low Risk Assumed', 'High Risk Assumed'].indexOf(typeOfAssessment) > -1
    );
  }

  _assessmentUpdated(e: CustomEvent) {
    if (!e.detail || !Object.keys(e.detail)) {
      return;
    }

    this._updateBassisForRiskRatingOptions(e.detail.before, e.detail.after);
  }

  _updateBassisForRiskRatingOptions(oldAssessm: PartnerAssessment, updatedAssessm: PartnerAssessment) {
    const oldBasisTxt = `${oldAssessm.type} - ${this.getDateDisplayValue(oldAssessm.completed_date!)}`;
    const updatedBasisTxt = `${updatedAssessm.type} - ${this.getDateDisplayValue(updatedAssessm.completed_date!)}`;

    if (this.partner.basis_for_risk_rating === oldBasisTxt) {
      fireEvent(this, 'assessment-updated-step3', updatedBasisTxt);
    } else {
      const index = this.basisOptions.findIndex((b: LabelAndValue) => b.label === oldBasisTxt);
      this.basisOptions.splice(index, 1, {
        label: updatedBasisTxt,
        value: updatedBasisTxt
      });
    }
  }

  _assessmentAdded(e: CustomEvent) {
    if (!e.detail || !Object.keys(e.detail)) {
      return;
    }
    const basisVal = `${e.detail.type} - ${this.getDateDisplayValue(e.detail.completed_date!)}`;

    this.basisOptions.push({value: basisVal, label: basisVal});
  }

  // Override from PaginationMixin
  paginatorChanged() {
    this._paginate(this.paginator.page, this.paginator.page_size);
  }
}
