import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';

import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../../store';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners';

import ModuleRoutingMixin from '../mixins/module-routing-mixin';
import ScrollControl from '../../mixins/scroll-control-mixin';
import ModuleMainElCommonFunctionalityMixin from '../mixins/module-common-mixin';

import '../../layout/page-content-header';
import '../../layout/page-content-header-slotted-styles';
import '../../layout/etools-tabs';
import '../../layout/etools-error-messages-box';
import {pageContentHeaderSlottedStyles} from '../../layout/page-content-header-slotted-styles';

import {UserPermissions, EtoolsTab} from '../../../typings/globals.types';
import { RESET_UNSAVED_UPLOADS } from '../../../actions/upload-status';

import {pageLayoutStyles} from '../../styles/page-layout-styles';
import {SharedStyles} from '../../styles/shared-styles';
import {buttonsStyles} from '../../styles/buttons-styles';
import { isEmptyObject } from '../../utils/utils';

import './data/partner-item-data.js';
import './components/new-partner-dialog.js';
import './components/partner-status.js';
import { fireEvent } from '../../utils/fire-custom-event';
import { property } from '@polymer/decorators';
import {Partner, StaffMemberSaveReqPayload, CVASaveReqPayload} from '../../../models/partners.models';
import { PartnerItemData } from './data/partner-item-data.js';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin GestureEventListeners
 * @appliesMixin ScrollControl
 * @appliesMixin ModuleRoutingMixin
 * @appliesMixin ModuleMainElCommonFunctionality
 */
