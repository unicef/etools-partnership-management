/* eslint-disable lit-a11y/anchor-is-valid */
import {LitElement, html, property, PropertyValues, customElement} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';

import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../../redux/store';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners';

import ModuleRoutingMixin from '../../common/mixins/module-routing-mixin-lit';
import ScrollControlMixin from '../../common/mixins/scroll-control-mixin-lit';
import ModuleMainElCommonFunctionalityMixin from '../../common/mixins/module-common-mixin-lit';
import CommonMixin from '../../common/mixins/common-mixin-lit';
import StaffMembersDataMixin from './mixins/staff-members-data-mixin.js';

import '../../common/components/page-content-header';
import '../../styles/page-content-header-slotted-styles';
import '../../common/components/etools-tabs';
import '../../common/components/etools-error-messages-box';
import {pageContentHeaderSlottedStyles} from '../../styles/page-content-header-slotted-styles-lit';

import {RESET_UNSAVED_UPLOADS} from '../../../redux/actions/upload-status';

import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {buttonsStyles} from '../../styles/buttons-styles-lit';
import {isEmptyObject} from '../../utils/utils';

import './data/partner-item-data.js';
import './components/new-partner-dialog.js';
import './components/partner-status.js';
import {fireEvent} from '../../utils/fire-custom-event';
import {Partner} from '../../../models/partners.models';
import {PartnerItemData} from './data/partner-item-data';
import {EtoolsTab, UserPermissions} from '@unicef-polymer/etools-types';
import {openDialog} from '../../utils/dialog';
import {translate, get as getTranslation} from 'lit-translate';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin GestureEventListeners
 * @appliesMixin ScrollControlMixin
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin ModuleMainElCommonFunctionalityMixin
 * @appliesMixin StaffMembersDataMixin
 */

