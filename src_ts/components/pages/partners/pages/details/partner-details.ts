/* eslint-disable lit-a11y/anchor-is-valid */
import {customElement, html, LitElement, property, PropertyValues} from 'lit-element';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/communication-icons.js';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-toggle-button/paper-toggle-button.js';

import CommonMixinLit from '../../../../common/mixins/common-mixin-lit';
import RiskRatingMixin from '../../../../common/mixins/risk-rating-mixin-lit';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';
import {riskRatingStyles} from '../../../../styles/risk-rating-styles-lit';

import {isEmptyObject, isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {RootState, store} from '../../../../../redux/store';

import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '../../../../common/components/etools-form-element-wrapper';

import '../../../../common/components/etools-error-messages-box.js';
import '../../../../common/components/icons-actions';

import './components/edit-core-values-assessment';
import './components/staff-members';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {convertDate} from '@unicef-polymer/etools-utils/dist/date.util';
import {Partner} from '../../../../../models/partners.models';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

import {translate} from 'lit-translate';
import {connect} from 'pwa-helpers/connect-mixin';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import {getTranslatedValue, translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

declare const dayjs: any;

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin CommonMixin
 * @appliesMixin RiskRatingMixin
 */

@customElement('partner-details')
export class PartnerDetails extends connect(store)(CommonMixinLit(RiskRatingMixin(ComponentBaseMixin(LitElement)))) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    if (!this.partner) return;

    return html`
      <style>
        ${pageCommonStyles} ${sharedStyles} ${dataTableStylesLit} ${riskRatingStyles} :host {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        paper-input {
          width: 100%;
        }

        paper-toggle-button#showArchived {
          font-size: 16px;
          --paper-toggle-button-label-color: var(--primary-text-color);
          --paper-toggle-button-checked-bar-color: var(--primary-color);
        }

        icons-actions2 {
          visibility: hidden;
        }

        etools-data-table-row:hover icons-actions2 {
          visibility: visible;
        }

        iron-icon {
          color: var(--dark-secondary-text-color);
        }

        .cvs-file {
          width: auto;
          max-width: calc(100% - 32px);
          margin-inline-start: 8px;
          word-break: break-all;
        }
      </style>

      <etools-content-panel class="content-section" panel-title="${translate('PARTNER_DETAILS')}">
        <div class="row-h flex-c">
          <div class="col col-4">
            <etools-form-element-wrapper2
              label="${translate('FULL_NAME')}"
              title="${this.partner.name}"
              .value="${this.partner.name}"
            >
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-4">
            <etools-form-element-wrapper2 label="${translate('SHORT_NAME')}" .value="${this.partner.short_name}">
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-4">
            <paper-input
              label="${translate('ALTERNATE_NAME')}"
              .value="${this.partner.alternate_name}"
              @value-changed="${({detail}: CustomEvent) => {
                this.partner.alternate_name = detail.value;
              }}"
              placeholder="&#8212;"
              ?readonly="${!this.editMode}"
            ></paper-input>
          </div>
        </div>

        <div class="row-h flex-c">
          <div class="col col-4">
            <etools-form-element-wrapper2 label="${translate('VENDOR_NUMBER')}" .value="${this.partner.vendor_number}">
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-4">
            <etools-form-element-wrapper2
              label="${translate('PARTNER_TYPE')}"
              .value="${this._computePartnerType(this.partner)}"
            >
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-4">
            <etools-dropdown-multi
              label="${translate('SHARED_PARTNER')}"
              .options="${this.sharedPartenerValues}"
              .selectedValues="${this.partner.shared_with}"
              ?readonly="${!this.editMode}"
              trigger-value-change-event
              @etools-selected-items-changed="${({detail}: CustomEvent) => {
                this.selectedItemsChanged(detail, 'shared_with', 'value', 'partner');
              }}"
            >
            </etools-dropdown-multi>
          </div>
        </div>

        <div class="row-h flex-c">
          <etools-form-element-wrapper2
            label="${translate('ADDRESS')}"
            title="${this.partner.address}"
            .value="${this.partner.address}"
          >
            <iron-icon slot="prefix" icon="communication:location-on"></iron-icon>
          </etools-form-element-wrapper2>
        </div>
        <div class="row-h flex-c">
          <div class="col col-4">
            <etools-form-element-wrapper2 label="${translate('PHONE_NUMBER')}" .value="${this.partner.phone_number}">
              <iron-icon slot="prefix" icon="communication:phone"></iron-icon>
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-4">
            <etools-form-element-wrapper2
              label="${translate('EMAIL_ADDRESS')}"
              title="${this.partner.email}"
              .value="${this.partner.email}"
            >
              <iron-icon icon="communication:email" slot="prefix"></iron-icon>
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-4"></div>
        </div>
        <div class="row-h flex-c">
          <div class="col col-4">
            <!-- HACT Risk rating -->
            <etools-form-element-wrapper2 label="${translate('HACT_RISK_RATING')}" no-placeholder>
              <span class="${this.getRiskRatingClass(this.partner.rating)}">
                ${translateValue(this.getRiskRatingValue(this.partner.rating), 'COMMON_DATA.PARTNERRISKRATINGS')}
              </span>
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-4">
            <!-- Type of assessment -->
            <etools-form-element-wrapper2
              label="${translate('TYPE_OF_ASSESSMENT')}"
              .value="${translateValue(this.partner.type_of_assessment, 'COMMON_DATA.ASSESSMENTTYPES')}"
            >
            </etools-form-element-wrapper2>
          </div>
          <div class="col col-4">
            <!--Date last assessed-->
            <etools-form-element-wrapper2
              label="${translate('DATE_OF_REPORT')}"
              .value="${this.getDateDisplayValue(this.partner.last_assessment_date)}"
            >
              <iron-icon icon="date-range" slot="prefix"></iron-icon>
            </etools-form-element-wrapper2>
          </div>
        </div>

        <div class="row-h flex-c">
          <div class="col col-4">
            <!-- PSEA risk rating -->
            <etools-form-element-wrapper2 label="${translate('SEA_RISK_RATING')}" no-placeholder>
              <span class="${this.getRiskRatingClass(this.partner.sea_risk_rating_name)}">
                ${translateValue(
                  this.getRiskRatingValue(this.partner.sea_risk_rating_name),
                  'COMMON_DATA.SEARISKRATINGS'
                )}
              </span>
            </etools-form-element-wrapper2>
          </div>

          <div class="col col-4">
            <!--Last PSEA Assess. Date-->
            <etools-form-element-wrapper2
              label="${translate('LAST_PSEA_ASSESSMENT_DATE')}"
              .value="${this.getDateDisplayValue(this.partner.psea_assessment_date)}"
            >
              <iron-icon icon="date-range" slot="prefix"></iron-icon>
            </etools-form-element-wrapper2>
          </div>
        </div>
      </etools-content-panel>

      <etools-content-panel class="content-section" panel-title="${translate('CORE_VALUES_ASSESSMENTS')}">
        <div slot="panel-btns" id="show-archived">
          <paper-toggle-button
            id="showArchived"
            ?checked="${this.showArchivedAssessments}"
            @iron-change="${this.showArchivedChange}"
          >
            ${translate('SHOW_ARCHIVED')}
          </paper-toggle-button>
        </div>

        <div ?hidden="${!this._shouldDisplayCVAList()}">
          <etools-data-table-header no-title no-collapse>
            <etools-data-table-column class="col-4">
              <div>${translate('DATE_LAST_ASSESSED')}</div>
              <div>(${translate('FROM_VISION')})</div>
            </etools-data-table-column>
            <etools-data-table-column class="col-6"> ${translate('CORE_VALUES_ASSESSMENTS')} </etools-data-table-column>
            <etools-data-table-column class="col-2"> ${translate('ARCHIVED')} </etools-data-table-column>
          </etools-data-table-header>

          ${this.partner?.core_values_assessments?.map(
            (item: any) => html` <etools-data-table-row
              no-collapse
              ?secondary-bg-on-hover="${this._canEditCVA(item.attachment, item.archived)}"
              ?hidden="${!this._shouldShowCVA(item.archived, this.showArchivedAssessments)}"
            >
              <div slot="row-data" class="p-relative">
                <span class="col-data col-4">
                  <span ?hidden="${this._isEmptyDate(item.date)}">${this.getDateDisplayValue(item.date)}</span>
                  <span ?hidden="${!this._isEmptyDate(item.date)}" class="placeholder-style">&#8212;</span>
                </span>
                <span class="col-data col-6">
                  <iron-icon icon="attachment" ?hidden="${!item.attachment}"></iron-icon>
                  <span ?hidden="${item.attachment}" class="placeholder-style">&#8212;</span>
                  <a class="cvs-file" href="${item.attachment}" target="_blank" download
                    >${this.getFileNameFromURL(item.attachment)}</a
                  >
                </span>
                <span class="col-data col-2">
                  <span ?hidden="${item.archived}" class="placeholder-style">&#8212;</span>
                  <iron-icon icon="check" ?hidden="${!item.archived}"></iron-icon>
                </span>
                <icons-actions2
                  .item="${item}"
                  .showEdit="${this._canEditCVA(item.attachment, item.archived)}"
                  .showDelete="${this.showDelete}"
                  @edit="${this._editCoreValuesAssessment}"
                >
                </icons-actions2>
              </div>
            </etools-data-table-row>`
          )}
        </div>
        <div class="row-h" ?hidden="${this._shouldDisplayCVAList()}">
          ${translate('THERE_ARE_NO_CORE_VALUE_ASSESSMENTS')}
        </div>
      </etools-content-panel>

      <staff-members
        id="staffMembersList"
        .dataItems="${this.partner.staff_members}"
        ?editMode="${this.editMode}"
        .partnerId="${this.partner.id}"
      >
      </staff-members>
    `;
  }

  @property({type: Object})
  partner!: Partner;

  @property({type: Boolean})
  editMode = false;

  @property({type: Array})
  csoTypes: LabelAndValue[] = [];

  @property({type: Array})
  partnerTypes: LabelAndValue[] = [];

  @property({type: Array})
  sharedPartenerValues: LabelAndValue[] = [];

  @property({type: Boolean})
  showCoreValuesAssessmentAttachment = false;

  @property({type: Boolean})
  showArchivedAssessments = false;

  @property({type: Boolean})
  showDelete = false;

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.csoTypes, state.commonData!.csoTypes)) {
      this.csoTypes = state.commonData!.csoTypes;
    }
    if (!isJsonStrMatch(this.csoTypes, state.commonData!.partnerTypes)) {
      this.partnerTypes = state.commonData!.partnerTypes;
    }
    if (!isJsonStrMatch(this.sharedPartenerValues, state.commonData!.agencyChoices)) {
      this.sharedPartenerValues = state.commonData!.agencyChoices;
    }
  }

  public connectedCallback() {
    super.connectedCallback();

    fireEvent(this, 'tab-content-attached');
  }

  public _shouldShowCVA(archived?: boolean, showArchived?: boolean) {
    if (showArchived) {
      return true;
    }
    return !archived;
  }

  public _editCoreValuesAssessment(e: CustomEvent) {
    openDialog({
      dialog: 'edit-core-values-assessment',
      dialogData: {
        item: cloneDeep(e.detail),
        parent: this
      }
    });
  }

  showArchivedChange(e: CustomEvent) {
    if (!e.detail) {
      return;
    }
    this.showArchivedAssessments = (e.currentTarget as HTMLInputElement).checked;
  }

  public _canEditCVA(attachment: any, archived?: boolean) {
    return !attachment && !archived;
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    // Disable loading message for details tab elements load,
    // triggered by parent element on stamp
    setTimeout(() => {
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: 'partners-page'
      });
    }, 200);
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('partner')) {
      this._partnerChanged(this.partner);
    }
  }

  public _partnerChanged(partner: any) {
    if (!isEmptyObject(partner)) {
      // decide if we should show core values assessment attachment
      this.showCoreValuesAssessmentAttachment = this._showCoreValueAssessment(partner.partner_type, partner.cso_type);

      this._displayAssessmentNotification(partner.core_values_assessment_date, 'Core Values Assessment');

      if (partner.type_of_assessment === 'Micro Assessment') {
        this._displayAssessmentNotification(partner.last_assessment_date, 'Micro Assessment');
      }

      this._sortCvaDescByDate();
    }
  }

  public _sortCvaDescByDate() {
    if (!this.partner.core_values_assessments || this.partner.core_values_assessments.length <= 1) {
      return;
    }

    this.partner.core_values_assessments.sort((a: any, b: any) => {
      // @ts-ignore
      return new Date(b.date) - new Date(a.date);
    });
  }

  public _displayAssessmentNotification(assessmentDateString: any, assessmentType: any) {
    if (!assessmentDateString) {
      return;
    }
    const datesFormat = 'YYYY-MM-DD';
    const today = dayjs.utc().format(datesFormat);
    const assessmentDate = convertDate(assessmentDateString);
    const assessmentExpDate = dayjs(assessmentDate).add(60, 'months');

    const daysUntilExpire = assessmentExpDate.diff(today, 'days');

    let notifMessage = '';
    if (daysUntilExpire < 1) {
      notifMessage = 'The ' + assessmentType + ' is expired (' + assessmentExpDate.format(datesFormat) + ')';
    } else {
      const notifStartDate = dayjs(assessmentDate).add(57, 'months');
      if (dayjs(today).isAfter(notifStartDate)) {
        notifMessage = 'The ' + assessmentType + ' will expire in ' + daysUntilExpire + ' days';
      }
    }
    if (notifMessage) {
      setTimeout(() => {
        fireEvent(this, 'toast', {text: notifMessage});
      }, 0);
    }
  }

  public _computePartnerType(partner: any) {
    return !isEmptyObject(partner) ? this._getPartnerType(partner.partner_type, partner.cso_type) : '';
  }

  public _getPartnerType(partnerType: any, csoType: any) {
    return csoType !== null
      ? getTranslatedValue(partnerType, 'COMMON_DATA.PARTNERTYPES') +
          '/' +
          getTranslatedValue(csoType, 'COMMON_DATA.CSOTYPES')
      : getTranslatedValue(partnerType, 'COMMON_DATA.PARTNERTYPES');
  }

  /**
   * Show core values assessment attachment only if partner type is 'Civil Society Organization'
   * and cso_type is 'National'
   */
  public _showCoreValueAssessment(partnerType: any, csoType: any) {
    return (
      partnerType === 'Civil Society Organization' &&
      ['National', 'Academic Institution', 'Community Based Organization'].indexOf(csoType) > -1
    );
  }

  public _isEmptyDate(date: any) {
    if (!date) {
      return true;
    }
    const converted = this.getDateDisplayValue(date);
    return !converted;
  }

  public _empty(val: any) {
    return isEmptyObject(val);
  }

  public _shouldDisplayCVAList() {
    return !this._empty(this.partner.core_values_assessments) && this.showCoreValuesAssessmentAttachment;
  }
}