class PartnersModule extends connect(store)((GestureEventListeners(ScrollControl(ModuleRoutingMixin
  (ModuleMainElCommonFunctionalityMixin(PolymerElement)))))) {

  public static get template() {
    // main template
    // language=HTML
    return html`
        ${pageLayoutStyles} ${SharedStyles} ${buttonsStyles} ${pageContentHeaderSlottedStyles}
        <style>
          :host {
              display: block;
          }
        </style>

        <app-route
          route="{{route}}"
          pattern="/list"
          query-params="{{listPageQueryParams}}"
          active="{{listActive}}"></app-route>

        <app-route
          route="{{route}}"
          pattern="/:id/:tab"
          active="{{tabsActive}}"
          data="{{routeData}}"></app-route>

        <page-content-header with-tabs-visible="[[tabsActive]]">
          <div slot="page-title">
            <template is="dom-if" if="[[listActive]]">
              <span hidden$="[[showOnlyGovernmentType]]">Partners</span>
              <span hidden$="[[!showOnlyGovernmentType]]">Government Partners</span>
            </template>
            <template is="dom-if" if="[[tabsActive]]">
              <span>[[partner.name]]</span>
            </template>
          </div>

          <div slot="title-row-actions" class="content-header-actions">
            <div class="action" hidden$="[[!listActive]]">
              <a target="_blank" href$="[[csvDownloadUrl]]">
                <paper-button>
                  <iron-icon icon="file-download"></iron-icon>
                  Export
                </paper-button>
              </a>
            </div>
            <div class="action" hidden$="[[!_showNewPartnerBtn(listActive, permissions)]]">
              <paper-button class="primary-btn with-prefix" on-tap="_openNewPartnerDialog">
                <iron-icon icon="add"></iron-icon>
                Import Partner
              </paper-button>
            </div>
          </div>

          <template is="dom-if" if="[[_showPageTabs(activePage)]]">
            <etools-tabs slot="tabs"
                         tabs="[[partnerTabs]]"
                         active-tab="{{routeData.tab}}"
                         on-iron-select="_handleTabSelectAction"></etools-tabs>
          </template>
        </page-content-header>

        <div id="main">
          <div id="pageContent">

            <etools-error-messages-box id="errorsBox"
                                       title="Errors Saving Partner"
                                       errors="{{serverErrors}}"></etools-error-messages-box>
            <iron-pages id="partnersPages"
                        selected="{{activePage}}"
                        attr-for-selected="name"
                        role="main">

              <template is="dom-if" if="[[_pageEquals(activePage, 'list')]]">
                <partners-list id="list"
                               name="list"
                               show-only-government-type="[[showOnlyGovernmentType]]"
                               current-module="[[currentModule]]"
                               active="[[listActive]]"
                               csv-download-url="{{csvDownloadUrl}}"
                               url-params="[[preservedListQueryParams]]">
                </partners-list>
              </template>

              <template is="dom-if" if="[[_pageEquals(activePage, 'overview')]]">
                <partner-overview name="overview" partner="[[partner]]"></partner-overview>
              </template>

              <template is="dom-if" if="[[_pageEquals(activePage, 'details')]]">
                <partner-details id="partnerDetails"
                                 name="details"
                                 partner="[[partner]]"
                                 edit-mode="[[_hasEditPermissions(permissions)]]"></partner-details>
              </template>

              <template is="dom-if" if="[[_pageEquals(activePage, 'financial-assurance')]]">
                <partner-financial-assurance id="financialAssurance"
                                             partner="[[partner]]"
                                             edit-mode="[[_hasEditPermissions(permissions)]]"
                                             name="financial-assurance">
                </partner-financial-assurance>
              </template>

            </iron-pages>

          </div> <!-- page content end -->

          <!-- sidebar content start -->
          <template is="dom-if" if="[[_showSidebarStatus(listActive, tabAttached, partner)]]">
            <div id="sidebar">
              <partner-status
                  on-save-partner="_validateAndTriggerPartnerSave"
                  on-delete-partner="_deletePartner"
                  active="[[!listActive]]"
                  partner="[[partner]]"
                  edit-mode$="[[_hasEditPermissions(permissions)]]">
              </partner-status>
            </div> <!-- sidebar content end -->
          </template>
        </div> <!-- main container end -->

        <partner-item-data id="partnerData"
                       partner-id="[[selectedPartnerId]]"
                       partner="{{partner}}"
                       error-event-name="partner-save-error">
        </partner-item-data>
    `;
  }

  @property({type: Array})
  partnerTabs: EtoolsTab[] = [{
      tab: 'overview',
      tabLabel: 'Overview',
      hidden: false
    },
    {
      tab: 'details',
      tabLabel: 'Partner Details',
      hidden: false
    },
    {
      tab: 'financial-assurance',
      tabLabel: 'Assurance',
      hidden: false
    }];

  @property({type: String})
  moduleName: string = 'partners';

  @property({type: String})
  csvDownloadUrl: string = '';

  @property({type: Number})
  selectedPartnerId: number | null = null;

  @property({type: Object, observer: '_partnerChanged'})
  partner: any = null;

  @property({type: Object})
  permissions: any = null;

  @property({type: Boolean})
  showOnlyGovernmentType: boolean = false;

  @property({type: String})
  currentModule: string = '';

  @property({type: Object})
  originalPartnerData: any = null;

  newPartnerDialog: any = null;

  public static get observers() {
    return [
      '_pageChanged(listActive, tabsActive, routeData, currentModule)',
      '_observeRouteDataId(routeData.id)'
    ];
  }

  public ready() {
    super.ready();
    this._initListeners();
    this._createNewPartnerDialog();
  }

  public connectedCallback() {
    super.connectedCallback();
    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'main-page'});
    /**
     * Loading msg used on stamping tabs elements (disabled in each tab main element attached callback)
     */
    this._showPartnersPageLoadingMessage();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._removeNewPartnerDialogFromDom();
    this._removeListeners();
  }

  public _initListeners() {
    this._partnerSaveError = this._partnerSaveError.bind(this);
    this._savePartnerContact = this._savePartnerContact.bind(this);
    this._saveCoreValuesAssessment = this._saveCoreValuesAssessment.bind(this);
    this._handlePartnerSelectionLoadingMsg = this._handlePartnerSelectionLoadingMsg.bind(this);

    this.addEventListener('partner-save-error', this._partnerSaveError as any);
    this.addEventListener('save-partner-contact', this._savePartnerContact as any);
    this.addEventListener('save-core-values-assessment', this._saveCoreValuesAssessment as any);
    this.addEventListener('trigger-partner-loading-msg', this._handlePartnerSelectionLoadingMsg);
  }

  public _removeListeners() {
    this.removeEventListener('partner-save-error', this._partnerSaveError as any);
    this.removeEventListener('save-partner-contact', this._savePartnerContact as any);
    this.removeEventListener('save-core-values-assessment', this._saveCoreValuesAssessment as any);
    this.removeEventListener('trigger-partner-loading-msg', this._handlePartnerSelectionLoadingMsg);
  }

  public _savePartnerContact(e: CustomEvent) {
    this._savePartner(new StaffMemberSaveReqPayload(this.partner.id, e.detail));
  }

  public _saveCoreValuesAssessment(e: CustomEvent) {
    this._savePartner(new CVASaveReqPayload(this.partner.id, e.detail));
  }

  public _createNewPartnerDialog() {
    this.newPartnerDialog = document.createElement('new-partner-dialog');
    this.newPartnerDialog.setAttribute('id', 'newPartnerDialog');
    // @ts-ignore
    document.querySelector('body')!.appendChild(this.newPartnerDialog);

    this._createPartner = this._createPartner.bind(this);
    this.newPartnerDialog.addEventListener('create-partner', this._createPartner);
  }

  public _removeNewPartnerDialogFromDom() {
    if (this.newPartnerDialog) {
      this.newPartnerDialog.removeEventListener('create-partner', this._createPartner);
      // @ts-ignore
      document.querySelector('body')!.removeChild(this.newPartnerDialog);
    }
  }

  public _pageChanged(listActive: boolean, tabsActive: boolean, routeData: any, _currentModule: string) {
    // Using isActiveModule will prevent wrong page import
    if (!this.isActiveModule(this.currentModule) || (!listActive && !tabsActive)) {
      return;
    }

    this.scrollToTopOnCondition(!listActive);

    let fileImportDetails = {
      filenamePrefix: 'partner',
      importErrMsg: 'Partners page import error occurred',
      errMsgPrefixTmpl: '[partner(s) ##page##]',
      loadingMsgSource: 'partners-page'
    };
    this.setActivePage(listActive, routeData.tab, fileImportDetails);
  }

  public _hasEditPermissions(permissions: UserPermissions) {
    return permissions && permissions.editPartnerDetails === true;
  }

  public _savePartner(newPartnerData: any) {
    let partnerData = this.shadowRoot!.querySelector('#partnerData') as PartnerItemData ;
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

    let partnerData = this.shadowRoot!.querySelector('#partnerData');
    if (partnerData) {
      (partnerData as any).deletePartner(this.partner);
    }
  }

  public _handlePartnerDeleted() {
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'partner-data'
    });
    fireEvent(this, 'toast', {
      text: 'Partner successfully deleted',
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
      this.set('selectedPartnerId', id);
    }
  }

  public _partnerSaveError(event: CustomEvent) {
    event.stopImmediatePropagation();
    if ((event.detail instanceof Array && event.detail.length > 0) ||
        (typeof event.detail === 'string' && event.detail !== '')) {
      fireEvent(this, 'set-server-errors', event.detail as any);
      this.scrollToTop();
    }
  }

  public _showNewPartnerBtn(listActive: any, permissions: any) {
    return listActive && this._hasEditPermissions(permissions);
  }

  public _openNewPartnerDialog() {
    this.newPartnerDialog.openNewPartnerDialog();
  }

  public _createPartner(event: CustomEvent) {
    let partnerData = this.shadowRoot!.querySelector('#partnerData') as PartnerItemData;
    if (partnerData) {
      partnerData.createPartner(event.detail, this._newPartnerCreated,
          this._handleCreatePartnerError);
    }
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
      this.set('originalPartnerData', new Partner(partner));
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
    let partnerChanges = this._getModifiedData(this.partner);
    partnerChanges.id = this.partner.id;
    this._savePartner(partnerChanges);
  }

  public _getModifiedData(partner: any) {
    let updatableFields = [
      'alternate_name',
      'shared_with',
      'planned_engagement',
      'basis_for_risk_rating'
    ];
    let changes: any = {};
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
  }

  public _handlePartnerSelectionLoadingMsg() {
    this._showTabChangeLoadingMsg(null, 'partners-page', 'partner-', 'details');
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

window.customElements.define('partners-module', PartnersModule);
