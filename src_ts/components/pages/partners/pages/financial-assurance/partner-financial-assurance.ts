/* eslint-disable lit-a11y/anchor-is-valid */
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-icon-button/paper-icon-button.js';
import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';

import EndpointsMixin from '../../../../endpoints/endpoints-mixin.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import AjaxServerErrorsMixin from '../../../../common/mixins/ajax-server-errors-mixin.js';
import PaginationMixin from '../../../../common/mixins/pagination-mixin.js';
import RiskRatingMixin from '../../../../common/mixins/risk-rating-mixin.js';
import CommonMixin from '../../../../common/mixins/common-mixin.js';

import {pageCommonStyles} from '../../../../styles/page-common-styles';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../styles/shared-styles';
import {riskRatingStyles} from '../../../../styles/risk-rating-styles';

declare const dayjs: any;
import {AP_DOMAIN} from '../../../../../config/config';

import './components/assessments-items.js';
import '../../../../layout/monitoring-visits-list';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {PartnerAssessment} from '../../../../../models/partners.models';
import './components/hact-edit-dialog';
import clone from 'lodash-es/clone';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {openDialog} from '../../../../utils/dialog';
import './components/monitoring-activities/monitoring-activities';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin CommonMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrorsMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin RiskRatingMixin
 */
class PartnerFinancialAssurance extends EtoolsCurrency(
  CommonMixin(EndpointsMixin(AjaxServerErrorsMixin(PaginationMixin(RiskRatingMixin(PolymerElement)))))
) {
  static get template() {
    // language=HTML
    return html`
      ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles} ${riskRatingStyles}
      <style include="data-table-styles">
        :host {
          --paper-input-container-input-webkit-spinner: {
            -webkit-appearance: none;
            margin: 0;
          }
          --engagements-row: {
            padding: 0 24px;
          }
        }

        /* overview panel styles */
        .overview-header {
          background-color: var(--medium-theme-background-color, #eeeeee);
          padding: 0 24px 0 48px;
        }

        .overview-header etools-data-table-column {
          padding-right: 0;
        }

        .overview-row {
          padding-left: 48px;
        }

        .vision {
          align-items: center;
          position: relative;
          /*width: 66.66667%;*/
          font-size: 16px;
          border: 2px solid rgba(0, 97, 233, 0.38);
          height: 56px;
          margin-left: -24px;
          padding-left: 24px;
          line-height: normal;
          box-sizing: content-box;
        }

        .from-vision {
          position: absolute;
          color: var(--secondary-color);
          font-size: 12px;
          font-weight: 500;
          padding: 0 8px;
          top: -9px;
          left: 12px;
          background: var(--primary-background-color);
        }

        .green {
          color: var(--paper-green-500);
        }

        .hact-values {
          font-size: 19px;
        }

        .engagements-header {
          background-color: var(--light-theme-background-color);
          @apply --engagements-row;
        }

        .panel-table-row {
          border-bottom: 1px solid var(--list-divider-color, #9d9d9d);
          align-items: center;
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
          font-size: 13px;
          color: var(--list-text-color, #2b2b2b);
          @apply --engagements-row;
        }

        .report {
          color: var(--primary-color, #0099ff);
          cursor: pointer;
          margin-left: -8px;
          padding-left: 24px;
          align-items: center;
        }

        .margin-l {
          margin-left: 56px;
        }

        .planning-wrapper {
          padding: 24px;
          font-size: 12px;
        }

        .no-r-padd .row-h {
          padding-right: 0;
        }

        .table-main div:not(:first-child) {
          color: var(--secondary-text-color);
          font-weight: 500;
        }

        .table-main div.totals {
          height: 56px;
          margin-top: -16px;
          margin-bottom: -15px;
          font-size: 16px;
          color: var(--primary-text-color);
          align-items: center;
          justify-content: center;
        }

        .quarter {
          display: flex;
          flex: 1;
          justify-content: center;
        }

        paper-input {
          text-align: center;
          width: 35px;
          font-size: 16px;
          color: var(--primary-text-color);
        }
      </style>

      <etools-content-panel panel-title="[[_getYear()]] Overview" class="content-section">
        <div class="row-h overview-header">
          <etools-data-table-column class="col col-1">
            [[_getTranslation('HACT_RISK_RATING')]]
          </etools-data-table-column>
          <etools-data-table-column class="col col-2">
            [[_getTranslation('TYPE_OF_ASSESSMENT')]] - [[_getTranslation('DATE_OF_ASSESSMENT')]]
          </etools-data-table-column>
          <etools-data-table-column class="col col-1 center-align" title="Jan-Dec">
            [[_getTranslation('CASH_TRANSFERS_USD')]]
          </etools-data-table-column>
          <etools-data-table-column class="col col-2 center-align">
            [[_getTranslation('PROG_VISIT')]]<br />
            [[_getTranslation('PLANNED_MR_COMPLETED')]]
          </etools-data-table-column>
          <etools-data-table-column class="col col-2 center-align">
            [[_getTranslation('SPOT_CHECKS')]] <br />
            [[_getTranslation('REQUIRED_COMPLETED')]]
          </etools-data-table-column>
          <etools-data-table-column class="col col-2 center-align">
            [[_getTranslation('AUDIT')]] <br />
            [[_getTranslation('REQUIRED_COMPLETED')]]
          </etools-data-table-column>
          <etools-data-table-column class="col col-1 center-align">
            [[_getTranslation('SEA_RISK_RATING')]]
          </etools-data-table-column>
          <etools-data-table-column class="col col-1 center-align">
            [[_getTranslation('LAST_PSEA_ASSESSMENT_DATE')]]
          </etools-data-table-column>
        </div>

        <div class="row-h overview-row">
          <div class="col col-4 vision">
            <div class="from-vision">[[_getTranslation('FROM_VISION')]]</div>
            <div class="col-3">
              <span class$="[[getRiskRatingClass(partner.rating)]]"> [[getRiskRatingValue(partner.rating)]] </span>
            </div>
            <div class="col col-5">
              [[partner.type_of_assessment]] <br />
              [[getDateDisplayValue(partner.last_assessment_date)]]
            </div>
            <div class="col col-4 center-align">$ [[displayCurrencyAmount(partner.total_ct_ytd, '0', 0)]]</div>
          </div>
          <div class="col col-2 center-align hact-values">
            <strong>
              [[partner.hact_values.programmatic_visits.planned.total]] /
              <span class="green"> [[partner.hact_min_requirements.programmatic_visits]]</span>
              / [[partner.hact_values.programmatic_visits.completed.total]]
            </strong>
          </div>
          <div class="col col-2 center-align hact-values">
            <strong>
              <span class="green">[[partner.planned_engagement.spot_check_required]] </span>
              / [[partner.hact_values.spot_checks.completed.total]]
            </strong>
          </div>
          <div class="col-2 col center-align hact-values">
            <strong>
              <span class="green">[[_getMinReqAudits(partner.planned_engagement)]] </span>
              / [[partner.hact_values.audits.completed]]
            </strong>
          </div>
          <div class="col-1 col center-align">
            <span class$="[[getRiskRatingClass(partner.sea_risk_rating_name)]]">
              [[getRiskRatingValue(partner.sea_risk_rating_name, 1)]]
            </span>
          </div>
          <div class="col col-1 center-align">[[getDateDisplayValue(partner.psea_assessment_date)]]</div>
        </div>
        <div class="row-h overview-row">
          <div class="col col-1"></div>
          <div class="col col-3">
            <etools-dropdown
              label="[[_getTranslation('BASIS_FOR_RISK_RATING')]]"
              options="[[basisOptions]]"
              selected="{{partner.basis_for_risk_rating}}"
              disabled="[[_disableBasisForRiskRating(editMode, partner.type_of_assessment, partner.rating)]]"
            >
            </etools-dropdown>
          </div>
        </div>
      </etools-content-panel>

      <etools-content-panel panel-title="Assurance Activities" class="content-section">
        <div slot="panel-btns">
          <paper-icon-button icon="create" title="Edit" on-click="_openHactEditDialog"> </paper-icon-button>
        </div>
        <div class="planning-wrapper">
          <div class="layout-horizontal">
            <div class="table-main col-4 no-r-padd">
              <div class="table-main panel-row-tall row-h panel-table-row darker-bg">
                <div class="col-4 table-title">[[_getTranslation('PROGRAMMATIC_VISITS')]]</div>
                <div class="quarter">Q1</div>
                <div class="quarter">Q2</div>
                <div class="quarter">Q3</div>
                <div class="quarter">Q4</div>
                <div class="col-2 center-align">[[_getTranslation('GENERAL.TOTAL_C')]]</div>
              </div>
              <div class="row-h panel-table-row">
                <div class="col-4">[[_getTranslation('PLANNED')]]</div>
                <div class="quarter">[[partner.hact_values.programmatic_visits.planned.q1]]</div>
                <div class="quarter">[[partner.hact_values.programmatic_visits.planned.q2]]</div>
                <div class="quarter">[[partner.hact_values.programmatic_visits.planned.q3]]</div>
                <div class="quarter">[[partner.hact_values.programmatic_visits.planned.q4]]</div>
                <div class="col-2 darker-bg layout-horizontal totals">
                  <strong>[[partner.hact_values.programmatic_visits.planned.total]]</strong>
                </div>
              </div>

              <div class="row-h panel-table-row ">
                <div class="col-4">[[_getTranslation('COMPLETED')]]</div>
                <div class="quarter">[[partner.hact_values.programmatic_visits.completed.q1]]</div>
                <div class="quarter">[[partner.hact_values.programmatic_visits.completed.q2]]</div>
                <div class="quarter">[[partner.hact_values.programmatic_visits.completed.q3]]</div>
                <div class="quarter">[[partner.hact_values.programmatic_visits.completed.q4]]</div>
                <div class="col-2 darker-bg totals layout-horizontal center-align">
                  <strong>[[partner.hact_values.programmatic_visits.completed.total]]</strong>
                </div>
              </div>
            </div>

            <div class="table-main col-4 margin-l no-r-padd">
              <div class="table-main panel-row-tall row-h panel-table-row darker-bg">
                <div class="col-4 table-title">[[_getTranslation('SPOT_CHECK')]]</div>
                <div class="quarter">Q1</div>
                <div class="quarter">Q2</div>
                <div class="quarter">Q3</div>
                <div class="quarter">Q4</div>
                <div class="col-2 center-align">[[_getTranslation('GENERAL.TOTAL_C')]]</div>
              </div>
              <div class="row-h panel-table-row">
                <div class="col-4">[[_getTranslation('PLANNED')]]</div>
                <div class="quarter">[[partner.planned_engagement.spot_check_planned_q1]]</div>
                <div class="quarter">[[partner.planned_engagement.spot_check_planned_q2]]</div>
                <div class="quarter">[[partner.planned_engagement.spot_check_planned_q3]]</div>
                <div class="quarter">[[partner.planned_engagement.spot_check_planned_q4]]</div>
                <div class="col-2 darker-bg totals layout-horizontal">
                  <strong>[[partner.planned_engagement.total_spot_check_planned]]</strong>
                </div>
              </div>

              <div class="row-h panel-table-row">
                <div class="col-4">[[_getTranslation('COMPLETED')]]</div>
                <div class="quarter">[[partner.hact_values.spot_checks.completed.q1]]</div>
                <div class="quarter">[[partner.hact_values.spot_checks.completed.q2]]</div>
                <div class="quarter">[[partner.hact_values.spot_checks.completed.q3]]</div>
                <div class="quarter">[[partner.hact_values.spot_checks.completed.q4]]</div>
                <div class="col-2 darker-bg totals layout-horizontal center-align">
                  <strong>[[partner.hact_values.spot_checks.completed.total]]</strong>
                </div>
              </div>
            </div>

            <div class="table-main col-2 margin-l no-r-padd">
              <div class="table-main panel-row-tall row-h panel-table-row darker-bg">
                <div class="flex-c table-title">[[_getTranslation('AUDITS')]]</div>
                <div class="col-5 center-align">[[_getTranslation('GENERAL.TOTAL_C')]]</div>
              </div>
              <div class="row-h panel-table-row ">
                <div class="flex-c">[[_getTranslation('REQUIRED')]]</div>
                <div class="col-5 layout-horizontal center-align totals darker-bg">
                  [[partner.hact_min_requirements.audits]]
                </div>
              </div>
              <div class="row-h panel-table-row ">
                <div class="flex-c">[[_getTranslation('COMPLETED')]]</div>
                <div class="col-5 layout-horizontal center-align totals darker-bg">
                  [[partner.hact_values.audits.completed]]
                </div>
              </div>
            </div>
          </div>
        </div>
      </etools-content-panel>

      <etools-content-panel
        show-expand-btn
        class="content-section"
        panel-title="Assessments  and Assurance ([[allEngagements.length]])"
      >
        <div class="panel-row-tall panel-table-row layout-horizontal engagements-header">
          <etools-data-table-column class="col-3">[[_getTranslation('ENGAGEMENT_TYPE')]] </etools-data-table-column>
          <etools-data-table-column class="col-2"> [[_getTranslation('DATE')]] </etools-data-table-column>
          <etools-data-table-column class="col-2">
            [[_getTranslation('AMOUNT_TESTED')]] <br />(USD)
          </etools-data-table-column>
          <etools-data-table-column class="col-3 col">
            [[_getTranslation('OUTSTANDING_FINDINGS')]] <br />(USD)
          </etools-data-table-column>
          <etools-data-table-column class="col-2"> [[_getTranslation('REPORT')]] </etools-data-table-column>
        </div>
        <template is="dom-repeat" items="[[engagements]]">
          <div class="assessment-row panel-table-row layout-horizontal">
            <div class="col-3">[[_displayType(item.engagement_type)]]</div>
            <div class="col-2">[[getDateDisplayValue(item.status_date)]]</div>
            <div class="col-2">[[displayCurrencyAmount(item.amount_tested, 0, 0)]]</div>
            <div class="col-3 col">[[displayCurrencyAmount(item.outstanding_findings, 0, 0)]]</div>
            <a class="report col-2" target="_blank" href$="[[item.object_url]]">
              <paper-icon-button icon="icons:open-in-new"></paper-icon-button>
              [[_getTranslation('VIEW_REPORT')]]
            </a>
          </div>
        </template>
        <etools-data-table-footer
          page-size="{{paginator.page_size}}"
          page-number="{{paginator.page}}"
          total-results="[[paginator.count]]"
          visible-range="{{paginator.visible_range}}"
        >
        </etools-data-table-footer>
      </etools-content-panel>

      <etools-content-panel
        id="monitoring-visits-panel"
        class="content-section"
        panel-title="[[_getTranslation('PROGRAMMATIC_VISITS_S_CASE')]]"
      >
        <monitoring-visits-list2 partner-id="[[partner.id]]" show-tpm-visits> </monitoring-visits-list2>
      </etools-content-panel>

      <monitoring-activities
        is-readonly="[[!editMode]]"
        activity-groups="[[partner.monitoring_activity_groups]]"
        partner-id="[[partner.id]]"
      ></monitoring-activities>

      <assessments-items
        id="assessmentsList"
        class="content-section"
        data-items="{{partner.assessments}}"
        edit-mode="[[editMode]]"
        partner-id="[[partner.id]]"
      ></assessments-items>
    `;
  }

  @property({type: String})
  auditorPortalBasePath: string = AP_DOMAIN;

  @property({type: Array})
  engagements: any[] = [];

  @property({type: Array})
  allEngagements: any[] = [];

  @property({
    type: Object,
    reflectToAttribute: true,
    observer: '_partnerReceived'
  })
  partner: any = {};

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

  static get observers() {
    return ['_paginate(paginator.page, paginator.page_size)'];
  }

  public connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for details tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */

    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'partners-page'
    });

    fireEvent(this, 'tab-content-attached');
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

  public _init(engagements: any) {
    this.set('allEngagements', engagements);

    this.set('engagements', []);

    this.set(
      'paginator',
      JSON.parse(
        JSON.stringify({
          count: engagements.length,
          page: 1,
          page_size: 5
        })
      )
    );
    this._addBasisFromEngagements(engagements);
  }

  public _displayType(type: any) {
    return this.TYPES[type];
  }

  public _getEngagementsRequestOptions(partnerId: any) {
    return {
      endpoint: this.getEndpoint('engagements'),
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
      .then((results: any) => this._init(results))
      // @ts-ignore
      .catch((err: any) => this.handleErrorResponse(err));

    this.set('basisOptions', []);
    this._addBasisFromPartner();
  }

  public _addBasisFromPartner() {
    this.set('basisOptions', [
      ...this.basisOptions,
      ...this.partner.assessments.map((a: PartnerAssessment) => ({
        label: `${a.type} - ${this.getDateDisplayValue(a.completed_date!)}`,
        value: `${a.type} - ${this.getDateDisplayValue(a.completed_date!)}`
      }))
    ]);
  }

  public _addBasisFromEngagements(engagements: any) {
    this.set('basisOptions', [
      ...this.basisOptions,
      ...engagements.map((e: any) => ({
        label: `${this.TYPES[e.engagement_type]} - ${this.getDateDisplayValue(e.status_date)}`,
        value: `${this.TYPES[e.engagement_type]} - ${this.getDateDisplayValue(e.status_date)}`
      }))
    ]);
  }

  public _paginate(pageNumber: number, pageSize: number) {
    if (!this.allEngagements) {
      return;
    }
    let engagements = this.allEngagements;
    engagements = engagements
      .sort((a, b) => dayjs(b.status_date) - dayjs(a.status_date))
      .slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    this.set('engagements', engagements);
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
      this.splice('basisOptions', index, 1, {
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

    this.push('basisOptions', {
      value: basisVal,
      label: basisVal
    });
  }
}

window.customElements.define('partner-financial-assurance', PartnerFinancialAssurance);