@customElement('partners-module')
export class PartnersModule extends connect(store)(
  // eslint-disable-next-line new-cap
  GestureEventListeners(
    CommonMixin(
      ScrollControlMixin(ModuleRoutingMixin(ModuleMainElCommonFunctionalityMixin(StaffMembersDataMixin(LitElement))))
    )
  )
) {
  render() {
    // main template
    // language=HTML
    return html`
      ${pageLayoutStyles} ${sharedStyles} ${buttonsStyles} ${pageContentHeaderSlottedStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      <app-route
        .route="${this.route}"
        pattern="/list"
        query-params="${this.listPageQueryParams}"
        .active="${this.listActive}"
      ></app-route>

      <app-route
        route="${this.route}"
        pattern="/:id/:tab"
        active="${this.tabsActive}"
        data="${this.routeData}"
      ></app-route>

      <page-content-header with-tabs-visible="${this.tabsActive}">
        <div slot="page-title">
          ${!this.listActive
            ? html` <span ?hidden="${this.showOnlyGovernmentType}">Partners</span>
                <span ?hidden="${!this.showOnlyGovernmentType}">Government Partners</span>`
            : ''}
          ${!this.tabsActive ? html`<span>${this.partner.name}</span>` : ''}
        </div>

        <div slot="title-row-actions" class="content-header-actions">
          <div class="action" ?hidden="${!this.listActive}">
            <a target="_blank" href="${this.csvDownloadUrl}">
              <paper-button>
                <iron-icon icon="file-download"></iron-icon>
                ${translate('EXPORT')}
              </paper-button>
            </a>
          </div>
          <div class="action" ?hidden="${!this._showNewPartnerBtn(this.listActive, this.permissions)}">
            <paper-button class="primary-btn with-prefix" @click="${this._openNewPartnerDialog}">
              <iron-icon icon="add"></iron-icon>
              ${translate('IMPORT_PARTNER')}
            </paper-button>
          </div>
        </div>

        ${this._showPageTabs(this.activePage)
          ? html` <etools-tabs
              slot="tabs"
              tabs="${this.partnerTabs}"
              active-tab="${this.routeData.tab}"
              @iron-select="${this._handleTabSelectAction}"
            ></etools-tabs>`
          : ''}
      </page-content-header>

      <div id="main">
        <div id="pageContent">
          <etools-error-messages-box
            id="errorsBox"
            title="Errors Saving Partner"
            .errors="${this.serverErrors}"
          ></etools-error-messages-box>
          <iron-pages id="partnersPages" .selected="${this.activePage}" attr-for-selected="name" role="main">
            ${this._pageEquals(this.activePage, 'list')
              ? html`<partners-list
                  id="list"
                  name="list"
                  show-only-government-type="${this.showOnlyGovernmentType}"
                  current-module="${this.currentModule}"
                  active="${this.listActive}"
                  csv-download-url="${this.csvDownloadUrl}"
                  url-params="${this.preservedListQueryParams}"
                >
                </partners-list>`
              : ''}
            ${this._pageEquals(this.activePage, 'overview')
              ? html`<partner-overview name="overview" .partner="${this.partner}"></partner-overview>`
              : ''}
            ${this._pageEquals(this.activePage, 'details')
              ? html` <partner-details
                  id="partnerDetails"
                  name="details"
                  .partner="${this.partner}"
                  .edit-mode="${this._hasEditPermissions(this.permissions)}"
                ></partner-details>`
              : ''}
            ${this._pageEquals(this.activePage, 'financial-assurance')
              ? html`<partner-financial-assurance
                  id="financialAssurance"
                  .partner="${this.partner}"
                  edit-mode="${this._hasEditPermissions(this.permissions)}"
                  name="financial-assurance"
                >
                </partner-financial-assurance>`
              : ''}
          </iron-pages>
        </div>
        <!-- page content end -->

        <!-- sidebar content start -->
        ${!this._showSidebarStatus(this.listActive, this.tabAttached, this.partner)
          ? html` <div id="sidebar">
              <partner-status
                @save-partner="${this._validateAndTriggerPartnerSave}"
                @delete-partner="${this._deletePartner}"
                .active="${!this.listActive}"
                .partner="${this.partner}"
                edit-mode="${this._hasEditPermissions(this.permissions)}"
              >
              </partner-status>
            </div>`
          : ''}
        <!-- sidebar content end -->
      </div>
      <!-- main container end -->

      <partner-item-data
        id="partnerData"
        .partner-id="${this.selectedPartnerId}"
        .partner="${this.partner}"
        @partner-changed="${(e: CustomEvent) => {
          this.partner = {...e.detail};
        }}"
        error-event-name="partner-save-error"
      >
      </partner-item-data>
    `;
  }

  @property({type: Array})
  partnerTabs: EtoolsTab[] = [
    {
      tab: 'overview',
      tabLabel: getTranslation('OVERVIEW'),
      hidden: false
    },
    {
      tab: 'details',
      tabLabel: getTranslation('PARTNER_DETAILS'),
      hidden: false
    },
    {
      tab: 'financial-assurance',
      tabLabel: getTranslation('ASSURANCE'),
      hidden: false
    }
  ];

  @property({type: String})
  moduleName = 'partners';

  @property({type: String})
  csvDownloadUrl = '';

  @property({type: Number})
  selectedPartnerId: number | null = null;

  @property({type: Object})
  partner!: Partner;

  @property({type: Object})
  permissions!: UserPermissions;

  @property({type: Boolean})
  showOnlyGovernmentType = false;

  @property({type: String})
  currentModule = '';

  @property({type: Object})
  originalPartnerData!: Partner;

  public connectedCallback() {
    super.connectedCallback();

    this._initListeners();

    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'main-page'
    });
    /**
     * Loading msg used on stamping tabs elements (disabled in each tab main element attached callback)
     */
    this._showPartnersPageLoadingMessage();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  public _initListeners() {
    this._partnerSaveError = this._partnerSaveError.bind(this);
    this._partnerContactsUpdated = this._partnerContactsUpdated.bind(this);
    this._saveCoreValuesAssessment = this._saveCoreValuesAssessment.bind(this);
    this._handlePartnerSelectionLoadingMsg = this._handlePartnerSelectionLoadingMsg.bind(this);
    this._updateBasisForRiskRating = this._updateBasisForRiskRating.bind(this);

    this.addEventListener('partner-save-error', this._partnerSaveError as any);
    this.addEventListener('partner-contacts-updated', this._partnerContactsUpdated as any);
    this.addEventListener('save-core-values-assessment', this._saveCoreValuesAssessment as any);
    this.addEventListener('trigger-partner-loading-msg', this._handlePartnerSelectionLoadingMsg);
    this.addEventListener('assessment-updated-step3', this._updateBasisForRiskRating as any);
    this.addEventListener('update-partner', this._updatePartner as any);
  }

  public _removeListeners() {
    this.removeEventListener('partner-save-error', this._partnerSaveError as any);
    this.removeEventListener('partner-contacts-updated', this._partnerContactsUpdated as any);
    this.removeEventListener('save-core-values-assessment', this._saveCoreValuesAssessment as any);
    this.removeEventListener('trigger-partner-loading-msg', this._handlePartnerSelectionLoadingMsg);
    this.removeEventListener('assessment-updated-step3', this._updateBasisForRiskRating as any);
    this.removeEventListener('update-partner', this._updatePartner as any);
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('partner')) {
      this._partnerChanged(this.partner);
    }
    if (changedProperties.has('routeData')) {
      this._observeRouteDataId(this.routeData.id);
    }

    if (
      changedProperties.has('listActive') ||
      changedProperties.has('tabsActive') ||
      changedProperties.has('routeData') ||
      changedProperties.has('currentModule')
    ) {
      this._pageChanged(this.listActive, this.tabsActive, this.routeData, this.currentModule);
    }
  }

  public _updatePartner(e: CustomEvent) {
    this.partner = e.detail;
  }
  public _partnerContactsUpdated(e: CustomEvent) {
    this.partner.updateStaffMembers(e.detail);
    this.partner = {...this.partner};
    //@dci this.notifyPath('partner.staff_members');
  }

  public _saveCoreValuesAssessment(e: CustomEvent) {
    this._savePartner(this.partner.getSaveCVARequestPayload(e.detail));
  }

  public _updateBasisForRiskRating(e: CustomEvent) {
    this._savePartner({id: this.partner.id, basis_for_risk_rating: e.detail});
  }

  public _pageChanged(listActive: boolean, tabsActive: boolean, routeData: any, _currentModule: string) {
    // Using isActiveModule will prevent wrong page import
    if (!this.isActiveModule(this.currentModule) || (!listActive && !tabsActive)) {
      return;
    }

    this.scrollToTopOnCondition(!listActive);

    const fileImportDetails = {
      filenamePrefix: 'partner',
      importErrMsg: 'Partners page import error occurred',
      errMsgPrefixTmpl: '[partner(s) ##page##]',
      loadingMsgSource: 'partners-page'
    };
    const page: string = listActive ? 'list' : routeData.tab;
    this.setActivePage(page, fileImportDetails);
  }

  public _hasEditPermissions(permissions: UserPermissions) {
    return permissions && permissions.editPartnerDetails === true;
  }

  public _savePartner(newPartnerData: any) {
    const partnerData = this.shadowRoot!.querySelector('#partnerData') as PartnerItemData;
    if (partnerData) {
      partnerData.savePartner(newPartnerData).then((successful: any) => {
        if (successful) {
          store.dispatch({type: RESET_UNSAVED_UPLOADS});
        }
      });
    }
  }

  public _deletePartner(e: CustomEvent) {
    e.stopImmediatePropagation();
    fireEvent(this, 'global-loading', {
      active: true,
      message: 'Deleting partner...',
      loadingSource: 'partner-data'
    });

    const partnerData = this.shadowRoot!.querySelector('#partnerData') as PartnerItemData;
    if (partnerData) {
      partnerData.deletePartner(this.partner);
    }
  }

  public _handlePartnerDeleted() {
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'partner-data'
    });
    fireEvent(this, 'toast', {
      text: this._getTranslation('PARTNER_SUCCESSFULLY_DELETED'),
      showCloseBtn: true
    });
    fireEvent(this, 'update-main-path', {
      path: 'partners/list'
    });
  }

  public _observeRouteDataId(id: any) {
    // Using isActiveModule will prevent wrong partner details request
    // (with an id from other app module, like reports)
    if (!this.isActiveModule(this.currentModule) || typeof id === 'undefined') {
      return;
    }
    if (this.route && this.route.prefix.indexOf('partners') > -1) {
      this.selectedPartnerId = id;
    }
  }

  public _partnerSaveError(event: CustomEvent) {
    event.stopImmediatePropagation();
    if (
      (event.detail instanceof Array && event.detail.length > 0) ||
      (typeof event.detail === 'string' && event.detail !== '')
    ) {
      fireEvent(this, 'set-server-errors', event.detail);
      this.scrollToTop();
    }
  }

  public _showNewPartnerBtn(listActive: any, permissions: any) {
    return listActive && this._hasEditPermissions(permissions);
  }

  public _openNewPartnerDialog() {
    openDialog({
      dialog: 'new-partner-dialog'
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return null;
      }
      const partnerData = this.shadowRoot!.querySelector('#partnerData') as PartnerItemData;
      if (partnerData) {
        partnerData.createPartner(response, this._newPartnerCreated, this._handleCreatePartnerError);
      }
      return true;
    });
  }

  public _newPartnerCreated(partner: any) {
    fireEvent(this, 'update-main-path', {
      path: 'partners/' + partner.id + '/details'
    });
  }

  public _handleCreatePartnerError(errorDetails: any) {
    fireEvent(this, 'toast', {
      text: errorDetails,
      showCloseBtn: true
    });
  }

  public _partnerChanged(partner: any) {
    if (!isEmptyObject(partner)) {
      // dismiss partner details pages loading
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: 'partner-data'
      });

      // keep a copy of loaded partner to be able to check changed data
      this.originalPartnerData = new Partner(partner);
    }
    fireEvent(this, 'clear-server-errors');
  }

  public _validateAndTriggerPartnerSave(event: CustomEvent) {
    event.stopImmediatePropagation();
    if (!this._hasEditPermissions(this.permissions)) {
      return;
    }

    // both partner details and financial assurance data is valid
    // TODO: move _getModifiedData in Partner class then use
    const partnerChanges = this._getModifiedData(this.partner);
    partnerChanges.id = this.partner.id;
    this._savePartner(partnerChanges);
  }

  public _getModifiedData(partner: any) {
    const updatableFields = ['alternate_name', 'shared_with', 'planned_engagement', 'basis_for_risk_rating'];
    const changes: any = {};
    updatableFields.forEach((fieldName) => {
      if (['shared_with', 'planned_engagement'].indexOf(fieldName) > -1) {
        if (JSON.stringify(partner[fieldName]) !== JSON.stringify(this.originalPartnerData[fieldName])) {
          changes[fieldName] = partner[fieldName];
        }
      } else {
        if (partner[fieldName] !== this.originalPartnerData[fieldName]) {
          changes[fieldName] = partner[fieldName];
        }
      }
    });
    return changes;
  }

  public _handleTabSelectAction(_e: CustomEvent) {
    // this._showTabChangeLoadingMsg(e, 'partners-page', 'partner-');
  }

  public _handlePartnerSelectionLoadingMsg() {
    // this._showTabChangeLoadingMsg(null, 'partners-page', 'partner-', 'details');
  }

  /**
   * Loading msg used on stamping tabs elements (disabled in each tab main element attached callback)
   */
  public _showPartnersPageLoadingMessage() {
    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'partners-page'
    });
  }
}
