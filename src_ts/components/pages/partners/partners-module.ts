import {LitElement, html, PropertyValues} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../redux/store';

import ModuleRoutingMixinLit from '../../common/mixins/module-routing-mixin-lit';
import ScrollControlMixinLit from '../../common/mixins/scroll-control-mixin-lit';
import ModuleMainElCommonFunctionalityMixinLit from '../../common/mixins/module-common-mixin-lit';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

import '../../common/components/page-content-header';
import '../../common/components/etools-error-messages-box';
import {pageContentHeaderSlottedStyles} from '../../styles/page-content-header-slotted-styles-lit';

import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

import './data/partner-item-data.js';
import './components/new-partner-dialog.js';
import './components/partner-status.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {Partner} from '../../../models/partners.models';
import {PartnerItemData} from './data/partner-item-data';
import {EtoolsTab, UserPermissions} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {
  translate,
  get as getTranslation,
  listenForLangChanged
} from '@unicef-polymer/etools-unicef/src/etools-translate';
import cloneDeep from 'lodash-es/cloneDeep';
import StaffMembersDataMixinLit from '../../common/mixins/staff-members-data-mixin-lit';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-tabs';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
import {UPLOAD_STATUS_KEYS} from '@unicef-polymer/etools-unicef/src/etools-upload/uploads-mixin.js';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin ScrollControlMixin
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin ModuleMainElCommonFunctionalityMixin
 * @appliesMixin StaffMembersDataMixin
 */

