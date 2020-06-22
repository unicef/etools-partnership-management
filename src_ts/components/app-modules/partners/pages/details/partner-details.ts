import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/communication-icons.js';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-toggle-button/paper-toggle-button.js';

import CommonMixin from '../../../../mixins/common-mixin.js';
import RiskRatingMixin from '../../../../mixins/risk-rating-mixin.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '../../../../layout/etools-form-element-wrapper.js';

import '../../../../layout/etools-error-messages-box.js';
import '../../../../layout/icons-actions.js';

import {pageCommonStyles} from '../../../../styles/page-common-styles.js';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles.js';
import {SharedStyles} from '../../../../styles/shared-styles.js';
import {riskRatingStyles} from '../../../../styles/risk-rating-styles.js';

import {isEmptyObject, isJsonStrMatch} from '../../../../utils/utils.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../store.js';

import './components/edit-core-values-assessment';
import './components/staff-members';
import {fireEvent} from '../../../../utils/fire-custom-event.js';
import {convertDate} from '../../../../utils/date-utils';
import {property} from '@polymer/decorators';
import {LabelAndValue} from '../../../../../typings/globals.types.js';
import {EditCoreValuesAssessmentEl} from './components/edit-core-values-assessment';
import {Partner} from '../../../../../models/partners.models.js';
declare const moment: any;

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin CommonMixin
 * @appliesMixin RiskRatingMixin
 */
