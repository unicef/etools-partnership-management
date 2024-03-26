/* eslint-disable lit-a11y/anchor-is-valid */
import {html, LitElement, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';

import CommonMixinLit from '../../../../common/mixins/common-mixin-lit';
import RiskRatingMixin from '../../../../common/mixins/risk-rating-mixin-lit';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';
import {riskRatingStyles} from '../../../../styles/risk-rating-styles-lit';

import {isEmptyObject, isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {RootState, store} from '../../../../../redux/store';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query';

import '../../../../common/components/etools-error-messages-box.js';
import '../../../../common/components/icons-actions';

import './components/edit-core-values-assessment';
import './components/staff-members';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {convertDate} from '@unicef-polymer/etools-utils/dist/date.util';
import {Partner} from '../../../../../models/partners.models';
import {LabelAndValue, User} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

import {translate} from 'lit-translate';
import {connect} from 'pwa-helpers/connect-mixin';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import {getTranslatedValue, translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import dayjs from 'dayjs';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin CommonMixin
 * @appliesMixin RiskRatingMixin
 */

@customElement('partner-details')
export class PartnerDetails extends connect(store)(CommonMixinLit(RiskRatingMixin(ComponentBaseMixin(LitElement)))) {
  static get styles() {
    return [layoutStyles];
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

        icons-actions2 {
          visibility: hidden;
        }

        etools-data-table-row:hover icons-actions2 {
          visibility: visible;
        }

        etools-icon {
          color: var(--dark-secondary-text-color);
        }

        etools-icon {
          margin-inline-end: 5px;
        }

        .cvs-file {
          width: auto;
          max-width: calc(100% - 32px);
          margin-inline-start: 8px;
          word-break: break-all;
        }
        .row {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 16px 9px;
        }
      </style>
      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel class="content-section" panel-title="${translate('PARTNER_DETAILS')}">
        <div class="row">
          <div class="col-12 col-md-4">
            <etools-input
              readonly
              placeholder="—"
              label="${translate('FULL_NAME')}"
              title="${this.partner.name}"
              .value="${this.partner.name}"
            >
            </etools-input>
          </div>
          <div class="col-12 col-md-4">
            <etools-input
              readonly
              placeholder="—"
              label="${translate('SHORT_NAME')}"
              .value="${this.partner.short_name}"
            >
            </etools-input>
          </div>
          <div class="col-12 col-md-4">
            <etools-input
              label="${translate('ALTERNATE_NAME')}"
              .value="${this.partner.alternate_name}"
              @value-changed="${({detail}: CustomEvent) => {
                this.partner.alternate_name = detail.value;
              }}"
              placeholder="&#8212;"
              ?readonly="${!this.editMode}"
            ></etools-input>
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md-4">
            <etools-input
              readonly
              placeholder="—"
              label="${translate('VENDOR_NUMBER')}"
              .value="${this.partner.vendor_number}"
            >
            </etools-input>
          </div>
          <div class="col-12 col-md-4">
            <etools-input
              readonly
              placeholder="—"
              label="${translate('PARTNER_TYPE')}"
              .value="${this._computePartnerType(this.partner)}"
            >
            </etools-input>
          </div>
          <div class="col-12 col-md-4">
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

        <div class="row">
          <etools-input
            class="col-12 col-md-4"
            readonly
            placeholder="—"
            label="${translate('ADDRESS')}"
            title="${this.partner.address}"
            .value="${this.partner.address}"
          >
            <etools-icon slot="prefix" name="communication:location-on"></etools-icon>
          </etools-input>
        </div>
        <div class="row">
          <div class="col-12 col-md-4">
            <etools-input
              readonly
              placeholder="—"
              label="${translate('PHONE_NUMBER')}"
              .value="${this.partner.phone_number}"
            >
              <etools-icon slot="prefix" name="communication:phone"></etools-icon>
            </etools-input>
          </div>
          <div class="col-12 col-md-4">
            <etools-input
              readonly
              placeholder="—"
              label="${translate('EMAIL_ADDRESS')}"
              title="${this.partner.email}"
              .value="${this.partner.email}"
            >
              <etools-icon name="communication:email" slot="prefix"></etools-icon>
            </etools-input>
          </div>
          <div class="col-12 col-md-4"></div>
        </div>
        <div class="row">
          <div class="col-12 col-md-4">
            <!-- HACT Risk rating -->
            <div>
              <label class="paper-label">${translate('HACT_RISK_RATING')} </label>
              <div class="${this.getRiskRatingClass(this.partner.rating)} input-label" ?empty="${!this.partner.rating}">
                ${translateValue(this.getRiskRatingValue(this.partner.rating), 'COMMON_DATA.PARTNERRISKRATINGS')}
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <!-- Type of assessment -->
            <etools-input
              readonly
              placeholder="—"
              label="${translate('TYPE_OF_ASSESSMENT')}"
              .value="${translateValue(this.partner.type_of_assessment, 'COMMON_DATA.ASSESSMENTTYPES')}"
            >
            </etools-input>
          </div>
          <div class="col-12 col-md-4">
            <!--Date last assessed-->
            <etools-input
              readonly
              placeholder="—"
              label="${translate('DATE_OF_REPORT')}"
              .value="${this.getDateDisplayValue(this.partner.last_assessment_date)}"
            >
              <etools-icon name="date-range" slot="prefix"></etools-icon>
            </etools-input>
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md-4">
            <!-- PSEA risk rating -->
            <div>
              <label class="paper-label">${translate('SEA_RISK_RATING')} </label>
              <div
                class="${this.getRiskRatingClass(this.partner.sea_risk_rating_name)} input-label"
                ?empty="${!this.partner.sea_risk_rating_name}"
              >
                ${translateValue(
                  this.getRiskRatingValue(this.partner.sea_risk_rating_name),
                  'COMMON_DATA.SEARISKRATINGS'
                )}
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <!--Last PSEA Assess. Date-->
            <etools-input
              readonly
              placeholder="—"
              label="${translate('LAST_PSEA_ASSESSMENT_DATE')}"
              .value="${this.getDateDisplayValue(this.partner.psea_assessment_date)}"
            >
              <etools-icon name="date-range" slot="prefix"></etools-icon>
            </etools-input>
          </div>
        </div>
      </etools-content-panel>

      <etools-content-panel class="content-section" panel-title="${translate('CORE_VALUES_ASSESSMENTS')}">
        <div slot="panel-btns" id="show-archived">
          <sl-switch
            id="showArchived"
            ?checked="${this.showArchivedAssessments}"
            @sl-change="${this.showArchivedChange}"
          >
            ${translate('SHOW_ARCHIVED')}
          </sl-switch>
        </div>

        <div ?hidden="${!this._shouldDisplayCVAList()}">
          <etools-data-table-header no-title no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
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
              .lowResolutionLayout="${this.lowResolutionLayout}"
            >
              <div slot="row-data" class="p-relative">
                <span
                  class="col-data col-4"
                  data-col-header-label="${translate('DATE_LAST_ASSESSED')} ${translate('FROM_VISION')}"
                >
                  <span ?hidden="${this._isEmptyDate(item.date)}">${this.getDateDisplayValue(item.date)}</span>
                  <span ?hidden="${!this._isEmptyDate(item.date)}" class="placeholder-style">&#8212;</span>
                </span>
                <span class="col-data col-6" data-col-header-label="${translate('CORE_VALUES_ASSESSMENTS')}">
                  <etools-icon name="attachment" ?hidden="${!item.attachment}"></etools-icon>
                  <span ?hidden="${item.attachment}" class="placeholder-style">&#8212;</span>
                  <a class="cvs-file" href="${item.attachment}" target="_blank" download
                    >${this.getFileNameFromURL(item.attachment)}</a
                  >
                </span>
                <span class="col-data col-2" data-col-header-label="${translate('ARCHIVED')}">
                  <span ?hidden="${item.archived}" class="placeholder-style">&#8212;</span>
                  <etools-icon name="check" ?hidden="${!item.archived}"></etools-icon>
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
        <etools-data-table-row no-collapse ?hidden="${this._shouldDisplayCVAList()}">
          <div slot="row-data" class="p-relative">
            <div class="col-data col-12">${translate('THERE_ARE_NO_CORE_VALUE_ASSESSMENTS')}</div>
          </div>
        </etools-data-table-row>
      </etools-content-panel>

      <staff-members
        id="staffMembersList"
        .dataItems="${this.partner.staff_members}"
        .partnerId="${this.partner.organization_id}"
        .user="${this.user}"
      >
      </staff-members>
    `;
  }

  @property({type: Object})
  partner!: Partner;

  @property({type: Object})
  user!: User;

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

  @property({type: Boolean})
  lowResolutionLayout = false;

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
    if (state.user && state.user.data && !isJsonStrMatch(this.user, state.user.data)) {
      this.user = state.user.data;
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
    if (!e.currentTarget) {
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