@customElement('partners-module')
export class PartnersModule extends connect(store)(
  // eslint-disable new-cap
  MatomoMixin(
    CommonMixin(
      ScrollControlMixinLit(
        ModuleRoutingMixinLit(ModuleMainElCommonFunctionalityMixinLit(StaffMembersDataMixinLit(LitElement)))
      )
    )
  )
  // eslint-enable new-cap
) {
  render() {
    // main template
    // language=HTML
    return html`
      ${pageLayoutStyles} ${sharedStyles} ${pageContentHeaderSlottedStyles}
      <style>
        :host {
          display: block;
        }
        section {
          --primary-background-color: #eeeeee;
        }
      </style>

      <page-content-header .withTabsVisible="${this.tabsActive}">
        <div slot="page-title">
          ${this.listActive
            ? html` <span ?hidden="${this.showOnlyGovernmentType}">${translate('PARTNERS')}</span>
                <span ?hidden="${!this.showOnlyGovernmentType}">${translate('GOVERNMENT_PARTNERS')}</span>`
            : ''}
          ${this.tabsActive ? html`<span>${(this.partner || {}).name}</span>` : ''}
        </div>

        <div slot="title-row-actions" class="content-header-actions">
          <div class="action" ?hidden="${!this.listActive}">
            <etools-button
              class="neutral"
              variant="text"
              target="_blank"
              href="${this.csvDownloadUrl}"
              @click="${this.trackAnalytics}"
              tracker="Export Partners"
              hidden
            >
              <etools-icon name="file-download"></etools-icon>
              ${translate('EXPORT')}
            </etools-button>
          </div>
          <div class="action" ?hidden="${!this._showNewPartnerBtn(this.listActive, this.permissions)}">
            <etools-button variant="primary" tracker="Import Sync Partner" @click="${this._openNewPartnerDialog}">
              <etools-icon name="add"></etools-icon>
              ${translate('IMPORT_SYNC_PARTNER')}
            </etools-button>
          </div>
        </div>

        ${this._showPageTabs(this.activePage)
          ? html`
              <etools-tabs-lit
                slot="tabs"
                .tabs="${this.partnerTabs}"
                .activeTab="${this.reduxRouteDetails?.subRouteName}"
                @sl-tab-show="${this._handleTabSelectAction}"
                id="pageTabs"
              ></etools-tabs-lit>
            `
          : ''}
      </page-content-header>

      <div id="main">
        <div id="pageContent">
          <etools-error-messages-box
            id="errorsBox"
            title="Errors Saving Partner"
            .errors="${this.serverErrors}"
          ></etools-error-messages-box>
          <partners-list
            id="list"
            name="list"
            ?hidden="${!(
              this._pageEquals(this.activePage, 'list') &&
              this.partnersListActive(this.listActive, this.reduxRouteDetails)
            )}"
            @csvDownloadUrl-changed=${(e: any) => {
              this.csvDownloadUrl = e.detail;
            }}
          >
          </partners-list>
          <governments-list
            id="g-list"
            name="g-list"
            ?hidden="${!(
              this._pageEquals(this.activePage, 'list') && this.govListActive(this.listActive, this.reduxRouteDetails)
            )}"
            @csvDownloadUrl-changed=${(e: any) => {
              this.csvDownloadUrl = e.detail;
            }}
          >
          </governments-list>
          <partner-overview
            ?hidden="${!this._pageEquals(this.activePage, 'overview')}"
            name="overview"
            .partner="${this.partner}"
          ></partner-overview>
          <partner-details
            id="partnerDetails"
            ?hidden="${!this._pageEquals(this.activePage, 'details')}"
            name="details"
            .partner="${this.partner}"
            .editMode="${this._hasEditPermissions(this.permissions)}"
          ></partner-details>

          <partner-financial-assurance
            id="financialAssurance"
            ?hidden="${!this._pageEquals(this.activePage, 'financial-assurance')}"
            .partner="${this.partner}"
            .editMode="${this._hasEditPermissions(this.permissions)}"
            name="financial-assurance"
          >
          </partner-financial-assurance>
        </div>
        <!-- page content end -->

        <!-- sidebar content start -->
        ${this._showSidebarStatus(this.listActive, this.tabAttached, this.partner)
          ? html` <div id="sidebar">
              <partner-status
                @save-partner="${this._validateAndTriggerPartnerSave}"
                @delete-partner="${this._deletePartner}"
                .active="${!this.listActive}"
                .partner="${this.partner}"
                .editMode="${this._hasEditPermissions(this.permissions)}"
              >
              </partner-status>
            </div>`
          : ''}
        <!-- sidebar content end -->
      </div>
      <!-- main container end -->

      <partner-item-data
        id="partnerData"
        .partnerId="${this.selectedPartnerId}"
        .partner="${this.partner}"
        @partner-changed="${(e: CustomEvent) => {
          this.partner = cloneDeep(e.detail);
        }}"
        error-event-name="partner-save-error"
      >
      </partner-item-data>
    `;
  }

  @property({type: Array})
  partnerTabs: EtoolsTab[] = [];

  @property({type: String})
  currentModule = '';

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

  @property({type: Object})
  originalPartnerData!: Partner;

  @property({type: Object})
  reduxRouteDetails?: EtoolsRouteDetails;

  @property({type: Number})
  commonDataLoadedTimestamp = 0;

  @property({type: String})
  _page = '';

  @state() isInitialLoading = true;

  public connectedCallback() {
    super.connectedCallback();

    this._initListeners();
    this.setPartnerTabs();
  }

  setPartnerTabs() {
    this.partnerTabs = [
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
  }

  stateChanged(state: RootState) {
    if (!state.app?.routeDetails?.routeName) {
      return;
    }
    if (['partners', 'government-partners'].includes(state.app?.routeDetails?.routeName!)) {
      this.reduxRouteDetails = state.app.routeDetails!;
      this.selectedPartnerId = Number(this.reduxRouteDetails!.params?.itemId);
      this.listActive = this.reduxRouteDetails?.subRouteName == 'list';
      this.tabsActive = !this.listActive;
      if (this.tabsActive && isNaN(this.selectedPartnerId)) {
        fireEvent(this, '404');
        return;
      }
      if (this.isInitialLoading) {
        this.isInitialLoading = false;
        this._showPartnersPageLoadingMessage();
      }
      this.activePage = this.reduxRouteDetails?.subRouteName!;
      this._page = this.reduxRouteDetails?.subRouteName!;
      this.currentModule = this.reduxRouteDetails?.routeName!;
      if (this.commonDataLoadedTimestamp !== state.commonData!.loadedTimestamp) {
        if (this.commonDataLoadedTimestamp !== 0) {
          // static data reloaded (because of language change), need to re-render controls (to update translations)
          this.partner = {...this.partner, commonDataLoadedTimestamp: state.commonData!.loadedTimestamp} as any;
        }
        this.commonDataLoadedTimestamp = state.commonData!.loadedTimestamp;
      }
    }
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  public _initListeners() {
    this._partnerSaveError = this._partnerSaveError.bind(this);
    this._newPartnerCreated = this._newPartnerCreated.bind(this);
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

    listenForLangChanged(() => {
      this.setPartnerTabs();
    });
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

    if (changedProperties.has('listActive') || changedProperties.has('tabsActive') || changedProperties.has('_page')) {
      this._pageChanged(this.listActive, this.reduxRouteDetails!);
    }
  }

  public _updatePartner(e: CustomEvent) {
    this.partner = cloneDeep(e.detail);
  }
  public _partnerContactsUpdated(e: CustomEvent) {
    this.partner.updateStaffMembers(e.detail);
    this.partner = cloneDeep(this.partner);
  }

  public _saveCoreValuesAssessment(e: CustomEvent) {
    this._savePartner(this.partner.getSaveCVARequestPayload(e.detail));
  }

  public _updateBasisForRiskRating(e: CustomEvent) {
    this._savePartner({id: this.partner.id, basis_for_risk_rating: e.detail});
  }

  public _pageChanged(listActive: boolean, routeDetails: EtoolsRouteDetails) {
    if (!routeDetails || !['partners', 'government-partners'].includes(routeDetails?.routeName!)) {
      return;
    }
    this.scrollToTopOnCondition(!listActive);
  }

  public _hasEditPermissions(permissions: UserPermissions) {
    return permissions && permissions.editPartnerDetails === true;
  }

  public _savePartner(newPartnerData: any) {
    const partnerData = this.shadowRoot!.querySelector('#partnerData') as PartnerItemData;
    if (partnerData) {
      partnerData.savePartner(newPartnerData).then((successful: any) => {
        if (successful) {
          fireEvent(this, 'upload-status-reset', {key: UPLOAD_STATUS_KEYS.UNSAVED});
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
      text: getTranslation('PARTNER_SUCCESSFULLY_DELETED')
    });
    fireEvent(this, 'update-main-path', {
      path: 'partners/list'
    });
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

  public _openNewPartnerDialog(e: CustomEvent) {
    this.trackAnalytics(e);
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
    (this.shadowRoot?.querySelector('#partnerData') as PartnerItemData).updatePartnersListInDexieDb(partner);

    fireEvent(this, 'update-main-path', {
      path: 'partners/' + partner.id + '/details'
    });
  }

  public _handleCreatePartnerError(errorDetails: any) {
    fireEvent(this, 'toast', {
      text: errorDetails
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
    const updatableFields = [
      'alternate_name',
      'shared_with',
      'planned_engagement',
      'basis_for_risk_rating',
      'lead_section',
      'lead_office'
    ];
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

  public _handleTabSelectAction(e: CustomEvent) {
    this._showTabChangeLoadingMsg(e, 'partners-page', 'partner-');
    const newTabName: string = e.detail.name;
    if (!this.partner || newTabName == this.activePage) {
      return;
    }
    const newPath = `${this.currentModule}/${this.partner!.id}/${newTabName}`;
    history.pushState(window.history.state, '', `${Environment.basePath}${newPath}`);
    window.dispatchEvent(new CustomEvent('popstate'));
  }

  public _handlePartnerSelectionLoadingMsg() {
    this._showTabChangeLoadingMsg(null, 'partners-page', 'partner-', 'details');
  }

  /**
   * Loading msg used on stamping tabs elements (disabled in each tab main element attached callback)
   */
  public _showPartnersPageLoadingMessage() {
    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'main-page'
    });
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'partners-page'
    });
  }

  govListActive(listActive: boolean, route?: EtoolsRouteDetails) {
    if (!route) {
      return false;
    }
    return listActive && route.routeName === 'government-partners';
  }

  partnersListActive(listActive: boolean, route?: EtoolsRouteDetails) {
    if (!route) {
      return false;
    }
    return listActive && route.routeName === 'partners';
  }
}