class PartnerDetails extends connect(store)(CommonMixin(RiskRatingMixin(PolymerElement))) {
  static get template() {
    // language=HTML
    return html`
      ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles} ${riskRatingStyles}
      <style include="data-table-styles">
        :host {
          @apply --layout-vertical;
          width: 100%;
        }

        paper-input {
          width: 100%;
        }

        paper-toggle-button#showArchived {
          font-size: 16px;
          --paper-toggle-button-label-color: white;
          --paper-toggle-button-checked-bar-color: white;
        }

        icons-actions {
          visibility: hidden;
        }

        etools-data-table-row:hover icons-actions {
          visibility: visible;
        }

        iron-icon {
          color: var(--dark-secondary-text-color);
        }

        .cvs-file {
          width: auto;
          max-width: calc(100% - 32px);
          margin-left: 8px;
          word-break: break-all;
        }
      </style>

      <etools-content-panel class="content-section" panel-title="Partner Details">
        <div class="row-h flex-c">
          <div class="col col-4">
            <etools-form-element-wrapper label="Full Name" title$="[[partner.name]]" value="[[partner.name]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-4">
            <etools-form-element-wrapper label="Short Name" value="[[partner.short_name]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-4">
            <paper-input
              label="Alternate Name"
              value="{{partner.alternate_name}}"
              placeholder="&#8212;"
              readonly$="[[!editMode]]"
            ></paper-input>
          </div>
        </div>

        <div class="row-h flex-c">
          <div class="col col-4">
            <etools-form-element-wrapper label="Vendor Number" value="[[partner.vendor_number]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-4">
            <etools-form-element-wrapper label="Partner Type" value="[[_partnerComputedType]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-4">
            <etools-dropdown-multi
              label="Shared Partner"
              options="[[sharedPartenerValues]]"
              selected-values="{{partner.shared_with}}"
              readonly$="[[!editMode]]"
            >
            </etools-dropdown-multi>
          </div>
        </div>

        <div class="row-h flex-c">
          <etools-form-element-wrapper label="Address" title$="[[partner.address]]" value="[[partner.address]]">
            <iron-icon slot="prefix" icon="communication:location-on"></iron-icon>
          </etools-form-element-wrapper>
        </div>
        <div class="row-h flex-c">
          <div class="col col-4">
            <etools-form-element-wrapper label="Phone Number" value="[[partner.phone_number]]">
              <iron-icon slot="prefix" icon="communication:phone"></iron-icon>
            </etools-form-element-wrapper>
          </div>
          <div class="col col-4">
            <etools-form-element-wrapper label="E-mail address" title$="[[partner.email]]" value="[[partner.email]]">
              <iron-icon icon="communication:email" slot="prefix"></iron-icon>
            </etools-form-element-wrapper>
          </div>
          <div class="col col-4"></div>
        </div>
        <div class="row-h flex-c">
          <div class="col col-4">
            <!-- HACT Risk rating -->
            <etools-form-element-wrapper label="HACT Risk Rating" no-placeholder>
              <span class$="[[getRiskRatingClass(partner.rating)]]">
                [[getRiskRatingValue(partner.rating)]]
              </span>
            </etools-form-element-wrapper>
          </div>
          <div class="col col-4">
            <!-- Type of assessment -->
            <etools-form-element-wrapper label="Type of Assessment" value="[[partner.type_of_assessment]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-4">
            <!--Date last assessed-->
            <etools-form-element-wrapper
              label="Date of Report"
              value="[[getDateDisplayValue(partner.last_assessment_date)]]"
            >
              <iron-icon icon="date-range" slot="prefix"></iron-icon>
            </etools-form-element-wrapper>
          </div>
        </div>

        <div class="row-h flex-c">
          <div class="col col-4">
            <!-- PSEA risk rating -->
            <etools-form-element-wrapper label="SEA Risk Rating" no-placeholder>
              <span class$="[[getRiskRatingClass(partner.sea_risk_rating_name)]]">
                [[getRiskRatingValue(partner.sea_risk_rating_name)]]
              </span>
            </etools-form-element-wrapper>
          </div>

          <div class="col col-4">
            <!--Last PSEA Assess. Date-->
            <etools-form-element-wrapper
              label="Last PSEA Assessment Date"
              value="[[getDateDisplayValue(partner.psea_assessment_date)]]"
            >
              <iron-icon icon="date-range" slot="prefix"></iron-icon>
            </etools-form-element-wrapper>
          </div>
        </div>
      </etools-content-panel>

      <etools-content-panel class="content-section" panel-title="Core Values Assessments">
        <div slot="panel-btns" id="show-archived">
          <paper-toggle-button id="showArchived" checked="{{showArchivedAssessments}}">
            Show Archived
          </paper-toggle-button>
        </div>

        <div hidden$="[[_empty(partner.core_values_assessments)]]">
          <etools-data-table-header no-title no-collapse>
            <etools-data-table-column class="col-4">
              <div>Date Last Assessed</div>
              <div>(from VISION)</div>
            </etools-data-table-column>
            <etools-data-table-column class="col-6">
              Core Values Assessment
            </etools-data-table-column>
            <etools-data-table-column class="col-2">
              Archived
            </etools-data-table-column>
          </etools-data-table-header>
          <template is="dom-repeat" items="{{partner.core_values_assessments}}">
            <etools-data-table-row
              no-collapse
              secondary-bg-on-hover$="[[_canEditCVA(item.attachment, item.archived, showCoreValuesAssessmentAttachment)]]"
              hidden$="[[!_shouldShowCVA(item.archived, showArchivedAssessments)]]"
            >
              <div slot="row-data" class="p-relative">
                <span class="col-data col-4">
                  <span hidden$="[[_isEmptyDate(item.date)]]">[[getDateDisplayValue(item.date)]]</span>
                  <span hidden$="[[!_isEmptyDate(item.date)]]" class="placeholder-style">&#8212;</span>
                </span>
                <span class="col-data col-6">
                  <iron-icon icon="attachment" hidden$="[[!item.attachment]]"></iron-icon>
                  <span hidden$="[[item.attachment]]" class="placeholder-style">&#8212;</span>
                  <a class="cvs-file" href$="[[item.attachment]]" target="_blank" download
                    >[[getFileNameFromURL(item.attachment)]]</a
                  >
                </span>
                <span class="col-data col-2">
                  <span hidden$="[[item.archived]]" class="placeholder-style">&#8212;</span>
                  <iron-icon icon="check" hidden$="[[!item.archived]]"></iron-icon>
                </span>
                <icons-actions
                  item$="[[item]]"
                  hidden$="[[!_canEditCVA(item.attachment, item.archived, showCoreValuesAssessmentAttachment)]]"
                  show-delete="[[showDelete]]"
                  on-edit="_editCoreValuesAssessment"
                >
                </icons-actions>
              </div>
            </etools-data-table-row>
          </template>
        </div>
        <div class="row-h" hidden$="[[!_empty(partner.core_values_assessments)]]">
          There are no Core Value Assessments.
        </div>
      </etools-content-panel>

      <staff-members
        id="staffMembersList"
        data-items="[[partner.staff_members]]"
        edit-mode="[[editMode]]"
        partner-id="[[partner.id]]"
      >
      </staff-members>
    `;
  }

  @property({type: Object, notify: true, observer: '_partnerChanged'})
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

  @property({type: String, computed: '_computePartnerType(partner)'})
  _partnerComputedType = '';

  @property({type: Boolean})
  showArchivedAssessments = false;

  @property({type: Boolean})
  showDelete = false;

  @property({type: Object})
  editCVADialog!: EditCoreValuesAssessmentEl;

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
    /**
     * Disable loading message for details tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'partners-page'
    });
    fireEvent(this, 'tab-content-attached');
    this._createEditCoreValuesAssessmentsDialog();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (this.editCVADialog) {
      document.querySelector('body')!.removeChild(this.editCVADialog);
    }
  }

  public _shouldShowCVA(archived: boolean, showArchived: boolean) {
    if (showArchived) {
      return true;
    }
    return !archived;
  }

  public _createEditCoreValuesAssessmentsDialog() {
    this.editCVADialog = document.createElement('edit-core-values-assessment') as any;
    this.editCVADialog.parent = this;

    document.querySelector('body')!.appendChild(this.editCVADialog);
  }

  public _editCoreValuesAssessment(e: CustomEvent) {
    this.editCVADialog.item = JSON.parse((e.target as PolymerElement).getAttribute('item')!);
    this.editCVADialog.open();
  }

  public _canEditCVA(attachment: any, archived: boolean) {
    if (attachment || archived) {
      return false;
    }
    return this.showCoreValuesAssessmentAttachment;
  }

  public _partnerChanged(partner: any) {
    if (!isEmptyObject(partner)) {
      // decide if we should show core values assessment attachment
      this.set(
        'showCoreValuesAssessmentAttachment',
        this._showCoreValueAssessment(partner.partner_type, partner.cso_type)
      );

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
    const today = moment.utc().format(datesFormat);
    const assessmentDate = convertDate(assessmentDateString);
    const assessmentExpDate = moment(assessmentDate).add(60, 'months');

    const daysUntilExpire = assessmentExpDate.diff(today, 'days');

    let notifMessage = '';
    if (daysUntilExpire < 1) {
      notifMessage = 'The ' + assessmentType + ' is expired (' + assessmentExpDate.format(datesFormat) + ')';
    } else {
      const notifStartDate = moment(assessmentDate).add(57, 'months');
      if (moment(today).isAfter(notifStartDate)) {
        notifMessage = 'The ' + assessmentType + ' will expire in ' + daysUntilExpire + ' days';
      }
    }
    if (notifMessage) {
      setTimeout(() => {
        fireEvent(this, 'toast', {text: notifMessage, showCloseBtn: true});
      }, 0);
    }
  }

  public _computePartnerType(partner: any) {
    return !isEmptyObject(partner) ? this._getPartnerType(partner.partner_type, partner.cso_type) : '';
  }

  public _getPartnerType(partnerType: any, csoType: any) {
    return csoType !== null ? partnerType + '/' + csoType : partnerType;
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
}

window.customElements.define('partner-details', PartnerDetails);
